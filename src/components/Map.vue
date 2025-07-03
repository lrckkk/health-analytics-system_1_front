<template>
  <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
    <div class="controls" style="padding: 10px; text-align: center; flex-shrink: 0;">
      <button @click="setView('scatter')">显示散点</button>
      <button @click="setView('pie')">显示饼图</button>
      <button @click="setView('map_only')">仅显示地图</button>
    </div>

    <div id="china-map-interactive" style="width: 100%; flex-grow: 1; background: transparent; border-radius: 8px;"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';

// 定义 props，接收父组件传入的数据
const props = defineProps({
  provinceData: {
    type: Array,
    default: () => []
  },
  scatterData: {
    type: Array,
    default: () => []
  },
  pieSeriesData: {
    type: Array,
    default: () => []
  }
});

// ECharts 实例的引用
const chartInstance = ref(null);
// 用于存储中国 GeoJSON 数据，避免重复加载
const chinaGeoJson = ref(null);

// 存储从 props 获取的最新数据副本，用于图表渲染
const currentScatterData = ref([]);
const currentPieSeriesData = ref([]);

/**
 * 销毁当前的 ECharts 实例。
 * 在切换图表模式前调用，以释放资源并避免图表叠加。
 */
const destroyChart = () => {
  if (chartInstance.value) {
    chartInstance.value.dispose(); // 销毁实例
    chartInstance.value = null; // 清空引用
  }
};

/**
 * 根据选择的模式初始化并渲染 ECharts 图表。
 * 每个模式（散点图、饼图、仅地图）都会初始化一个独立的 ECharts 实例。
 * @param {string} mode - 要显示的图表模式 ('scatter', 'pie', 'map_only')
 */
