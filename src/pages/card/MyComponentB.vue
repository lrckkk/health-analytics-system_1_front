<template>



    <div class="card-content-inner-a">
      <simpleline
          :chart-data="medicalData2"
          title="病床机构数量变化趋势"
          height=100%
          width=100%
          x-field="year"
          y-field="count"
      />
    </div>

</template>

<script setup>
import {ref, onMounted, nextTick, watch} from 'vue'
import Simpleline from '/src/components/simpleline.vue'
import request from '@/utils/request'  // 使用我们封装好的request
import {useRegionStore} from '@/stores/RegionData.js';
import axios from "axios";
const regionStore = useRegionStore();

const medicalData = ref([])
const medicalData2 = ref([])
const costData = ref([])
const medicalLoading = ref(true)
// const medicalLoading2 = ref(true)
// API基础URL
//
// const fetchBedData = async (region) => {
//   if (region === undefined || region === 0) {
//     try {
//
//       medicalLoading.value = true;
//       const response = await request.get(`/api/provinces/1/bed/years`);
//
//       // 调试：打印原始响应结构
//       console.log('API响应结构:', Object.keys(response), Array.isArray(response));
//       medicalData2.value = (response.data || response).map(item => ({
//         year: String(item.year), // 强制转为字符串
//         count: Number(item.total) // 明确使用total字段
//       }));
//       console.log('处理后的图表数据:', medicalData.value); // 验证处理结果
//       console.log('最终medicalData:', JSON.parse(JSON.stringify(medicalData.value)))
//
//     } catch (error) {
//       console.error('获取医疗机构数据失败:', error);
//       medicalData.value = [];
//     } finally {
//       medicalLoading.value = false;
//     }
//   }
//   else{
//     try {
//
//       medicalLoading.value = true;
//       const response = await request.get(`/api/provinces/${region}/bed/years`);
//
//       // 调试：打印原始响应结构
//       console.log('API响应结构:', Object.keys(response), Array.isArray(response));
//       medicalData2.value = (response.data || response).map(item => ({
//         year: String(item.year), // 强制转为字符串
//         count: Number(item.total) // 明确使用total字段
//       }));
//       console.log('处理后的图表数据:', medicalData.value); // 验证处理结果
//       console.log('最终medicalData:', JSON.parse(JSON.stringify(medicalData.value)))
//
//     } catch (error) {
//       console.error('获取医疗机构数据失败:', error);
//       medicalData.value = [];
//     } finally {
//       medicalLoading.value = false;
//     }
//   }
// }
//
// const fetchAllData = async () => {
//   await Promise.all([
//     fetchBedData(),
//
//   ])
// }
// watch(
//     () => regionStore.getRegionId, // 侦听 Pinia store 中的 selectedRegion
//     (newRegion) => {
//       console.log(`检测到区域变化: ${newRegion}，正在重新请求数据...`);
//       fetchBedData(newRegion); // 使用新的区域值作为参数发起请求
//     },
//     { immediate: true } // 立即执行一次，以便在组件挂载时就获取数据
// );
watch(
    () => regionStore.getRegionId, // 侦听 Pinia store 中的 ID
    async (newRegionId) => {
      console.log(`检测到区域变化: ${newRegionId}，准备从 Store 获取数据...`);
      medicalLoading.value = true;
      try {
        // 直接调用 store 的 action，它会处理缓存逻辑
        const data = await regionStore.fetchMedicalData2IfNeeded(newRegionId);
        medicalData2.value = data;
      } catch (error) {
        console.error("在组件中处理数据获取失败:", error);
        medicalData2.value = [];
      } finally {
        medicalLoading.value = false;
      }
    },
    {
      immediate: true // 立即执行一次，确保组件挂载时就能加载初始数据
    }
);


// // 组件挂载时获取数据
// onMounted(() => {
//   fetchAllData()
// })
</script>


<style scoped>
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