<template>
  <header class="app-header tech-header">
    <div class="real-time">
      <el-icon><Clock /></el-icon>
      <span>{{ currentTime }}</span>
    </div>
    <div class="header-title">
      <el-icon class="title-icon"><Opportunity /></el-icon>
      <span>大数据医疗可视化平台</span>
    </div>
    <el-button @click="handleNewButtonClick('管理设置')" class="nav-button tech-button" link>
      <el-icon><Setting /></el-icon>
      <span>管理设置</span>
    </el-button>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { defineComponent } from 'vue';
import router from "@/pages/user/router.js"; // 保持路由引入
import { ElButton, ElMessage, ElIcon } from 'element-plus'; // 导入 Element Plus 组件和消息提示

// 导入 Element Plus 图标
import { Clock, Monitor, Grid, DataAnalysis, MapLocation, TrendCharts, Setting, Opportunity } from '@element-plus/icons-vue';
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

const handleNewButtonClick = (name) => {
  console.log('点击了按钮：', name)
}
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.header-title {
  display: flex;
  align-items: center;
}

.title-icon {
  margin-right: 5px;
}

/* 实时时间样式 */
.real-time {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  margin-right: auto;
  margin-left: 30px;
}

.real-time el-icon {
  margin-right: 4px;
}

.nav-button {
  margin-left: auto;
}
/* 科技风页眉样式 - 从原有文件中剪切并粘贴到这里 */
.app-header.tech-header {
  width: 100%;
  height: 100%; /* 固定页眉高度 */
  padding: 0 30px;
  background: linear-gradient(to right, #0a1b2e, #000b1a);
  color: #e0f2f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 150, 255, 0.2), 0 0 15px rgba(0, 150, 255, 0.1);
  border-bottom: 1px solid rgba(0, 180, 255, 0.4);
  z-index: 100;
  position: sticky;
  top: 0;
  left: 0;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.tech-header .header-title {
  font-family: 'Segoe UI', 'Roboto', sans-serif, 'Microsoft YaHei', 'PingFang SC';
  font-size: 2.2em;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-shadow: 0 0 12px rgba(0, 224, 255, 0.9), 0 0 25px rgba(0, 224, 255, 0.5);
  flex-shrink: 0;
  margin-right: 40px;
  color: #00e0ff;
  display: flex;
  align-items: center;
}

.header-title .title-icon {
  font-size: 1.2em;
  margin-right: 10px;
  color: #00e0ff;
  filter: drop-shadow(0 0 5px rgba(0, 224, 255, 0.7));
}

.header-nav.fill-width {
  flex-grow: 1;
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 15px;
}

/* Element Plus 按钮基础样式覆盖 */
.el-button.nav-button.tech-button {
  flex: 1;
  min-width: 90px;
  height: 48px;
  background: transparent;
  color: #e0f2f7;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.05em;
  font-weight: 500;
  transition: all 0.3s ease;
  text-transform: uppercase;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  text-decoration: none;
}

.el-button.nav-button.tech-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid rgba(0, 150, 255, 0.4);
  border-radius: 4px;
  box-shadow: 0 0 8px rgba(0, 150, 255, 0.2);
  transition: all 0.3s ease;
}

.el-button.nav-button.tech-button:hover::before {
  border-color: #00e0ff;
  box-shadow: 0 0 15px rgba(0, 224, 255, 0.6), inset 0 0 5px rgba(0, 224, 255, 0.3);
}

.el-button.nav-button.tech-button:hover {
  color: #00e0ff;
  transform: translateY(-2px);
}

.el-button.nav-button.tech-button:active {
  transform: translateY(0);
  box-shadow: none;
  background-color: rgba(0, 150, 255, 0.1);
}

.el-button.nav-button.tech-button .el-icon {
  font-size: 1.5em;
  margin-bottom: 5px;
  color: inherit;
}

/* Element Plus Message Box 科技风样式 - 也应该放在公共样式或需要它的组件样式中 */
/* 这里为了方便测试，先放在这里，实际项目中建议放在全局样式文件 */
.el-message.tech-message {
  background-color: rgba(26, 42, 58, 0.9);
  border: 1px solid rgba(0, 150, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 150, 255, 0.3);
  color: #e0f2f7;
}
.el-message.tech-message .el-message__content {
  color: inherit;
}
.el-message.tech-message.el-message--info {
  background-color: rgba(26, 42, 58, 0.9);
}
.el-message.tech-message.el-message--success {
  background-color: rgba(26, 42, 58, 0.9);
}
</style>