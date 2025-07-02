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
import { onMounted, ref, watch } from 'vue'; // 引入 watch
import * as echarts from 'echarts';

// 定义 props
const props = defineProps({
  provinceData: {
    type: Array,
    default: () => []
  },
  scatterData: { // 将 scatterDataOriginal 改名为 scatterData 以符合 prop 命名习惯
    type: Array,
    default: () => []
  },
  pieSeriesData: { // 饼图数据也从父组件传入
    type: Array,
    default: () => []
  }
});

// 定义一个 ref 来持有 ECharts 实例，方便在不同函数中访问
const chartInstance = ref(null);

// 原始数据现在从 props 获取，并在本地存储一份可变副本（如果需要）
let currentScatterData = ref([]); // 使用 ref 包装，以便 watch 侦听
let currentPieSeriesData = ref([]); // 使用 ref 包装，以便 watch 侦听

// 视图切换函数
const setView = (mode) => {
  if (!chartInstance.value) return;

  let optionUpdate = {
    series: [
      {
        id: 'scatter',
        // 根据模式决定是否显示数据
        data: mode === 'scatter' ? currentScatterData.value : []
      },
      {
        id: 'pie',
        // 根据模式决定是否显示数据
        data: mode === 'pie' ? currentPieSeriesData.value : []
      }
    ]
  };

  // 使用 setOption 更新图表
  chartInstance.value.setOption(optionUpdate);
};

onMounted(async () => {
  // 确保 props 数据在初始化时可用
  currentScatterData.value = props.scatterData;
  currentPieSeriesData.value = props.pieSeriesData;

  const response = await fetch('/new-china.geojson');
  const chinaGeoJson = await response.json();

  const chartDom = document.getElementById('china-map-interactive');
  const myChart = echarts.init(chartDom, null, { renderer: 'canvas' });
  chartInstance.value = myChart; // 保存实例

  echarts.registerMap('china', chinaGeoJson);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        if (params.seriesId === 'scatter') {
          return `${params.name}<br/>指标值: ${params.value[2]}`;
        }
        if (params.seriesId === 'pie') {
          let tooltipHtml = `${params.name}<br/>`;
          // 注意这里需要从 params.data 获取原始数据，因为 pieSeriesDataOriginal 已经被 currentPieSeriesData.value 替代
          const pieData = currentPieSeriesData.value[params.dataIndex].pieData;
          pieData.forEach(item => {
            tooltipHtml += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>${item.name}: ${item.value}<br/>`;
          });
          return tooltipHtml;
        }
        return params.name;
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
    visualMap: {
      show: true, min: 0, max: 200,
      inRange: { color: ['#0080F5', '#143E9F'] },
      text: ['高', '低'], calculable: true, orient: 'vertical',
      right: 10, top: '50%', seriesIndex: [0],
    },
    geo: {
      map: 'china', roam: true, zoom: 1.25, center: [105, 36],
      label: { show: false },
      itemStyle: { borderColor: '#79C9FB', borderWidth: 1 },
      emphasis: { itemStyle: { borderColor: '#79C9FB', borderWidth: 2 } }
    },
    series: [
      // 0. 地图系列
      {
        id: 'map', // 添加id
        type: 'map', map: 'china', geoIndex: 0,
        data: props.provinceData, // 使用 props.provinceData
        itemStyle: { areaColor: '#143E9F' },
        emphasis: { itemStyle: { areaColor: '#000080' } }
      },
      // 1. 散点图系列
      {
        id: 'scatter', // 添加id，用于精确控制
        name: '热点', type: 'scatter', coordinateSystem: 'geo',
        symbol: 'circle', symbolSize: val => val[2] / 3,
        itemStyle: { color: '#ff4', borderColor: '#ff4', borderWidth: 1 },
        data: currentScatterData.value // 默认显示散点图，使用 currentScatterData
      },
      // 2. 自定义饼图系列
      {
        id: 'pie', // 添加id，用于精确控制
        name: '产业分布', type: 'custom', coordinateSystem: 'geo',
        zlevel: 10,
        data: [], // 默认不显示饼图数据
        renderItem: (params, api) => {
          const point = api.coord([api.value(0), api.value(1)]);
          if (!point) return;
          // 从 currentPieSeriesData.value 获取饼图数据
          const pieData = currentPieSeriesData.value[params.dataIndex].pieData;
          const total = pieData.reduce((sum, item) => sum + item.value, 0);
          let startAngle = -Math.PI / 2;
          const children = [];
          const radius = 10;
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
    ]
  };

  myChart.setOption(option);

  myChart.on('click', function(params) {
    if (params.componentType === 'series' && params.seriesType === 'map') {
      const regionName = params.name;
      // emit('region-clicked', regionName) // 如果需要，可以取消此行注释
      console.log('Clicked on:', regionName);
    }
  });

  window.addEventListener('resize', () => { myChart.resize() });
});

// 侦听 props 变化，更新内部数据和图表
watch(() => props.scatterData, (newVal) => {
  currentScatterData.value = newVal;
  if (chartInstance.value) {
    chartInstance.value.setOption({
      series: [{ id: 'scatter', data: newVal }]
    });
  }
});

watch(() => props.pieSeriesData, (newVal) => {
  currentPieSeriesData.value = newVal;
  // 注意：饼图的渲染逻辑在 renderItem 中，它会直接使用 currentPieSeriesData.value
  // 所以这里不需要像散点图那样显式地更新 series.data，
  // 但如果饼图需要从“不显示”到“显示”，你可能需要在 setView 中处理
  // 或者在侦听器中强制刷新图表（例如，重新调用 setOption(option)）
  // 这里为了简单，假设 setView 会根据模式正确显示或隐藏
  if (chartInstance.value) {
    // 强制刷新，确保 renderItem 重新执行，捕获新的 pieSeriesData
    chartInstance.value.setOption({
      series: [{ id: 'pie', data: newVal.length > 0 ? newVal : [] }] // 确保饼图数据更新
    });
  }
});

watch(() => props.provinceData, (newVal) => {
  if (chartInstance.value) {
    chartInstance.value.setOption({
      series: [{ id: 'map', data: newVal }]
    });
  }
});

</script>

<style scoped>
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