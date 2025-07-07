<template>
  <header class="app-header tech-header">
    <div class="header-title">
      <el-icon class="title-icon"><Opportunity /></el-icon>
      <span>大数据医疗可视化平台</span>
    </div>
    <nav class="header-nav fill-width">
      <el-button @click="goToTargetPage" class="nav-button tech-button" link>
        <el-icon><Monitor /></el-icon>
        <span>页面跳转</span>
      </el-button>
      <el-button @click="goTocard" class="nav-button tech-button" link>
        <el-icon><Grid /></el-icon>
        <span>卡片视图</span>
      </el-button>
      <el-button @click="handleNewButtonClick('数据概览')" class="nav-button tech-button" link>
        <el-icon><DataAnalysis /></el-icon>
        <span>数据概览</span>
      </el-button>
      <el-button @click="handleNewButtonClick('区域分析')" class="nav-button tech-button" link>
        <el-icon><MapLocation /></el-icon>
        <span>区域分析</span>
      </el-button>
      <el-button @click="handleNewButtonClick('趋势预测')" class="nav-button tech-button" link>
        <el-icon><TrendCharts /></el-icon>
        <span>趋势预测</span>
      </el-button>
      <el-button @click="handleNewButtonClick('系统设置')" class="nav-button tech-button" link>
        <el-icon><Setting /></el-icon>
        <span>系统设置</span>
      </el-button>
    </nav>
  </header>
</template>

<script>
import { defineComponent } from 'vue';
import router from "@/pages/user/router.js"; // 保持路由引入
import { ElButton, ElMessage, ElIcon } from 'element-plus'; // 导入 Element Plus 组件和消息提示

// 导入 Element Plus 图标
import { Monitor, Grid, DataAnalysis, MapLocation, TrendCharts, Setting, Opportunity } from '@element-plus/icons-vue';

export default defineComponent({
  name: 'AppHeader', // 组件名称
  components: {
    ElButton,
    ElIcon,
    // 注册 Element Plus 图标组件
    Monitor,
    Grid,
    DataAnalysis,
    MapLocation,
    TrendCharts,
    Setting,
    Opportunity,
  },
  setup() {
    // 页面跳转方法
    const goToTargetPage = () => {
      router.push({ name: 'Home' }); // 假设 Home 是您的目标路由名称
      ElMessage({
        message: '跳转到首页！',
        type: 'info',
        duration: 2000,
        customClass: 'tech-message'
      });
    };

    const goTocard = () => {
      router.push({ name: 'Text' }); // 假设 Card 是您的卡片视图路由名称
      ElMessage({
        message: '跳转到卡片视图！',
        type: 'info',
        duration: 2000,
        customClass: 'tech-message'
      });
    };

    // 其他按钮的点击处理
    const handleNewButtonClick = (buttonName) => {
      ElMessage({
        message: `你点击了：${buttonName}！`,
        type: 'success',
        duration: 2000,
        customClass: 'tech-message'
      });
    };

    return {
      goToTargetPage,
      goTocard,
      handleNewButtonClick,
    };
  },
});
</script>

<style scoped>
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