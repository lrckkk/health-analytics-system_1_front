<!--<template>-->
<!--  <div class="multi-line-chart-container">-->
<!--    <el-card class="chart-card">-->
<!--      <template #header>-->
<!--        <div class="card-header">-->
<!--          <div class="chart-title">{{ title }}</div>-->
<!--          <div class="chart-controls">-->
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

<!--            <div class="legend-controls">-->
<!--              <div-->
<!--                  v-for="(field, index) in valueFields"-->
<!--                  :key="field"-->
<!--                  class="legend-item"-->
<!--                  :class="{ hidden: !visibleLines[field] }"-->
<!--                  @click="toggleLineVisibility(field)"-->
<!--              >-->
<!--                <div class="legend-color" :style="{ backgroundColor: colorPalette[index % colorPalette.length] }"></div>-->
<!--                <span>{{ field }}</span>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </template>-->

<!--      <div ref="chartRef" class="chart" :style="{ height: height, width: width }"></div>-->
<!--    </el-card>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import { ref, onMounted, watch, nextTick } from 'vue';-->
<!--import * as echarts from 'echarts';-->
<!--import { ElCard, ElSelect, ElOption } from 'element-plus';-->

<!--export default {-->
<!--  name: 'MultiLineChart',-->
<!--  props: {-->
<!--    chartData: {-->
<!--      type: Array,-->
<!--      default: () => [],-->
<!--      required: true-->
<!--    },-->
<!--    title: {-->
<!--      type: String,-->
<!--      default: '多折线统计图'-->
<!--    },-->
<!--    height: {-->
<!--      type: String,-->
<!--      default: '400px'-->
<!--    },-->
<!--    width: {-->
<!--      type: String,-->
<!--      default: '100%'-->
<!--    },-->
<!--    xField: {-->
<!--      type: String,-->
<!--      default: ''-->
<!--    },-->
<!--    colorPalette: {-->
<!--      type: Array,-->
<!--      default: () => [-->
<!--        '#5470C6', '#91CC75', '#EE6666', '#FAC858', '#73C0DE',-->
<!--        '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC'-->
<!--      ]-->
<!--    },-->
<!--    showDataZoom: {-->
<!--      type: Boolean,-->
<!--      default: true-->
<!--    },-->
<!--    showLegend: {-->
<!--      type: Boolean,-->
<!--      default: true-->
<!--    },-->
<!--    smooth: {-->
<!--      type: Boolean,-->
<!--      default: true-->
<!--    }-->
<!--  },-->
<!--  setup(props) {-->
<!--    const chartRef = ref(null);-->
<!--    let chartInstance = null;-->
<!--    const availableFields = ref([]);-->
<!--    const valueFields = ref([]);-->
<!--    const selectedXField = ref(props.xField);-->
<!--    const visibleLines = ref({});-->

<!--    // 从数据中提取所有可用字段-->
<!--    const extractAvailableFields = () => {-->
<!--      if (!props.chartData.length) {-->
<!--        availableFields.value = [];-->
<!--        valueFields.value = [];-->
<!--        return;-->
<!--      }-->

<!--      const fields = new Set();-->
<!--      props.chartData.forEach(item => {-->
<!--        Object.keys(item).forEach(key => {-->
<!--          fields.add(key);-->
<!--        });-->
<!--      });-->

<!--      availableFields.value = Array.from(fields);-->

<!--      // 设置X轴字段-->
<!--      if (props.xField && availableFields.value.includes(props.xField)) {-->
<!--        selectedXField.value = props.xField;-->
<!--      } else if (availableFields.value.length > 0) {-->
<!--        selectedXField.value = availableFields.value[0];-->
<!--      }-->

<!--      // 自动识别数值字段（排除X轴字段）-->
<!--      valueFields.value = availableFields.value.filter(field =>-->
<!--          field !== selectedXField.value &&-->
<!--          typeof props.chartData[0][field] === 'number'-->
<!--      );-->

<!--      // 初始化所有折线为可见-->
<!--      valueFields.value.forEach(field => {-->
<!--        if (visibleLines.value[field] === undefined) {-->
<!--          visibleLines.value[field] = true;-->
<!--        }-->
<!--      });-->
<!--    };-->

<!--    // 切换折线可见性-->
<!--    const toggleLineVisibility = (field) => {-->
<!--      visibleLines.value[field] = !visibleLines.value[field];-->
<!--      updateChart();-->
<!--    };-->

<!--    // 初始化图表-->
<!--    const initChart = () => {-->
<!--      if (!chartRef.value) return;-->

<!--      if (chartInstance) {-->
<!--        chartInstance.dispose();-->
<!--      }-->

<!--      chartInstance = echarts.init(chartRef.value);-->
<!--      updateChart();-->
<!--    };-->

<!--    // 更新图表数据-->
<!--    const updateChart = () => {-->
<!--      if (!chartInstance || !props.chartData.length || !selectedXField.value) return;-->

<!--      const xData = [];-->
<!--      const seriesData = [];-->

<!--      // 提取X轴数据-->
<!--      props.chartData.forEach(item => {-->
<!--        if (item[selectedXField.value] !== undefined) {-->
<!--          xData.push(item[selectedXField.value]);-->
<!--        }-->
<!--      });-->

<!--      // 提取Y轴数据系列-->
<!--      valueFields.value.forEach((field, index) => {-->
<!--        // 只添加可见的折线-->
<!--        if (!visibleLines.value[field]) return;-->

<!--        const yData = [];-->
<!--        props.chartData.forEach(item => {-->
<!--          if (item[field] !== undefined) {-->
<!--            yData.push(item[field]);-->
<!--          }-->
<!--        });-->

<!--        seriesData.push({-->
<!--          name: field,-->
<!--          type: 'line',-->
<!--          data: yData,-->
<!--          smooth: props.smooth,-->
<!--          symbol: 'circle',-->
<!--          symbolSize: 8,-->
<!--          itemStyle: {-->
<!--            color: props.colorPalette[index % props.colorPalette.length]-->
<!--          },-->
<!--          lineStyle: {-->
<!--            width: 3-->
<!--          },-->
<!--          emphasis: {-->
<!--            focus: 'series',-->
<!--            itemStyle: {-->
<!--              borderWidth: 2,-->
<!--              borderColor: '#000'-->
<!--            }-->
<!--          },-->
<!--          animationDelay: index * 100-->
<!--        });-->
<!--      });-->

<!--      const option = {-->
<!--        title: {-->
<!--          text: props.title,-->
<!--          left: 'center',-->
<!--          textStyle: {-->
<!--            fontSize: 18,-->
<!--            fontWeight: 'bold'-->
<!--          }-->
<!--        },-->
<!--        tooltip: {-->
<!--          trigger: 'axis',-->
<!--          axisPointer: {-->
<!--            type: 'cross',-->
<!--            label: {-->
<!--              backgroundColor: '#6a7985'-->
<!--            }-->
<!--          }-->
<!--        },-->
<!--        legend: {-->
<!--          show: props.showLegend,-->
<!--          data: valueFields.value.filter(field => visibleLines.value[field]),-->
<!--          bottom: 10,-->
<!--          type: 'scroll',-->
<!--          pageIconColor: '#2c3e50',-->
<!--          pageTextStyle: {-->
<!--            color: '#2c3e50'-->
<!--          }-->
<!--        },-->
<!--        grid: {-->
<!--          left: '3%',-->
<!--          right: '4%',-->
<!--          bottom: props.showDataZoom ? '15%' : '10%',-->
<!--          top: '15%',-->
<!--          containLabel: true-->
<!--        },-->
<!--        xAxis: {-->
<!--          type: 'category',-->
<!--          boundaryGap: false,-->
<!--          data: xData,-->
<!--          name: selectedXField.value,-->
<!--          axisLabel: {-->
<!--            rotate: xData.length > 10 ? 45 : 0-->
<!--          },-->
<!--          axisLine: {-->
<!--            lineStyle: {-->
<!--              color: '#7f8c8d'-->
<!--            }-->
<!--          }-->
<!--        },-->
<!--        yAxis: {-->
<!--          type: 'value',-->
<!--          name: '数值',-->
<!--          axisLine: {-->
<!--            lineStyle: {-->
<!--              color: '#7f8c8d'-->
<!--            }-->
<!--          },-->
<!--          splitLine: {-->
<!--            lineStyle: {-->
<!--              type: 'dashed'-->
<!--            }-->
<!--          }-->
<!--        },-->
<!--        series: seriesData,-->
<!--        animationEasing: 'elasticOut',-->
<!--        animationDelayUpdate: function (idx) {-->
<!--          return idx * 5;-->
<!--        }-->
<!--      };-->

<!--      // 添加数据缩放功能-->
<!--      if (props.showDataZoom) {-->
<!--        option.dataZoom = [-->
<!--          {-->
<!--            type: 'inside',-->
<!--            start: 0,-->
<!--            end: 100-->
<!--          },-->
<!--          {-->
<!--            type: 'slider',-->
<!--            start: 0,-->
<!--            end: 100,-->
<!--            bottom: '2%',-->
<!--            height: 20,-->
<!--            handleSize: '100%',-->
<!--            handleStyle: {-->
<!--              color: '#3498db'-->
<!--            }-->
<!--          }-->
<!--        ];-->
<!--      }-->

<!--      chartInstance.setOption(option);-->
<!--    };-->

<!--    // 响应式调整图表大小-->
<!--    const resizeChart = () => {-->
<!--      if (chartInstance) {-->
<!--        chartInstance.resize();-->
<!--      }-->
<!--    };-->

<!--    // 监听数据变化-->
<!--    onMounted(() => {-->
<!--      extractAvailableFields();-->
<!--      nextTick(() => {-->
<!--        initChart();-->
<!--        window.addEventListener('resize', resizeChart);-->
<!--      });-->
<!--    });-->

<!--    return {-->
<!--      chartRef,-->
<!--      availableFields,-->
<!--      valueFields,-->
<!--      selectedXField,-->
<!--      visibleLines,-->
<!--      extractAvailableFields,-->
<!--      initChart,-->
<!--      updateChart,-->
<!--      toggleLineVisibility-->
<!--    };-->
<!--  },-->
<!--  watch: {-->
<!--    chartData: {-->
<!--      handler(newVal) {-->
<!--        this.extractAvailableFields();-->
<!--        this.$nextTick(() => {-->
<!--          this.updateChart();-->
<!--        });-->
<!--      },-->
<!--      deep: true-->
<!--    },-->
<!--    xField(newVal) {-->
<!--      if (newVal && this.availableFields.includes(newVal)) {-->
<!--        this.selectedXField = newVal;-->
<!--        this.updateChart();-->
<!--      }-->
<!--    }-->
<!--  }-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.multi-line-chart-container {-->
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

<!--.chart-title {-->
<!--  font-weight: 600;-->
<!--  color: #2c3e50;-->
<!--  font-size: 18px;-->
<!--}-->

<!--.chart-controls {-->
<!--  display: flex;-->
<!--  gap: 15px;-->
<!--  flex-wrap: wrap;-->
<!--  align-items: center;-->
<!--}-->

<!--.legend-controls {-->
<!--  display: flex;-->
<!--  gap: 10px;-->
<!--  flex-wrap: wrap;-->
<!--  margin-left: 10px;-->
<!--}-->

<!--.legend-item {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  padding: 4px 8px;-->
<!--  background: #f0f7ff;-->
<!--  border-radius: 4px;-->
<!--  cursor: pointer;-->
<!--  transition: all 0.3s ease;-->
<!--}-->

<!--.legend-item:hover {-->
<!--  background: #e1f0ff;-->
<!--}-->

<!--.legend-item.hidden {-->
<!--  opacity: 0.5;-->
<!--}-->

<!--.legend-color {-->
<!--  width: 12px;-->
<!--  height: 12px;-->
<!--  border-radius: 50%;-->
<!--  margin-right: 6px;-->
<!--}-->

<!--.chart {-->
<!--  width: 100%;-->
<!--}-->
<!--</style>-->

<!--<template>-->
<!--  <div class="multi-line-chart-container">-->
<!--    <el-card class="chart-card futuristic-card">-->
<!--      <template #header>-->
<!--        <div class="card-header">-->
<!--          <h3 class="futuristic-title">{{ title }}</h3>-->
<!--          <div class="chart-controls">-->
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

<!--            <div class="legend-controls">-->
<!--              <div-->
<!--                  v-for="(field, index) in valueFields"-->
<!--                  :key="field"-->
<!--                  class="legend-item"-->
<!--                  :class="{ hidden: !visibleLines[field] }"-->
<!--                  @click="toggleLineVisibility(field)"-->
<!--              >-->
<!--                <div-->
<!--                    class="legend-color"-->
<!--                    :style="{-->
<!--                    backgroundColor: colorPalette[index % colorPalette.length],-->
<!--                    boxShadow: `0 0 6px ${colorPalette[index % colorPalette.length]}`-->
<!--                  }"-->
<!--                ></div>-->
<!--                <span>{{ field }}</span>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </template>-->

<!--      <div class="chart-wrapper">-->
<!--        <div-->
<!--            ref="chartRef"-->
<!--            class="chart futuristic-chart"-->
<!--            :style="{ height: height }"-->
<!--        ></div>-->
<!--        <canvas ref="particleCanvas" class="particle-canvas"></canvas>-->
<!--        <div v-if="!hasData" class="empty-placeholder">-->
<!--          <i class="el-icon-data-line"></i>-->
<!--          <span>暂无数据</span>-->
<!--        </div>-->
<!--      </div>-->
<!--    </el-card>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->
<!--import { ref, onMounted, watch, nextTick, onUnmounted, computed } from 'vue'-->
<!--import * as echarts from 'echarts'-->
<!--import { ElCard, ElSelect, ElOption } from 'element-plus'-->

<!--const props = defineProps({-->
<!--  chartData: {-->
<!--    type: Array,-->
<!--    default: () => [],-->
<!--    required: true-->
<!--  },-->
<!--  title: {-->
<!--    type: String,-->
<!--    default: '多折线统计图'-->
<!--  },-->
<!--  height: {-->
<!--    type: String,-->
<!--    default: '400px'-->
<!--  },-->
<!--  xField: {-->
<!--    type: String,-->
<!--    default: ''-->
<!--  },-->
<!--  colorPalette: {-->
<!--    type: Array,-->
<!--    default: () => [-->
<!--      '#7DF9FF', '#FF00FF', '#00B4D8', '#48CAE4', '#90E0EF',-->
<!--      '#0096FF', '#5D8AA8', '#0077B6', '#03045E'-->
<!--    ]-->
<!--  },-->
<!--  showDataZoom: {-->
<!--    type: Boolean,-->
<!--    default: true-->
<!--  },-->
<!--  showLegend: {-->
<!--    type: Boolean,-->
<!--    default: true-->
<!--  },-->
<!--  smooth: {-->
<!--    type: Boolean,-->
<!--    default: true-->
<!--  }-->
<!--})-->

<!--const emit = defineEmits(['xFieldChange'])-->

<!--const chartRef = ref(null)-->
<!--const particleCanvas = ref(null)-->
<!--let chartInstance = null-->
<!--let particleCtx = null-->
<!--let animationFrameId = null-->
<!--const availableFields = ref([])-->
<!--const valueFields = ref([])-->
<!--const selectedXField = ref(props.xField)-->
<!--const visibleLines = ref({})-->

<!--// 计算属性-->
<!--const hasData = computed(() => {-->
<!--  return props.chartData && props.chartData.length > 0 && selectedXField.value-->
<!--})-->

<!--// 粒子系统-->
<!--const initParticles = () => {-->
<!--  if (!particleCanvas.value || !hasData.value) return-->

<!--  const canvas = particleCanvas.value-->
<!--  canvas.width = canvas.offsetWidth-->
<!--  canvas.height = canvas.offsetHeight-->

<!--  particleCtx = canvas.getContext('2d')-->

<!--  // 创建粒子-->
<!--  const particles = Array.from({ length: 60 }, () => ({-->
<!--    x: Math.random() * canvas.width,-->
<!--    y: Math.random() * canvas.height,-->
<!--    size: Math.random() * 1.5 + 0.5,-->
<!--    speed: Math.random() * 0.2 + 0.1,-->
<!--    opacity: Math.random() * 0.4 + 0.2,-->
<!--    direction: Math.random() * Math.PI * 2-->
<!--  }))-->

<!--  const animate = () => {-->
<!--    if (!particleCtx || !canvas) return-->

<!--    // 半透明背景用于拖尾效果-->
<!--    particleCtx.fillStyle = 'rgba(3, 4, 94, 0.08)'-->
<!--    particleCtx.fillRect(0, 0, canvas.width, canvas.height)-->

<!--    // 绘制粒子-->
<!--    particles.forEach(p => {-->
<!--      p.x += Math.cos(p.direction) * p.speed-->
<!--      p.y += Math.sin(p.direction) * p.speed-->

<!--      // 边界检查-->
<!--      if (p.x < 0 || p.x > canvas.width) p.direction = Math.PI - p.direction-->
<!--      if (p.y < 0 || p.y > canvas.height) p.direction = -p.direction-->

<!--      const gradient = particleCtx.createRadialGradient(-->
<!--          p.x, p.y, 0,-->
<!--          p.x, p.y, p.size-->
<!--      )-->
<!--      gradient.addColorStop(0, 'rgba(125, 249, 255, 0.8)')-->
<!--      gradient.addColorStop(1, 'rgba(125, 249, 255, 0)')-->

<!--      particleCtx.beginPath()-->
<!--      particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2)-->
<!--      particleCtx.fillStyle = gradient-->
<!--      particleCtx.fill()-->
<!--    })-->

<!--    animationFrameId = requestAnimationFrame(animate)-->
<!--  }-->

<!--  animate()-->
<!--}-->

