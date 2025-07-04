<!--<template>-->
<!--  <div class="line-chart-container">-->
<!--    &lt;!&ndash; Element Plus 选择器 &ndash;&gt;-->
<!--    <el-card class="chart-card">-->
<!--      <template #header>-->
<!--&lt;!&ndash;        <div>选择X轴字段</div>&ndash;&gt;-->
<!--&lt;!&ndash;        <div>选择Y轴字段</div>&ndash;&gt;-->
<!--        <div class="card-header">-->
<!--&lt;!&ndash;          <span>{{ title }}</span>&ndash;&gt;-->
<!--          <div class="chart-controls">-->
<!--&lt;!&ndash;            <div>选择X轴字段</div>&ndash;&gt;-->
<!--            <el-select-->
<!--                v-model="selectedXField"-->
<!--                placeholder="选择X轴字段"-->
<!--                @change="updateChart"-->
<!--            >-->
<!--              <el-option-->
<!--                  v-for="field in availableFields"-->
<!--                  :key="field"-->
<!--                  :label="field"-->
<!--                  :value="field"-->
<!--              />-->
<!--            </el-select>-->
<!--&lt;!&ndash;            <div>选择Y轴字段</div>&ndash;&gt;-->
<!--            <el-select-->
<!--                v-model="selectedYField"-->
<!--                placeholder="选择Y轴字段"-->
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

<!--      &lt;!&ndash; ECharts 图表容器 &ndash;&gt;-->
<!--      <div ref="chartRef" class="chart" :style="{ height: height ,width:width}"></div>-->
<!--    </el-card>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->
<!--import { ref, onMounted, watch, nextTick } from 'vue'-->
<!--import * as echarts from 'echarts'-->
<!--import { ElCard, ElSelect, ElOption } from 'element-plus'-->

<!--const props = defineProps({-->
<!--  // 图表数据-->
<!--  chartData: {-->
<!--    type: Array,-->
<!--    default: () => []-->
<!--  },-->
<!--  // 图表标题-->
<!--  title: {-->
<!--    type: String,-->
<!--    default: '数据趋势图'-->
<!--  },-->
<!--  // 图表高度-->
<!--  height: {-->
<!--    type: String,-->
<!--    default: '400px'-->
<!--  },-->
<!--  width: {-->
<!--    type: String,-->
<!--    default: '100%',-->
<!--  },-->
<!--  // X轴字段名-->
<!--  xField: {-->
<!--    type: String,-->
<!--    default: ''-->
<!--  },-->
<!--  // Y轴字段名-->
<!--  yField: {-->
<!--    type: String,-->
<!--    default: ''-->
<!--  }-->
<!--})-->

<!--const chartRef = ref(null)-->
<!--let chartInstance = null-->
<!--const availableFields = ref([])-->
<!--const selectedXField = ref(props.xField)-->
<!--const selectedYField = ref(props.yField)-->

<!--// 初始化图表-->
<!--const initChart = () => {-->
<!--  if (!chartRef.value) return-->

<!--  // 销毁旧实例-->
<!--  if (chartInstance) {-->
<!--    chartInstance.dispose()-->
<!--  }-->

<!--  // 创建新实例-->
<!--  chartInstance = echarts.init(chartRef.value)-->
<!--  updateChart()-->
<!--}-->

