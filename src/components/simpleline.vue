
<template>
  <div class="line-chart-container" :style="{ width: computedWidth }">
    <el-card class="chart-card futuristic-card">
      <template #header>
        <div class="card-header">
          <h3 class="futuristic-title">{{ title }}</h3>
          <div class="chart-controls">
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
<!--        <div v-if="isLoading" class="loading-overlay">-->
<!--          <div class="loading-spinner"></div>-->
<!--        </div>-->
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
  width: {
    type: [String, Number],
    default: '100%'
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
// 计算宽度（处理数字类型的px单位）
const computedWidth = computed(() => {
  return typeof props.width === 'number' ? `${props.width}px` : props.width
})
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

  // 创建粒子 - 数量减少到40个以降低负载
  const particles = Array.from({ length: 40 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 1 + 0.5, // 减小粒子大小
    speed: Math.random() * 0.15 + 0.05, // 降低速度
    opacity: Math.random() * 0.3 + 0.1, // 降低不透明度
    direction: Math.random() * Math.PI * 2
  }))

  const animate = () => {
    if (!particleCtx || !canvas) return

    // 使用更透明的背景让拖尾更快消失
    particleCtx.fillStyle = 'rgba(3, 4, 94, 0.05)' // 更透明
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
      // 使用更浅的颜色
      gradient.addColorStop(0, 'rgba(180, 250, 255, 0.6)') // 更浅的蓝色
      gradient.addColorStop(1, 'rgba(180, 250, 255, 0)')

      particleCtx.beginPath()
      particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      particleCtx.fillStyle = gradient
      particleCtx.fill()
    })

    // 添加帧率控制 - 每两帧渲染一次
    animationFrameId = requestAnimationFrame(() => {
      setTimeout(() => {
        requestAnimationFrame(animate)
      }, 0)
    })
  }

  animate()
}

// 初始化图表

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
  // 格式化数字显示
  const formatNumber = (value) => {
    if (value >= 100000000) {
      return (value / 100000000).toFixed(1) + '亿'
    } else if (value >= 10000) {
      return (value / 10000).toFixed(1) + '万'
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + '千'
    }
    return Math.round(value) // 小于1000的直接取整
  }
  const option = {
    backgroundColor: 'transparent',
    title: {
      // text: props.title,
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
            <span style="color:#7DF9FF;font-weight:bold;">${formatNumber(yValue)}</span>
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
      left: '5%',
      right: '5%',
      bottom: '10%',
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
      name: '总数',
      nameTextStyle: {
        color: '#90E0EF',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#48CAE4'
        }
      },
      axisLabel: {
        color: '#90E0EF',
        fontSize: 11,
        formatter: function(value) {
          return formatNumber(value)
        }
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
      },
      label: {
        show: yData.length <= 100, // 数据点较少时才显示标签
        position: 'top',
        color: '#CAF0F8',
        fontSize: 9,
        offset: [0, 5],
        formatter: (params) => formatNumber(params.value)
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
/* 容器样式 */
.line-chart-container {
  min-width: 300px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* 卡片样式 */
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

/* 卡片头部样式 */
.card-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.futuristic-title {
  color: #7DF9FF;
  font-size: 15px;
  margin: 0;
  font-weight: 500;
  text-shadow: 0 0 8px rgba(125, 249, 255, 0.3);
}

/* 图表控制区域 */
.chart-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 控制组样式 */
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
    text-shadow: 0 0 5px rgba(125, 249, 255, 0.3);
  }

  /* 选择器样式 */
  :deep(.el-select) {
    flex-grow: 1;
    width: 100%;

    .el-input {
      .el-input__inner {
        background: rgba(0, 119, 182, 0.3) !important;
        border: 1px solid rgba(72, 202, 228, 0.6) !important;
        color: #CAF0F8 !important;
        height: 32px;
        font-size: 12px;
        transition: all 0.3s ease;
        box-shadow: 0 0 8px rgba(0, 180, 216, 0.2);
        border-radius: 4px;

        &::placeholder {
          color: rgba(202, 240, 248, 0.6) !important;
        }

        &:hover {
          border-color: #7DF9FF !important;
          box-shadow: 0 0 12px rgba(125, 249, 255, 0.4) !important;
        }

        &:focus {
          border-color: #7DF9FF !important;
          box-shadow: 0 0 15px rgba(125, 249, 255, 0.6) !important;
        }
      }

      .el-select__caret {
        color: #7DF9FF !important;
        transition: transform 0.3s;
      }
    }

    &.is-focus {
      .el-input__inner {
        border-color: #7DF9FF !important;
      }
      .el-select__caret {
        transform: rotate(180deg);
      }
    }
  }
}

/* 下拉菜单样式 */
:deep(.el-select-dropdown) {
  background: linear-gradient(135deg, #03045E 0%, #023E8A 100%) !important;
  border: 1px solid rgba(72, 202, 228, 0.6) !important;
  box-shadow: 0 5px 20px rgba(0, 119, 182, 0.4) !important;
  border-radius: 4px !important;
  overflow: hidden !important;

  .el-select-dropdown__item {
    color: #CAF0F8 !important;
    font-size: 12px !important;
    padding: 8px 16px !important;
    transition: all 0.2s ease !important;
    position: relative !important;

    &:before {
      content: '' !important;
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 3px !important;
      height: 100% !important;
      background: transparent !important;
      transition: all 0.2s ease !important;
    }

    &:hover {
      background: rgba(0, 180, 216, 0.2) !important;
      color: #7DF9FF !important;

      &:before {
        background: #7DF9FF !important;
      }
    }

    &.selected {
      background: rgba(0, 150, 199, 0.3) !important;
      color: #7DF9FF !important;
      font-weight: bold !important;

      &:before {
        background: #7DF9FF !important;
      }
    }
  }

  .el-select-dropdown__empty {
    color: rgba(202, 240, 248, 0.6) !important;
    padding: 10px !important;
    font-size: 12px !important;
  }

  .popper__arrow {
    border-bottom-color: rgba(72, 202, 228, 0.6) !important;

    &:after {
      border-bottom-color: #03045E !important;
    }
  }
}

/* 图表容器样式 */
.chart-wrapper {
  position: relative;
  width: 100%;
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

/* 粒子画布样式 */
.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

/* 加载状态样式 */
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

/* 空状态提示样式 */
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

/* 动画定义 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .chart-controls {
    flex-direction: column;
  }

  .control-group {
    min-width: 100%;
  }
}
:deep(.el-card .el-card__body) {
  padding: 0 !important;
}

</style>


