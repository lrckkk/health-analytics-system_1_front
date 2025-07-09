<template>
  <div class="radar-chart-container">


    <div v-if="loadingData" class="loading-overlay tech-loading">
      <div class="loading-spinner"></div>
      <p>数据加载中...</p>
    </div>

    <div ref="chartDom" class="radar-chart" :class="{ 'chart-hidden': isEmptyData || loadingData }"></div>

    <div v-if="isEmptyData && !loadingData" class="no-data-message">
      <p v-if="regionStore.selectedRegionId === 0">请选择一个省份以显示雷达图。</p>
      <p v-else>当前区域数据不完整，无法生成雷达图。</p>
      <p v-if="comparisonProvinceId !== 0">对比区域数据也可能不完整。</p>
    </div>

    <div class="comparison-selector">
      <label for="compare-province">对比省份:</label>
      <select id="compare-province" v-model="selectedComparisonProvinceName" @change="handleComparisonChange">
        <option :value="null">-- 不对比 --</option>
        <option
            v-for="name in availableProvincesForComparison"
            :key="name"
            :value="name"
            :disabled="name === regionStore.selectedRegion"
        >
          {{ name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
import * as echarts from 'echarts'; // 导入 ECharts
import { useRegionStore } from '@/stores/RegionData.js'; // 导入区域数据 Pinia Store
import { useMapDataStore } from '@/stores/TotalData.js'; // 导入总数据 Pinia Store
import { provinceIdMap } from '@/utils/mapid.js'; // 导入省份 ID 映射
// 导入排名和数据处理函数，请确保路径正确
import { getValueAndRankById, getRankOfGivenValue } from '@/utils/countround.js';


const chartDom = ref(null); // ECharts 容器的 DOM 引用
let myChart = null; // ECharts 实例

// 初始化 Pinia Store
const regionStore = useRegionStore();
const mapDataStore = useMapDataStore();

const isEmptyData = ref(false); // 控制是否显示“无数据”消息
const loadingData = ref(true); // 控制是否显示“数据加载中”叠加层，初始为 true

const selectedComparisonProvinceName = ref(null); // 对比省份的名称
const comparisonProvinceId = ref(0); // 对比省份的 ID

// 将 provinceIdMap 转换为名称到 ID 的映射，方便查找
const provinceNameToIdMap = Object.entries(provinceIdMap).reduce((acc, [id, name]) => {
  acc[name] = parseInt(id); // 确保 ID 是数字类型
  return acc;
}, {});

// 计算可用于对比的省份列表
const allProvinceNames = Object.values(provinceIdMap);
const availableProvincesForComparison = computed(() => {
  return allProvinceNames.filter(name =>
      name !== '全国' && name !== regionStore.selectedRegion // 排除“全国”和当前选中的省份
  ).sort(); // 按字母顺序排序
});

/**
 * 辅助函数：从给定的数据数组中，根据ID查找对应的value
 * @param {Array<Object>} dataArray 数据数组，元素结构为 {id:..., value:...}
 * @param {number} id 要查找的省份ID
 * @returns {number} 找到的value，如果未找到则返回0
 */
const getSingleValueById = (dataArray, id) => {
  // 确保输入是数组
  if (!Array.isArray(dataArray)) {
    return 0;
  }
  // 【关键修正】直接访问 d.id 和 d.value，因为您的数据结构是扁平的
  const item = dataArray.find(d => d.id === id);
  return item ? Number(item.value) : 0;
};

// --- 排名结果的计算属性 ---
// 这些 computed 属性会响应 mapDataStore.populationData 的变化自动更新


// --- ECharts 雷达图配置和渲染逻辑 ---

/**
 * 获取雷达图的 ECharts 配置项
 */
const getRadarChartOptions = () => {
  // 雷达图的各项指标配置
  const indicator = [
    { name: '医疗机构数量', max: 100000, color: '#a0e0ff' },
    { name: '医疗人员数量', max: 1500000, color: '#a0e0ff' },
    { name: '病床总数', max: 1000000, color: '#a0e0ff' },
    { name: '医疗花费', max: 100000000000, color: '#a0e0ff' },
    { name: '门诊就诊人次', max: 100000000, color: '#a0e0ff' },
    { name: '住院就诊人次', max: 10000000, color: '#a0e0ff' },
    { name: '人口数量', max: 150000000, color: '#a0e0ff' }
  ];

  const seriesData = []; // 雷达图系列数据
  const legendData = []; // 图例数据

  // --- 主选省份的数据 ---
  const mainRegionId = regionStore.selectedRegionId;
  const mainRegionName = regionStore.selectedRegion;
  const mainColor = '#40e0d0'; // 主省份的颜色

  // 确保主省份 ID 有效且图表所需数据已加载
  if (mainRegionId !== 0 && mapDataStore.institutionData.length > 0) {
    const mainValues = [
      getSingleValueById(mapDataStore.institutionData, mainRegionId),
      getSingleValueById(mapDataStore.personnelData, mainRegionId),
      getSingleValueById(mapDataStore.bedData, mainRegionId),
      getSingleValueById(mapDataStore.totalCostData, mainRegionId),
      getSingleValueById(mapDataStore.outpatientVisitsData, mainRegionId),
      getSingleValueById(mapDataStore.inpatientAdmissions, mainRegionId),
      getSingleValueById(mapDataStore.populationData, mainRegionId)
    ];
    // 检查主省份是否有有效数据（至少有一个值大于0）
    const hasMainData = mainValues.some(val => val > 0);

    if (hasMainData) {
      legendData.push({ name: mainRegionName, icon: 'circle' });
      seriesData.push({
        value: mainValues,
        name: mainRegionName,
        areaStyle: { opacity: 0.7, color: mainColor + '66' },
        lineStyle: { width: 2, color: mainColor },
        itemStyle: { color: mainColor },
        label: { // 添加标签显示数值
          show: true,
          formatter: function (params) {
            return params.value;
          },
          color: '#fff',
          fontSize: 12,
          distance: 5
        }
      });
    }
  }

  // --- 对比省份的数据 ---
  const compareId = comparisonProvinceId.value;
  const compareName = provinceIdMap[compareId];
  const compareColor = '#ffa000'; // 对比省份的颜色

  // 确保对比省份 ID 有效、不与主省份相同且图表所需数据已加载
  if (compareId !== 0 && compareId !== mainRegionId && mapDataStore.institutionData.length > 0) {
    const compareValues = [
      getSingleValueById(mapDataStore.institutionData, compareId),
      getSingleValueById(mapDataStore.personnelData, compareId),
      getSingleValueById(mapDataStore.bedData, compareId),
      getSingleValueById(mapDataStore.totalCostData, compareId),
      getSingleValueById(mapDataStore.outpatientVisitsData, compareId),
      getSingleValueById(mapDataStore.inpatientAdmissions, compareId),
      getSingleValueById(mapDataStore.populationData, compareId)
    ];
    // 检查对比省份是否有有效数据
    const hasCompareData = compareValues.some(val => val > 0);

    if (hasCompareData) {
      legendData.push({ name: compareName, icon: 'circle' });
      seriesData.push({
        value: compareValues,
        name: compareName,
        areaStyle: { opacity: 0.7, color: compareColor + '66' },
        lineStyle: { width: 2, color: compareColor },
        itemStyle: { color: compareColor },
        label: { // 添加标签显示数值
          show: true,
          formatter: function (params) {
            return params.value;
          },
          color: '#fff',
          fontSize: 12,
          distance: 5
        }
      });
    }
  }

  // 如果没有数据可用于渲染，则返回 null
  if (seriesData.length === 0) {
    return null;
  }

  // ECharts 选项配置
  return {
    title: {
      text: '省份指标雷达图',
      left: 'center',
      textStyle: { color: '#eee', fontSize: 18 }
    },
    tooltip: { // 添加 tooltip 配置，鼠标悬停时显示数据详情
      trigger: 'item',
      formatter: function (params) {
        if (params.seriesType === 'radar') {
          let html = `<b>${params.name}</b><br/>`;
          // 遍历指标，确保 tooltip 显示正确的指标名称和数值
          params.value.forEach((val, index) => {
            html += `${indicator[index].name}: ${val}<br/>`;
          });
          return html;
        }
        return '';
      },
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: '#40e0d0',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },
    legend: { // 图例配置
      data: legendData,
      top: 20, left: 'center',
      textStyle: { color: '#eee', fontSize: 14 },
      itemGap: 25
    },
    radar: { // 雷达图坐标系配置
      indicator: indicator,
      center: ['50%', '55%'], radius: '65%',
      axisName: { color: '#a0e0ff', fontSize: 14 },
      splitLine: { lineStyle: { color: 'rgba(74, 207, 255, 0.3)' } },
      splitArea: { areaStyle: { color: ['rgba(3, 4, 94, 0.4)', 'rgba(0, 0, 0, 0.2)'] } },
      axisLine: { lineStyle: { color: 'rgba(74, 207, 255, 0.5)' } }
    },
    series: [{ // 系列配置
      type: 'radar',
      data: seriesData,
      symbol: 'circle', symbolSize: 8
    }]
  };
};

/**
 * 渲染或更新 ECharts 图表
 */
const renderChart = () => {
  // 只有当 ECharts 实例和 DOM 引用都有效时才尝试渲染
  if (!myChart || !chartDom.value) {
    return;
  }

  // 确保所有用于图表的数据都已加载
  const allDataLoadedForChart = [
    mapDataStore.populationData,
    mapDataStore.institutionData,
    mapDataStore.personnelData,
    mapDataStore.bedData,
    mapDataStore.inpatientAdmissions,
    mapDataStore.outpatientVisitsData,
    mapDataStore.totalCostData
  ].every(arr => Array.isArray(arr) && arr.length > 0); // 检查每个数据数组是否都已加载且非空

  if (allDataLoadedForChart) {
    const chartOptions = getRadarChartOptions(); // 获取图表配置

    if (chartOptions) {
      isEmptyData.value = false; // 有数据，不显示无数据消息
      myChart.setOption(chartOptions, true); // 设置图表选项
      myChart.resize(); // 调整图表大小以适应容器
    } else {
      isEmptyData.value = true; // 无有效数据，显示无数据消息
      myChart.clear(); // 清空图表
      console.warn("雷达图数据不完整或全为零，无法渲染图表。");
    }
  } else {
    // 如果数据尚未准备好，保持图表隐藏/加载状态
    isEmptyData.value = true; // 指示数据尚未准备好用于图表
    myChart.clear(); // 清空任何旧图表内容
    console.log("正在等待所有地图数据加载...");
  }
};

/**
 * 处理对比省份下拉框的选择变化
 */
const handleComparisonChange = () => {
  const selectedName = selectedComparisonProvinceName.value;
  if (selectedName === null) {
    comparisonProvinceId.value = 0; // 清除对比省份
    console.log('对比区域已清除。');
  } else {
    const newId = provinceNameToIdMap[selectedName];
    if (newId !== undefined) {
      comparisonProvinceId.value = newId; // 设置新的对比省份 ID
      console.log(`设置对比区域: ${selectedName}, ID: ${newId}`);
    } else {
      console.warn(`handleComparisonChange: 未知区域名称 "${selectedName}"，对比区域未设置。`);
      comparisonProvinceId.value = 0;
    }
  }
};

// --- Watchers ---
// 监听选中区域 ID 的变化
watch(() => regionStore.selectedRegionId, (newId, oldId) => {
  if (newId !== oldId) {
    selectedComparisonProvinceName.value = null; // 清除对比省份选择
    comparisonProvinceId.value = 0; // 重置对比省份 ID
  }
  renderChart(); // 重新渲染图表
}, { immediate: true }); // 组件挂载时立即执行一次

// 监听对比省份 ID 的变化
watch(comparisonProvinceId, () => {
  renderChart(); // 重新渲染图表
});

// 监听所有 ECharts 所需数据 Store 属性的变化
watch([
  () => mapDataStore.populationData,
  () => mapDataStore.institutionData,
  () => mapDataStore.personnelData,
  () => mapDataStore.bedData,
  () => mapDataStore.inpatientAdmissions,
  () => mapDataStore.outpatientVisitsData,
  () => mapDataStore.totalCostData
], (newValues) => {
  // 检查所有数据数组是否都已加载且非空
  const allDataLoaded = newValues.every(arr => Array.isArray(arr) && arr.length > 0);
  loadingData.value = !allDataLoaded; // 更新加载状态

  if (allDataLoaded) {
    console.log("所有地图数据已加载。正在重新渲染图表并重新计算排名。");
    renderChart(); // 当所有数据加载完成后渲染图表
  } else {
    console.log("部分地图数据仍在加载中...");
  }
}, { deep: true, immediate: true }); // 深度监听数组内容变化，并立即执行一次

// --- 生命周期钩子 ---
onMounted(() => {
  nextTick(() => {
    if (chartDom.value) {
      myChart = echarts.init(chartDom.value); // 初始化 ECharts 实例
      renderChart(); // 初始渲染图表
      // 监听窗口大小变化以自动调整图表大小
      window.addEventListener('resize', () => myChart?.resize());
    } else {
      console.error("onMounted 后 chartDom 引用仍然为 null，ECharts 初始化失败。");
    }
  });
});

onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose(); // 销毁 ECharts 实例，释放资源
    window.removeEventListener('resize', () => myChart?.resize()); // 移除事件监听器
  }
});
</script>

