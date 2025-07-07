<template>
  <div class="scatter-chart-container" :style="{ width: computedWidth }">
    <el-card class="chart-card futuristic-card">
      <router-link :to="{ name: 'Home' }" class="chart-title">{{ title }}</router-link>
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
    default: 20
  },
  minBubbleSize: {
    type: Number,
    default: 13
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
// 粒子系统
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
  initParticles()
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance || !hasData.value) return
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
  // 准备数据 - 假设数据格式为 [{ year: '2020', count: 100 }, ...]
  const seriesData = props.chartData.map((item, index) => ({
    name: String(item.year), // 确保年份是字符串
    value: [String(item.year), Number(item.count)], // 确保类型正确
    symbolSize: calculateBubbleSize(item.count),
    formattedValue: formatNumber(item.count),

  }))

  // 计算最大值并向上取整到最近的合适刻度
  const maxCount = Math.max(...props.chartData.map(item => item.count))
  const roundedMax = roundToNiceNumber(maxCount * 1.1)
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
            <span style="color:#7DF9FF;font-weight:bold;">${data.formattedValue}</span>
          </div>
        `
      }
    },
    grid: {
      left: '5%',
      right: '10%',
      bottom: '0%',
      top: '28%',
      // position: 'center',
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
      max: roundedMax,
      min: 0, // 确保从0开始
      axisLine: {
        lineStyle: {
          color: '#48CAE4',
          width: 2
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
      splitNumber: 4,  // 增加这个属性可以控制分割段数，使y轴刻度更稀疏
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
      label: {
        show: props.chartData.length <= 100, // 数据点较少时才显示标签
        position: 'top',
        color: '#CAF0F8',
        fontSize: 9,
        offset: [0, 5],
        formatter: (params) => {
          // 只有当数据索引是偶数时才显示标签
          return params.dataIndex % 2 === 0 ? formatNumber(params.data.value[1]) : ''
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
// 辅助函数：将数字舍入到合适的刻度
const roundToNiceNumber = (value) => {
  const exponent = Math.floor(Math.log10(value))
  const fraction = value / Math.pow(10, exponent)

  let niceFraction
  if (fraction <= 1.5) niceFraction = 1.5
  else if (fraction <= 3) niceFraction = 3
  else if (fraction <= 7) niceFraction = 5
  else niceFraction = 10

  return niceFraction * Math.pow(10, exponent)
}
// 更新calculateBubbleSize函数，添加规范化处理
const calculateBubbleSize = (value) => {
  const values = props.chartData.map(item => item.count)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)

  // 处理所有值相同的情况
  if (maxVal === minVal) {
    return (props.minBubbleSize + props.maxBubbleSize) / 2
  }

  // 对数值进行对数处理，减小极端值的影响
  const logMin = Math.log10(minVal + 1) // +1防止0值
  const logMax = Math.log10(maxVal + 1)
  const logValue = Math.log10(value + 1)

  // 计算规范化后的尺寸
  return props.minBubbleSize +
      ((logValue - logMin) / (logMax - logMin)) *
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
//
//.scatter-chart-container {
//  width: 55vh
//
//}
.scatter-chart-container {
  min-width: 300px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: linear-gradient(135deg, #03045E 0%, #023E8A 100%);
  box-shadow: 0 2px 12px rgba(0, 119, 182, 0.3);
  border-radius: 4px;
  padding: 1px;
}
.chart-title {
  position: absolute;
  top: 55px;
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
  flex-grow: 1;
  padding-top: 70px;
}

.chart {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
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
.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}
:deep(.el-card .el-card__body) {
  padding: 0 !important;
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