<template>



  <div class="rankings-grid">

    <RankingList
        title="费用排名排位"
        :data="mapDataStore.totalCostData"
        :selected-region-id="regionStore.getRegionId"
    />

    <!--      <RankingList-->
    <!--          title="人口排行榜"-->
    <!--          :data="mapDataStore.populationData"-->
    <!--          :selected-region-id="regionStore.getRegionId"-->
    <!--      />-->

  </div>

</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRegionStore } from '@/stores/RegionData.js'; // 保持不变，用于区域选择
import { useMapDataStore } from '@/stores/TotalData.js'; // 引入新的 store
import RankingList from '@/components/RankingList.vue';

const regionStore = useRegionStore();
const mapDataStore = useMapDataStore(); // 初始化新的 mapDataStore


// --- 数据加载 ---
// 不再需要 selectedYear 和 availableYears

// 在组件挂载时获取全国数据
// onMounted(() => {
//   // 调用 mapDataStore 中的 fetchMapData 来加载所有需要的全国数据
//   // fetchMapData 会调用 fetchcountryData，后者会填充 populationData, bedData 等
//   mapDataStore.fetchMapData();
// });

// --- 数据转换: 从 Pinia Store 转换为 [{id, value}] ---
// 注意：processCacheToRankingData 不再需要，因为 mapDataStore 中的数据已经是 {id, value} 格式了

// 为病床排行榜准备数据
const bedRankingData = computed(() => {
  // mapDataStore.bedData 已经是 [{id, value}] 格式，无需额外转换
  return mapDataStore.bedData;
});

// 为人口排行榜准备数据
const populationRankingData = computed(() => {
  // mapDataStore.populationData 已经是 [{id, value}] 格式，无需额外转换
  return mapDataStore.populationData;
});

</script>

<style scoped>
/* 样式与之前的版本相同，保持不变 */
.controls {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f0f4f8;
  border-radius: 8px;
}
/* ... 其他样式 ... */
.full-loading {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
  color: #555;
}
.rankings-grid {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}
</style>