<!--// 更新图表数据-->
<!--const updateChart = () => {-->
<!--  if (!chartInstance || !props.chartData.length) return-->

<!--  const xData = []-->
<!--  const yData = []-->

<!--  props.chartData.forEach(item => {-->
<!--    if (selectedXField.value && item[selectedXField.value] !== undefined) {-->
<!--      xData.push(item[selectedXField.value])-->
<!--    }-->
<!--    if (selectedYField.value && item[selectedYField.value] !== undefined) {-->
<!--      yData.push(item[selectedYField.value])-->
<!--    }-->
<!--  })-->

<!--  const option = {-->
<!--    title: {-->
<!--      text: props.title,-->
<!--      left: 'center'-->
<!--    },-->
<!--    tooltip: {-->
<!--      trigger: 'axis',-->
<!--      formatter: params => {-->
<!--        const xValue = params[0].axisValue-->
<!--        const yValue = params[0].data-->
<!--        return `${selectedXField.value}: ${xValue}<br/>${selectedYField.value}: ${yValue}`-->
<!--      }-->
<!--    },-->
<!--    legend: {-->
<!--      data: [selectedYField.value],-->
<!--      bottom: 10-->
<!--    },-->
<!--    grid: {-->
<!--      left: '3%',-->
<!--      right: '4%',-->
<!--      bottom: '15%',-->
<!--      containLabel: true-->
<!--    },-->
<!--    xAxis: {-->
<!--      type: 'category',-->
<!--      data: xData,-->
<!--      name: selectedXField.value,-->
<!--      axisLabel: {-->
<!--        rotate: xData.length > 10 ? 45 : 0-->
<!--      }-->
<!--    },-->
<!--    yAxis: {-->
<!--      type: 'value',-->
<!--      name: selectedYField.value-->
<!--    },-->
<!--    series: [-->
<!--      {-->
<!--        name: selectedYField.value,-->
<!--        type: 'line',-->
<!--        data: yData,-->
<!--        smooth: true,-->
<!--        symbol: 'circle',-->
<!--        symbolSize: 8,-->
<!--        itemStyle: {-->
<!--          color: '#409EFF'-->
<!--        },-->
<!--        lineStyle: {-->
<!--          width: 3-->
<!--        },-->
<!--        areaStyle: {-->
<!--          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [-->
<!--            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },-->
<!--            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }-->
<!--          ])-->
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

<!--  // 如果没有指定字段，自动选择前两个字段-->
<!--  if (!selectedXField.value && availableFields.value.length > 0) {-->
<!--    selectedXField.value = availableFields.value[0]-->
<!--  }-->
<!--  if (!selectedYField.value && availableFields.value.length > 1) {-->
<!--    selectedYField.value = availableFields.value[1]-->
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

<!--  // 窗口大小变化时重新调整图表大小-->
<!--  window.addEventListener('resize', () => {-->
<!--    if (chartInstance) {-->
<!--      chartInstance.resize()-->
<!--    }-->
<!--  })-->
<!--})-->
<!--</script>-->

<!--<style scoped>-->

<!--.line-chart-container {-->
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
<!--}-->

<!--.chart {-->
<!--  width: 100%;-->
<!--}-->
<!--</style>-->


<template>
  <div class="line-chart-container">
    <el-card class="chart-card futuristic-card">
      <template #header>
        <div class="card-header">
          <h3 class="futuristic-title">{{ title }}</h3>
          <div class="chart-controls">
            <div class="control-group">
              <span class="control-label">X轴</span>
              <el-select
                  v-model="selectedXField"
                  placeholder="选择X轴"
                  @change="handleFieldChange"
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
              <span class="control-label">Y轴</span>
              <el-select
                  v-model="selectedYField"
                  placeholder="选择Y轴"
                  @change="handleFieldChange"
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
            :style="{ height: '100%' ,width: '100%' }"
        ></div>
        <canvas ref="particleCanvas" class="particle-canvas"></canvas>
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-spinner"></div>
        </div>
        <div v-if="!hasData" class="empty-placeholder">
          <i class="el-icon-data-line"></i>
          <span>暂无数据</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {ref, onMounted, watch, nextTick, onUnmounted, computed, onBeforeUnmount} from 'vue'
import * as echarts from 'echarts'
import { ElCard, ElSelect, ElOption } from 'element-plus'

const props = defineProps({
  chartData: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: '数据趋势分析'
  },
  height: {
    type: String,
    default: '350px'
  },
  xField: {
    type: String,
    default: '100%'
  },
  yField: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['xFieldChange', 'yFieldChange'])

const chartRef = ref(null)
const particleCanvas = ref(null)
let chartInstance = null
let particleCtx = null
let animationFrameId = null
const availableFields = ref([])
const selectedXField = ref(props.xField)
const selectedYField = ref(props.yField)
const isLoading = ref(props.loading)

// 计算属性
const hasData = computed(() => {
  return props.chartData && props.chartData.length > 0 && selectedXField.value && selectedYField.value
})

// 初始化粒子系统
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
// const initChart = () => {
//   if (!chartRef.value) return
//
//   if (chartInstance) {
//     chartInstance.dispose()
//   }
//
//   chartInstance = echarts.init(chartRef.value, 'dark')
//   updateChart()
// }
const initChart = () => {
  nextTick(() => { // 确保在 DOM 更新后执行
    if (!chartRef.value) {
      console.error("图表容器不存在")
      return
    }

    console.log("图表容器尺寸:", chartRef.value.offsetWidth, "x", chartRef.value.offsetHeight)

    if (chartInstance) {
      chartInstance.dispose()
    }

    try {
      chartInstance = echarts.init(chartRef.value, 'dark')
      console.log("ECharts 实例创建成功")
      updateChart()
    } catch (e) {
      console.error("ECharts 初始化失败:", e)
    }
  })
}
// 更新图表数据
const updateChart = () => {
  if (!chartInstance) return

  if (!hasData.value) {
    chartInstance.clear()
    return
  }

  const xData = []
  const yData = []

  props.chartData.forEach(item => {
    if (item[selectedXField.value] !== undefined && item[selectedYField.value] !== undefined) {
      xData.push(item[selectedXField.value])
      yData.push(item[selectedYField.value])
    }
  })

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
      trigger: 'axis',
      backgroundColor: 'rgba(0, 20, 40, 0.9)',
      borderColor: '#00B4D8',
      borderWidth: 1,
      textStyle: {
        color: '#FFFFFF',
        fontSize: 12
      },
      formatter: (params) => {
        const xValue = params[0].axisValue
        const yValue = params[0].data
        return `
          <div style="margin-bottom:3px;">
            <span style="color:#90E0EF;">${selectedXField.value}: </span>
            <span style="color:#7DF9FF;">${xValue}</span>
          </div>
          <div>
            <span style="color:#90E0EF;">${selectedYField.value}: </span>
            <span style="color:#7DF9FF;font-weight:bold;">${yValue}</span>
          </div>
        `
      }
    },
    legend: {
      data: [selectedYField.value],
      bottom: 5,
      textStyle: {
        color: '#CAF0F8',
        fontSize: 12
      }
    },
    grid: {
      left: '10%',
      right: '5%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: {
        lineStyle: {
          color: '#48CAE4'
        }
      },
      axisLabel: {
        color: '#90E0EF',
        rotate: xData.length > 8 ? 45 : 0,
        fontSize: 11,
        interval: Math.ceil(xData.length / 10)
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#48CAE4'
        }
      },
      axisLabel: {
        color: '#90E0EF',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(72, 202, 228, 0.15)'
        }
      }
    },
    series: [{
      name: selectedYField.value,
      type: 'line',
      data: yData,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: yData.length <= 20,
      itemStyle: {
        color: '#7DF9FF',
        borderColor: '#03045E',
        borderWidth: 1
      },
      lineStyle: {
        width: 2,
        shadowBlur: 8,
        shadowColor: '#7DF9FF'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 180, 216, 0.5)' },
          { offset: 1, color: 'rgba(0, 119, 182, 0.05)' }
        ])
      },
      emphasis: {
        itemStyle: {
          color: '#FF00FF'
        }
      }
    }],
    animationDuration: 800
  }

  chartInstance.setOption(option, true)
}