<style scoped>
/* CSS 样式与之前相同 */
.radar-chart-container {
  width: 50%;
  height: 600px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(3, 4, 94, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);
  border: 3px solid rgba(74, 207, 255, 0.2);
  box-shadow:
      0 0 10px rgba(74, 207, 255, 0.4),
      0 0 20px rgba(74, 207, 255, 0.2),
      inset 0 0 10px rgba(74, 207, 255, 0.3);
  border-radius: 8px;
}

.radar-chart {
  width: 100%;
  height: calc(100% - 60px);
  transition: opacity 0.5s ease-in-out;
}

.chart-hidden {
  opacity: 0;
  height: 0;
  pointer-events: none;
}

.no-data-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffcccc;
  text-align: center;
  font-size: 1.1em;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(255, 0, 0, 0.5);
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.3);
  z-index: 10;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #00e0ff;
  font-size: 1.2em;
  z-index: 15;
  backdrop-filter: blur(3px);
}

.loading-spinner {
  border: 4px solid rgba(0, 150, 255, 0.3);
  border-top: 4px solid #00e0ff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.comparison-selector {
  position: absolute;
  bottom: 15px;
  width: 90%;
  text-align: center;
  z-index: 12;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: #a0e0ff;
  font-size: 0.95em;
}

.comparison-selector label {
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 224, 255, 0.5);
}

.comparison-selector select {
  background-color: rgba(10, 25, 47, 0.8);
  border: 1px solid #40e0d0;
  color: #e0f2f7;
  padding: 6px 12px;
  border-radius: 5px;
  font-size: 0.9em;
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23e0f2f7%22%20d%3D%22M7.41%2C8.59L6%2C7.17L4.59%2C8.59L3.17%2C7.17L6%2C4.24L8.83%2C7.17L7.41%2C8.59Z%22%20transform%3D%22rotate(180%206%206)%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 30px;
  transition: all 0.3s ease;
}

.comparison-selector select:hover {
  border-color: #00e0ff;
  box-shadow: 0 0 8px rgba(0, 224, 255, 0.4);
}

.comparison-selector select option {
  background-color: #081a2e;
  color: #e0f2f7;
}

.comparison-selector select option:disabled {
  color: #888;
}
</style>