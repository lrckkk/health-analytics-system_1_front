<template>



    <div class="card-content-inner-a">
      <simpleline
          :chart-data="medicalData2"
          title="病床机构数量变化趋势"
          height=20vh
          width=100%
          x-field="year"
          y-field="count"
      />
    </div>

</template>

<script setup>
import {ref, onMounted, nextTick} from 'vue'
// import axios from 'axios'
import Simpleline from '/src/components/simpleline.vue'
import MultiLineChart from '/src/components/MutipleLineCharts.vue'
import PieChart from '/src/components/PieChart.vue'
import ScatterChart from '/src/components/ScatterChart.vue'
import { provinceIdMap } from '@/utils/mapid'
import { IdToNameMapper } from '@/utils/IdToNameMapper'
import request from '@/utils/request'  // 使用我们封装好的request

const medicalData = ref([])
const medicalData2 = ref([])
const costData = ref([])
// const salesData = ref([])
// const marketShareData = ref([])
//
// 加载状态
const medicalLoading = ref(true)
// const medicalLoading2 = ref(true)
// API基础URL

// 当前选择的省份（默认为湖南）
const currentProvinceId = ref(23) // 湖南的ID

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


    console.log('处理后的图表数据:', medicalData.value); // 验证处理结果
    console.log('最终medicalData:', JSON.parse(JSON.stringify(medicalData.value)))

  } catch (error) {
    console.error('获取医疗机构数据失败:', error);
    medicalData.value = [];
  } finally {
    medicalLoading.value = false;
  }
}


const fetchAllData = async () => {
  await Promise.all([
    fetchBedData(),

  ])
}


// 组件挂载时获取数据
onMounted(() => {
  fetchAllData()
})
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