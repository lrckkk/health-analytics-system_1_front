<template>
  <div class="page-container">
    <header class="app-header tech-header">
      <div class="header-title">大数据医疗</div>
      <nav class="header-nav fill-width">
        <button @click="goToTargetPage" class="nav-button tech-button">跳转页面</button>
        <button @click="goTocard" class="nav-button tech-button">跳转卡片</button>
        <button @click="handleNewButtonClick('数据概览')" class="nav-button tech-button">数据概览</button>
        <button @click="handleNewButtonClick('区域分析')" class="nav-button tech-button">区域分析</button>
        <button @click="handleNewButtonClick('趋势预测')" class="nav-button tech-button">趋势预测</button>
        <button @click="handleNewButtonClick('设置')" class="nav-button tech-button">设置</button>
      </nav>
    </header>
    <router-view></router-view>
    <div>{{selectedRegion}}</div>

    <div v-if="mapDataStore.isLoading" class="loading-overlay">加载数据中，请稍候...喵~</div>
    <div v-if="mapDataStore.error" class="error-message">加载数据失败：{{ mapDataStore.error }}，喵~</div>

    <div class="bottom-align" v-if="!mapDataStore.isLoading && !mapDataStore.error">
      <ChinaMap
          @region-clicked="handleRegionClick"
          :provinceData="mapDataStore.provinceData"
          :scatterData="mapDataStore.scatterData"
          :pieSeriesData="mapDataStore.pieSeriesData"
      />
    </div>
  </div>
</template>

<script>
import ChinaMap from '../../components/Map.vue';
import { ref, onMounted } from 'vue';
import router from "@/pages/user/router.js";
import { useMapDataStore } from '@/stores/TotalData.js';

export default {
  components: { ChinaMap /* , heatmap */ },
  setup() {
    const selectedRegion = ref(null);
    const mapDataStore = useMapDataStore();

    const handleRegionClick = (regionName) => {
      selectedRegion.value = regionName;
    };

    const goToTargetPage = () => {
      router.push({ name: 'Home' });
    };

    const goTocard = () => {
      router.push({ name: 'Card' });
    };

    const handleNewButtonClick = (buttonName) => {
      alert(`你点击了：${buttonName}！`);
      // 在这里添加未来按钮的具体逻辑
    };

    onMounted(() => {
      if (mapDataStore.provinceData.length === 0 && !mapDataStore.isLoading) {
        mapDataStore.fetchMapData();
      }
    });

    return {
      handleRegionClick,
      selectedRegion,
      goToTargetPage,
      goTocard,
      handleNewButtonClick,
      mapDataStore,
    };
  },
};
</script>

<style>
/* 现有样式（保持不变） */
.page-container {
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
}
.bottom-align {
  position: fixed;
  top: 10%; /* 调整以适应页眉高度 */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  width: 40%;
  height: 40%;
  padding: 1px;
  border-radius: 1px;
  border: 2px solid transparent;
  background-origin: border-box;
  background-clip: padding-box, border-box;
}

.loading-overlay, .error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 20px 30px;
  border-radius: 10px;
  font-size: 1.2em;
  z-index: 1000;
  text-align: center;
}

.error-message {
  background-color: rgba(255, 0, 0, 0.7);
}

/* --- 科技风页眉新增及修改样式 --- */
.app-header.tech-header {
  width: 100%;
  padding: 15px 30px;
  /* 科技感背景：深蓝灰，带一点点发光效果 */
  background: linear-gradient(to right, #1a2a3a, #101c2a);
  color: #e0f2f7; /* 浅蓝色文字 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 科技感阴影：更锐利，带一点蓝色光晕 */
  box-shadow: 0 4px 15px rgba(0, 150, 255, 0.3), 0 0 20px rgba(0, 150, 255, 0.1);
  z-index: 10;
  position: sticky;
  top: 0;
  left: 0;
  border-bottom: 1px solid rgba(0, 150, 255, 0.5); /* 底部细边框 */
}

.tech-header .header-title {
  font-family: 'Segoe UI', 'Roboto', sans-serif; /* 更现代的字体 */
  font-size: 2em; /* 标题更大更醒目 */
  font-weight: 600;
  letter-spacing: 2px; /* 字符间距增加 */
  text-shadow: 0 0 8px rgba(0, 150, 255, 0.6); /* 文字发光效果 */
  flex-shrink: 0; /* 确保标题不被挤压 */
  margin-right: 30px; /* 标题与导航间距 */
}

.header-nav.fill-width {
  flex-grow: 1; /* 导航区域占据所有可用空间 */
  display: flex;
  justify-content: space-around; /* 按钮平均分布 */
  align-items: center;
  gap: 10px; /* 按钮之间的间隙 */
}

.nav-button.tech-button {
  flex: 1; /* 每个按钮占据等宽空间 */
  min-width: 80px; /* 确保按钮不会太窄 */
  background: linear-gradient(to bottom, #007bff, #0056b3); /* 蓝色渐变按钮 */
  color: white;
  padding: 12px 0; /* 上下内边距，左右由flex自动分配 */
  border: 1px solid rgba(0, 150, 255, 0.7); /* 蓝色边框 */
  border-radius: 3px; /* 略微锐利的圆角 */
  cursor: pointer;
  font-size: 1.05em;
  font-weight: 500;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  /* 科技感阴影和悬停效果 */
  box-shadow: 0 2px 8px rgba(0, 150, 255, 0.3);
  text-transform: uppercase; /* 按钮文字大写，增加科技感 */
}

.nav-button.tech-button:hover {
  background: linear-gradient(to bottom, #0056b3, #003d80); /* 悬停时颜色变深 */
  transform: translateY(-2px); /* 略微上浮效果 */
  box-shadow: 0 4px 12px rgba(0, 150, 255, 0.5); /* 悬停时阴影更明显 */
}
</style>