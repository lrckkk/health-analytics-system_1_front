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

const activeKey = ref('import')
</script>

<template>
  <div class="management-container">
    <!-- 左侧导航栏 -->
    <Navigate @select="activeKey = $event" />
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

.panel-fullwidth {
  width: 100%;
  min-width: 0;
  padding-left: 1%;
  padding-right: 1%;
  margin: 0;
  box-sizing: border-box;
}
</style>
