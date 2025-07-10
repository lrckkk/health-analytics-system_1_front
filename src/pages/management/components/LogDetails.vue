<template>
  <div class="panel-content">
    <h2 class="title">日志明细</h2>
    <div class="log-details-toolbar">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        size="small"
      />
      <el-select v-model="selectedLevel" placeholder="日志级别" size="small" style="width: 120px">
        <el-option label="全部" value="" />
        <el-option label="错误" value="error" />
        <el-option label="警告" value="warn" />
        <el-option label="信息" value="info" />
      </el-select>
      <el-input v-model="sourceFilter" placeholder="来源检索" size="small" style="width: 160px" clearable />
      <el-button size="small" type="primary" @click="searchLogs">搜索</el-button>
      <el-button size="small" @click="resetFilters">重置</el-button>
    </div>
    <el-table
      :data="logs"
      v-if="logs.length > 0"
      stripe
      border
      class="log-table user-table"
      :style="tableStyle"
      :header-cell-style="headerCellStyle"
      :cell-style="bodyCellStyle"
      size="small"
      show-overflow-tooltip
      :row-class-name="rowClassName"
      :cell-class-name="cellClassName"
      :row-style="rowStyle"
      :header-row-style="headerRowStyle"
      :header-cell-class-name="headerCellClassName"
      :empty-text="'暂无日志数据'"
      :fit="true"
      :highlight-current-row="true"
      :table-layout="'fixed'"
      :max-height="420"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="time" label="时间" width="180" />
      <el-table-column prop="level" label="级别" width="100">
        <template #default="scope">
          <el-tag :type="levelType(scope.row.level)" disable-transitions>{{ levelText(scope.row.level) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="source" label="来源" width="220" />
      <el-table-column prop="content" label="日志内容" min-width="120" />
      <el-table-column prop="important" label="重要" width="60">
        <template #default="scope">
          <el-tag v-if="scope.row.important" type="warning" disable-transitions>是</el-tag>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column prop="dangerous" label="危险" width="60">
        <template #default="scope">
          <el-tag v-if="scope.row.dangerous" type="danger" disable-transitions>是</el-tag>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="已读" width="60">
        <template #default="scope">
          <el-tag v-if="scope.row.status" type="success" disable-transitions>是</el-tag>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="scope">
          <div class="op-btns">
            <el-button size="small" type="primary" @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)" style="margin-left:4px;">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div v-else style="text-align:center;color:#888;margin:32px 0;">暂无日志数据</div>
    <el-dialog v-model="dialogVisible" title="日志详情" width="420px">
      <div v-if="currentLog" class="log-dialog-content">
        <div class="log-dialog-row"><span class="log-dialog-label">时间：</span>{{ currentLog.timestamp }}</div>
        <div class="log-dialog-row"><span class="log-dialog-label">级别：</span>{{ levelText(currentLog.level) }}</div>
        <div class="log-dialog-row"><span class="log-dialog-label">来源：</span>{{ currentLog.source }}</div>
        <div class="log-dialog-row"><span class="log-dialog-label">内容：</span>{{ currentLog.content || currentLog.message }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from '@/utils/request'

// 日志数据由后端接口获取
const logs = ref([])

const dateRange = ref([]);
const selectedLevel = ref("");
const sourceFilter = ref("");

const filteredLogs = computed(() => {
  // 调试输出
  console.log('logs.value:', logs.value)
  const mapped = logs.value.map(log => ({
    id: log.id || log.logId || log.ID,
    timestamp: log.timestamp || log.time || log.createTime || '',
    level: (log.level || log.logLevel || '').toLowerCase(),
    source: log.source || log.logSource || '',
    content: log.content || log.message || log.logMessage || '',
    ...log
  }))
  console.log('mapped:', mapped)
  const filtered = mapped.filter((log) => {
    const inLevel = !selectedLevel.value || log.level === selectedLevel.value;
    const inSource = !sourceFilter.value || log.source?.includes(sourceFilter.value);
    let inDate = true;
    if (dateRange.value && dateRange.value.length === 2) {
      const start = new Date(dateRange.value[0]).getTime();
      const end = new Date(dateRange.value[1]).getTime();
      const logTime = new Date(log.timestamp).getTime();
      inDate = logTime >= start && logTime <= end;
    }
    return inLevel && inSource && inDate;
  })
  console.log('filtered:', filtered)
  return filtered
});

const fetchLogs = async () => {
  try {
    // 构造查询参数
    const params = {}
    if (dateRange.value && dateRange.value.length === 2) {
      // 只传递日期部分并补全为T00:00:00
      params.startTime = dateRange.value[0] ? dateRange.value[0].toISOString().slice(0, 10) + 'T00:00:00' : undefined
      params.endTime = dateRange.value[1] ? dateRange.value[1].toISOString().slice(0, 10) + 'T00:00:00' : undefined
    }
    if (selectedLevel.value) params.level = selectedLevel.value
    if (sourceFilter.value) params.source = sourceFilter.value
    const res = await request.get('/api/logs', { params })
    // 兼容后端返回格式
    if (Array.isArray(res)) {
      logs.value = res
    } else if (Array.isArray(res.data)) {
      logs.value = res.data
    } else if (Array.isArray(res.result)) {
      logs.value = res.result
    } else {
      logs.value = []
    }
    console.log('fetchLogs set logs.value:', logs.value)
  } catch (e) {
    logs.value = []
  }
}

// 新增：搜索按钮调用 fetchLogs
function searchLogs() {
  fetchLogs();
}

const fetchLogDetail = async (id) => {
  try {
    // 调用 getLogById，后端会自动 markLogAsRead
    const res = await request.get(`/api/logs/${id}`)
    // 兼容后端返回格式
    return res.data || res || null
  } catch (e) {
    return null
  }
}

const dialogVisible = ref(false);
const currentLog = ref(null);
function handleView(row) {
  // 查看详情时自动设为已读
  fetchLogDetail(row.id || row.logId).then(detail => {
    if (detail) {
      // 可选：本地数据同步为已读
      if (detail.status !== 1) {
        const idx = logs.value.findIndex(l => l.id === detail.id)
        if (idx !== -1) logs.value[idx].status = 1
      }
      currentLog.value = detail
    } else {
      currentLog.value = row
    }
    dialogVisible.value = true
  })
}
function handleDelete(row) {
  ElMessageBox.confirm(`确定要删除该日志吗？`, "提示", {
    type: "warning",
  })
    .then(async () => {
      try {
        await request.delete(`/api/logs/${row.id || row.logId}`)
        logs.value = logs.value.filter((log) => log.id !== row.id)
        ElMessage.success("删除成功")
      } catch (e) {
        ElMessage.error("删除失败")
      }
    })
    .catch(() => {});
}

onMounted(fetchLogs)

const tableStyle = {
  background: 'rgba(255,255,255,0.08)', // 与UsersPanel一致
  borderRadius: '10px',
  border: '1px solid #00d5ff33',
  boxShadow: '0 0 10px rgba(0,255,255,0.08)',
  marginTop: '20px',
  width: '100%',
  fontSize: '15px',
  fontFamily: 'inherit',
  color: '#222',
};

function headerCellStyle({ row, column, rowIndex, columnIndex }) {
  if (rowIndex === 0) {
    return {
      background: 'rgba(0,213,255,0.08)',
      color: '#222',
      fontWeight: 'bold',
      border: '1px solid #00d5ff33',
      padding: '8px 12px',
      whiteSpace: 'pre-line',
      fontSize: '15px',
      fontFamily: 'inherit',
    };
  }
  return {};
}
function bodyCellStyle({ row, column, rowIndex, columnIndex }) {
  return {
    background: 'transparent',
    color: '#222',
    border: '1px solid #00d5ff33',
    padding: '8px 12px',
    fontSize: '15px',
    fontFamily: 'inherit',
  };
}

function rowClassName({row, rowIndex}) {
  return row.status === 1 ? 'log-row-read' : 'log-row-unread';
}
function cellClassName({row, column, rowIndex, columnIndex}) {
  return '';
}
function rowStyle({row, rowIndex}) {
  return {};
}
function headerRowStyle({row, rowIndex}) {
  return {};
}
function headerCellClassName({row, column, rowIndex, columnIndex}) {
  return '';
}

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
</script>

<style scoped>
.panel-content {
  user-select: none;
  cursor: default;
  background: rgba(255, 255, 255, 0.06);
  padding: 24px;
  border-radius: 10px;
  border: 1px solid rgba(0, 213, 255, 0.15);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.08);
}
.log-details-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.log-table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  background: rgba(255,255,255,0.08) !important;
  border-radius: 10px;
  border: 1px solid #00d5ff33;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.08);
  table-layout: fixed;
  word-break: break-all;
}
:deep(.el-table__header) {
  background: rgba(0,213,255,0.08) !important;
}
:deep(.el-table__cell),
:deep(.el-table th),
:deep(.el-table td) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  min-height: 28px !important;
  height: 28px !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: transparent !important;
  color: #222;
}
:deep(.el-table__row.log-row-unread) {
  background: #e0f7fa !important;
}
:deep(.el-table__row.log-row-read) {
  background: transparent !important;
}
:deep(.el-table__cell .el-button) {
  margin-right: 4px;
}
:deep(.el-table__cell .el-button:last-child) {
  margin-right: 0;
}
:deep(.el-tag) {
  background: #b2ebf2 !important;
  color: #00bcd4 !important;
  border: none !important;
}
:deep(.el-tag.danger) {
  background: #ffcdd2 !important;
  color: #b71c1c !important;
}
:deep(.el-tag.warning) {
  background: #fff9c4 !important;
  color: #f57c00 !important;
}
:deep(.el-tag.info) {
  background: #b2ebf2 !important;
  color: #00bcd4 !important;
}
.log-dialog-content {
  padding: 8px 0 0 0;
}
.log-dialog-row {
  margin-bottom: 10px;
  font-size: 15px;
  color: #333;
  display: flex;
}
.log-dialog-label {
  min-width: 60px;
  color: #888;
  font-weight: 500;
  display: inline-block;
}
.op-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  justify-content: flex-start;
}
</style>
