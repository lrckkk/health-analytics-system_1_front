<!--<template>-->
<!--  <div class="pie-chart-container">-->
<!--    <el-card class="chart-card">-->
<!--      <template #header>-->
<!--        <div class="card-header">-->
<!--          <div class="chart-controls">-->
<!--            <el-select-->
<!--                v-model="selectedNameField"-->
<!--                placeholder="选择名称字段"-->
<!--                @change="updateChart"-->
<!--            >-->
<!--              <el-option-->
<!--                  v-for="field in availableFields"-->
<!--                  :key="field"-->
<!--                  :label="field"-->
<!--                  :value="field"-->
<!--              />-->
<!--            </el-select>-->

<!--            <el-select-->
<!--                v-model="selectedValueField"-->
<!--                placeholder="选择数值字段"-->
<!--                @change="updateChart"-->
<!--            >-->
<!--              <el-option-->
<!--                  v-for="field in availableFields"-->
<!--                  :key="field"-->
<!--                  :label="field"-->
<!--                  :value="field"-->
<!--              />-->
<!--            </el-select>-->
<!--          </div>-->
<!--        </div>-->
<!--      </template>-->

<!--      <div ref="chartRef" class="chart" :style="{ height: height, width: width }"></div>-->
<!--    </el-card>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->
<!--import { ref, onMounted, watch, nextTick } from 'vue'-->
<!--import * as echarts from 'echarts'-->
<!--import { ElCard, ElSelect, ElOption } from 'element-plus'-->

<!--const props = defineProps({-->
<!--  chartData: {-->
<!--    type: Array,-->
<!--    default: () => []-->
<!--  },-->
<!--  title: {-->
<!--    type: String,-->
<!--    default: '扇形统计图'-->
<!--  },-->
<!--  height: {-->
<!--    type: String,-->
<!--    default: '400px'-->
<!--  },-->
<!--  width: {-->
<!--    type: String,-->
<!--    default: '100%'-->
<!--  },-->
<!--  nameField: {-->
<!--    type: String,-->
<!--    default: ''-->
<!--  },-->
<!--  valueField: {-->
<!--    type: String,-->
<!--    default: ''-->
<!--  },-->
<!--  colorPalette: {-->
<!--    type: Array,-->
<!--    default: () => [-->
<!--      '#5470C6', '#91CC75', '#EE6666', '#FAC858', '#73C0DE',-->
<!--      '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC'-->
<!--    ]-->
<!--  },-->
<!--  showLegend: {-->
<!--    type: Boolean,-->
<!--    default: true-->
<!--  },-->
<!--  showLabel: {-->
<!--    type: Boolean,-->
<!--    default: true-->
<!--  },-->
<!--  roseType: {-->
<!--    type: String,-->
<!--    default: '' // 'radius' 为南丁格尔玫瑰图-->
<!--  }-->
<!--})-->

<!--const chartRef = ref(null)-->
<!--let chartInstance = null-->
<!--const availableFields = ref([])-->
<!--const selectedNameField = ref(props.nameField)-->
<!--const selectedValueField = ref(props.valueField)-->

<!--// 初始化图表-->
<!--const initChart = () => {-->
<!--  if (!chartRef.value) return-->

<!--  if (chartInstance) {-->
<!--    chartInstance.dispose()-->
<!--  }-->

<!--  chartInstance = echarts.init(chartRef.value)-->
<!--  updateChart()-->
<!--}-->