<!--// 从数据中提取所有可用字段-->
<!--const extractAvailableFields = () => {-->
<!--  if (!props.chartData.length) {-->
<!--    availableFields.value = []-->
<!--    valueFields.value = []-->
<!--    return-->
<!--  }-->

<!--  const fields = new Set()-->
<!--  props.chartData.forEach(item => {-->
<!--    Object.keys(item).forEach(key => {-->
<!--      fields.add(key)-->
<!--    })-->
<!--  })-->

<!--  availableFields.value = Array.from(fields)-->

<!--  // 设置X轴字段-->
<!--  if (props.xField && availableFields.value.includes(props.xField)) {-->
<!--    selectedXField.value = props.xField-->
<!--  } else if (availableFields.value.length > 0) {-->
<!--    selectedXField.value = availableFields.value[0]-->
<!--  }-->

<!--  // 自动识别数值字段（排除X轴字段）-->
<!--  valueFields.value = availableFields.value.filter(field =>-->
<!--      field !== selectedXField.value &&-->
<!--      typeof props.chartData[0][field] === 'number'-->
<!--  )-->

<!--  // 初始化所有折线为可见-->
<!--  valueFields.value.forEach(field => {-->
<!--    if (visibleLines.value[field] === undefined) {-->
<!--      visibleLines.value[field] = true-->
<!--    }-->
<!--  })-->
<!--}-->

