<template>
  <div class="card-content-inner-a">



      <scatter-chart
          :chart-data="costData"
          :width="scatterChartWidth"
          title="医疗费用年度分布"
          height=80%
          color="#00B4D8"
      />
    </div>

</template>

<script setup>
const scatterChartWidth = ref('100%')//散点
import {ref, onMounted, watch} from 'vue'
import request from '@/utils/request'
import PieChart from "@/components/PieChart.vue";
import ScatterChart from "@/components/ScatterChart.vue";
import {useRegionStore} from "@/stores/RegionData.js";  // 确保 request 路径正确
const regionStore = useRegionStore();

const costData = ref([])
//
//
// // 获取成本数据
// const fetchCostData = async (region) => {
//   if (region===undefined||region===0) {
//     try {
//       const response = await request.get(`/api/provinces/1/cost/years`)
//       costData.value = (response.data || response).map(item => ({
//         year: String(item.year),
//         count: Number(item.total)
//       }))
//       console.log('处理后的成本图表数据:', costData.value)
//     } catch (error) {
//       console.error('获取医疗成本数据失败:', error)
//       costData.value = []
//     } finally {
//       // medicalLoading.value = false;
//     }
//   }else{
//     try {
//       const response = await request.get(`/api/provinces/${region}/cost/years`)
//       costData.value = (response.data || response).map(item => ({
//         year: String(item.year),
//         count: Number(item.total)
//       }))
//       console.log('处理后的成本图表数据:', costData.value)
//     } catch (error) {
//       console.error('获取医疗成本数据失败:', error)
//       costData.value = []
//     } finally {
//       // medicalLoading.value = false;
//     }
//   }
// }
watch(
    () => regionStore.getRegionId, // 侦听 Pinia store 中的 ID
    async (newRegionId) => {
      console.log(`检测到区域变化: ${newRegionId}，准备从 Store 获取数据...`);
      try {
        // 直接调用 store 的 action，它会处理缓存逻辑
        const data = await regionStore.fetchCostDataIfNeeded(newRegionId);
        costData.value = data;
      } catch (error) {
        console.error("在组件中处理数据获取失败:", error);
        costData.value = [];
      } finally {

      }
    },
    {
      immediate: true // 立即执行一次，确保组件挂载时就能加载初始数据
    }
);
// const fetchAllData = async () => {
//   await Promise.all([
//
//     fetchCostData(),
//   ])
// }
//
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
</style>