<template>
  <div class="card-content-inner-a">
    <bar-chart
        :width="barChartWidth"
        :chart-data="medicalPersonnelData"
        title="医疗卫生人员统计"
        height=80%
        x-field="year"
        y-field="count"
        color="#7DF9FF"

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
const regionStore = useRegionStore();
const medicalPersonnelData = ref([])
const medicalLoading = ref(true)
//
// const currentProvinceId = ref()//默认北京
//
// // 获取医疗机构数据
// const fetchMedicalData = async (region) => {
//   if (region===undefined||region===0) {
//     try {
//       medicalLoading.value = true
//       const response = await request.get(`/api/provinces/1/institution/years`)
//       medicalData.value = (response.data || response).map(item => ({
//         year: String(item.year),
//         count: Number(item.total)
//       }))
//       console.log('处理后的医疗机构图表数据:', medicalData.value)
//     } catch (error) {
//       console.error('获取医疗机构数据失败:', error)
//       medicalData.value = []
//     } finally {
//       medicalLoading.value = false
//     }
//   }
//   else{
//     try {
//       medicalLoading.value = true
//       const response = await request.get(`/api/provinces/${region}/institution/years`)
//       medicalData.value = (response.data || response).map(item => ({
//         year: String(item.year),
//         count: Number(item.total)
//       }))
//       console.log('处理后的医疗机构图表数据:', medicalData.value)
//     } catch (error) {
//       console.error('获取医疗机构数据失败:', error)
//       medicalData.value = []
//     } finally {
//       medicalLoading.value = false
//     }
//   }
// }

//
// const fetchAllData = async () => {
//   await Promise.all([
//     fetchMedicalData(),
//   ])
// }
watch(
    () => regionStore.getRegionId, // 侦听 Pinia store 中的 ID
    async (newRegionId) => {
      console.log(`检测到区域变化: ${newRegionId}，准备从 Store 获取数据...`);
      medicalLoading.value = true;
      try {
        // 直接调用 store 的 action，它会处理缓存逻辑
        const data = await regionStore.fetchbarChartWidthIfNeeded(newRegionId);
        medicalPersonnelData.value = data;
      } catch (error) {
        console.error("在组件中处理数据获取失败:", error);
        medicalPersonnelData.value = [];
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