<!--// 更新图表数据-->
<!--const updateChart = () => {-->
<!--  if (!chartInstance || !props.chartData.length) return-->

<!--  const seriesData = props.chartData.map(item => ({-->
<!--    name: selectedNameField.value ? item[selectedNameField.value] : '',-->
<!--    value: selectedValueField.value ? item[selectedValueField.value] : 0-->
<!--  }))-->

<!--  const option = {-->
<!--    title: {-->
<!--      text: props.title,-->
<!--      left: 'center'-->
<!--    },-->
<!--    tooltip: {-->
<!--      trigger: 'item',-->
<!--      formatter: '{a} <br/>{b}: {c} ({d}%)'-->
<!--    },-->
<!--    legend: {-->
<!--      show: props.showLegend,-->
<!--      orient: 'vertical',-->
<!--      left: 'left',-->
<!--      data: seriesData.map(item => item.name)-->
<!--    },-->
<!--    series: [-->
<!--      {-->
<!--        name: props.title,-->
<!--        type: 'pie',-->
<!--        radius: ['40%', '70%'],-->
<!--        avoidLabelOverlap: false,-->
<!--        itemStyle: {-->
<!--          borderRadius: 10,-->
<!--          borderColor: '#fff',-->
<!--          borderWidth: 2-->
<!--        },-->
<!--        label: {-->
<!--          show: props.showLabel,-->
<!--          formatter: '{b}: {c} ({d}%)'-->
<!--        },-->
<!--        emphasis: {-->
<!--          label: {-->
<!--            show: true,-->
<!--            fontSize: '18',-->
<!--            fontWeight: 'bold'-->
<!--          }-->
<!--        },-->
<!--        labelLine: {-->
<!--          show: props.showLabel-->
<!--        },-->
<!--        data: seriesData,-->
<!--        roseType: props.roseType,-->
<!--        color: props.colorPalette,-->
<!--        animationType: 'scale',-->
<!--        animationEasing: 'elasticOut',-->
<!--        animationDelay: function (idx) {-->
<!--          return Math.random() * 200-->
<!--        }-->
<!--      }-->
<!--    ]-->
<!--  }-->

<!--  chartInstance.setOption(option)-->
<!--}-->

<!--// 提取可用字段-->
<!--const extractAvailableFields = () => {-->
<!--  if (!props.chartData.length) {-->
<!--    availableFields.value = []-->
<!--    return-->
<!--  }-->

<!--  const fields = new Set()-->
<!--  props.chartData.forEach(item => {-->
<!--    Object.keys(item).forEach(key => {-->
<!--      fields.add(key)-->
<!--    })-->
<!--  })-->

<!--  availableFields.value = Array.from(fields)-->

<!--  if (!selectedNameField.value && availableFields.value.length > 0) {-->
<!--    selectedNameField.value = availableFields.value[0]-->
<!--  }-->
<!--  if (!selectedValueField.value && availableFields.value.length > 1) {-->
<!--    selectedValueField.value = availableFields.value[1]-->
<!--  }-->
<!--}-->

<!--// 监听数据变化-->
<!--watch(() => props.chartData, (newVal) => {-->
<!--  extractAvailableFields()-->
<!--  nextTick(() => {-->
<!--    updateChart()-->
<!--  })-->
<!--}, { deep: true })-->

<!--// 组件挂载时初始化-->
<!--onMounted(() => {-->
<!--  extractAvailableFields()-->
<!--  initChart()-->

<!--  window.addEventListener('resize', () => {-->
<!--    if (chartInstance) {-->
<!--      chartInstance.resize()-->
<!--    }-->
<!--  })-->
<!--})-->
<!--</script>-->

<!--<style scoped>-->
<!--.pie-chart-container {-->
<!--  width: 100%;-->
<!--}-->

<!--.chart-card {-->
<!--  margin: 20px 0;-->
<!--}-->

<!--.card-header {-->
<!--  display: flex;-->
<!--  justify-content: space-between;-->
<!--  align-items: center;-->
<!--}-->

<!--.chart-controls {-->
<!--  display: flex;-->
<!--  gap: 10px;-->
<!--  flex-wrap: wrap;-->
<!--}-->

<!--.chart {-->
<!--  width: 100%;-->
<!--}-->
<!--</style>-->