<!--// 切换折线可见性-->
<!--const toggleLineVisibility = (field) => {-->
<!--  visibleLines.value[field] = !visibleLines.value[field]-->
<!--  updateChart()-->
<!--}-->

<!--// 字段变更处理-->
<!--const handleFieldChange = () => {-->
<!--  emit('xFieldChange', selectedXField.value)-->
<!--  updateChart()-->
<!--}-->

<!--// 初始化图表-->
<!--const initChart = () => {-->
<!--  if (!chartRef.value) return-->

<!--  if (chartInstance) {-->
<!--    chartInstance.dispose()-->
<!--  }-->

<!--  chartInstance = echarts.init(chartRef.value, 'dark')-->
<!--  updateChart()-->
<!--  initParticles()-->
<!--}-->

<!--// 更新图表数据-->
<!--const updateChart = () => {-->
<!--  if (!chartInstance || !props.chartData.length || !selectedXField.value) return-->

<!--  const xData = []-->
<!--  const seriesData = []-->

<!--  // 提取X轴数据-->
<!--  props.chartData.forEach(item => {-->
<!--    if (item[selectedXField.value] !== undefined) {-->
<!--      xData.push(item[selectedXField.value])-->
<!--    }-->
<!--  })-->

<!--  // 提取Y轴数据系列-->
<!--  valueFields.value.forEach((field, index) => {-->
<!--    // 只添加可见的折线-->
<!--    if (!visibleLines.value[field]) return-->

<!--    const yData = []-->
<!--    props.chartData.forEach(item => {-->
<!--      if (item[field] !== undefined) {-->
<!--        yData.push(item[field])-->
<!--      }-->
<!--    })-->

<!--    seriesData.push({-->
<!--      name: field,-->
<!--      type: 'line',-->
<!--      data: yData,-->
<!--      smooth: props.smooth,-->
<!--      symbol: 'circle',-->
<!--      symbolSize: 6,-->
<!--      itemStyle: {-->
<!--        color: props.colorPalette[index % props.colorPalette.length],-->
<!--        borderColor: '#03045E',-->
<!--        borderWidth: 1-->
<!--      },-->
<!--      lineStyle: {-->
<!--        width: 2,-->
<!--        shadowBlur: 8,-->
<!--        shadowColor: props.colorPalette[index % props.colorPalette.length]-->
<!--      },-->
<!--      emphasis: {-->
<!--        itemStyle: {-->
<!--          color: '#FF00FF'-->
<!--        }-->
<!--      },-->
<!--      animationDelay: index * 100-->
<!--    })-->
<!--  })-->

<!--  const option = {-->
<!--    backgroundColor: 'transparent',-->
<!--    title: {-->
<!--      text: props.title,-->
<!--      left: 'center',-->
<!--      textStyle: {-->
<!--        color: '#7DF9FF',-->
<!--        fontSize: 16,-->
<!--        fontWeight: 'bold'-->
<!--      }-->
<!--    },-->
<!--    tooltip: {-->
<!--      trigger: 'axis',-->
<!--      backgroundColor: 'rgba(0, 20, 40, 0.9)',-->
<!--      borderColor: '#00B4D8',-->
<!--      borderWidth: 1,-->
<!--      textStyle: {-->
<!--        color: '#FFFFFF',-->
<!--        fontSize: 12-->
<!--      },-->
<!--      axisPointer: {-->
<!--        type: 'shadow',-->
<!--        shadowStyle: {-->
<!--          color: 'rgba(0, 180, 216, 0.3)'-->
<!--        }-->
<!--      }-->
<!--    },-->
<!--    legend: {-->
<!--      show: props.showLegend,-->
<!--      data: valueFields.value.filter(field => visibleLines.value[field]),-->
<!--      bottom: props.showDataZoom ? '80px' : '10px', // 调整图例位置-->
<!--      textStyle: {-->
<!--        color: '#CAF0F8',-->
<!--        fontSize: 12-->
<!--      },-->
<!--      type: 'scroll',-->
<!--      pageIconColor: '#7DF9FF',-->
<!--      pageTextStyle: {-->
<!--        color: '#90E0EF'-->
<!--      }-->
<!--    },-->
<!--    grid: {-->
<!--      left: '10%',-->
<!--      right: '5%',-->
<!--      bottom: props.showDataZoom ? '100px' : '50px', // 调整网格底部间距-->
<!--      top: '20%',-->
<!--      containLabel: true-->
<!--    },-->
<!--    xAxis: {-->
<!--      type: 'category',-->
<!--      boundaryGap: false,-->
<!--      data: xData,-->
<!--      name: selectedXField.value,-->
<!--      axisLine: {-->
<!--        lineStyle: {-->
<!--          color: '#48CAE4',-->
<!--          width: 2-->
<!--        }-->
<!--      },-->
<!--      axisLabel: {-->
<!--        color: '#90E0EF',-->
<!--        rotate: xData.length > 8 ? 45 : 0,-->
<!--        fontSize: 11-->
<!--      },-->
<!--      axisTick: {-->
<!--        lineStyle: {-->
<!--          color: '#48CAE4'-->
<!--        }-->
<!--      }-->
<!--    },-->
<!--    yAxis: {-->
<!--      type: 'value',-->
<!--      name: '数值',-->
<!--      axisLine: {-->
<!--        lineStyle: {-->
<!--          color: '#48CAE4',-->
<!--          width: 2-->
<!--        }-->
<!--      },-->
<!--      axisLabel: {-->
<!--        color: '#90E0EF',-->
<!--        fontSize: 11-->
<!--      },-->
<!--      splitLine: {-->
<!--        lineStyle: {-->
<!--          color: 'rgba(72, 202, 228, 0.2)'-->
<!--        }-->
<!--      }-->
<!--    },-->
<!--    series: seriesData,-->
<!--    animationEasing: 'cubicOut',-->
<!--    animationDuration: 1000,-->
<!--    // 调整数据缩放位置-->
<!--    dataZoom: props.showDataZoom ? [-->
<!--      {-->
<!--        type: 'inside',-->
<!--        start: 0,-->
<!--        end: 100,-->
<!--        zoomLock: true // 禁止缩放-->
<!--      },-->
<!--      {-->
<!--        type: 'slider',-->
<!--        start: 0,-->
<!--        end: 100,-->
<!--        bottom: '40px', // 将缩放条放在更下方-->
<!--        height: 20,-->
<!--        handleSize: '100%',-->
<!--        handleStyle: {-->
<!--          color: '#7DF9FF',-->
<!--          borderColor: '#03045E'-->
<!--        },-->
<!--        textStyle: {-->
<!--          color: '#90E0EF'-->
<!--        },-->
<!--        fillerColor: 'rgba(72, 202, 228, 0.3)',-->
<!--        borderColor: 'rgba(72, 202, 228, 0.5)',-->
<!--        backgroundColor: 'rgba(0, 53, 102, 0.3)'-->
<!--      }-->
<!--    ] : []-->
<!--  }-->

<!--  // 添加数据缩放功能-->
<!--  if (props.showDataZoom) {-->
<!--    option.dataZoom = [-->
<!--      {-->
<!--        type: 'inside',-->
<!--        start: 0,-->
<!--        end: 100-->
<!--      },-->
<!--      {-->
<!--        type: 'slider',-->
<!--        start: 0,-->
<!--        end: 100,-->
<!--        bottom: '2%',-->
<!--        height: 20,-->
<!--        handleSize: '100%',-->
<!--        handleStyle: {-->
<!--          color: '#7DF9FF'-->
<!--        },-->
<!--        textStyle: {-->
<!--          color: '#90E0EF'-->
<!--        }-->
<!--      }-->
<!--    ]-->
<!--  }-->

<!--  chartInstance.setOption(option, true)-->
<!--}-->