// 字段变更处理
const handleFieldChange = () => {
  emit('xFieldChange', selectedXField.value)
  emit('yFieldChange', selectedYField.value)
  updateChart()
  nextTick(initParticles)
}

// 提取可用字段
const extractAvailableFields = () => {
  availableFields.value = props.chartData.length > 0
      ? [...new Set(props.chartData.flatMap(Object.keys))]
      : []

  if (availableFields.value.length > 0) {
    if (!selectedXField.value || !availableFields.value.includes(selectedXField.value)) {
      selectedXField.value = availableFields.value[0]
    }
    if (!selectedYField.value || !availableFields.value.includes(selectedYField.value)) {
      selectedYField.value = availableFields.value.length > 1
          ? availableFields.value[1]
          : availableFields.value[0]
    }
  }
}

// 监听数据变化
watch(() => props.chartData, extractAvailableFields, { deep: true })

// 监听字段变化
watch([selectedXField, selectedYField], () => {
  if (chartInstance) updateChart()
})

// 监听loading状态
watch(() => props.loading, (val) => {
  isLoading.value = val
})
// 监听窗口大小变化，自动调整图表大小
const resizeChart = () => {
  nextTick(() => {
    if (chartInstance) {
      chartInstance.resize();
    }
  });
};

// 响应式调整
const handleResize = () => {
  if (chartInstance) chartInstance.resize()


  if (particleCanvas.value) {
    particleCanvas.value.width = particleCanvas.value.offsetWidth
    particleCanvas.value.height = particleCanvas.value.offsetHeight
  }
}

