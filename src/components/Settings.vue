<template>
  <el-button @click="goToManagement" class="settings-button" link>
    <el-icon class="icon"><Setting /></el-icon>
  </el-button>
</template>

<script setup>
import { Setting } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToManagement = () => {
  router.push('/manage')
}
</script>

<style scoped>
.settings-button {
  padding: 8px;
  border: none;
  background: transparent;
  color: #00eaff;
}

.icon {
  font-size: 26px;
  color: #00eaff;
  user-select: none;
}
</style>
