<script setup>
import { ref } from 'vue'
import Navigate from '@/pages/management/components/Navigate.vue'
import ImportPanel from './components/ImportPanel.vue'
import ExportPanel from './components/ExportPanel.vue'
import UsersPanel from './components/UsersPanel.vue'
import LogDashboard from "@/pages/management/components/LogDashboard.vue";
import LogDetails from "@/pages/management/components/LogDetails.vue";
import DashBoard from "@/pages/management/components/DashBoard.vue";
import TagManager from "@/pages/management/components/TagManager.vue";
import router from "@/pages/user/router.js";
const activeKey = ref('import')

const goBackToProvince  = () => {
  router.push('/province');
};

</script>

<template>
  <div class="management-container">
    <!-- 左侧导航栏 -->
    <div class="left-panel">
    <Navigate @select="activeKey = $event" />
    <div class="back-button" @click="goBackToProvince">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="back-icon">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>返回地图</span>
    </div>
    </div>
    <!-- 右侧内容区 -->
    <main class="panel panel-fullwidth">
      <ImportPanel v-if="activeKey === 'import'" />
      <ExportPanel v-else-if="activeKey === 'export'" />
      <TagManager v-else-if="activeKey === 'tags'" />
      <UsersPanel v-else-if="activeKey === 'users'" />
      <DashBoard v-else-if="activeKey === 'panel'" />
      <LogDashboard v-else-if="activeKey === 'board'" />
      <LogDetails v-else-if="activeKey === 'details'" />
      <div v-else class="panel-content" style="user-select:none; cursor:default;">
        <p>请选择左侧功能模块进行管理操作。</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.management-container {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, rgba(0, 54, 85, 0.3), rgba(0, 80, 120, 0.3));
  backdrop-filter: blur(8px);
  font-family: 'Segoe UI', 'sans-serif';
  overflow: hidden;
}

/* 右侧主面板 */
.panel {
  height: 100%;
  flex: 1;
  padding: 5px;
  overflow-y: auto;
  color: #e7faff;
  box-sizing: border-box;
  min-height: 0;
}
.left-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.panel-fullwidth {
  width: 100%;
  min-width: 0;
  padding-left: 1%;
  padding-right: 1%;
  margin: 0;
  box-sizing: border-box;
}

/* 返回按钮样式 */
.back-button {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #e7faff;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 120, 180, 0.2);
  border-left: 3px solid transparent;
  margin-top: auto; /* 将按钮推到底部 */
  margin-bottom: 10px;
}

.back-button:hover {
  background: rgba(0, 150, 225, 0.3);
  border-left: 3px solid #00e0ff;
  color: #00e0ff;
}

.back-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  transition: all 0.3s ease;
}

.back-button:hover .back-icon {
  transform: translateX(-3px);
}

</style>