<!--// 响应式调整-->
<!--const handleResize = () => {-->
<!--  if (chartInstance) chartInstance.resize()-->
<!--  if (particleCanvas.value) {-->
<!--    particleCanvas.value.width = particleCanvas.value.offsetWidth-->
<!--    particleCanvas.value.height = particleCanvas.value.offsetHeight-->
<!--  }-->
<!--}-->

<!--// 初始化-->
<!--onMounted(() => {-->
<!--  extractAvailableFields()-->
<!--  nextTick(() => {-->
<!--    initChart()-->
<!--    window.addEventListener('resize', handleResize)-->
<!--  })-->
<!--})-->

<!--// 清理-->
<!--onUnmounted(() => {-->
<!--  if (chartInstance) chartInstance.dispose()-->
<!--  if (animationFrameId) cancelAnimationFrame(animationFrameId)-->
<!--  window.removeEventListener('resize', handleResize)-->
<!--})-->
<!--</script>-->

<!--<style scoped lang="scss">-->
<!--$tech-blue: #03045E;-->
<!--$tech-cyan: #7DF9FF;-->
<!--$tech-lightblue: #90E0EF;-->
<!--$tech-darkblue: #023E8A;-->
<!--$tech-text: #CAF0F8;-->
<!--.multi-line-chart-container {-->
<!--  width: 100%;-->
<!--  position: relative;-->
<!--}-->
<!--.futuristic-card {-->
<!--  margin: 0;-->
<!--  border: none;-->
<!--  background: linear-gradient(135deg, $tech-blue 0%, $tech-darkblue 100%);-->
<!--  box-shadow: 0 2px 12px rgba(0, 119, 182, 0.3);-->

<!--  :deep(.el-card__header) {-->
<!--    padding: 12px 20px;-->
<!--    border-bottom: 1px solid rgba(72, 202, 228, 0.2);-->
<!--    background: rgba(0, 53, 102, 0.3);-->
<!--  }-->
<!--}-->

