<template>
  <div class="card-content-inner-a">
    <simpleline
        :chart-data="medicalData"
        title="医疗机构数量变化趋势"
        height=20vh
        width=100%
        x-field="year"
        y-field="count"
        :loading="medicalLoading"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// 假设这些是您的公共组件路径
import Simpleline from '/src/components/simpleline.vue' // 请确保路径正确，可能需要调整
// import MultiLineChart from '/src/components/MutipleLineCharts.vue'
// import PieChart from '/src/components/PieChart.vue'
// import ScatterChart from '/src/components/ScatterChart.vue'
// import { provinceIdMap } from '@/utils/mapid' // 如果需要在组件内部使用，请保留
// import { IdToNameMapper } from '@/utils/IdToNameMapper' // 如果需要在组件内部使用，请保留
import request from '@/utils/request'  // 确保 request 路径正确

const medicalData = ref([])
const medicalData2 = ref([])
const costData = ref([])
const medicalLoading = ref(true)

const currentProvinceId = ref(23) // 湖南的ID，可根据需求动态调整

// 获取医疗机构数据
const fetchMedicalData = async () => {
  try {
    medicalLoading.value = true
    const response = await request.get(`/api/provinces/${currentProvinceId.value}/institution/years`)
    medicalData.value = (response.data || response).map(item => ({
      year: String(item.year),
      count: Number(item.total)
    }))
    console.log('处理后的医疗机构图表数据:', medicalData.value)
  } catch (error) {
    console.error('获取医疗机构数据失败:', error)
    medicalData.value = []
  } finally {
    medicalLoading.value = false
  }
}

// 获取床位数据
const fetchBedData = async () => {
  try {
    // 假设 bedData 也使用 simpleline 显示
    // medicalLoading.value = true; // 如果您希望床位数据也有独立的loading状态，可以复制此行
    const response = await request.get(`/api/provinces/${currentProvinceId.value}/bed/years`)
    medicalData2.value = (response.data || response).map(item => ({
      year: String(item.year),
      count: Number(item.total)
    }))
    console.log('处理后的床位图表数据:', medicalData2.value)
  } catch (error) {
    console.error('获取床位数据失败:', error)
    medicalData2.value = []
  } finally {
    // medicalLoading.value = false;
  }
}

// 获取成本数据
const fetchCostData = async () => {
  try {
    // 假设 costData 也使用 simpleline 显示
    // medicalLoading.value = true;
    const response = await request.get(`/api/provinces/${currentProvinceId.value}/cost/years`)
    costData.value = (response.data || response).map(item => ({
      year: String(item.year),
      count: Number(item.total)
    }))
    console.log('处理后的成本图表数据:', costData.value)
  } catch (error) {
    console.error('获取医疗成本数据失败:', error)
    costData.value = []
  } finally {
    // medicalLoading.value = false;
  }
}

const fetchAllData = async () => {
  await Promise.all([
    fetchMedicalData(),
    fetchBedData(),
    fetchCostData(),
  ])
}

onMounted(() => {
  fetchAllData()
})
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