onMounted(() => {

  nextTick(() => {
    extractAvailableFields();
    if (props.chartData.length > 0) {
      initChart();
      initParticles()
    }
  });

// 添加对数据的主动监听
  watch(() => props.chartData, (newData) => {
    if (newData.length > 0) {
      nextTick(initChart); // 数据变化时重新初始化
      nextTick(initParticles); // 数据变化时重新初始化
    }
  }, { immediate: true, deep: true });
  window.addEventListener('resize', resizeChart);
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  // 移除窗口大小变化监听
  window.removeEventListener('resize', resizeChart);
});
onUnmounted(() => {
  if (chartInstance) chartInstance.dispose()
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">

.line-chart-container {
  width: 100%;
  min-width: 300px;
  display: flex;
  flex-direction: column;
}

.chart-card {
  margin: 0;
  border: none;
  background: linear-gradient(135deg, #03045E 0%, #023E8A 100%);
  box-shadow: 0 2px 12px rgba(0, 119, 182, 0.3);
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  :deep(.el-card__header) {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(72, 202, 228, 0.2);
  }
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;

  .control-label {
    color: #90E0EF;
    font-size: 13px;
    white-space: nowrap;
  }

  :deep(.el-input__inner) {
    background: rgba(0, 119, 182, 0.2);
    border: 1px solid rgba(72, 202, 228, 0.4);
    color: #CAF0F8;
    height: 28px;
    font-size: 12px;

    &::placeholder {
      color: rgba(202, 240, 248, 0.6);
    }
  }

  :deep(.el-select__caret) {
    color: #7DF9FF;
  }
}

.futuristic-title {
  color: #7DF9FF;
  font-size: 15px;
  margin: 0;
  font-weight: 500;
}

.chart-wrapper {
  position: relative;
  width: auto;
  height: v-bind(height);
  min-height: 200px;
  flex-grow: 1;
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
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(2, 62, 138, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;

  .loading-spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(125, 249, 255, 0.2);
    border-radius: 50%;
    border-top-color: #7DF9FF;
    animation: spin 1s linear infinite;
  }
}

.empty-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 3;
  color: rgba(144, 224, 239, 0.7);
  font-size: 13px;

  .el-icon-data-line {
    font-size: 32px;
    margin-bottom: 8px;
    color: rgba(125, 249, 255, 0.4);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

