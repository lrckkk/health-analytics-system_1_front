<template>
  <div class="log-details">
    <h2 class="title">日志明细</h2>
    <el-card>
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
      <el-table :data="filteredLogs" :cell-style="cellStyle" stripe class="log-table" style="width: 100%; margin-top: 12px">
        <el-table-column prop="timestamp" label="时间" width="180" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="scope">
            <el-tag :type="levelType(scope.row.level)">{{ levelText(scope.row.level) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="160" />
        <el-table-column prop="message" label="日志内容" min-width="260" />
        <el-table-column label="操作" width="140">
          <template #default="scope">
            <div class="op-btns">
              <el-button size="small" type="primary" @click="handleView(scope.row)">查看</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" title="日志详情" width="420px">
      <div v-if="currentLog" class="log-dialog-content">
        <div class="log-dialog-row"><span class="log-dialog-label">时间：</span>{{ currentLog.timestamp }}</div>
        <div class="log-dialog-row"><span class="log-dialog-label">级别：</span>{{ levelText(currentLog.level) }}</div>
        <div class="log-dialog-row"><span class="log-dialog-label">来源：</span>{{ currentLog.source }}</div>
        <div class="log-dialog-row"><span class="log-dialog-label">内容：</span>{{ currentLog.message }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

// 模拟日志数据
const logs = ref([
  { timestamp: "2025-07-01 10:00:00", level: "error", message: "系统异常", source: "服务A" },
  { timestamp: "2025-07-02 11:20:00", level: "warn", message: "磁盘空间不足", source: "服务B" },
  { timestamp: "2025-07-03 09:30:00", level: "info", message: "用户登录成功", source: "服务C" },
  { timestamp: "2025-07-04 14:15:00", level: "error", message: "数据库连接失败", source: "服务A" },
  { timestamp: "2025-07-05 08:00:00", level: "info", message: "定时任务执行完毕", source: "服务D" },
]);

const dateRange = ref([]);
const selectedLevel = ref("");
const sourceFilter = ref("");

const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
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
  });
});

function searchLogs() {
  // 这里只需触发filteredLogs的计算即可
}
function resetFilters() {
  dateRange.value = [];
  selectedLevel.value = "";
  sourceFilter.value = "";
}

function levelType(level) {
  if (level === "error") return "danger";
  if (level === "warn") return "warning";
  return "info";
}
function levelText(level) {
  if (level === "error") return "错误";
  if (level === "warn") return "警告";
  return "信息";
}

const dialogVisible = ref(false);
const currentLog = ref(null);
function handleView(row) {
  currentLog.value = row;
  dialogVisible.value = true;
}
function handleDelete(row) {
  ElMessageBox.confirm(`确定要删除该日志吗？`, "提示", {
    type: "warning",
  })
    .then(() => {
      logs.value = logs.value.filter((log) => log !== row);
      ElMessage.success("删除成功");
    })
    .catch(() => {});
}

function cellStyle() {
  return { color: '#222', fontSize: '15px', background: '#fff' };
}
</script>

<style scoped>
.log-details {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 0;
}
.title {
  margin: 0 0 16px 0;
  font-weight: 600;
  color: #a0eaff;
}
.log-details-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.el-card {
  box-shadow: 0 2px 8px #f0f1f2;
  border-radius: 8px;
  padding: 18px 16px 12px 16px;
}
.log-table {
  font-size: 15px;
}
.log-table .el-table__cell {
  padding: 8px 12px;
}
.el-table th {
  font-weight: bold;
  background: #f5f7fa !important;
}
.el-table__row {
  transition: background 0.2s;
}
.el-table__row:hover {
  background: #f0f9ff !important;
}
.el-tag {
  font-size: 13px;
}
.op-btns {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
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
</style>
