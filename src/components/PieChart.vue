<template>
  <div class="pie-chart-container" :style="{ width: computedWidth }">
    <el-card class="chart-card futuristic-card">
      <div class="chart-wrapper">

        <router-link :to="{ name: 'Home' }" class="futuristic-title" > <h3 >{{ title }}</h3></router-link>
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
import { ElCard } from 'element-plus'

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
    type: [String, Number],
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

const computedWidth = computed(() => {
  return typeof props.width === 'number' ? `${props.width}px` : props.width
})

const hasData = computed(() => {
  return props.chartData && props.chartData.length > 0 && props.nameField && props.valueField
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
    name: props.nameField ? item[props.nameField] : '',
    value: props.valueField ? item[props.valueField] : 0
  }))

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
        selectedMode: false,
        emphasis: {
          scale: true,
          scaleSize: 10,
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
        }
      }
    ]
  }

  chartInstance.setOption(option)
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
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

// 初始化
onMounted(() => {
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
  min-width: 300px;
  display: flex;
  flex-direction: column;
}

.futuristic-card {
  margin: 0;
  border: none;
  background: transparent;
  box-shadow: none;

  :deep(.el-card__header),
  :deep(.el-card__body) {
    padding: 0;
    border: none;
    background: transparent;
  }
}

.futuristic-title {
  color: $tech-cyan;
  font-size: 18px;
  text-align: center;
  margin: 10px 0;
  padding-top: 10px;
  font-weight: 500;
  text-shadow: 0 0 8px rgba($tech-cyan, 0.5);
  position: relative;
  z-index: 4;
  cursor: pointer; /* 添加指针样式 */
  text-decoration: none; /* 移除下划线 */

  &:hover {
    color: #0059ff; /* 悬停时改变颜色 */
    text-shadow: 0 0 10px rgba(255, 0, 255, 0.5); /* 悬停时增强阴影 */
  }
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: v-bind(height);
  min-height: 200px;
  background: linear-gradient(135deg, rgba($tech-blue, 0.8) 0%, rgba($tech-darkblue, 0.8) 100%);
  border-radius: 8px;
  overflow: hidden;
}

.chart {
  width: 100%;
  height: calc(100% - 40px);
  position: relative;
  z-index: 2;
  margin-top: -10px;
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
</style>