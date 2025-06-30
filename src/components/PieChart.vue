<template>
  <div class="pie-chart-container">
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <div class="chart-controls">
            <el-select
                v-model="selectedNameField"
                placeholder="选择名称字段"
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
                v-model="selectedValueField"
                placeholder="选择数值字段"
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

      <div ref="chartRef" class="chart" :style="{ height: height, width: width }"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElCard, ElSelect, ElOption } from 'element-plus'

const props = defineProps({
  chartData: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: '扇形统计图'
  },
  height: {
    type: String,
    default: '400px'
  },
  width: {
    type: String,
    default: '100%'
  },
  nameField: {
    type: String,
    default: ''
  },
  valueField: {
    type: String,
    default: ''
  },
  colorPalette: {
    type: Array,
    default: () => [
      '#5470C6', '#91CC75', '#EE6666', '#FAC858', '#73C0DE',
      '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC'
    ]
  },
  showLegend: {
    type: Boolean,
    default: true
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  roseType: {
    type: String,
    default: '' // 'radius' 为南丁格尔玫瑰图
  }
})

const chartRef = ref(null)
let chartInstance = null
const availableFields = ref([])
const selectedNameField = ref(props.nameField)
const selectedValueField = ref(props.valueField)

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance || !props.chartData.length) return

  const seriesData = props.chartData.map(item => ({
    name: selectedNameField.value ? item[selectedNameField.value] : '',
    value: selectedValueField.value ? item[selectedValueField.value] : 0
  }))

  const option = {
    title: {
      text: props.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      show: props.showLegend,
      orient: 'vertical',
      left: 'left',
      data: seriesData.map(item => item.name)
    },
    series: [
      {
        name: props.title,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: props.showLabel,
          formatter: '{b}: {c} ({d}%)'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: props.showLabel
        },
        data: seriesData,
        roseType: props.roseType,
        color: props.colorPalette,
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
          return Math.random() * 200
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

  if (!selectedNameField.value && availableFields.value.length > 0) {
    selectedNameField.value = availableFields.value[0]
  }
  if (!selectedValueField.value && availableFields.value.length > 1) {
    selectedValueField.value = availableFields.value[1]
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

  window.addEventListener('resize', () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  })
})
</script>

<style scoped>
.pie-chart-container {
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
  flex-wrap: wrap;
}

.chart {
  width: 100%;
}
</style>