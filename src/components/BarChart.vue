<template>
  <div class="bar-chart-container" :style="{ width: computedWidth }">
    <el-card class="chart-card futuristic-card">

      <div class="chart-title">{{ title }}</div>
      <div class="chart-wrapper">
        <div
            ref="chartRef"
            class="chart futuristic-chart"
            :style="{ height: height }"
        ></div>
        <canvas ref="particleCanvas" class="particle-canvas"></canvas>
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-spinner"></div>
        </div>
        <div v-if="!hasData" class="empty-placeholder">
          <i class="el-icon-data-analysis"></i>
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
    default: '医疗卫生人员统计'
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
    default: ''
  },
  yField: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#00B4D8'
  },
  showLabel: {
    type: Boolean,
    default: true
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
// 添加计算属性处理宽度
const computedWidth = computed(() => {
  return typeof props.width === 'number' ? `${props.width}px` : props.width
})
// 计算属性
const hasData = computed(() => {
  return props.chartData && props.chartData.length > 0 && selectedXField.value && selectedYField.value
})
const globalParticles = ref({
  active: false,
  animationFrameId: null,
  particles: [],
  lastCleanup: 0,
  lastFrameTime: 0
})
// 辅助函数：将hex颜色转换为rgba
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// 初始化粒子系统
const initParticles = () => {
  if (!particleCanvas.value || !hasData.value) return

  // 如果粒子系统已经在运行，先停止它
  if (globalParticles.value.active) {
    stopParticles()
  }

  const canvas = particleCanvas.value
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight

  const ctx = canvas.getContext('2d')

  // 粒子配置 - 使用MultipleLineChart风格的参数
  const config = {
    MAX_PARTICLES: 40,          // 粒子数量
    PARTICLE_SIZE: 1.5,         // 粒子基础大小
    SPEED: 0.2,                // 基础速度
    TRAIL_LENGTH: 15,          // 拖尾长度
    FPS: 30,                   // 目标帧率
    COLORS: ['#7DF9FF', '#00B4D8', '#90E0EF'] // 粒子颜色
  }

  // 粒子生成函数
  const createParticle = () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 1.5 + 0.5,
    speed: config.SPEED * (0.8 + Math.random() * 1.4),
    opacity: Math.random() * 0.4 + 0.2,
    direction: Math.random() * Math.PI * 2,
    color: config.COLORS[Math.floor(Math.random() * config.COLORS.length)],
    history: [],
    life: 1 + Math.random() * 0.3
  })

  // 标记为活跃
  globalParticles.value.active = true

  // 初始填充粒子
  globalParticles.value.particles = Array.from(
      { length: config.MAX_PARTICLES / 2 }, // 初始只填充一半粒子
      createParticle
  )

  const animate = (timestamp) => {
    if (!globalParticles.value.active) return

    // 控制帧率
    const deltaTime = timestamp - globalParticles.value.lastFrameTime
    if (deltaTime < 1000 / config.FPS) {
      globalParticles.value.animationFrameId = requestAnimationFrame(animate)
      return
    }
    globalParticles.value.lastFrameTime = timestamp

    // 清除画布 - 使用更透明的背景让拖尾更快消失
    ctx.fillStyle = 'rgba(3, 4, 94, 0.08)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 定期清理死亡粒子
    const now = Date.now()
    if (now - globalParticles.value.lastCleanup > 2000) {
      globalParticles.value.particles = globalParticles.value.particles.filter(p => p.life > 0)
      globalParticles.value.lastCleanup = now
    }

    // 补充新粒子 (不超过最大值)
    if (globalParticles.value.particles.length < config.MAX_PARTICLES && Math.random() > 0.7) {
      globalParticles.value.particles.push(createParticle())
    }

    // 更新和绘制粒子
    globalParticles.value.particles.forEach(p => {
      // 更新生命周期
      p.life -= 0.002

      // 更新位置
      p.x += Math.cos(p.direction) * p.speed
      p.y += Math.sin(p.direction) * p.speed

      // 边界检查并反弹
      if (p.x < 0 || p.x > canvas.width) p.direction = Math.PI - p.direction
      if (p.y < 0 || p.y > canvas.height) p.direction = -p.direction

      // 创建粒子光晕效果 - MultipleLineChart风格
      const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.size
      )
      gradient.addColorStop(0, `rgba(125, 249, 255, ${p.opacity * 0.7})`)
      gradient.addColorStop(0.7, `rgba(125, 249, 255, ${p.opacity * 0.2})`)
      gradient.addColorStop(1, 'rgba(125, 249, 255, 0)')

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    })

    globalParticles.value.animationFrameId = requestAnimationFrame(animate)
  }

  globalParticles.value.animationFrameId = requestAnimationFrame(animate)
}


