<template>
  <div class="data-panel-management">
    <el-select
        v-model="selectedUserId"
        placeholder="请选择用户"
        style="width: 220px; margin-bottom: 24px;"
        clearable
        filterable
        :loading="loadingUsers"
        :disabled="loadingUsers"
        @change="handleUserChange"
        append-to-body
    >
      <el-option
          v-for="user in users"
          :key="user.id"
          :label="user.name"
          :value="user.id"
      />
    </el-select>

    <div v-if="selectedUserId === null" class="empty-state">
      <p>请选择一个用户以定制其数据面板视图。</p>
    </div>

    <div v-else class="dashboard">
      <h3>{{ currentUser?.name }} 的定制数据面板</h3>

      <el-checkbox-group v-model="selectedWidgets" @change="handleWidgetChange">
        <el-checkbox label="number" border>数字牌</el-checkbox>
        <el-checkbox label="pie" border>扇形统计图</el-checkbox>
        <el-checkbox label="bar" border>条形统计图</el-checkbox>
        <el-checkbox label="line" border>折线统计图</el-checkbox>
        <el-checkbox label="stack" border>条形分布图</el-checkbox>
        <el-checkbox label="doughnut"  border>环形分布图</el-checkbox>
      </el-checkbox-group>

      <div class="widgets-container" style="margin-top: 20px;">
        <div v-if="selectedWidgets.includes('number')" class="widget chart-widget">
          <h4>数字牌</h4>
          <!-- 这里你可以用图表库比如 ECharts / Chart.js 来做真实图表 -->
          <p>这里显示图表数据...</p>
        </div>

        <div v-if="selectedWidgets.includes('pie')" class="widget stats-widget">
          <h4>扇形统计图</h4>
          <p>这里显示统计数据...</p>
        </div>

        <div v-if="selectedWidgets.includes('bar')" class="widget logs-widget">
          <h4>条形统计图</h4>
          <p>这里显示日志摘要...</p>
        </div>
        <div v-if="selectedWidgets.includes('line')" class="widget logs-widget">
          <h4>折线统计图</h4>
          <p>这里显示日志摘要...</p>
        </div>
        <div v-if="selectedWidgets.includes('stack')" class="widget logs-widget">
          <h4>条形分布图</h4>
          <p>这里显示日志摘要...</p>
        </div>
        <div v-if="selectedWidgets.includes('doughnut')" class="widget logs-widget">
          <h4>环形统计图</h4>
          <p>这里显示日志摘要...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 模拟用户数据，真实环境你可能从接口请求
const users = ref([
  { id: 1, name: '普通用户' },
  { id: 2, name: '分析员' },
  { id: 3, name: 'wdf' }
])

const loadingUsers = ref(false)
const selectedUserId = ref(null)

// 模拟保存每个用户定制的面板控件
const userWidgets = ref({
  1: ['chart', 'stats'],
  2: ['logs'],
  3: ['chart', 'logs', 'stats']
})

// 当前用户对象
const currentUser = computed(() => {
  return users.value.find(u => u.id === selectedUserId.value) || null
})

// 当前用户的已选控件（复选框绑定）
const selectedWidgets = ref([])

// 监听用户切换，初始化控件状态
watch(selectedUserId, (newId) => {
  if (newId && userWidgets.value[newId]) {
    selectedWidgets.value = [...userWidgets.value[newId]]
  } else {
    selectedWidgets.value = []
  }
})

// 用户切换事件
function handleUserChange(id) {
  // 这里也可以同步调用接口，获取该用户的面板配置
}

// 控件选择变更，保存配置
function handleWidgetChange(newWidgets) {
  if (selectedUserId.value) {
    userWidgets.value[selectedUserId.value] = [...newWidgets]
  }
}
</script>

<style scoped>
.data-panel-management {
  padding: 30px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.empty-state {
  margin-top: 20px;
  font-style: italic;
  color: #999;
}

.dashboard h3 {
  margin-bottom: 16px;
}

.widgets-container {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.widget {
  flex: 1 1 300px;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 16px;
  background: #f9f9f9;
  box-sizing: border-box;
}

.widget h4 {
  margin-bottom: 12px;
}
</style>
