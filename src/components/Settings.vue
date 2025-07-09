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

.settings-button:hover {
  transform: translateY(-3px) scale(1.2);
  filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.7));
}
.icon {
  font-size: 26px;
  color: #00eaff;
  user-select: none;
}

.settings-button:hover .icon {
  color: #7d5fff;
  animation: pulseGlow 1.5s infinite alternate;
}

@keyframes pulseGlow {
  0% {
    filter: drop-shadow(0 0 4px rgba(0, 240, 255, 0.5));
  }
  100% {
    filter: drop-shadow(0 0 12px rgba(125, 95, 255, 0.8));
  }
}
</style>
