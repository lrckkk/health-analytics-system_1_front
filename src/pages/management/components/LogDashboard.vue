<template>
  <div class="log-dashboard">
    <el-card>
      <h3>日志统计</h3>
      <div ref="chartRef" style="width: 100%; height: 300px;"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

// 模拟日志统计数据
const logStats = ref({
  error: 20,
  warn: 15,
  info: 65,
})

const chartRef = ref(null)
let chartInstance = null

function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: 0
    },
    series: [
      {
        name: '日志级别',
        type: 'pie',
        radius: '50%',
        data: [
          { value: logStats.value.error, name: '错误' },
          { value: logStats.value.warn, name: '警告' },
          { value: logStats.value.info, name: '信息' },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  chartInstance.setOption(option)
}

onMounted(() => {
  initChart()
})

// 如果 logStats 更新，可以在这里 watch 重新渲染图表
</script>

<style scoped>
.log-dashboard {
  width: 100%;
}
</style>
