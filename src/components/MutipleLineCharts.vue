<template>
  <div class="multi-line-chart-container" :style="{ width: computedWidth }">
    <el-card class="chart-card futuristic-card">
      <!-- 标题和控制区域 -->
      <div class="chart-header">
        <div class="chart-title">{{ title }}</div>
        <div class="chart-controls">
          <div class="control-group">
            <el-select
                v-model="selectedProvinces"
                multiple
                placeholder=" "
                collapse-tags
                collapse-tags-tooltip
                @change="handleProvinceChange"
                class="futuristic-select"
                size="small"
                :teleported="false"
            >
              <template #prefix>
                <span class="select-placeholder">选择省份</span>
              </template>
              <template #tag="{ item }">
                <span style="display: none;"></span>
              </template>
              <el-option
                  v-for="province in allProvinces"
                  :key="province.provinceId"
                  :label="province.provinceName"
                  :value="province.provinceId"
              />
            </el-select>
          </div>
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
            <i class="el-icon-close" @click.stop="removeProvince(field)"></i>
          </div>
        </div>
      </div>

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

const computedWidth = computed(() => {
  return typeof props.width === 'number' ? `${props.width}px` : props.width
})

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
    if (!valueFields.value.includes(provinceName)) {
      valueFields.value.push(provinceName)
    }
    visibleLines.value[provinceName] = true

    updateChart()
  } catch (error) {
    console.error(`获取省份${provinceId}人口数据失败:`, error)
  }
}

// 初始化图表
const initChart = () => {
  nextTick(() => {
    if (!chartRef.value) return

    if (chartInstance) {
      chartInstance.dispose()
    }

    chartInstance = echarts.init(chartRef.value, 'dark')
    initParticles()
    updateChart()
  })
}

// 粒子系统
const initParticles = () => {
  nextTick(() => {
    const canvas = particleCanvas.value
    if (!canvas) return

    const container = canvas.parentElement
    if (!container) return

    const setCanvasSize = () => {
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight
    }

    setCanvasSize()

    particleCtx = canvas.getContext('2d')
    if (!particleCtx) return

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

      particleCtx.fillStyle = 'rgba(3, 4, 94, 0.08)'
      particleCtx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        p.x += Math.cos(p.direction) * p.speed
        p.y += Math.sin(p.direction) * p.speed

        if (p.x < 0 || p.x > canvas.width) p.direction = Math.PI - p.direction
        if (p.y < 0 || p.y > canvas.height) p.direction = -p.direction

        const gradient = particleCtx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, p.size
        )
        gradient.addColorStop(0, `rgba(125, 249, 255, ${p.opacity * 0.7})`)
        gradient.addColorStop(0.7, `rgba(125, 249, 255, ${p.opacity * 0.2})`)
        gradient.addColorStop(1, 'rgba(125, 249, 255, 0)')

        particleCtx.beginPath()
        particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        particleCtx.fillStyle = gradient
        particleCtx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }

    animate()

    const resizeObserver = new ResizeObserver(() => {
      setCanvasSize()
    })
    resizeObserver.observe(container)

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

// 移除省份
const removeProvince = (provinceName) => {
  const provinceId = provinceMapper.getId(provinceName) || parseInt(provinceName.replace('省份', ''))
  const index = selectedProvinces.value.indexOf(provinceId)
  if (index !== -1) {
    selectedProvinces.value.splice(index, 1)
  }
  const fieldIndex = valueFields.value.indexOf(provinceName)
  if (fieldIndex !== -1) {
    valueFields.value.splice(fieldIndex, 1)
  }
  if (visibleLines.value[provinceName] !== undefined) {
    delete visibleLines.value[provinceName]
  }
  updateChart()
}

// 处理省份变化
const handleProvinceChange = () => {
  const currentProvinceNames = selectedProvinces.value.map(id =>
      provinceMapper.getName(id) || `省份${id}`
  )
  Object.keys(populationData.value).forEach(provinceName => {
    if (!currentProvinceNames.includes(provinceName)) {
      delete populationData.value[provinceName]
      const index = valueFields.value.indexOf(provinceName)
      if (index !== -1) {
        valueFields.value.splice(index, 1)
      }
      if (visibleLines.value[provinceName] !== undefined) {
        delete visibleLines.value[provinceName]
      }
    }
  })

  selectedProvinces.value.forEach(provinceId => {
    const provinceName = provinceMapper.getName(provinceId) || `省份${provinceId}`
    if (!populationData.value[provinceName]) {
      fetchPopulationData(provinceId)
    }
  })

  valueFields.value.forEach(field => {
    visibleLines.value[field] = selectedProvinces.value.some(provinceId =>
        provinceMapper.getName(provinceId) === field
    )
  })
  updateChart()
}

// 监听选择的省份变化
watch(selectedProvinces, (newVal) => {
  handleProvinceChange()
}, { deep: true })

// 响应式调整
const handleResize = () => {
  if (chartInstance) chartInstance.resize()
  initParticles()
}

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

.multi-line-chart-container {
  min-width: 300px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: linear-gradient(135deg, $tech-blue 0%, $tech-darkblue 100%);
  box-shadow: 0 2px 12px rgba(0, 119, 182, 0.3);
  border-radius: 4px;
  padding: 1px;
}

.futuristic-card {
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
    background: transparent;
  }

  :deep(.el-card__body) {
    padding: 0 !important;
  }
}

