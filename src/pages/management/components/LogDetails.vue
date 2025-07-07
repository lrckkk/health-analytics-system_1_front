<template>
  <div class="log-details">
    <el-card>
      <h3>日志详情</h3>

      <div class="filter-bar">
        <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
            style="margin-right: 12px"
        />
        <el-select
            v-model="selectedLevel"
            placeholder="选择级别"
            size="small"
            clearable
            style="margin-right: 12px; width: 120px"
        >
          <el-option label="错误" value="error" />
          <el-option label="警告" value="warn" />
          <el-option label="信息" value="info" />
        </el-select>
        <el-input
            v-model="keyword"
            placeholder="关键字搜索"
            size="small"
            clearable
            style="width: 200px"
        />
        <el-button
            type="primary"
            size="small"
            @click="searchLogs"
            style="margin-left: 8px"
        >搜索</el-button
        >
        <el-button size="small" @click="resetFilters" style="margin-left: 8px"
        >重置</el-button
        >
      </div>

      <el-table :data="filteredLogs" stripe style="width: 100%; margin-top: 12px">
        <el-table-column prop="timestamp" label="时间" width="180" />
        <el-table-column prop="level" label="级别" width="100" />
        <el-table-column prop="message" label="日志内容" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// 模拟日志数据
const logs = ref([
  { timestamp: "2025-07-01 10:00:00", level: "error", message: "系统异常" },
  { timestamp: "2025-07-02 11:20:00", level: "warn", message: "磁盘空间不足" },
  { timestamp: "2025-07-03 09:30:00", level: "info", message: "用户登录成功" },
  { timestamp: "2025-07-04 14:15:00", level: "error", message: "数据库连接失败" },
  { timestamp: "2025-07-05 08:00:00", level: "info", message: "定时任务执行完毕" },
]);

const dateRange = ref([]);
const selectedLevel = ref("");
const keyword = ref("");

const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    // 时间过滤
    if (dateRange.value.length === 2) {
      const logTime = new Date(log.timestamp).getTime();
      const start = new Date(dateRange.value[0]).getTime();
      const end = new Date(dateRange.value[1]).getTime();
      if (logTime < start || logTime > end) return false;
    }
    // 级别过滤
    if (selectedLevel.value && log.level !== selectedLevel.value) return false;
    // 关键字过滤
    if (keyword.value && !log.message.includes(keyword.value)) return false;
    return true;
  });
});

function searchLogs() {
  // 这里直接用了计算属性 filteredLogs，没额外请求
}

function resetFilters() {
  dateRange.value = [];
  selectedLevel.value = "";
  keyword.value = "";
}
</script>

<style scoped>
.el-card {
  background-color: transparent !important;
  box-shadow: none !important;
  color: #e7faff; /* 白色文字 */
  font-size: 14px;
  line-height: 1.6;
}

/* 表格表头 */
.el-table thead th {
  color: #a0cfff !important; /* 稍浅的蓝色，区分表头 */
}

/* 过滤栏文字颜色 */
.filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  color: #e7faff;
}

/* 输入框、下拉框字体颜色 */
.filter-bar .el-input__inner,
.filter-bar .el-select .el-input__inner {
  color: #e7faff;
  background-color: rgba(0,0,0,0.2);
  border-color: rgba(255,255,255,0.3);
}
</style>
