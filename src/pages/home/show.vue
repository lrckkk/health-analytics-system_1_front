<template>
  <div style="display: flex; flex-wrap: nowrap; justify-content: space-between; ">
    <div style="flex: 1;">

    <simpleline
        :chart-data="medicalData"
        title="医疗机构数量变化趋势"
        height="200px"
        :width="chartWidth1"
        x-field="year"
        y-field="count"
        :loading="medicalLoading"
    />
  </div>

    <div style="flex: 1; ">
    <simpleline
        :chart-data="medicalData2"
        title="病床机构数量变化趋势"
        height="200px"
        :width="chartWidth2"
        x-field="year"
        y-field="count"
        :loading="medicalLoading"

    />
  </div>
  </div>
  <div class="dashboard">


    <div class="chart-row">
      <multi-line-chart
          :width="lineChartWidth"
          :chart-data="populationData"
          title="人口统计趋势"
          height="350px"
          :show-data-zoom="true"
          :show-legend="true"
          :smooth="true"
          :loading="populationLoading"
          @provinceChange="handleProvinceChange"
      />
    </div>

    <div class="chart-row">
      <pie-chart
          :width="pieChartWidth"
          :chart-data="marketShareData"
          title="市场份额分布"
          name-field="company"
          value-field="share"
          height="350px"
          rose-type="radius"
      />
    </div>

    <div class="chart-row">
      <scatter-chart
          :width="scatterChartWidth"
          :chart-data="costData"
          title="医疗费用年度分布"
          height="350px"
          color="#00B4D8"
      />
    </div>

    <div class="chart-row">
      <bar-chart
          :width="barChartWidth"
          :chart-data="medicalPersonnelData"
          title="医疗卫生人员统计"
          height="350px"
          x-field="year"
          y-field="count"
          color="#7DF9FF"

      />
    </div>
    <div class="chart-row">
      <MultipleChart
          :width="multiChartWidth"
          :chart-data="medicalServiceData"
          title="医疗服务统计"
          height="350px"
      />
    </div>
  </div>

</template>

<script setup>
import {ref, onMounted, nextTick} from 'vue'
// import axios from 'axios'
import Simpleline from '/src/components/simpleline.vue'
import MultiLineChart from '/src/components/MutipleLineCharts.vue'
import PieChart from '/src/components/PieChart.vue'
import ScatterChart from '/src/components/ScatterChart.vue'
import BarChart from '@/components/BarChart.vue'
import MultipleChart from '@/components/MutipleChart.vue'
import { provinceIdMap } from '@/utils/mapid'  // 导入省份ID映射表
import { IdToNameMapper } from '@/utils/IdToNameMapper'  // 导入转换类
import request from '@/utils/request'
 // 使用我们封装好的request
//
const provinceMapper = new IdToNameMapper(provinceIdMap)
// 初始化ID到名称的映射器
// const provinceMapper = new IdToNameMapper(provinceIdMap)
// 新增宽度控制变量
const chartWidth1 = ref('100%') // 可以是百分比或具体像素值
const chartWidth2 = ref('100%')
const lineChartWidth = ref('100%')//多折线
const barChartWidth = ref('100%')//单柱
const multiChartWidth = ref('100%')//多柱
const pieChartWidth = ref('100%')//派
const scatterChartWidth = ref('100%')//散点
// const medicalData = ref([
//   { year: '2015', count: 983528 },
//   { year: '2016', count: 983394 },
//   { year: '2017', count: 986649 },
//   { year: '2018', count: 997433 },
//   { year: '2019', count: 1007579 },
//   { year: '2020', count: 1022922 },
//   { year: '2021', count: 1340340 },
// ])
// const medicalData2 = ref([
//   { year: '2015', count: 123024 },
//   { year: '2016', count: 129323 },
//   { year: '2017', count: 111111 },
//   { year: '2018', count: 197433 },
//   { year: '2019', count: 100757 },
//   { year: '2020', count: 122922 }
// ])