.chart-header {
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  gap: 10px;
  padding: 0 20px;
}

.chart-title {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  color: $tech-cyan;
  font-size: 16px;
  margin: 0;
  font-weight: 500;
  text-shadow: 0 0 8px rgba($tech-cyan, 0.3);
  text-align: center;
  cursor: pointer; /* 添加指针样式 */
  text-decoration: none; /* 移除下划线 */

  &:hover {
    color: #0059ff; /* 悬停时改变颜色 */
    text-shadow: 0 0 10px rgba(255, 0, 255, 0.5); /* 悬停时增强阴影 */
  }
}

.chart-controls {
  display: flex;
  justify-content: center;
  width: 100%;
}

.control-group {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 300px;
}

.futuristic-select {
  width: 100%;

  :deep(.el-select__wrapper) {
    background: rgba(0, 53, 102, 0.5) !important;
    border: 1px solid rgba(72, 202, 228, 0.5) !important;
    box-shadow: 0 0 8px rgba(125, 249, 255, 0.3) !important;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      border-color: #7DF9FF !important;
      box-shadow: 0 0 12px rgba(125, 249, 255, 0.5) !important;
    }
  }

  :deep(.el-select__placeholder) {
    color: #90E0EF !important;
    font-size: 13px;
  }

  :deep(.el-select__prefix) {
    .select-placeholder {
      color: #90E0EF;
      font-size: 13px;
      padding-left: 8px;
    }
  }

  :deep(.el-select__tags) {
    display: none;
  }
}

.legend-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  max-width: 100%;
  padding: 0 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  padding: 4px 20px 4px 10px;
  background: rgba(0, 119, 182, 0.3);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(72, 202, 228, 0.3);
  position: relative;
  font-size: 12px;
  color: rgba($tech-lightblue, 0.9);
  &:hover {
    background: rgba(0, 180, 216, 0.4);
    transform: translateY(-1px);
  }

  &.hidden {
    opacity: 0.4;
    background: rgba(0, 53, 102, 0.3);
  }

  .legend-color {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 6px;

  }

  .el-icon-close {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: #f56c6c;
    opacity: 0.6;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: v-bind(height);
  min-height: 200px;
  flex-grow: 1;
  padding-top: 120px; /* 为标题和控制区域留出足够空间 */
}

.chart {
  position: relative;
  width: 100%;
  height: 100%;
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

/* 响应式调整 */
@media (max-width: 768px) {
  .chart-header {
    top: 5px;
    gap: 5px;
  }



  .legend-item {
    padding: 3px 16px 3px 8px;
    font-size: 11px;
  }

  .chart-wrapper {
    padding-top: 100px;
  }
}

.el-select-dropdown {
  background: #03045E !important;
  border: 1px solid #7DF9FF !important;
  box-shadow: 0 0 15px rgba(125, 249, 255, 0.3) !important;
  border-radius: 6px;

  .el-select-dropdown__list {
    padding: 6px 0;
  }

  .el-select-dropdown__item {
    color: #90E0EF;
    font-size: 13px;
    height: 36px;
    line-height: 36px;
    padding: 0 16px;
    transition: all 0.2s;

    &:not(.selected) {
      background: transparent;

      &:hover {
        background: rgba(125, 249, 255, 0.1) !important;
        color: #7DF9FF;
      }
    }

    &.selected {
      color: #7DF9FF !important;
      background: rgba(125, 249, 255, 0.15) !important;

      &::after {
        content: "";
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 12px;
        height: 12px;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%237DF9FF'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E") no-repeat center;
      }
    }
  }

  .el-checkbox {
    margin-right: 8px;

    .el-checkbox__inner {
      background-color: rgba(144, 224, 239, 0.1);
      border-color: rgba(125, 249, 255, 0.5);

      &:hover {
        border-color: #7DF9FF;
      }

    }
    &.is-checked {
      .el-checkbox__inner {
        background-color: rgba(125, 249, 255, 0.2);
        border-color: #7DF9FF;
      }
      .el-checkbox__label {
        color: #7DF9FF;
      }
    }
  }
}

</style>