const initChart = (mode) => {
  destroyChart(); // 在初始化新图表前先销毁旧图表

  const chartDom = document.getElementById('china-map-interactive');
  if (!chartDom) {
    console.error('ECharts 容器元素未找到！');
    return;
  }

  const myChart = echarts.init(chartDom, null, { renderer: 'canvas' });
  chartInstance.value = myChart; // 保存新实例的引用

  // 注册地图，确保只注册一次，即使切换模式也无需重复注册
  if (!echarts.getMap('china') && chinaGeoJson.value) {
    echarts.registerMap('china', chinaGeoJson.value);
  }

  // 基础的 ECharts 选项，所有模式共享
  let option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        if (params.seriesId === 'scatter') {
          // 确保安全访问 params.value 的 value 属性
          const val = params.value && params.value[2] !== undefined ? params.value[2] : 'N/A';
          return `${params.name}<br/>指标值: ${val}`;
        }
        if (params.seriesId === 'pie') {
          let tooltipHtml = `${params.name}<br/>`;
          // 根据名称找到对应的饼图数据
          const pieDataForTooltip = currentPieSeriesData.value.find(d => d.name === params.name)?.pieData || [];
          pieDataForTooltip.forEach(item => {
            tooltipHtml += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>${item.name}: ${item.value}<br/>`;
          });
          return tooltipHtml;
        }
        // 地图模式下，如果数据项有值，则显示
        if (params.seriesId === 'map' && params.data && params.data.value !== undefined) {
          return `${params.name}<br/>值: ${params.value}`;
        }
        return params.name; // 默认返回名称
      },
      backgroundColor: '#000080',
      borderColor: '#FFF',
      borderWidth: 1,
      borderRadius: 8,
      padding: [10, 15],
      textStyle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    geo: {
      map: 'china', roam: true, zoom: 1.25, center: [105, 36],
      label: { show: false },
      itemStyle: { borderColor: '#79C9FB', borderWidth: 1 },
      emphasis: { itemStyle: { borderColor: '#79C9FB', borderWidth: 2 } }
    },
    series: [] // 系列数据，将根据模式填充
  };

  // 根据不同的模式配置 series 和 visualMap
  if (mode === 'scatter') {
    // 散点图模式：显示 visualMap，作用于地图和散点图
    option.visualMap = {
      show: true, min: 0, max: 200,
      inRange: { color: ['#0080F5', '#143E9F'] },
      text: ['高', '低'], calculable: true, orient: 'vertical',
      right: 10, top: '50%',
      seriesIndex: [0], // visualMap 作用于地图（索引0）和散点图（索引1）
    };
    option.series = [
      { // 0. 地图系列 (作为背景)
        id: 'map', type: 'map', map: 'china', geoIndex: 0,
        data: props.provinceData,
        itemStyle: { areaColor: '#143E9F' },
        emphasis: { itemStyle: { areaColor: '#000080' } }
      },
      { // 1. 散点图系列
        id: 'scatter', name: '热点', type: 'scatter', coordinateSystem: 'geo',
        symbol: 'circle',
        // val[2] 是散点数据的第三个值 (通常是指标值)，用于决定大小
        symbolSize: val => val && val[2] !== undefined ? val[2] / 3 : 10, // 确保安全访问并提供默认值
        itemStyle: { color: 'yellow', borderColor: 'yellow', borderWidth: 1 }, // **散点颜色设置为黄色**
        data: currentScatterData.value
      }
    ];
  } else if (mode === 'pie') {
    // 饼图模式：不显示 visualMap
    option.visualMap = { show: true,
      min: 0, max: 200,
      inRange: { color: ['#0080F5', '#143E9F'] },
      text: ['高', '低'], calculable: true, orient: 'vertical',
      right: 10, top: '50%',
      seriesIndex: [0], // visualMap 作用于地图（索引0）和散点图（索引1）
    };
    option.series = [
      { // 0. 地图系列 (作为背景，保持其固有颜色)
        id: 'map', type: 'map', map: 'china', geoIndex: 0,
        data: props.provinceData,
        itemStyle: {
          areaColor: '#143E9F', // **显式设置地图区域颜色，解决变红问题**
          borderColor: '#79C9FB', borderWidth: 1
        },
        emphasis: { itemStyle: { areaColor: '#000080', borderColor: '#79C9FB', borderWidth: 2 } }
      },
      { // 1. 自定义饼图系列
        id: 'pie', name: '产业分布', type: 'custom', coordinateSystem: 'geo',
        zlevel: 10, // 确保饼图在地图上方
        data: currentPieSeriesData.value, // 直接使用饼图数据
        renderItem: (params, api) => {
          // 获取地理坐标并转换为像素坐标
          const point = api.coord([api.value(0), api.value(1)]);
          if (!point) return null; // 如果无法获取像素坐标，不渲染

          // 从 currentPieSeriesData 中找到当前数据项对应的饼图详细数据
          const pieData = currentPieSeriesData.value[params.dataIndex]?.pieData;
          if (!pieData || pieData.length === 0) return null; // 没有饼图数据则不渲染

          const total = pieData.reduce((sum, item) => sum + item.value, 0);
          let startAngle = -Math.PI / 2;
          const children = [];
          const radius = 10; // 饼图半径

          for (let i = 0; i < pieData.length; i++) {
            const sector = pieData[i];
            const angle = (sector.value / total) * Math.PI * 2;
            children.push({
              type: 'sector',
              shape: { cx: point[0], cy: point[1], r: radius, r0: 0, startAngle: startAngle, endAngle: startAngle + angle },
              style: api.style({ fill: sector.color, stroke: '#fff', lineWidth: 1 })
            });
            startAngle += angle;
          }
          return { type: 'group', children: children };
        },
      }
    ];
  } else if (mode === 'map_only') {
    // 仅显示地图模式：显示 visualMap，仅作用于地图
    option.visualMap = {
      show: true, min: 0, max: 200,
      inRange: { color: ['#0080F5', '#143E9F'] },
      text: ['高', '低'], calculable: true, orient: 'vertical',
      right: 10, top: '50%',
      seriesIndex: [0], // visualMap 仅作用于地图（索引0）
    };
    option.series = [
      { // 0. 地图系列
        id: 'map', type: 'map', map: 'china', geoIndex: 0,
        data: props.provinceData,
        itemStyle: { areaColor: '#143E9F' },
        emphasis: { itemStyle: { areaColor: '#000080' } }
      }
    ];
  }

  myChart.setOption(option);

  // 监听窗口大小变化，自动调整图表尺寸
  window.addEventListener('resize', () => { myChart.resize() });
};

/**
 * 按钮点击事件处理函数，用于切换图表模式。
 * @param {string} mode - 要切换到的模式 ('scatter', 'pie', 'map_only')
 */
const setView = (mode) => {
  initChart(mode); // 调用初始化函数来渲染对应模式的图表
};

// 组件挂载时执行
onMounted(async () => {
  // 首次加载中国 GeoJSON 数据，只需加载一次
  try {
    const response = await fetch('/new-china.geojson');
    chinaGeoJson.value = await response.json();
    echarts.registerMap('china', chinaGeoJson.value); // 注册地图
  } catch (error) {
    console.error('加载中国GeoJSON数据失败:', error);
  }

  // 初始化本地数据副本，确保有数据可用
  currentScatterData.value = props.scatterData;
  currentPieSeriesData.value = props.pieSeriesData;

  // 默认显示散点图模式
  initChart('scatter');
});

// --- 监听 props 变化并更新图表 ---
// 当 scatterData 变化时，如果当前是散点图模式，则重新初始化图表
watch(() => props.scatterData, (newVal) => {
  currentScatterData.value = newVal;
  // 通过检查当前图表的 series 结构来判断是否处于“散点图”模式
  const currentSeries = chartInstance.value?.getOption()?.series;
  if (currentSeries && currentSeries[1]?.id === 'scatter') {
    initChart('scatter');
  }
}, { deep: true }); // deep: true 确保能侦听到数组内部对象的变化

// 当 pieSeriesData 变化时，如果当前是饼图模式，则重新初始化图表
watch(() => props.pieSeriesData, (newVal) => {
  currentPieSeriesData.value = newVal;
  // 通过检查当前图表的 series 结构来判断是否处于“饼图”模式
  const currentSeries = chartInstance.value?.getOption()?.series;
  if (currentSeries && currentSeries[1]?.id === 'pie') {
    initChart('pie');
  }
}, { deep: true }); // deep: true 确保能侦听到数组内部对象的变化

// 当 provinceData 变化时，重新初始化当前图表模式，以更新地图底图
watch(() => props.provinceData, (newVal) => {
  // 不需要更新 currentProvinceData，直接使用 props.provinceData
  if (chartInstance.value) {
    // 尝试获取当前图表的模式，然后用新数据重新初始化
    const option = chartInstance.value.getOption();
    let currentMode = 'map_only'; // 默认值

    // 粗略判断当前模式
    if (option.series[1]?.id === 'scatter' && option.visualMap?.show === true) {
      currentMode = 'scatter';
    } else if (option.series[1]?.id === 'pie' && option.visualMap?.show === false) {
      currentMode = 'pie';
    }
    initChart(currentMode);
  }
}, { deep: true }); // deep: true 确保能侦听到数组内部对象的变化
</script>

<style scoped>
/* 按钮样式保持不变 */
.controls button {
  margin: 0 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 15px;
  font-weight: bold;
  transition: all 0.3s ease;
  background: linear-gradient(145deg, #2a72bb, #1d5a99);
  color: #e0f2f7;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3),
  -5px -5px 10px rgba(255, 255, 255, 0.1);
}

.controls button:hover {
  background: linear-gradient(145deg, #1d5a99, #2a72bb);
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3),
  -2px -2px 5px rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.controls button:active {
  background: linear-gradient(145deg, #1d5a99, #2a72bb);
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.4),
  inset -2px -2px 5px rgba(255, 255, 255, 0.05);
  transform: translateY(1px);
}
</style>