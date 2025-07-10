<template>
  <div class="log-dashboard">
    <el-row :gutter="16" class="dashboard-cards">
      <el-col :span="6">
        <el-card>
          <div class="card-title">总日志数</div>
          <div class="card-value">{{ totalLogs }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-title">今日新增</div>
          <div class="card-value">{{ todayLogs }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-title">未处理</div>
          <div class="card-value">{{ unhandledLogs }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-title">高危错误</div>
          <div class="card-value">{{ criticalLogs }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="12">
        <el-card>
          <h3>日志级别分布</h3>
          <div ref="chartRef" class="chart-small"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <h3>日志趋势</h3>
          <div ref="trendRef" class="chart-small"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3>重要日志</h3>
        <el-select v-model="filterLevel" placeholder="筛选级别" style="width: 120px;">
          <el-option label="全部" value="" />
          <el-option label="错误" value="error" />
          <el-option label="警告" value="warn" />
          <el-option label="信息" value="info" />
        </el-select>
      </div>
      <el-table
        :data="filteredLogs"
        size="small"
        stripe
        border
        class="log-table"
        :cell-style="bodyCellStyle"
        :header-cell-style="headerCellStyle"
        style="width: 100%; margin-top: 12px; border-radius:10px;"
        max-height="240"
        show-overflow-tooltip
        table-layout="fixed"
        empty-text="暂无日志"
        scrollbar-always-on
      >
        <el-table-column prop="time" label="时间" width="140" />
        <el-table-column prop="level" label="级别" width="70">
          <template #default="scope">
            <el-tag :type="levelType(scope.row.level)" size="small">{{ levelText(scope.row.level) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="80" max-width="180" />
        <el-table-column prop="source" label="来源" width="100" />
        <el-table-column label="操作" width="70">
          <template #default="scope">
            <el-button type="text" size="small" @click="showDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" title="日志详情" width="500px">
      <div v-if="currentLog">
        <p><b>时间：</b>{{ currentLog.time }}</p>
        <p><b>级别：</b>{{ levelText(currentLog.level) }}</p>
        <p><b>内容：</b>{{ currentLog.content }}</p>
        <p><b>来源：</b>{{ currentLog.source }}</p>
        <p><b>状态：</b>{{ currentLog.status }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'

const logStats = ref({ error: 0, warn: 0, info: 0 })
const totalLogs = ref(0)
const todayLogs = ref(0)
const unhandledLogs = ref(0)
const criticalLogs = ref(0)
const trendData = ref({ dates: [], error: [], warn: [], info: [] })
const logs = ref([])

// 新增：日志级别分布数据
const levelDistribution = ref([])

const filterLevel = ref('')
const filteredLogs = computed(() => {
  if (!filterLevel.value) return logs.value
  return logs.value.filter(l => l.level === filterLevel.value)
})

const fetchStats = async () => {
  const res = await request.get('/api/logs/stats')
  if (res) {
    // 兼容你的新数据结构
    totalLogs.value = res.total || 0
    todayLogs.value = res.today || 0
    unhandledLogs.value = res.unprocessed || 0
    criticalLogs.value = res.dangerous || 0
    // 处理日志级别分布
    if (Array.isArray(res.levelDistribution)) {
      levelDistribution.value = res.levelDistribution
      // 统计各级别数量
      const stats = { error: 0, warn: 0, info: 0 }
      res.levelDistribution.forEach(item => {
        if (item.level === 'ERROR') stats.error = item.count
        else if (item.level === 'WARN') stats.warn = item.count
        else if (item.level === 'INFO') stats.info = item.count
      })
      logStats.value = stats
    } else {
      logStats.value = res.levelStats || { error: 0, warn: 0, info: 0 }
    }
  }
}
const fetchTrend = async (start, end) => {
  const params = {}
  if (start && end) {
    params.start = start
    params.end = end
  }
  const res = await request.get('/api/logs/trend', { params })
  if (Array.isArray(res)) {
    trendData.value = {
      dates: res.map(item => item.date),
      total: res.map(item => item.count)
    }
  }
}
const fetchImportant = async () => {
  let url = '/api/logs/important'
  if (filterLevel.value) url = `/api/logs/important/${filterLevel.value}`
  const res = await request.get(url)
  logs.value = Array.isArray(res) ? res : (res.data || [])
}

onMounted(() => {
  fetchStats()
  fetchTrend()
  fetchImportant()
  initChart()
  initTrend()
})

watch(filterLevel, () => fetchImportant())

const chartRef = ref(null)
const trendRef = ref(null)
let chartInstance = null
let trendInstance = null

function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  // 使用 levelDistribution 渲染饼图
  const pieData = levelDistribution.value.length > 0
    ? levelDistribution.value.map(item => ({
        value: item.count,
        name: item.level === 'ERROR' ? '错误' : item.level === 'WARN' ? '警告' : '信息'
      }))
    : [
        { value: logStats.value.error, name: '错误' },
        { value: logStats.value.warn, name: '警告' },
        { value: logStats.value.info, name: '信息' },
      ]
  const option = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        name: '日志级别',
        type: 'pie',
        radius: '50%',
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  chartInstance.setOption(option)
}

function initTrend() {
  if (!trendRef.value) return
  trendInstance = echarts.init(trendRef.value)
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    xAxis: { type: 'category', data: trendData.value.dates },
    yAxis: { type: 'value' },
    series: [
      { name: '总数', type: 'line', data: trendData.value.total, smooth: true, color: '#409eff' }
    ]
  }
  trendInstance.setOption(option)
}

onMounted(() => {
  initChart()
  initTrend()
})

watch(logStats, () => { if (chartInstance) initChart() })
watch(trendData, () => { if (trendInstance) initTrend() })

function levelType(level) {
  if (level === 'error') return 'danger'
  if (level === 'warn') return 'warning'
  return 'info'
}
function levelText(level) {
  if (level === 'error') return '错误'
  if (level === 'warn') return '警告'
  return '信息'
}

const detailVisible = ref(false)
const currentLog = ref(null)
async function showDetail(row) {
  // 调用 markLogAsRead
  try {
    await request.get(`/api/logs/${row.id}`)
    // 可选：本地状态同步为已读
    if (row.status !== undefined) row.status = 1
  } catch (e) {}
  currentLog.value = row
  detailVisible.value = true
}

function headerCellStyle() {
  return {
    background: 'rgba(0,213,255,0.08)',
    color: '#222',
    fontWeight: 'bold',
    border: '1px solid #00d5ff33',
    padding: '6px 10px',
    fontSize: '14px',
    fontFamily: 'inherit',
  };
}
function bodyCellStyle() {
  return {
    background: 'transparent',
    color: '#222',
    border: '1px solid #00d5ff33',
    padding: '6px 10px',
    fontSize: '14px',
    fontFamily: 'inherit',
  };
}

</script>

<style scoped>
.log-dashboard {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.dashboard-cards {
  margin-bottom: 8px;
  flex-shrink: 0;
}
.card-title {
  font-size: 14px;
  color: #888;
}
.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-top: 8px;
}
.chart-small {
  width: 100%;
  height: 180px;
}
.log-table {
  width: 100%;
  margin-top: 12px;
  border-radius: 10px;
  border: 1px solid #00d5ff33;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.08);
  table-layout: fixed;
  word-break: break-all;
  background: rgba(255,255,255,0.08) !important;
  font-size: 13px;
}
:deep(.el-table__header) {
  background: rgba(0,213,255,0.08) !important;
}
:deep(.el-table__cell),
:deep(.el-table th),
:deep(.el-table td) {
  padding-top: 2px !important;
  padding-bottom: 2px !important;
  min-height: 22px !important;
  height: 22px !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: transparent !important;
  color: #222;
  font-size: 13px !important;
}
:deep(.el-tag) {
  background: #b2ebf2 !important;
  color: #00bcd4 !important;
  border: none !important;
  font-size: 12px !important;
  height: 18px !important;
  line-height: 18px !important;
  padding: 0 5px !important;
}
</style>
