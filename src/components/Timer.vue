<template>
  <div class="real-time-clock">
    <el-icon class="clock-icon"><Clock /></el-icon>
    <span>{{ currentTime }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Clock } from '@element-plus/icons-vue'

const currentTime = ref('')

const updateTime = () => {
  const now = new Date()
  const format = (n) => String(n).padStart(2, '0')
  currentTime.value = `${now.getFullYear()}-${format(now.getMonth() + 1)}-${format(now.getDate())} ${format(now.getHours())}:${format(now.getMinutes())}:${format(now.getSeconds())}`
}

let timer = null

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.real-time-clock {
  display: flex;
  align-items: center;
  user-select: none;
  color: #4acfff ;
  font-size: 14px;
}

.clock-icon {
  color: #409EFF; /* 蓝色图标 */
  margin-right: 6px;
}
</style>