const salesData = ref([
  { year: '2008', '湖南省': 120, productB: 220, productC: 150, productD: 180, productE: 90 },
  { year: '2009', '湖南省': 132, productB: 182, productC: 232, productD: 160, productE: 110 },
  { year: '2010', '湖南省': 101, productB: 191, productC: 201, productD: 190, productE: 130 },
  { year: '2011', '湖南省': 134, productB: 234, productC: 154, productD: 210, productE: 150 },
  { year: '2012', '湖南省': 90, productB: 290, productC: 190, productD: 230, productE: 170 },
  { year: '2013', '湖南省': 230, productB: 330, productC: 330, productD: 250, productE: 190 },
  { year: '2014', '湖南省': 210, productB: 310, productC: 410, productD: 270, productE: 210 },
  { year: '2015', '湖南省': 175, productB: 275, productC: 375, productD: 290, productE: 230 },
  { year: '2016', '湖南省': 145, productB: 245, productC: 345, productD: 310, productE: 250 },
  { year: '2017', '湖南省': 160, productB: 260, productC: 360, productD: 330, productE: 270 },
  { year: '2018', '湖南省': 195, productB: 295, productC: 395, productD: 350, productE: 290 },
  { year: '2019', '湖南省': 220, productB: 320, productC: 420, productD: 370, productE: 310 }
]);

const marketShareData = ref([
  { company: '公司A', share: 38.5 },
  { company: '公司B', share: 27.3 },
  { company: '公司C', share: 18.2 },
  { company: '公司D', share: 9.1 },
  { company: '其他', share: 6.9 }
])
// const yearData = ref([
//   { year: '2015', count: 983528 },
//   { year: '2016', count: 983394 },
//   { year: '2017', count: 986649 },
//   { year: '2018', count: 997433 },
//   { year: '2019', count: 1007579 },
//   { year: '2020', count: 1022922 },
//   { year: '2021', count: 1140340 }
// ])
// const medicalPersonnelData = ref([
//   { year: '2018', count: 12345 },
//   { year: '2019', count: 13567 },
//   { year: '2020', count: 14289 },
//   { year: '2021', count: 15678 }
// ])
//
// const medicalServiceData = ref([
//   { year: 2004, outpatientVisits: 3700, inpatientAdmissions: 230 },
//   { year: 2005, outpatientVisits: 4000, inpatientAdmissions: 250 },
//   // ...其他数据
// ])

// // 创建响应式数据
const medicalData = ref([])
const medicalData2 = ref([])
const costData = ref([])
const medicalPersonnelData = ref([])
const medicalServiceData = ref([

])
const populationData = ref([])
// const salesData = ref([])
// const marketShareData = ref([])
//
// 加载状态
const medicalLoading = ref(true)
// const medicalLoading2 = ref(true)
// API基础URL

// 当前选择的省份（默认为湖南）
const currentProvinceId = ref(23) // 湖南的ID
const populationLoading = ref(true)
// 获取医疗机构数据
const fetchMedicalData = async () => {
  try {
    medicalLoading.value = true;
    const response = await request.get(`/api/provinces/${currentProvinceId.value}/institution/years`);

    // 调试：打印原始响应结构
    console.log('API响应结构:', Object.keys(response), Array.isArray(response));




    medicalData.value = (response.data || response).map(item => ({
      year: String(item.year), // 强制转为字符串
      count: Number(item.total) // 明确使用total字段
    }));


    console.log('处理后的图表数据:', medicalData.value); // 验证处理结果
    console.log('最终medicalData:', JSON.parse(JSON.stringify(medicalData.value)))

  } catch (error) {
    console.error('获取医疗机构数据失败:', error);
    medicalData.value = [];
  } finally {
    medicalLoading.value = false;
  }
}
const fetchBedData = async () => {
  try {
    medicalLoading.value = true;
    const response = await request.get(`/api/provinces/${currentProvinceId.value}/bed/years`);

    // 调试：打印原始响应结构
    console.log('API响应结构:', Object.keys(response), Array.isArray(response));




    medicalData2.value = (response.data || response).map(item => ({
      year: String(item.year), // 强制转为字符串
      count: Number(item.total) // 明确使用total字段
    }));
    // medicalServiceData.value = response.data

    console.log('处理后的图表数据:', medicalData.value); // 验证处理结果
    console.log('最终medicalData:', JSON.parse(JSON.stringify(medicalData.value)))

  } catch (error) {
    console.error('获取医疗机构数据失败:', error);
    medicalData.value = [];
  } finally {
    medicalLoading.value = false;
  }
}

