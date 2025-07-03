<template>
  <div style="display: flex; flex-wrap: nowrap; justify-content: space-between; ">
    <div style="flex: 1;">
    <simpleline
        :chart-data="medicalData"
        title="医疗机构数量变化趋势"
        height="200px"
        width=100%
        x-field="year"
        y-field="count"
    />
  </div>

    <div style="flex: 1; ">
    <simpleline
        :chart-data="medicalData2"
        title="病床机构数量变化趋势"
        height="200px"
        width=100%
        x-field="year"
        y-field="count"
    />
  </div>
  </div>
  <div class="dashboard">


    <div class="chart-row">
      <multi-line-chart
          :chart-data="salesData"
          title="年度销售趋势"
          x-field="month"
          height="350px"
          :show-data-zoom="true"
          :show-legend="true"
          :smooth="true"
      />
    </div>

    <div class="chart-row">
      <pie-chart
          :chart-data="marketShareData"
          title="市场份额分布"
          name-field="company"
          value-field="share"
          height="350px"
          rose-type="radius"
      />
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
// import axios from 'axios'
import Simpleline from '/src/components/simpleline.vue'
import MultiLineChart from '/src/components/MutipleLineCharts.vue'
import PieChart from '/src/components/PieChart.vue'
import axios from "echarts-countries-js/starbucks/dep/echarts.js";


const medicalData = ref([
  { year: '2015', count: 983528 },
  { year: '2016', count: 983394 },
  { year: '2017', count: 986649 },
  { year: '2018', count: 997433 },
  { year: '2019', count: 1007579 },
  { year: '2020', count: 1022922 },
  { year: '2021', count: 1340340 },
])
const medicalData2 = ref([
  { year: '2015', count: 123024 },
  { year: '2016', count: 129323 },
  { year: '2017', count: 111111 },
  { year: '2018', count: 197433 },
  { year: '2019', count: 100757 },
  { year: '2020', count: 122922 }
])
const salesData = ref([
  { month: '1月', productA: 120, productB: 220, productC: 150, productD: 180, productE: 90 },
  { month: '2月', productA: 132, productB: 182, productC: 232, productD: 160, productE: 110 },
  { month: '3月', productA: 101, productB: 191, productC: 201, productD: 190, productE: 130 },
  { month: '4月', productA: 134, productB: 234, productC: 154, productD: 210, productE: 150 },
  { month: '5月', productA: 90, productB: 290, productC: 190, productD: 230, productE: 170 },
  { month: '6月', productA: 230, productB: 330, productC: 330, productD: 250, productE: 190 },
  { month: '7月', productA: 210, productB: 310, productC: 410, productD: 270, productE: 210 },
  { month: '8月', productA: 175, productB: 275, productC: 375, productD: 290, productE: 230 },
  { month: '9月', productA: 145, productB: 245, productC: 345, productD: 310, productE: 250 },
  { month: '10月', productA: 160, productB: 260, productC: 360, productD: 330, productE: 270 },
  { month: '11月', productA: 195, productB: 295, productC: 395, productD: 350, productE: 290 },
  { month: '12月', productA: 220, productB: 320, productC: 420, productD: 370, productE: 310 }
]);

const marketShareData = ref([
  { company: '公司A', share: 38.5 },
  { company: '公司B', share: 27.3 },
  { company: '公司C', share: 18.2 },
  { company: '公司D', share: 9.1 },
  { company: '其他', share: 6.9 }
])
//
// // 创建响应式数据
// const medicalData = ref([])
// const medicalData2 = ref([])
// const salesData = ref([])
// const marketShareData = ref([])
//
// // API基础URL
// const API_BASE_URL = 'http://localhost:8080/api/charts'
//
// // 获取数据的方法
// const fetchData = async () => {
//   try {
//     // 并行请求所有数据
//     const [
//       medicalResponse,
//       bedResponse,
//       salesResponse,
//       marketShareResponse
//     ] = await Promise.all([
//       axios.get(`${API_BASE_URL}/medical-institutions`),
//       axios.get(`${API_BASE_URL}/bed-institutions`),
//       axios.get(`${API_BASE_URL}/sales`),
//       axios.get(`${API_BASE_URL}/market-share`)
//     ])
//
//     medicalData.value = medicalResponse.data
//     medicalData2.value = bedResponse.data
//     salesData.value = salesResponse.data
//     marketShareData.value = marketShareResponse.data
//   } catch (error) {
//     console.error('获取图表数据失败:', error)
//
//   }
// }
//
// // 组件挂载时获取数据
// onMounted(() => {
//   fetchData()
// })
</script>


<style scoped>



</style>