<!--.futuristic-title {-->
<!--  color: $tech-cyan;-->
<!--  font-size: 18px;-->
<!--  margin: 0 0 10px 0;-->
<!--  font-weight: 500;-->
<!--}-->

<!--.chart-controls {-->
<!--  display: flex;-->
<!--  gap: 15px;-->
<!--  flex-wrap: wrap;-->
<!--  align-items: center;-->
<!--}-->
<!--.control-group {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  gap: 8px;-->

<!--  .control-label {-->
<!--    color: $tech-cyan; /* 霓虹蓝文字 */-->
<!--    font-size: 15px;-->
<!--    width: 100%;-->
<!--    text-shadow: 0 0 4px rgba($tech-cyan, 0.3);-->
<!--    letter-spacing: 0.5px;-->
<!--  }-->
<!--}-->
<!--/* 调整图例容器的下边距 */-->
<!--.legend-controls {-->
<!--  display: flex;-->
<!--  gap: 12px;-->
<!--  flex-wrap: wrap;-->
<!--  margin-bottom: 10px; /* 增加下边距 */-->
<!--}-->

<!--/* 图例项文字样式 */-->
<!--.legend-item {-->
<!--  span {-->
<!--    color: $tech-text; /* 浅蓝色文字 */-->
<!--    font-size: 12px;-->
<!--    letter-spacing: 0.5px;-->
<!--    transition: all 0.3s;-->
<!--  }-->

<!--  &:hover span {-->
<!--    color: $tech-cyan; /* 悬浮时变为霓虹蓝 */-->
<!--    text-shadow: 0 0 6px rgba($tech-cyan, 0.5);-->
<!--  }-->

<!--  &.hidden span {-->
<!--    color: rgba($tech-text, 0.5); /* 隐藏状态半透明 */-->
<!--  }-->
<!--}-->


