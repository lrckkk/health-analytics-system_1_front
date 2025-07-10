<template>
  <div class="data-panel-management">
    <div class="user-select-group">
      <el-select v-model="selectedUserId" placeholder="请选择用户" :disabled="loadingUsers" filterable style="width: 220px;">
        <el-option v-for="user in users" :key="user.userId" :label="user.username" :value="user.userId" />
      </el-select>
    </div>
    <div class="dashboard" v-if="selectedUserId">
      <el-checkbox-group v-model="selectedTypes" style="margin-bottom: 18px;">
        <el-checkbox v-for="w in allTypes" :key="w.type" :label="w.type">{{ w.label }}</el-checkbox>
      </el-checkbox-group>
      <PanelEditor
        v-model:widgets="userPanelConfig[selectedUserId]"
        :allowed-types="selectedTypes"
        :user-id="selectedUserId"
        @save="handlePanelSave(selectedUserId)"
      />
    </div>
    <div v-else class="empty-state">
      <p>请选择用户以定制其数据面板视图。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import PanelEditor from '@/components/PanelEditor.vue'

const users = ref([])
const loadingUsers = ref(false)
const selectedUserId = ref(null)

const allTypes = [
  { type: 'number', label: '数字牌' },
  { type: 'pie', label: '扇形统计图' },
  { type: 'bar', label: '条形统计图' },
  { type: 'line', label: '折线统计图' },
  { type: 'stack', label: '条形分布图' },
  { type: 'doughnut', label: '环形分布图' },
]

const userPanelConfig = ref({})
const selectedTypes = ref(allTypes.map(t => t.type))

onMounted(async () => {
  loadingUsers.value = true
  try {
    const res = await request.get('/api/admin/users')
    users.value = res.data || []
    if (users.value.length) {
      selectedUserId.value = users.value[0].userId
      users.value.forEach(u => {
        if (!userPanelConfig.value[u.userId]) userPanelConfig.value[u.userId] = []
      })
    }
  } catch (e) {
    users.value = []
  } finally {
    loadingUsers.value = false
  }
})

function handlePanelSave(userId) {
  return (config) => {
    userPanelConfig.value[userId] = config
    window.$message?.success?.('保存成功！')
  }
}
</script>

<style scoped>
.data-panel-management {
  padding: 30px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background: #f8fbfd;
  border-radius: 12px;
  box-shadow: 0 2px 16px 0 rgba(0, 213, 255, 0.08);
}
.user-select-group {
  margin-bottom: 24px;
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px 8px 20px;
  box-shadow: 0 1px 6px 0 rgba(0, 213, 255, 0.06);
}
.dashboard {
  background: #fff;
  border-radius: 10px;
  padding: 24px 18px 18px 18px;
  box-shadow: 0 2px 12px 0 rgba(0, 213, 255, 0.07);
}
.empty-state {
  color: #aaa;
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
}
</style>