// 停止粒子系统
const stopParticles = () => {
  if (globalParticles.value.animationFrameId) {
    cancelAnimationFrame(globalParticles.value.animationFrameId)
    globalParticles.value.animationFrameId = null
  }
  globalParticles.value.active = false
  globalParticles.value.particles = []

  // 清除画布
  if (particleCanvas.value) {
    const ctx = particleCanvas.value.getContext('2d')
    ctx.clearRect(0, 0, particleCanvas.value.width, particleCanvas.value.height)
  }
}
// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value, 'dark')
  updateChart()
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance || !hasData.value) return

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
  // 获取Y轴最大值用于确定合适的单位
  const maxValue = Math.max(...yData)

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
    grid: {
      left: '5%',
      right: '5%',
      bottom: '20%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: {
        lineStyle: {
          color: '#48CAE4',
          width: 1
        }
      },
      axisLabel: {
        color: '#90E0EF',
        rotate: xData.length > 8 ? 45 : 0,
        fontSize: 11,
        interval: Math.ceil(xData.length / 10)
      },
      axisTick: {
        alignWithLabel: true,
        lineStyle: {
          color: '#48CAE4'
        }
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
          color: '#48CAE4',
          width: 0
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
          color: 'rgba(72, 202, 228, 0.15)',
          width: 1  // 可以适当增加分割线宽度
        },
        interval: 'auto'  // 确保自动计算间隔
      },
      axisTick: {
        lineStyle: {
          color: '#48CAE4'
        }
      },
      splitNumber: 3  // 增加这个属性可以控制分割段数，使y轴刻度更稀疏
    },
    series: [{
      name: selectedYField.value,
      type: 'bar',
      data: yData,
      barWidth: '60%', // 减小柱形宽度
      barGap: '80%',   // 增加柱形组间间距
      barCategoryGap: '50%', // 增加同一类别柱形间间距
      itemStyle: {
        color: props.color,
        borderColor: '#03045E',
        borderWidth: 1,
        borderRadius: [4, 4, 0, 0],
        shadowBlur: 10,
        shadowColor: props.color
      },
      emphasis: {
        itemStyle: {
          color: '#FF00FF',
          borderWidth: 2,
          shadowBlur: 15,
          shadowColor: 'rgba(255, 0, 255, 0.5)'
        }
      },
      label: {
        show: props.showLabel,
        position: 'top',
        color: '#CAF0F8',
        fontSize:12,
        offset: [0, 3],  // 垂直偏移2像素，避免紧贴柱顶
        formatter: (params) => {
          // 只显示偶数索引的标签（每隔一个显示一个）
          return params.dataIndex % 2 === 0 ? formatNumber(params.value) : '';
        },
        textStyle: {
          fontSize: 8,  // 再次确认字体大小
          fontWeight: 'normal'  // 使用普通字体粗细
        }
      },
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: function (idx) {
        return idx * 50
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
    extractAvailableFields()
    if (props.chartData.length > 0) {
      initChart()
      initParticles()
    }
  })

  // 添加对数据的主动监听
  watch(() => props.chartData, (newData) => {
    if (newData.length > 0) {
      nextTick(initChart)
      nextTick(initParticles)
    }
  }, { immediate: true, deep: true })

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chartInstance) chartInstance.dispose()
  stopParticles()
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
$tech-highlight: #FF00FF;

.bar-chart-container {
  min-width: 300px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: linear-gradient(135deg, #03045E 0%, #023E8A 100%);
  box-shadow: 0 2px 12px rgba(0, 119, 182, 0.3);
  border-radius: 4px;
  padding: 1px;
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
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 10px;
}
.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;

  .control-label {
    color: $tech-cyan;
    font-size: 13px;
    min-width: 30px;
    text-shadow: 0 0 5px rgba($tech-cyan, 0.3);
  }
}
.chart-card {
  margin: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;

  :deep(.el-card__header) {
    padding: 0;
    border-bottom: none;
  }

  :deep(.el-card__body) {
    padding: 0 !important;
  }
}
.chart-wrapper {
  position: relative;
  width: 100%;
  height: v-bind(height);
  min-height: 200px;
  flex-grow: 1;
  padding-top: 80px;
  //padding-bottom: 20px;
}
.chart-title {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  position: absolute;
  top: 65px;
  left: 0;
  right: 0;
  text-align: center;
  color: #7DF9FF;
  font-size: 14px;
  margin: 0;
  font-weight: 500;
  text-shadow: 0 0 8px rgba(125, 249, 255, 0.3);
  z-index: 10;
  cursor: pointer; /* 添加指针样式 */
  text-decoration: none; /* 移除下划线 */

  &:hover {
    color: #0059ff; /* 悬停时改变颜色 */
    text-shadow: 0 0 10px rgba(255, 0, 255, 0.5); /* 悬停时增强阴影 */
  }
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: rgba($tech-lightblue, 0.7);
  z-index: 3;

  .el-icon-data-analysis {
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

@keyframes spin {
  to { transform: rotate(360deg); }
}
:deep(.el-card .el-card__body) {
  padding: 0 !important;
}
</style>
