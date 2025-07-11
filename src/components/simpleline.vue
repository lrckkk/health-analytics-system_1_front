
<template>
  <div class="line-chart-container" :style="{ width: computedWidth }">
    <el-card class="chart-card futuristic-card">

      <div class="chart-title">{{ title }}</div>
      <div class="chart-wrapper">
        <div
            ref="chartRef"
            class="chart futuristic-chart"
            :style="{ height: '100%' ,width: '100%' }"
        ></div>
        <canvas ref="particleCanvas" class="particle-canvas"></canvas>
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
import { useRouter } from 'vue-router'
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
// 初始化粒子系统 - 使用MultipleLineChart风格的粒子效果
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
    // 处理小数情况
    if (Math.abs(value) < 1 && value !== 0) {
      return value.toFixed(3); // 显示2位小数
    }

    if (value >= 100000000) {
      return (value / 100000000).toFixed(1) + '亿';
    } else if (value >= 10000) {
      return (value / 10000).toFixed(1) + '万';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + '千';
    }
    return Math.round(value); // 小于1000的直接取整
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
            <span style="color:#90E0EF;">年份: </span>
            <span style="color:#7DF9FF;">${xValue}</span>
          </div>
          <div>
            <span style="color:#90E0EF;">总数: </span>
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
      bottom: '20%',
      top: '30%',
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
          color: 'rgba(72, 202, 228, 0.15)',
          width: 1  // 可以适当增加分割线宽度
        },
        interval: 'auto'  // 确保自动计算间隔
      },
      splitNumber: 3  // 增加这个属性可以控制分割段数，使y轴刻度更稀疏
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
        formatter: (params) => {
          // 只显示偶数索引的标签（每隔一个显示一个）
          return params.dataIndex % 2 === 0 ? formatNumber(params.value) : '';
        },
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
      // 先取消之前的动画
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
        stopParticles()
      }
      stopParticles()
      nextTick(initChart)
      nextTick(initParticles)
    }
  }, { immediate: true, deep: true })
  window.addEventListener('resize', resizeChart);
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  // 移除窗口大小变化监听
  window.removeEventListener('resize', resizeChart);
});
onUnmounted(() => {
  if (chartInstance) chartInstance.dispose()
  stopParticles()
  window.removeEventListener('resize', handleResize)
})
//
// onUnmounted(() => {
//   if (chartInstance) chartInstance.dispose()
//   if (animationFrameId) cancelAnimationFrame(animationFrameId)
//   window.removeEventListener('resize', handleResize)
// })
</script>
<style scoped lang="scss">
/* 容器样式 */
.line-chart-container {
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
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  position: absolute;
  top: 45px;
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
/* 图表容器样式 */
.chart-wrapper {
  position: relative;
  width: 100%;
  height: v-bind(height);
  min-height: 200px;
  flex-grow: 1;
  padding-top: 30px; /* 为标题留出空间 */
}


.chart {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
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
  position: relative; /* 为绝对定位的标题提供参考 */

  :deep(.el-card__header) {
    padding: 0;
    border-bottom: none; /* 移除头部边框 */
  }

  :deep(.el-card__body) {
    padding: 0 !important;
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


}




/* 粒子画布样式 */
.particle-canvas {
  position: absolute;
  top: 0; /* 从顶部开始 */
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



/* 动画定义 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .line-chart-container {
    padding: 8px;
  }

  .futuristic-title {
    font-size: 14px;
  }
}
:deep(.el-card .el-card__body) {
  padding: 0 !important;
}

</style>


