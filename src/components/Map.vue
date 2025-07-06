<template>
  <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">


    <div id="china-map-interactive" style="width: 100%; flex-grow: 1; background: transparent; border-radius: 8px;"></div>
    <div class="controls" style="padding: 10px; text-align: center; flex-shrink: 0;">
      <el-button @click="setView('scatter')" class="tech-button" link>
        <el-icon><TrendCharts /></el-icon> <span>显示散点</span>
      </el-button>
      <el-button @click="setView('pie')" class="tech-button" link>
        <el-icon><PieChart /></el-icon>
        <span>显示饼图</span>
      </el-button>
      <el-button @click="setView('map_only')" class="tech-button" link>
        <el-icon><Location /></el-icon> <span>仅显示地图</span>
      </el-button>
    </div>


  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
const emit = defineEmits(['region-clicked']);

// 导入 Element Plus 组件
import { ElButton, ElIcon } from 'element-plus';
// 导入 Element Plus 图标 (确保你已安装 @element-plus/icons-vue)
import { TrendCharts, PieChart, Location } from '@element-plus/icons-vue';

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

// 存储当前显示的模式，用于 watch 逻辑判断
const currentViewMode = ref('scatter'); // 默认模式

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
  currentViewMode.value = mode; // 更新当前模式

  myChart.on('click', function(params) {
    if (params.componentType === 'series' && params.seriesType === 'map') {
      const regionName = params.name;
      // 这是最关键的部分：派发事件！
      // 通过 emit 函数将 'region-clicked' 事件和地块名称 regionName 传递给父组件
      emit('region-clicked', regionName);
    }
  })

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
          // 从 props 中获取饼图数据
          const pieDataForTooltip = props.pieSeriesData.find(d => d.name === params.name)?.pieData || [];
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
      show: true, min: 0, max: 200, // visualMap 的 min/max 仍可用于颜色映射
      inRange: { color: ['#0080F5', '#143E9F'] },
      text: ['高', '低'], calculable: true, orient: 'vertical',
      right: 10, top: '50%',
      seriesIndex: [0], // visualMap 作用于地图（索引0）
    };
    option.series = [
      { // 0. 地图系列 (作为背景)
        id: 'map', type: 'map', map: 'china', geoIndex: 0,
        data: props.provinceData, // 从 props 获取数据
        itemStyle: { areaColor: '#143E9F' },
        emphasis: { itemStyle: { areaColor: '#000080' } }
      },
      { // 1. 散点图系列
        id: 'scatter', name: '热点', type: 'scatter', coordinateSystem: 'geo',
        symbol: 'circle',
        // val[2] 是散点数据的第三个值 (通常是指标值)，用于决定大小
        symbolSize: val => {
          const dataVal = val && val[2] !== undefined ? val[2] : 0;
          // 尝试从 props.scatterData[5].value[2] 获取除数，如果不存在或无效则默认为 1
          const divisor = props.scatterData[23].value[2]

          // 执行除法，并确保结果不会过小，给一个最小尺寸
          // 增加乘数因子 1.5，并提高最小尺寸到 8 像素
          return Math.max((dataVal / divisor) * 8+6, 8);
        },
        itemStyle: { color: 'yellow', borderColor: 'yellow', borderWidth: 1 }, // **散点颜色设置为黄色**
        data: props.scatterData // 从 props 获取数据
      }
    ];
  } else if (mode === 'pie') {
    // 饼图模式：显示 visualMap (根据之前的要求，这里也显示 visualMap)
    option.visualMap = { show: true,
      min: 0, max: 200,
      inRange: { color: ['#0080F5', '#143E9F'] },
      text: ['高', '低'], calculable: true, orient: 'vertical',
      right: 10, top: '50%',
      seriesIndex: [0], // visualMap 作用于地图
    };
    option.series = [
      { // 0. 地图系列 (作为背景，保持其固有颜色)
        id: 'map', type: 'map', map: 'china', geoIndex: 0,
        data: props.provinceData, // 从 props 获取数据
        itemStyle: {
          areaColor: '#143E9F', // **显式设置地图区域颜色，解决变红问题**
          borderColor: '#79C9FB', borderWidth: 1
        },
        emphasis: { itemStyle: { areaColor: '#000080', borderColor: '#79C9FB', borderWidth: 2 } }
      },
      { // 1. 自定义饼图系列
        id: 'pie', name: '产业分布', type: 'custom', coordinateSystem: 'geo',
        zlevel: 10, // 确保饼图在地图上方
        data: props.pieSeriesData, // 从 props 获取数据
        renderItem: (params, api) => {
          // 获取地理坐标并转换为像素坐标
          const point = api.coord([api.value(0), api.value(1)]);
          if (!point) return null; // 如果无法获取像素坐标，不渲染

          // 从 props 的 pieSeriesData 中找到当前数据项对应的饼图详细数据
          const pieData = props.pieSeriesData[params.dataIndex]?.pieData;
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
        data: props.provinceData, // 从 props 获取数据
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

  // 默认显示散点图模式
  initChart('scatter');
});

// --- 监听 props 变化并更新图表 ---
// 当 scatterData 变化时，如果当前是散点图模式，则更新散点图数据
watch(() => props.scatterData, (newVal) => {
  if (chartInstance.value && currentViewMode.value === 'scatter') {
    chartInstance.value.setOption({
      series: [{
        id: 'scatter', // 确保ID匹配
        data: newVal
        // symbolSize 函数会因为 props.scatterData 的变化而自动更新
      }]
    });
  }
}, { deep: true }); // deep: true 确保能侦听到数组内部对象的变化

// 当 pieSeriesData 变化时，如果当前是饼图模式，则更新饼图数据
watch(() => props.pieSeriesData, (newVal) => {
  if (chartInstance.value && currentViewMode.value === 'pie') {
    chartInstance.value.setOption({
      series: [{
        id: 'pie', // 确保ID匹配
        data: newVal
      }]
    });
  }
}, { deep: true }); // deep: true 确保能侦听到数组内部对象的变化

// 当 provinceData 变化时，更新地图底图的数据
watch(() => props.provinceData, (newVal) => {
  if (chartInstance.value) {
    // 仅更新地图系列的数据，而不是重新初始化整个图表
    chartInstance.value.setOption({
      series: [{
        id: 'map', // 确保ID匹配地图系列
        data: newVal
      }]
    });
  }
}, { deep: true }); // deep: true 确保能侦听到数组内部对象的变化
</script>

<style scoped>
/* 定义动画 */
@keyframes tech-glow {
  0%, 100% {
    box-shadow: 0 0 5px #00aaff, 0 0 10px #00aaff, inset 0 0 3px #00aaff;
    filter: drop-shadow(0 0 3px #00aaff);
  }
  50% {
    box-shadow: 0 0 10px #00d5ff, 0 0 20px #00d5ff, inset 0 0 5px #00d5ff;
    filter: drop-shadow(0 0 5px #00d5ff);
  }
}

@keyframes scan-line {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 按钮容器 */
.controls {
  display: flex; /* 使用 Flexbox 布局按钮 */
  justify-content: center; /* 按钮水平居中 */
  gap: 30px; /* 按钮之间的间距 */
  margin-bottom: 15px; /* 按钮与地图之间的间距 */
  padding: 10px 0;
}

/* * 科技感按钮核心样式
 * 我们将完全重写 Element Plus 的 link 按钮样式
 */
.controls .el-button.tech-button {
  /* 基础设定 */
  background: transparent;
  border: 1px solid #083c72;
  color: #79c9fb;
  padding: 0; /* 清除内边距，由内部元素控制 */
  min-width: 140px; /* 增加最小宽度 */
  height: 50px; /* 固定按钮高度 */
  font-size: 16px;
  font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
  font-weight: 600;
  text-transform: uppercase; /* 文字大写 */
  letter-spacing: 1px;
  position: relative;
  overflow: hidden; /* 隐藏超出范围的伪元素和动画 */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  /* 完全覆盖 Element Plus 的默认样式 */
  border-radius: 0; /* 使用锐利边角 */
  text-decoration: none;
}

/* 按钮内容（图标和文字）的容器 */
.controls .el-button.tech-button :deep(span) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2; /* 确保内容在最上层 */
}

/* 内部图标样式 */
.controls .el-button.tech-button .el-icon {
  font-size: 1.6em; /* 图标大小 */
  margin-bottom: 4px; /* 图标与文字间距 */
  transition: all 0.3s ease;
}

/* 按钮主要背景和伪元素装饰 */
.controls .el-button.tech-button::before,
.controls .el-button.tech-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 允许点击穿透 */
  transition: all 0.4s ease-out;
}

/* ::before 用于背景渐变和边框 */
.controls .el-button.tech-button::before {
  background: linear-gradient(135deg, rgba(13, 58, 110, 0.3), rgba(8, 28, 54, 0.6));
  border: 1px solid #1c5a9b;
  box-sizing: border-box;
}

/* ::after 用于制作角落的装饰 */
.controls .el-button.tech-button::after {
  --corner-size: 8px; /* 定义角落装饰的大小 */
  border-left: 2px solid #79c9fb;
  border-top: 2px solid #79c9fb;
  width: var(--corner-size);
  height: var(--corner-size);
  top: -2px; /* 补偿边框宽度 */
  left: -2px;
}

/* 流光动画效果 */
.controls .el-button.tech-button .scanner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
      90deg,
      transparent,
      rgba(121, 201, 251, 0.3),
      transparent
  );
  z-index: 1;
  animation: scan-line 3s infinite linear;
  opacity: 0;
  transition: opacity 0.4s ease;
}

/* --- 悬停 (Hover) 效果 --- */
.controls .el-button.tech-button:hover {
  color: #fff;
  border-color: #79c9fb;
  transform: translateY(-2px);
  filter: drop-shadow(0 0 8px rgba(121, 201, 251, 0.7));
}

.controls .el-button.tech-button:hover::before {
  background: linear-gradient(135deg, rgba(8, 28, 54, 0.6), rgba(13, 58, 110, 0.8));
  box-shadow: inset 0 0 15px rgba(121, 201, 251, 0.2);
}

.controls .el-button.tech-button:hover::after {
  width: calc(100% + 4px); /* 装饰线延伸 */
  height: calc(100% + 4px);
  border-color: #00e0ff;
}

.controls .el-button.tech-button:hover .scanner {
  opacity: 1; /* 悬停时显示流光 */
  animation: scan-line 2.5s infinite linear; /* 加快动画 */
}

.controls .el-button.tech-button:hover .el-icon {
  transform: scale(1.1); /* 图标放大 */
}

/* --- 点击 (Active) 效果 --- */
.controls .el-button.tech-button:active {
  transform: translateY(0); /* 按下时恢复原位 */
  filter: drop-shadow(0 0 5px rgba(121, 201, 251, 0.5));
  background: rgba(0, 150, 255, 0.1);
  transition-duration: 0.1s;
}

/* * 修复 Element Plus 按钮 `link` 属性带来的样式问题。
 * 我们需要一个 `<span>` 来包裹图标和文字，但`el-button`默认会创建自己的span。
 * 使用 :deep() 选择器强制修改其内部结构，使其适应我们的Flex布局。
 */
.controls .el-button.tech-button :deep(.el-icon + span) {
  margin-left: 0; /* 移除 Element Plus 默认的图标和文字间距 */
}

/* ECharts 容器样式 */
#china-map-interactive {
  width: 100%;
  flex-grow: 1;
  background: transparent;
  border-radius: 8px;
}
</style>
