<template>
  <div class="card-content-inner-a">
    <MultipleChart
        :width="multiChartWidth"
        :chart-data="medicalServiceData"
        title="医疗服务统计"
        height=120%
    />

  </div>
</template>





<script setup>
import {ref, onMounted, watch} from 'vue'
// 假设这些是您的公共组件路径
import Simpleline from '/src/components/simpleline.vue' // 请确保路径正确，可能需要调整
import BarChart from '@/components/BarChart.vue'
const barChartWidth = ref('100%')//单柱
import request from '@/utils/request'  // 确保 request 路径正确
import {useRegionStore} from '@/stores/RegionData.js';
import axios from "axios";
import MultipleChart from "@/components/MutipleChart.vue";
const regionStore = useRegionStore();
const medicalServiceData = ref([])
const multiChartWidth = ref('100%')//多柱
const medicalLoading = ref(true)
watch(
    () => regionStore.getRegionId, // 侦听 Pinia store 中的 ID
    async (newRegionId) => {

      medicalLoading.value = true;
      try {
        // 直接调用 store 的 action，它会处理缓存逻辑
        const data = await regionStore.fetchserviceDataIfNeeded(newRegionId);
        medicalServiceData.value = data;
      } catch (error) {
        console.error("在组件中处理数据获取失败:", error);
        medicalServiceData.value = [];
      } finally {
        medicalLoading.value = false;
      }
    },
    {
      immediate: true // 立即执行一次，确保组件挂载时就能加载初始数据
    }
);

// onMounted(() => {
//   fetchAllData()
// })
</script>








<style scoped>
/* 这个类用于包裹整个卡片内容，确保有背景和内边距 */
.card-content-inner-a {

  background-color: #e8f5e9; /* 淡绿色背景 */
  border-radius: 10px;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
  width: 100%; /* 确保填满父容器 */
  height: 100%; /* 确保填满父容器的高度 */
  text-align: center;
  color: #388e3c; /* 深绿色文本 */
  box-sizing: border-box; /* 让 padding 不会增加总尺寸 */
  display: flex; /* 使用 flex 布局，让内容垂直居中或排列 */
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
h3 {
  color: #2e7d32;
  margin-bottom: 10px;
}
p {
  line-height: 1.6;
}
</style>