<!--.legend-color {-->
<!--  width: 12px;-->
<!--  height: 12px;-->
<!--  border-radius: 50%;-->
<!--  margin-right: 8px;-->
<!--}-->

<!--.chart-wrapper {-->
<!--  position: relative;-->
<!--  width: 100%;-->
<!--  height: v-bind(height);-->
<!--  min-height: 200px;-->
<!--}-->

<!--.chart {-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--  position: relative;-->
<!--  z-index: 2;-->
<!--}-->

<!--.particle-canvas {-->
<!--  position: absolute;-->
<!--  top: 0;-->
<!--  left: 0;-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--  z-index: 1;-->
<!--  pointer-events: none;-->
<!--}-->

<!--.empty-placeholder {-->
<!--  position: absolute;-->
<!--  top: 0;-->
<!--  left: 0;-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--  z-index: 3;-->
<!--  color: rgba(144, 224, 239, 0.7);-->
<!--  font-size: 13px;-->

<!--  .el-icon-data-line {-->
<!--    font-size: 32px;-->
<!--    margin-bottom: 8px;-->
<!--    color: rgba(125, 249, 255, 0.4);-->
<!--  }-->
<!--}-->
<!--/* 选择器文字样式 */-->
<!--.futuristic-select {-->
<!--  width: 100%;-->
<!--  :deep(.el-input__inner) {-->
<!--    color: $tech-text !important; /* 浅蓝色文字 */-->
<!--    &::placeholder {-->
<!--      color: rgba($tech-lightblue, 0.7) !important; /* 半透明提示文字 */-->
<!--    }-->
<!--  }-->

<!--  :deep(.el-select__caret) {-->
<!--    color: $tech-cyan !important; /* 霓虹蓝箭头 */-->
<!--  }-->
<!--}-->

