
<template>
  <div class="multi-line-chart-container" :style="{ width: computedWidth }">
    <el-card class="chart-card futuristic-card">
      <template #header>
        <div class="card-header">
          <h3 class="futuristic-title">{{ title }}</h3>
          <div class="chart-controls">
<!--            <div class="control-group">-->
<!--              <span class="control-label">X轴</span>-->
<!--              <el-select-->
<!--                  v-model="selectedXField"-->
<!--                  placeholder="选择X轴"-->
<!--                  @change="handleFieldChange"-->
<!--                  class="futuristic-select"-->
<!--                  :clearable="false"-->
<!--                  size="small"-->
<!--              >-->
<!--                <el-option-->
<!--                    v-for="field in availableFields"-->
<!--                    :key="field"-->
<!--                    :label="field"-->
<!--                    :value="field"-->
<!--                    class="futuristic-option"-->
<!--                />-->
<!--              </el-select>-->

<!--            </div>-->

            <div class="control-group">
              <span class="control-label">省份</span>
              <el-select
                  v-model="selectedProvinces"
                  multiple
                  placeholder="选择对比省份"
                  @change="updateChart"
                  class="futuristic-select"
                  size="small"
              >
                <el-option
                    v-for="province in allProvinces"
                    :key="province.provinceId"
                    :label="province.provinceName"
                    :value="province.provinceId"
                    class="futuristic-option"
                />
              </el-select>
            </div>

            <div class="legend-controls">
              <div
                  v-for="(field, index) in valueFields"
                  :key="field"
                  class="legend-item"
                  :class="{ hidden: !visibleLines[field] }"
                  @click="toggleLineVisibility(field)"
              >
                <div
                    class="legend-color"
                    :style="{
                    backgroundColor: colorPalette[index % colorPalette.length],
                    boxShadow: `0 0 6px ${colorPalette[index % colorPalette.length]}`
                  }"
                ></div>
                <span>{{ field }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div class="chart-wrapper">
        <canvas ref="particleCanvas" class="particle-canvas"></canvas>
        <div
            ref="chartRef"
            class="chart futuristic-chart"
            :style="{ height: height }"
        ></div>
        <div v-if="!hasData" class="empty-placeholder">
          <i class="el-icon-data-line"></i>
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
import request from '@/utils/request'
import { provinceIdMap } from '@/utils/mapid'
import { IdToNameMapper } from '@/utils/IdToNameMapper'

const props = defineProps({
  title: {
    type: String,
    default: '人口统计趋势'
  },
  height: {
    type: String,
    default: '350px'
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  showDataZoom: {
    type: Boolean,
    default: true
  },
  showLegend: {
    type: Boolean,
    default: true
  },
  smooth: {
    type: Boolean,
    default: true
  }
})

const provinceMapper = new IdToNameMapper(provinceIdMap)
const chartRef = ref(null)
const particleCanvas = ref(null)
let chartInstance = null
let particleCtx = null
let animationFrameId = null
const availableFields = ref(['year'])
const valueFields = ref([])
const selectedXField = ref('year')
const visibleLines = ref({})
const allProvinces = ref([])
const selectedProvinces = ref([23]) // 默认选择湖南(23)
const populationData = ref({})
const colorPalette = ref([
  '#7DF9FF', '#FF00FF', '#00B4D8', '#48CAE4', '#90E0EF',
  '#0096FF', '#5D8AA8', '#0077B6', '#03045E'
])
// 添加计算属性处理宽度
const computedWidth = computed(() => {
  return typeof props.width === 'number' ? `${props.width}px` : props.width
})
// 计算属性
const hasData = computed(() => {
  return Object.keys(populationData.value).length > 0 && selectedXField.value
})

// 获取所有省份列表
const fetchProvinces = async () => {
  try {
    const response = await request.get('/api/provinces')
    allProvinces.value = response
  } catch (error) {
    console.error('获取省份列表失败:', error)
  }
}

// 获取人口数据
const fetchPopulationData = async (provinceId) => {
  try {
    const response = await request.get(`/api/provinces/${provinceId}/population/years`)
    const provinceName = provinceMapper.getName(provinceId) || `省份${provinceId}`
    populationData.value[provinceName] = response.map(item => ({
      year: String(item.year),
      population: Number(item.total)
    }))

    // 更新可用字段
    valueFields.value = [...new Set([...valueFields.value, provinceName])]
    visibleLines.value[provinceName] = true

    updateChart()
  } catch (error) {
    console.error(`获取省份${provinceId}人口数据失败:`, error)
  }
}

// 初始化图表
// 修改后的初始化图表方法
const initChart = () => {
  nextTick(() => {
    if (!chartRef.value) return

    // 销毁旧实例
    if (chartInstance) {
      chartInstance.dispose()
    }

    // 创建新实例
    chartInstance = echarts.init(chartRef.value, 'dark')

    // 初始化粒子
    initParticles()

    // 更新图表
    updateChart()
  })
}

// 粒子系统 - 修改后的实现
const initParticles = () => {
  // 确保DOM已渲染
  nextTick(() => {
    const canvas = particleCanvas.value
    if (!canvas) return

    const container = canvas.parentElement
    if (!container) return

    // 设置画布尺寸
    const setCanvasSize = () => {
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight
    }

    setCanvasSize()

    // 获取2D上下文
    particleCtx = canvas.getContext('2d')
    if (!particleCtx) return

    // 调整粒子数量和参数
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.2 + 0.1,
      opacity: Math.random() * 0.4 + 0.2,
      direction: Math.random() * Math.PI * 2
    }))

    // 动画循环
    const animate = () => {
      if (!particleCtx || !canvas) return

      // 清除画布 - 使用半透明实现拖尾效果
      particleCtx.fillStyle = 'rgba(3, 4, 94, 0.08)'
      particleCtx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制粒子
      particles.forEach(p => {
        // 更新位置
        p.x += Math.cos(p.direction) * p.speed
        p.y += Math.sin(p.direction) * p.speed

        // 边界检查
        if (p.x < 0 || p.x > canvas.width) p.direction = Math.PI - p.direction
        if (p.y < 0 || p.y > canvas.height) p.direction = -p.direction

        // 创建粒子发光效果
        const gradient = particleCtx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, p.size
        )
        // 调整粒子渐变透明度
        gradient.addColorStop(0, `rgba(125, 249, 255, ${p.opacity * 0.7})`) // 降低主透明度
        gradient.addColorStop(0.7, `rgba(125, 249, 255, ${p.opacity * 0.2})`) // 降低渐变透明度
        gradient.addColorStop(1, 'rgba(125, 249, 255, 0)')

        // 绘制粒子
        particleCtx.beginPath()
        particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        particleCtx.fillStyle = gradient
        particleCtx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    // 停止之前的动画
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }

    // 开始动画
    animate()

    // 窗口大小变化时重设画布尺寸
    const resizeObserver = new ResizeObserver(() => {
      setCanvasSize()
    })
    resizeObserver.observe(container)

    // 组件卸载时清理
    onUnmounted(() => {
      resizeObserver.disconnect()
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    })
  })
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance || !hasData.value) return

  const xData = [...new Set(
      Object.values(populationData.value)
          .flatMap(data => data.map(item => item[selectedXField.value])))
  ].sort()

  const seriesData = []

  valueFields.value.forEach((field, index) => {
    if (!visibleLines.value[field] || !populationData.value[field]) return

    const yData = xData.map(x => {
      const item = populationData.value[field].find(d => d[selectedXField.value] === x)
      return item ? item.population : null
    })

    seriesData.push({
      name: field,
      type: 'line',
      data: yData,
      smooth: props.smooth,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: {
        color: colorPalette.value[index % colorPalette.value.length],
        borderColor: '#03045E',
        borderWidth: 1
      },
      lineStyle: {
        width: 2,
        shadowBlur: 8,
        shadowColor: colorPalette.value[index % colorPalette.value.length]
      },
      emphasis: {
        itemStyle: {
          color: '#FF00FF'
        }
      },
      animationDelay: index * 100
    })
  })

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
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(0, 180, 216, 0.3)'
        }
      }
    },
    legend: {
      show: props.showLegend,
      data: valueFields.value.filter(field => visibleLines.value[field]),
      bottom: props.showDataZoom ? '80px' : '10px',
      textStyle: {
        color: '#CAF0F8',
        fontSize: 12
      },
      type: 'scroll',
      pageIconColor: '#7DF9FF',
      pageTextStyle: {
        color: '#90E0EF'
      }
    },
    grid: {
      left: '10%',
      right: '5%',
      bottom: props.showDataZoom ? '100px' : '50px',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData,
      name: selectedXField.value,
      axisLine: {
        lineStyle: {
          color: '#48CAE4',
          width: 2
        }
      },
      axisLabel: {
        color: '#90E0EF',
        rotate: xData.length > 8 ? 45 : 0,
        fontSize: 11
      },
      axisTick: {
        lineStyle: {
          color: '#48CAE4'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '人口数量(万人)',
      nameTextStyle: {
        color: '#90E0EF',
        fontSize: 12
      },
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
          color: 'rgba(72, 202, 228, 0.2)'
        }
      }
    },
    series: seriesData,
    animationEasing: 'cubicOut',
    animationDuration: 1000,
    dataZoom: props.showDataZoom ? [
      {
        type: 'inside',
        start: 0,
        end: 100,
        zoomLock: true
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        bottom: '40px',
        height: 20,
        handleSize: '100%',
        handleStyle: {
          color: '#7DF9FF',
          borderColor: '#03045E'
        },
        textStyle: {
          color: '#90E0EF'
        },
        fillerColor: 'rgba(72, 202, 228, 0.3)',
        borderColor: 'rgba(72, 202, 228, 0.5)',
        backgroundColor: 'rgba(0, 53, 102, 0.3)'
      }
    ] : []
  }

  chartInstance.setOption(option, true)
}

