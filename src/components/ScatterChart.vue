<template>
  <div class="scatter-chart-container" :style="{ width: computedWidth }">
    <el-card class="chart-card futuristic-card">
      <template #header>
        <div class="card-header">
          <h3 class="futuristic-title">{{ title }}</h3>
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
import { ElCard } from 'element-plus'

const props = defineProps({
  chartData: {
    type: Array,
    default: () => [],
    required: true
  },
  title: {
    type: String,
    default: '年份数据分布'
  },
  height: {
    type: String,
    default: '400px'
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  color: {
    type: String,
    default: '#7DF9FF'
  },
  maxBubbleSize: {
    type: Number,
    default: 40
  },
  minBubbleSize: {
    type: Number,
    default: 20
  }
})

const chartRef = ref(null)
const particleCanvas = ref(null)
let chartInstance = null
let particleCtx = null
let animationFrameId = null
// 添加计算属性处理宽度
const computedWidth = computed(() => {
  return typeof props.width === 'number' ? `${props.width}px` : props.width
})
// 计算属性
const hasData = computed(() => {
  return props.chartData && props.chartData.length > 0
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

  // 准备数据 - 假设数据格式为 [{ year: '2020', count: 100 }, ...]
  const seriesData = props.chartData.map(item => ({
    name: item.year,
    value: [item.year, item.count],
    symbolSize: calculateBubbleSize(item.count)
  }))

  // 计算最大值用于坐标轴刻度
  const maxCount = Math.max(...props.chartData.map(item => item.count)) * 1.1

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
      formatter: (params) => {
        const data = params.data
        return `
          <div style="margin-bottom:5px;">
            <span style="color:#90E0EF;">年份: </span>
            <span style="color:#7DF9FF;font-weight:bold;">${data.name}</span>
          </div>
          <div>
            <span style="color:#90E0EF;">费用: </span>
            <span style="color:#7DF9FF;font-weight:bold;">${data.value[1]}</span>
          </div>
        `
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
      data: props.chartData.map(item => item.year),
      axisLine: {
        lineStyle: {
          color: '#48CAE4',
          width: 2
        }
      },
      axisLabel: {
        color: '#90E0EF',
        fontSize: 11,
        rotate: props.chartData.length > 8 ? 45 : 0
      },
      splitLine: {
        show: false
      },
      axisTick: {
        lineStyle: {
          color: '#48CAE4'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '费用',
      nameTextStyle: {
        color: '#90E0EF',
        fontSize: 12
      },
      max: maxCount,
      axisLine: {
        lineStyle: {
          color: '#48CAE4',
          width: 2
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
      },
      axisTick: {
        lineStyle: {
          color: '#48CAE4'
        }
      }
    },
    series: [{
      type: 'scatter',
      symbol: 'circle',
      data: seriesData,
      itemStyle: {
        color: props.color,
        borderColor: '#03045E',
        borderWidth: 2,
        shadowBlur: 15,
        shadowColor: props.color
      },
      emphasis: {
        itemStyle: {
          color: '#FF00FF',
          borderWidth: 3,  // 强调状态边框加粗
          shadowBlur: 20,  // 强调状态阴影增大
          shadowColor: 'rgba(255, 0, 255, 0.5)'
        }
      },
      // 添加缩放动画效果
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: function (idx) {
        return idx * 50
      }
    }],
    animationEasing: 'cubicOut',
    animationDuration: 1000
  }

  chartInstance.setOption(option, true)
}

// 计算气泡大小（根据数量值）
const calculateBubbleSize = (value) => {
  const values = props.chartData.map(item => item.count)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)

  if (maxVal === minVal) {
    return (props.minBubbleSize + props.maxBubbleSize) / 2
  }

  return props.minBubbleSize +
      ((value - minVal) / (maxVal - minVal)) *
      (props.maxBubbleSize - props.minBubbleSize)
}

// 响应式调整
const handleResize = () => {
  if (chartInstance) chartInstance.resize()
  if (particleCanvas.value) {
    particleCanvas.value.width = particleCanvas.value.offsetWidth
    particleCanvas.value.height = particleCanvas.value.offsetHeight
  }
}

// // 初始化
// onMounted(() => {
//   nextTick(() => {
//     initChart()
//     initParticles()
//     window.addEventListener('resize', handleResize)
//   })
// })
//
// // 监听数据变化
// watch(() => props.chartData, () => {
//   updateChart()
// }, { deep: true })


onMounted(() => {

  nextTick(() => {

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

  window.addEventListener('resize', handleResize)
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
//
//.scatter-chart-container {
//  width: 55vh
//
//}
.scatter-chart-container {
  /* 移除固定宽度设置 */
  min-width: 300px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
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
</style>