<template>
  <div class="pie-chart-container">
    <el-card class="chart-card futuristic-card">
      <template #header>
        <div class="card-header">
          <h3 class="futuristic-title">{{ title }}</h3>
          <div class="chart-controls">
            <div class="control-group">
              <span class="control-label">名称</span>
              <el-select
                  v-model="selectedNameField"
                  placeholder="选择名称字段"
                  @change="updateChart"
                  class="futuristic-select"
                  :clearable="false"
                  size="small"
              >
                <el-option
                    v-for="field in availableFields"
                    :key="field"
                    :label="field"
                    :value="field"
                    class="futuristic-option"
                />
              </el-select>
            </div>

            <div class="control-group">
              <span class="control-label">数值</span>
              <el-select
                  v-model="selectedValueField"
                  placeholder="选择数值字段"
                  @change="updateChart"
                  class="futuristic-select"
                  :clearable="false"
                  size="small"
              >
                <el-option
                    v-for="field in availableFields"
                    :key="field"
                    :label="field"
                    :value="field"
                    class="futuristic-option"
                />
              </el-select>
            </div>
          </div>
        </div>
      </template>

      <div class="chart-wrapper">
        <div
            ref="chartRef"
            class="chart futuristic-chart"
            :style="{ height: height }"
        ></div>
        <canvas ref="particleCanvas" class="particle-canvas"></canvas>
        <div v-if="!hasData" class="empty-placeholder">
          <i class="el-icon-pie-chart"></i>
          <span>暂无数据</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted, computed } from 'vue'
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
      '#7DF9FF', '#FF00FF', '#00B4D8', '#48CAE4', '#90E0EF',
      '#0096FF', '#5D8AA8', '#0077B6', '#03045E'
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
const particleCanvas = ref(null)
let chartInstance = null
let particleCtx = null
let animationFrameId = null
const availableFields = ref([])
const selectedNameField = ref(props.nameField)
const selectedValueField = ref(props.valueField)

// 计算属性
const hasData = computed(() => {
  return props.chartData && props.chartData.length > 0 && selectedNameField.value && selectedValueField.value
})

// 粒子系统
const initParticles = () => {
  if (!particleCanvas.value || !hasData.value) return

  const canvas = particleCanvas.value
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight

  particleCtx = canvas.getContext('2d')

  // 创建粒子
  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 0.2 + 0.1,
    opacity: Math.random() * 0.4 + 0.2,
    direction: Math.random() * Math.PI * 2
  }))

  const animate = () => {
    if (!particleCtx || !canvas) return

    // 半透明背景用于拖尾效果
    particleCtx.fillStyle = 'rgba(3, 4, 94, 0.08)'
    particleCtx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制粒子
    particles.forEach(p => {
      p.x += Math.cos(p.direction) * p.speed
      p.y += Math.sin(p.direction) * p.speed

      // 边界检查
      if (p.x < 0 || p.x > canvas.width) p.direction = Math.PI - p.direction
      if (p.y < 0 || p.y > canvas.height) p.direction = -p.direction

      const gradient = particleCtx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.size
      )
      gradient.addColorStop(0, 'rgba(125, 249, 255, 0.8)')
      gradient.addColorStop(1, 'rgba(125, 249, 255, 0)')

      particleCtx.beginPath()
      particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      particleCtx.fillStyle = gradient
      particleCtx.fill()
    })

    animationFrameId = requestAnimationFrame(animate)
  }

  animate()
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value, 'dark')
  updateChart()
  initParticles()
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance || !hasData.value) return

  const seriesData = props.chartData.map(item => ({
    name: selectedNameField.value ? item[selectedNameField.value] : '',
    value: selectedValueField.value ? item[selectedValueField.value] : 0
  }))

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: props.title,
      left: 'center',
      textStyle: {
        color: '#7DF9FF',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: '#00B4D8',
      borderWidth: 1,
      textStyle: {
        color: '#FFFFFF',
        fontSize: 12
      },
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      show: props.showLegend,
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: '#CAF0F8',
        fontSize: 12
      },
      data: seriesData.map(item => item.name)
    },
    series: [
      {
        name: props.title,
        type: 'pie',
        radius: props.roseType ? ['30%', '70%'] : ['40%', '70%'],
        center: props.roseType ? ['50%', '50%'] : ['50%', '60%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#03045E',
          borderWidth: 1,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        },
        label: {
          show: props.showLabel,
          color: '#CAF0F8',
          formatter: '{b}: {c} ({d}%)'
        },
        selectedMode: false, // 禁用选中模式
        emphasis: {
          scale: true, // 鼠标悬停时放大
          scaleSize: 10, // 放大尺寸
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold',
            color: '#FF00FF'
          }
        },
        labelLine: {
          show: props.showLabel,
          lineStyle: {
            color: 'rgba(125, 249, 255, 0.3)'
          }
        },
        data: seriesData,
        roseType: props.roseType,
        color: props.colorPalette,
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
          return Math.random() * 200
        },

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

