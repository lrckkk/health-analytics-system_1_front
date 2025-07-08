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
      <el-table :data="filteredLogs" :cell-style="{color: '#222', fontSize: '15px', background: '#fff'}" style="width: 100%; margin-top: 12px;" height="260">
        <el-table-column prop="time" label="时间" width="160" />
        <el-table-column prop="level" label="级别" width="80">
          <template #default="scope">
            <el-tag :type="levelType(scope.row.level)">{{ levelText(scope.row.level) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="内容" />
        <el-table-column prop="source" label="来源" width="120" />
        <el-table-column label="操作" width="80">
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
        <p><b>内容：</b>{{ currentLog.message }}</p>
        <p><b>来源：</b>{{ currentLog.source }}</p>
        <p><b>状态：</b>{{ currentLog.status }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import * as echarts from 'echarts'

// mock 日志统计数据
const logStats = ref({
  error: 20,
  warn: 15,
  info: 65,
})
const totalLogs = computed(() => logStats.value.error + logStats.value.warn + logStats.value.info)
const todayLogs = ref(12)
const unhandledLogs = ref(5)
const criticalLogs = ref(2)

// mock 日志趋势数据
const trendData = ref({
  dates: ['07-01','07-02','07-03','07-04','07-05','07-06','07-07','07-08'],
  error: [2,3,1,4,2,3,2,3],
  warn: [1,2,2,1,3,2,1,3],
  info: [8,7,9,6,8,7,8,9],
})

// mock 最新日志
const logs = ref([
  { time: '2025-07-08 10:01', level: 'error', message: '数据库连接失败', source: '服务A', status: '未处理' },
  { time: '2025-07-08 09:55', level: 'warn', message: '内存使用率高', source: '服务B', status: '未处理' },
  { time: '2025-07-08 09:50', level: 'info', message: '用户登录成功', source: '服务C', status: '已处理' },
  { time: '2025-07-08 09:45', level: 'error', message: '接口超时', source: '服务A', status: '未处理' },
  { time: '2025-07-08 09:40', level: 'info', message: '时任务完成', source: '服务D', status: '已处理' },
  { time: '2025-07-08 09:35', level: 'warn', message: '磁盘空间不足', source: '服务B', status: '已处理' },
])

const filterLevel = ref('')
const filteredLogs = computed(() => {
  if (!filterLevel.value) return logs.value
  return logs.value.filter(l => l.level === filterLevel.value)
})

const chartRef = ref(null)
const trendRef = ref(null)
let chartInstance = null
let trendInstance = null

function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  const option = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        name: '日志级别',
        type: 'pie',
        radius: '50%',
        data: [
          { value: logStats.value.error, name: '错误' },
          { value: logStats.value.warn, name: '警告' },
          { value: logStats.value.info, name: '信息' },
        ],
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
      { name: '错误', type: 'line', data: trendData.value.error, smooth: true, color: '#f56c6c' },
      { name: '警告', type: 'line', data: trendData.value.warn, smooth: true, color: '#e6a23c' },
      { name: '信息', type: 'line', data: trendData.value.info, smooth: true, color: '#409eff' },
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
function showDetail(row) {
  currentLog.value = row
  detailVisible.value = true
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

</style>
