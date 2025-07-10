<template>
  <div>
    <h2>历史数据增长分析</h2>
    <button @click="loadData">加载测试数据</button>
    <div v-if="growthStore.historicalData.length > 0">
      <p>历史数据点：</p>
      <ul>
        <li v-for="item in growthStore.historicalData" :key="item.year">
          {{ item.year }}: {{ item.count.toFixed(2) }}
        </li>
      </ul>
      <hr>
      <p>平均增长率:
        <span v-if="growthStore.averageGrowthRate !== 0">
          {{ (growthStore.averageGrowthRate * 100).toFixed(2) }}%
        </span>
        <span v-else>
          数据不足或增长率为零
        </span>
      </p>
      <p v-if="growthStore.estimatedNextYearValue !== null">
        估算 2021 年的值: {{ growthStore.estimatedNextYearValue.toFixed(2) }}
      </p>
      <p v-else>
        无法估算下一年的值 (数据不足)
      </p>
    </div>
    <div v-else>
      <p>没有加载历史数据。</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useGrowthStore } from '@/utils/countgrow.js'; // 导入您创建的 Store
import { useRegionStore } from '@/stores/RegionData.js'; // 导入区域数据 Pinia Store
const regionStore = useRegionStore();
const growthStore = useGrowthStore();

// 模拟从后端加载数据
const loadData = () => {
  const mockData = regionStore.populationDataCache[regionStore.getRegionId];
  growthStore.setHistoricalData(mockData);
};

onMounted(() => {
  // 在组件挂载时自动加载数据，实际应用中可能从 API 获取
  loadData();
});
</script>

<style scoped>
h2 {
  color: #333;
}
p {
  font-size: 1.1em;
  color: #555;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  background-color: #f0f0f0;
  margin-bottom: 5px;
  padding: 8px;
  border-radius: 4px;
}
button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
}
button:hover {
  background-color: #0056b3;
}
</style>