const fetchCostData = async () => {
  try {
    medicalLoading.value = true;
    const response = await request.get(`/api/provinces/${currentProvinceId.value}/cost/years`);

    // 调试：打印原始响应结构
    console.log('API响应结构:', Object.keys(response), Array.isArray(response));




    costData.value = (response.data || response).map(item => ({
      year: String(item.year), // 强制转为字符串
      count: Number(item.total) // 明确使用total字段
    }));


    console.log('处理后的图表数据:', medicalData.value); // 验证处理结果
    console.log('最终medicalData:', JSON.parse(JSON.stringify(medicalData.value)))

  } catch (error) {
    console.error('获取医疗机构数据失败:', error);
    medicalData.value = [];
  } finally {
    medicalLoading.value = false;
  }
}


const fetchPersonnelData = async () => {
  try {
    medicalLoading.value = true;
    const response = await request.get(`/api/provinces/${currentProvinceId.value}/personnel/years`);

    // 调试：打印原始响应结构
    console.log('API响应结构:', Object.keys(response), Array.isArray(response));




    medicalPersonnelData.value = (response.data || response).map(item => ({
      year: String(item.year), // 强制转为字符串
      count: Number(item.total) // 明确使用total字段
    }));


    console.log('处理后的图表数据:', medicalData.value); // 验证处理结果
    console.log('最终medicalData:', JSON.parse(JSON.stringify(medicalData.value)))

  } catch (error) {
    console.error('获取医疗机构数据失败:', error);
    medicalData.value = [];
  } finally {
    medicalLoading.value = false;
  }
}

// 获取医疗服务数据
const fetchServiceData = async () => {
  try {
    medicalLoading.value = true;
    const response = await request.get(`/api/provinces/${currentProvinceId.value}/service/years`);

    // 调试：打印原始响应结构
    console.log('API响应结构:', Object.keys(response), Array.isArray(response));

    // 处理响应数据
    medicalServiceData.value = (response.data || response).map(item => ({
      year: String(item.year), // 强制转为字符串
      outpatientVisits: Number(item.outpatientVisits), // 门诊量
      inpatientAdmissions: Number(item.inpatientAdmissions) // 住院量
    }));

    console.log('处理后的图表数据:', medicalServiceData.value); // 验证处理结果
    console.log('最终medicalServiceData:', JSON.parse(JSON.stringify(medicalServiceData.value)))

  } catch (error) {
    console.error('获取医疗服务数据失败:', error);
    medicalServiceData.value = [];
  } finally {
    medicalLoading.value = false;
  }
}
// 获取人口数据
const fetchPopulationData = async (provinceIds) => {
  try {
    populationLoading.value = true
    const requests = provinceIds.map(provinceId =>
        request.get(`/api/provinces/${provinceId}/population/years`)
    )
    const responses = await Promise.all(requests)

    // 转换数据格式
    const allData = {}
    responses.forEach((response, index) => {
      const provinceId = provinceIds[index]
      const provinceName = provinceMapper.getName(provinceId) || `省份${provinceId}`
      allData[provinceName] = response.map(item => ({
        year: String(item.year),
        population: Number(item.total)
      }))
    })

    // 合并数据
    populationData.value = mergeProvinceData(allData)
  } catch (error) {
    console.error('获取人口数据失败:', error)
  } finally {
    populationLoading.value = false
  }
}

// 合并省份数据
const mergeProvinceData = (dataByProvince) => {
  const result = []
  const allYears = [...new Set(
      Object.values(dataByProvince).flatMap(data => data.map(item => item.year))
  )].sort()

  allYears.forEach(year => {
    const yearData = { year }
    Object.entries(dataByProvince).forEach(([provinceName, data]) => {
      const item = data.find(d => d.year === year)
      yearData[provinceName] = item ? item.population : null
    })
    result.push(yearData)
  })

  return result
}
// 处理省份选择变化
const handleProvinceChange = async (provinceIds) => {
  if (provinceIds.length === 0) {
    // 如果全部省份被移除，可以保留默认的湖南或者清空数据
    provinceIds = [23] // 保留湖南作为默认
    // 或者 populationData.value = [] 清空数据
  }
  await fetchPopulationData(provinceIds)
}

const fetchAllData = async () => {
  await Promise.all([
    fetchMedicalData(),
    fetchBedData(),
   fetchCostData(),
    fetchPersonnelData(),
    fetchServiceData(),
  ])
}


// 组件挂载时获取数据
onMounted(() => {
  fetchAllData()
  fetchPopulationData([currentProvinceId.value])
})
</script>


<style scoped>



</style>