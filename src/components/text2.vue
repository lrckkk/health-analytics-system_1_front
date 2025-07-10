<script setup>
import {computed} from "vue";

import { useRegionStore } from '@/stores/RegionData.js'; // 导入区域数据 Pinia Store
import { useMapDataStore } from '@/stores/TotalData.js'; // 导入总数据 Pinia Store
import { provinceIdMap } from '@/utils/mapid.js'; // 导入省份 ID 映射
// 导入排名和数据处理函数，请确保路径正确
import { getValueAndRankById, getRankOfGivenValue } from '@/utils/countround.js';


// 初始化 Pinia Store
const regionStore = useRegionStore();
const mapDataStore = useMapDataStore()
const resultByIdDisplay = computed(() => {
  const data = mapDataStore.populationData; // 获取人口数据
  console.log(data)
  // 关键校验：确保数据是数组且不为空
  if (Array.isArray(data) && data.length > 0) {
    // 只有数据有效时才调用排名函数
    const result = getValueAndRankById(data, regionStore.getRegionId); // 查找 ID 为 5 的数据及其排名
    if (result) {
      return `值: ${result.value}, 排名: ${result.rank}`;
    }
  }
  return '数据加载中或无效 ID'; // 数据未加载或 ID 无效时的提示
});

const resultByValueDisplay = computed(() => {
  const data = mapDataStore.populationData; // 获取人口数据

  // 关键校验：确保数据是数组且不为空
  if (Array.isArray(data) && data.length > 0) {
    // 只有数据有效时才调用排名函数
    const result = getRankOfGivenValue(data, 10000); // 查找值 3000 的排名
    if (result && result.rank !== '未找到') { // 检查排名结果是否有效
      return `排名: ${result.rank}`;
    }
  }
  return '数据加载中或未找到此值'; // 数据未加载或值未找到时的提示
});

</script>

<template>
  <p>ID为5的排名: {{ resultByIdDisplay }}</p>
  <p>值为3000的排名: {{ resultByValueDisplay }}</p>
</template>

<style scoped>

</style>