<template>
  <div class="line-chart-container">
    <!-- Element Plus 选择器 -->
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
<!--          <span>{{ title }}</span>-->
          <div class="chart-controls">
            <el-select
                v-model="selectedXField"
                placeholder="选择X轴字段"
                @change="updateChart"
            >
              <el-option
                  v-for="field in availableFields"
                  :key="field"
                  :label="field"
                  :value="field"
              />
            </el-select>

            <el-select
                v-model="selectedYField"
                placeholder="选择Y轴字段"
                @change="updateChart"
            >
              <el-option
                  v-for="field in availableFields"
                  :key="field"
                  :label="field"
                  :value="field"
              />
            </el-select>
          </div>
        </div>
      </template>

      <!-- ECharts 图表容器 -->
      <div ref="chartRef" class="chart" :style="{ height: height ,width:width}"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElCard, ElSelect, ElOption } from 'element-plus'

const props = defineProps({
  // 图表数据
  chartData: {
    type: Array,
    default: () => []
  },
  // 图表标题
  title: {
    type: String,
    default: '数据趋势图'
  },
  // 图表高度
  height: {
    type: String,
    default: '400px'
  },
  width: {
    type: String,
    default: '100%',
  },
  // X轴字段名
  xField: {
    type: String,
    default: ''
  },
  // Y轴字段名
  yField: {
    type: String,
    default: ''
  }
})

const chartRef = ref(null)
let chartInstance = null
const availableFields = ref([])
const selectedXField = ref(props.xField)
const selectedYField = ref(props.yField)

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  // 销毁旧实例
  if (chartInstance) {
    chartInstance.dispose()
  }

  // 创建新实例
  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance || !props.chartData.length) return

  const xData = []
  const yData = []

  props.chartData.forEach(item => {
    if (selectedXField.value && item[selectedXField.value] !== undefined) {
      xData.push(item[selectedXField.value])
    }
    if (selectedYField.value && item[selectedYField.value] !== undefined) {
      yData.push(item[selectedYField.value])
    }
  })

  const option = {
    title: {
      text: props.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        const xValue = params[0].axisValue
        const yValue = params[0].data
        return `${selectedXField.value}: ${xValue}<br/>${selectedYField.value}: ${yValue}`
      }
    },
    legend: {
      data: [selectedYField.value],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xData,
      name: selectedXField.value,
      axisLabel: {
        rotate: xData.length > 10 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: selectedYField.value
    },
    series: [
      {
        name: selectedYField.value,
        type: 'line',
        data: yData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

// 提取可用字段
const extractAvailableFields = () => {
  if (!props.chartData.length) {
    availableFields.value = []
    return
  }

  const fields = new Set()
  props.chartData.forEach(item => {
    Object.keys(item).forEach(key => {
      fields.add(key)
    })
  })

  availableFields.value = Array.from(fields)

  // 如果没有指定字段，自动选择前两个字段
  if (!selectedXField.value && availableFields.value.length > 0) {
    selectedXField.value = availableFields.value[0]
  }
  if (!selectedYField.value && availableFields.value.length > 1) {
    selectedYField.value = availableFields.value[1]
  }
}

// 监听数据变化
watch(() => props.chartData, (newVal) => {
  extractAvailableFields()
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

// 组件挂载时初始化
onMounted(() => {
  extractAvailableFields()
  initChart()

  // 窗口大小变化时重新调整图表大小
  window.addEventListener('resize', () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  })
})
</script>

<style scoped>
.line-chart-container {
  width: 100%;
}

.chart-card {
  margin: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-controls {
  display: flex;
  gap: 10px;
}

.chart {
  width: 100%;
}
</style>