<!--/* 下拉菜单文字样式 */-->
<!--:deep(.el-select-dropdown) {-->
<!--  background: $tech-darkblue !important;-->
<!--  border: 1px solid $tech-cyan !important;-->
<!--  box-shadow: 0 0 15px rgba($tech-cyan, 0.3) !important;-->

<!--  .el-select-dropdown__item {-->
<!--    color: $tech-text;-->

<!--    &:hover, &.hover {-->
<!--      background: rgba($tech-cyan, 0.2) !important;-->
<!--      color: $tech-cyan;-->
<!--    }-->

<!--    &.selected {-->
<!--      color: $tech-cyan;-->
<!--      font-weight: bold;-->
<!--      background: rgba($tech-cyan, 0.1) !important;-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</style>-->

<template>

  <div class="multi-line-chart-container">
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
        <div
            ref="chartRef"
            class="chart futuristic-chart"
            :style="{ height: height }"
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
import { ref, onMounted, watch, nextTick, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { ElCard, ElSelect, ElOption } from 'element-plus'

const props = defineProps({
  chartData: {
    type: Array,
    default: () => [],
    required: true
  },
  title: {
    type: String,
    default: '多折线统计图'
  },
  height: {
    type: String,
    default: '400px'
  },
  xField: {
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

const emit = defineEmits(['xFieldChange'])

const chartRef = ref(null)
const particleCanvas = ref(null)
let chartInstance = null
let particleCtx = null
let animationFrameId = null
const availableFields = ref([])
const valueFields = ref([])
const selectedXField = ref(props.xField)
const visibleLines = ref({})

// 计算属性
const hasData = computed(() => {
  return props.chartData && props.chartData.length > 0 && selectedXField.value
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

// 从数据中提取所有可用字段
const extractAvailableFields = () => {
  if (!props.chartData.length) {
    availableFields.value = []
    valueFields.value = []
    return
  }

  const fields = new Set()
  props.chartData.forEach(item => {
    Object.keys(item).forEach(key => {
      fields.add(key)
    })
  })

  availableFields.value = Array.from(fields)

  // 设置X轴字段
  if (props.xField && availableFields.value.includes(props.xField)) {
    selectedXField.value = props.xField
  } else if (availableFields.value.length > 0) {
    selectedXField.value = availableFields.value[0]
  }

  // 自动识别数值字段（排除X轴字段）
  valueFields.value = availableFields.value.filter(field =>
      field !== selectedXField.value &&
      typeof props.chartData[0][field] === 'number'
  )

  // 初始化所有折线为可见
  valueFields.value.forEach(field => {
    if (visibleLines.value[field] === undefined) {
      visibleLines.value[field] = true
    }
  })
}

// 切换折线可见性
const toggleLineVisibility = (field) => {
  visibleLines.value[field] = !visibleLines.value[field]
  updateChart()
}

// 字段变更处理
const handleFieldChange = () => {
  emit('xFieldChange', selectedXField.value)
  updateChart()
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
  if (!chartInstance || !props.chartData.length || !selectedXField.value) return

  const xData = []
  const seriesData = []

  // 提取X轴数据
  props.chartData.forEach(item => {
    if (item[selectedXField.value] !== undefined) {
      xData.push(item[selectedXField.value])
    }
  })

  // 提取Y轴数据系列
  valueFields.value.forEach((field, index) => {
    // 只添加可见的折线
    if (!visibleLines.value[field]) return

    const yData = []
    props.chartData.forEach(item => {
      if (item[field] !== undefined) {
        yData.push(item[field])
      }
    })

    seriesData.push({
      name: field,
      type: 'line',
      data: yData,
      smooth: props.smooth,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: {
        color: props.colorPalette[index % props.colorPalette.length],
        borderColor: '#03045E',
        borderWidth: 1
      },
      lineStyle: {
        width: 2,
        shadowBlur: 8,
        shadowColor: props.colorPalette[index % props.colorPalette.length]
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
      name: '数值',
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

// 响应式调整
const handleResize = () => {
  if (chartInstance) chartInstance.resize()
  if (particleCanvas.value) {
    particleCanvas.value.width = particleCanvas.value.offsetWidth
    particleCanvas.value.height = particleCanvas.value.offsetHeight
  }
}

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

.multi-line-chart-container {
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