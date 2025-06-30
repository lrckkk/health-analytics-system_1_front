<template>
  <div class="multi-line-chart-container">
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <div class="chart-title">{{ title }}</div>
          <div class="chart-controls">
            <el-select
                v-model="selectedXField"
                placeholder="选择X轴字段"
                @change="updateChart"
            >
              <el-option
                  v-for="field in availableFields"
                  :key="field"
                  :label="field"
                  :value="field"
              />
            </el-select>

            <div class="legend-controls">
              <div
                  v-for="(field, index) in valueFields"
                  :key="field"
                  class="legend-item"
                  :class="{ hidden: !visibleLines[field] }"
                  @click="toggleLineVisibility(field)"
              >
                <div class="legend-color" :style="{ backgroundColor: colorPalette[index % colorPalette.length] }"></div>
                <span>{{ field }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div ref="chartRef" class="chart" :style="{ height: height, width: width }"></div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { ElCard, ElSelect, ElOption } from 'element-plus';

export default {
  name: 'MultiLineChart',
  props: {
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
    width: {
      type: String,
      default: '100%'
    },
    xField: {
      type: String,
      default: ''
    },
    colorPalette: {
      type: Array,
      default: () => [
        '#5470C6', '#91CC75', '#EE6666', '#FAC858', '#73C0DE',
        '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC'
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
  },
  setup(props) {
    const chartRef = ref(null);
    let chartInstance = null;
    const availableFields = ref([]);
    const valueFields = ref([]);
    const selectedXField = ref(props.xField);
    const visibleLines = ref({});

    // 从数据中提取所有可用字段
    const extractAvailableFields = () => {
      if (!props.chartData.length) {
        availableFields.value = [];
        valueFields.value = [];
        return;
      }

      const fields = new Set();
      props.chartData.forEach(item => {
        Object.keys(item).forEach(key => {
          fields.add(key);
        });
      });

      availableFields.value = Array.from(fields);

      // 设置X轴字段
      if (props.xField && availableFields.value.includes(props.xField)) {
        selectedXField.value = props.xField;
      } else if (availableFields.value.length > 0) {
        selectedXField.value = availableFields.value[0];
      }

      // 自动识别数值字段（排除X轴字段）
      valueFields.value = availableFields.value.filter(field =>
          field !== selectedXField.value &&
          typeof props.chartData[0][field] === 'number'
      );

      // 初始化所有折线为可见
      valueFields.value.forEach(field => {
        if (visibleLines.value[field] === undefined) {
          visibleLines.value[field] = true;
        }
      });
    };

    // 切换折线可见性
    const toggleLineVisibility = (field) => {
      visibleLines.value[field] = !visibleLines.value[field];
      updateChart();
    };

    // 初始化图表
    const initChart = () => {
      if (!chartRef.value) return;

      if (chartInstance) {
        chartInstance.dispose();
      }

      chartInstance = echarts.init(chartRef.value);
      updateChart();
    };

    // 更新图表数据
    const updateChart = () => {
      if (!chartInstance || !props.chartData.length || !selectedXField.value) return;

      const xData = [];
      const seriesData = [];

      // 提取X轴数据
      props.chartData.forEach(item => {
        if (item[selectedXField.value] !== undefined) {
          xData.push(item[selectedXField.value]);
        }
      });

      // 提取Y轴数据系列
      valueFields.value.forEach((field, index) => {
        // 只添加可见的折线
        if (!visibleLines.value[field]) return;

        const yData = [];
        props.chartData.forEach(item => {
          if (item[field] !== undefined) {
            yData.push(item[field]);
          }
        });

        seriesData.push({
          name: field,
          type: 'line',
          data: yData,
          smooth: props.smooth,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: props.colorPalette[index % props.colorPalette.length]
          },
          lineStyle: {
            width: 3
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              borderWidth: 2,
              borderColor: '#000'
            }
          },
          animationDelay: index * 100
        });
      });

      const option = {
        title: {
          text: props.title,
          left: 'center',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          show: props.showLegend,
          data: valueFields.value.filter(field => visibleLines.value[field]),
          bottom: 10,
          type: 'scroll',
          pageIconColor: '#2c3e50',
          pageTextStyle: {
            color: '#2c3e50'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: props.showDataZoom ? '15%' : '10%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xData,
          name: selectedXField.value,
          axisLabel: {
            rotate: xData.length > 10 ? 45 : 0
          },
          axisLine: {
            lineStyle: {
              color: '#7f8c8d'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '数值',
          axisLine: {
            lineStyle: {
              color: '#7f8c8d'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        series: seriesData,
        animationEasing: 'elasticOut',
        animationDelayUpdate: function (idx) {
          return idx * 5;
        }
      };

      // 添加数据缩放功能
      if (props.showDataZoom) {
        option.dataZoom = [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            type: 'slider',
            start: 0,
            end: 100,
            bottom: '2%',
            height: 20,
            handleSize: '100%',
            handleStyle: {
              color: '#3498db'
            }
          }
        ];
      }

      chartInstance.setOption(option);
    };

    // 响应式调整图表大小
    const resizeChart = () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    };

    // 监听数据变化
    onMounted(() => {
      extractAvailableFields();
      nextTick(() => {
        initChart();
        window.addEventListener('resize', resizeChart);
      });
    });

    return {
      chartRef,
      availableFields,
      valueFields,
      selectedXField,
      visibleLines,
      extractAvailableFields,
      initChart,
      updateChart,
      toggleLineVisibility
    };
  },
  watch: {
    chartData: {
      handler(newVal) {
        this.extractAvailableFields();
        this.$nextTick(() => {
          this.updateChart();
        });
      },
      deep: true
    },
    xField(newVal) {
      if (newVal && this.availableFields.includes(newVal)) {
        this.selectedXField = newVal;
        this.updateChart();
      }
    }
  }
};
</script>

<style scoped>
.multi-line-chart-container {
  width: 100%;
}

.chart-card {
  margin: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 18px;
}

.chart-controls {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.legend-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-left: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: #f0f7ff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.legend-item:hover {
  background: #e1f0ff;
}

.legend-item.hidden {
  opacity: 0.5;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
}

.chart {
  width: 100%;
}
</style>