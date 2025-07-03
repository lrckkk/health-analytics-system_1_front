<template>
  <div class="page-container">
    <router-view></router-view>
    <div>{{selectedRegion}}</div>
    <button @click="goToTargetPage">跳转页面</button>

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
import { useMapDataStore } from '@/stores/TotalData.js'; // 导入你的 store

export default {
  components: { ChinaMap /* , heatmap */ },
  setup() {
    const selectedRegion = ref(null);
    const mapDataStore = useMapDataStore(); // 使用你的 store

    const handleRegionClick = (regionName) => {
      selectedRegion.value = regionName;
    };

    const goToTargetPage = () => {
      router.push({ name: 'Home' });
    };

    // 在组件挂载时，如果数据没有加载过，就去加载它
    onMounted(() => {
      // 只有在数据未加载或者加载失败（需要重新加载）时才调用 fetchMapData
      if (mapDataStore.provinceData.length === 0 && !mapDataStore.isLoading) {
        mapDataStore.fetchMapData();
      }
    });

    return {
      handleRegionClick,
      selectedRegion,
      goToTargetPage,
      mapDataStore, // 将 store 暴露给模板，以便访问其 state
    };
  },
};
</script>

<style>
/* 样式与之前保持一致 */
.page-container {
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
}
.bottom-align {
  position: fixed;
  top: 10%;
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
</style>