// 切换折线可见性
const toggleLineVisibility = (field) => {
  visibleLines.value[field] = !visibleLines.value[field]
  updateChart()
}

// 字段变更处理
const handleFieldChange = () => {
  updateChart()
}

// 响应式调整
const handleResize = () => {
  if (chartInstance) chartInstance.resize()

  // 重新初始化粒子以适应新尺寸
  initParticles()
}

// 监听选择的省份变化
watch(selectedProvinces, (newVal) => {
  // 移除不再选择的省份数据

  Object.keys(populationData.value).forEach(province => {
    if (!valueFields.value.includes(province)) {
      delete populationData.value[province]
    }
  })

  // 添加新选择的省份数据
  newVal.forEach(provinceId => {
    const provinceName = provinceMapper.getName(provinceId) || `省份${provinceId}`
    if (!populationData.value[provinceName]) {
      fetchPopulationData(provinceId)
    }
  })

  // 更新可见的折线
  valueFields.value.forEach(field => {
    visibleLines.value[field] = newVal.some(provinceId =>
        provinceMapper.getName(provinceId) === field
    )
  })
})

// 初始化
onMounted(() => {
  fetchProvinces()
  fetchPopulationData(23) // 默认加载湖南数据

  nextTick(() => {
    initChart()
    initParticles()
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
//
//.multi-line-chart-container {
//  width: 100%;
//  position: relative;
//}
.multi-line-chart-container {
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

.legend-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-left: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: rgba(0, 119, 182, 0.3);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(72, 202, 228, 0.3);

  &:hover {
    background: rgba(0, 180, 216, 0.4);
    transform: translateY(-1px);
  }

  &.hidden {
    opacity: 0.4;
    background: rgba(0, 53, 102, 0.3);
  }

  span {
    color: $tech-text;
    font-size: 13px;
    margin-left: 6px;
  }
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: v-bind(height);
  min-height: 200px;
  overflow: hidden; /* 防止内容溢出 */
}

/* 确保图表在粒子上方 */
.chart {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
}

/* 确保粒子画布在图表下方 */
.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* 确保在图表下方 */
  pointer-events: none; /* 不拦截鼠标事件 */
}

.empty-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: rgba($tech-lightblue, 0.7);
  z-index: 3;

  .el-icon-data-line {
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