// 响应式调整
const handleResize = () => {
  if (chartInstance) chartInstance.resize()
  if (particleCanvas.value) {
    particleCanvas.value.width = particleCanvas.value.offsetWidth
    particleCanvas.value.height = particleCanvas.value.offsetHeight
  }
}

// 监听数据变化
watch(() => props.chartData, () => {
  extractAvailableFields()
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

// 初始化
onMounted(() => {
  extractAvailableFields()
  nextTick(() => {
    initChart()
    window.addEventListener('resize', handleResize)
  })
})

// 清理
onUnmounted(() => {
  if (chartInstance) chartInstance.dispose()
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
$tech-blue: #03045E;
$tech-cyan: #7DF9FF;
$tech-lightblue: #90E0EF;
$tech-darkblue: #023E8A;
$tech-text: #CAF0F8;

.pie-chart-container {
  width: 100%;
  position: relative;
}

.futuristic-card {
  margin: 0;
  border: none;
  background: linear-gradient(135deg, $tech-blue 0%, $tech-darkblue 100%);
  box-shadow: 0 0 20px rgba(0, 180, 216, 0.5);
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(72, 202, 228, 0.3);
    background: rgba(0, 53, 102, 0.3);
  }
}

.futuristic-title {
  color: $tech-cyan;
  font-size: 18px;
  margin: 0 0 12px 0;
  font-weight: 500;
  text-shadow: 0 0 8px rgba($tech-cyan, 0.5);
}

.chart-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px;

  .control-label {
    color: $tech-cyan;
    font-size: 14px;
    white-space: nowrap;
    flex-shrink: 0;
    text-shadow: 0 0 4px rgba($tech-cyan, 0.3);
  }
}

.futuristic-select {
  width: 180px;

  :deep(.el-input__wrapper) {
    background: rgba(0, 119, 182, 0.3) !important;
    border: 1px solid rgba(72, 202, 228, 0.5) !important;
    box-shadow: 0 0 8px rgba(125, 249, 255, 0.2) !important;
    height: 32px;

    .el-input__inner {
      color: $tech-text !important;
      font-size: 13px;

      &::placeholder {
        color: rgba($tech-lightblue, 0.7) !important;
      }
    }
  }

  :deep(.el-select__caret) {
    color: $tech-cyan !important;
  }
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: v-bind(height);
  min-height: 200px;
}

.chart {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
}

.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.6;
}

.empty-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: rgba($tech-lightblue, 0.7);
  z-index: 3;

  .el-icon-pie-chart {
    font-size: 48px;
    color: rgba($tech-cyan, 0.3);
    margin-bottom: 12px;
    display: block;
  }

  span {
    display: block;
    font-size: 14px;
  }
}

:deep(.el-select-dropdown) {
  background: $tech-darkblue !important;
  border: 1px solid $tech-cyan !important;
  box-shadow: 0 0 15px rgba($tech-cyan, 0.3) !important;

  .el-select-dropdown__item {
    color: $tech-text;

    &:hover {
      background: rgba($tech-cyan, 0.1) !important;
    }

    &.selected {
      color: $tech-cyan;
      font-weight: normal;
    }
  }
}
</style>