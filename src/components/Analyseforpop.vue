<template>
  <div class="dashboard-container">
    <!-- 顶部标题和统计信息 -->
    <div class="dashboard-header">
      <div class="header-content">
        <!-- 返回按钮 -->
        <div class="back-button" @click="navigateBack">
          <div class="back-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="back-text">返回地图</div>
          <div class="button-effects">
            <div class="effect-circle"></div>
            <div class="effect-particles"></div>
          </div>
        </div>

        <h1 class="dashboard-title">{{regionStore.selectedRegion}} - 人口分析</h1>
        <div class="stats-container">
          <div class="stat-card" v-for="(stat, index) in stats" :key="index" :style="`--delay: ${index * 0.1}s`">
            <p class="stat-label">{{ stat.label }}</p>
            <p class="stat-value">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 主图表区域 - 三行布局 -->
    <div class="chart-grid">
      <!-- 第一行：多线折线图 -->
      <div class="chart-card multi-line-chart">
        <multi-line-chart
            ref="multiLineChart"
            width="100%"
            :chart-data="populationData"
            title="人口统计趋势"
            height="400px"
            :show-data-zoom="true"
            :show-legend="true"
            :smooth="true"
            :loading="populationLoading"
            @provinceChange="handleProvinceChange"
        />
      </div>

      <!-- 第二行：单线折线图 -->
      <div class="chart-card line-chart" v-if="singleLineData.length > 0">
        <simpleline
            ref="singleLineChart"
            :chart-data="singleLineData"
            :title="`人口数量变化趋势 - ${regionStore.getDisplayRegion}`"
            height="400px"
            width="100%"
            x-field="year"
            y-field="count"
            :loading="medicalLoading"
        />
      </div>

      <!-- 第三行：饼图 -->
      <div class="chart-card pie-chart" v-if="marketShareData.length > 0">
        <pie-chart
            ref="pieChart"
            width="100%"
            :chart-data="marketShareData"
            :title="`人口组成 - ${regionStore.getDisplayRegion}`"
            name-field="company"
            value-field="share"
            height="450px"
            rose-type="radius"
        />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>数据加载中...</p>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch, computed} from 'vue';
import { useRegionStore } from '@/stores/RegionData.js';
import { useMapDataStore } from '@/stores/TotalData.js';
import { useGrowthStore } from '@/utils/countgrow.js';
import MultiLineChart from "@/components/MutipleLineCharts.vue";
import Simpleline from '/src/components/simpleline.vue'
import PieChart from "@/components/PieChart.vue";
import {getValueAndRankById} from "@/utils/countround.js";
import { IdToNameMapper } from "@/utils/IdToNameMapper.js";

import request from "@/utils/request.js";
import {provinceIdMap} from "@/utils/mapid.js";
import { useRouter } from 'vue-router';

const router = useRouter();
const regionStore = useRegionStore();
const mapDataStore = useMapDataStore();
const growthStore = useGrowthStore();

const medicalLoading = ref(false);
const populationLoading = ref(false);
const populationData = ref([]);
const singleLineData = ref([]);

import {useGrowthStore} from "@/utils/countgrow.js";
import Simpleline from '/src/components/simpleline.vue'
import {useAnalysisDataStore} from "@/stores/AnalysisData.js"; // 请确保路径正确，可能需要调整
// --- Pinia Stores ---
const regionStore = useRegionStore();
const mapDataStore = useMapDataStore(); // 保持导入，以防将来需要
const growthStore = useGrowthStore(); // 如果这个组件不直接使用，可以暂时移除
const medicalLoading = ref(true)
const analyseStore = useAnalysisDataStore();
// --- 响应式数据 ---
const populationData = ref([]);
const populationLoading = ref(true);
const loadData = () => {
  const mockData = regionStore.populationDataCache[regionStore.getRegionId];
  // **关键修改：将人口数据缓存存储到 growthStore 的 '2' 号键下**
  growthStore.setHistoricalData('2', mockData);
  analyseStore.growthRates[2]=(growthStore.getAverageGrowthRate('2') * 100).toFixed(2);
};
// 假设这些是静态的，或者你会在组件加载后动态更新它们

const marketShareData = ref([
  { company: '儿童（0-14）', share: 16 },
  { company: '青年（14-44）', share: 20 },
  { company: '中年（45-59岁）', share: 20 },
  { company: '中老年（60-74岁', share: 15 },
  { company: '老年（75岁及以上）', share: 9 }
]);

// 图表引用
const multiLineChart = ref(null);
const singleLineChart = ref(null);
const pieChart = ref(null);

// 计算合并的加载状态
const isLoading = computed(() => medicalLoading.value || populationLoading.value);

const stats = computed(() => [
  {
    label: '人口总数',
    value: resultByIdDisplay.value
  },
  {
    label: '平均增长率',
    value: growthStore.getAverageGrowthRate('2') !== 0
        ? `${(growthStore.getAverageGrowthRate('2') * 100).toFixed(2)}%`
        : '数据不足或增长率为零'
  },
  {
    label: '下一年估算值',
    value: growthStore.getEstimatedNextYearValue('2') !== null
        ? `${growthStore.getEstimatedNextYearValue('2')?.toFixed(2)} (${growthStore.getNextYear('2')}年)`
        : '无法估算(数据不足)'
  }
]);

const resultByIdDisplay = computed(() => {
  const data = mapDataStore.populationData;
  if (Array.isArray(data) && data.length > 0) {
    const result = getValueAndRankById(data, regionStore.getRegionId);
    if (result) {
      return `${result.value}万人 (排名: ${result.rank})`;
    }
  }
  return '数据加载中或无效 ID';
});

const provinceMapper = new IdToNameMapper(provinceIdMap);

const navigateBack = () => {
  router.push('/province');
};

const fetchPopulationData = async (provinceIds) => {
  if (!Array.isArray(provinceIds)) {
    console.warn('无效的省份ID列表，跳过请求');
    populationLoading.value = false;
    return;
  }

  try {
    populationLoading.value = true;
    const responses = await Promise.all(
        provinceIds.map(id => request.get(`/api/provinces/${id}/population/years`))
    );

    const processedData = {};
    responses.forEach((response, index) => {
      const provinceName = provinceMapper.getName(provinceIds[index]) || `省份${provinceIds[index]}`;
      processedData[provinceName] = response.map(item => ({
        year: String(item.year),
        population: Number(item.total)
      }));
    });

    populationData.value = mergeProvinceData(processedData);
  } catch (error) {
    console.error('获取人口数据失败:', error);
    populationLoading.value = false;
  } finally {
    populationLoading.value = false;
  }
};

const mergeProvinceData = (dataByProvince) => {
  const allYears = [...new Set(
      Object.values(dataByProvince).flatMap(data => data.map(item => item.year))
  )].sort();

  return allYears.map(year => {
    const yearData = { year };
    Object.entries(dataByProvince).forEach(([name, data]) => {
      const item = data.find(d => d.year === year);
      yearData[name] = item ? item.population : null;
    });
    return yearData;
  });
};

const handleProvinceChange = async (selectedIds) => {
  await fetchPopulationData(selectedIds || [regionStore.getRegionId]);
};


const loadSingleLineData = async () => {
  try {
    medicalLoading.value = true;
    const data = await regionStore.fetchPopulationDataIfNeeded(regionStore.getRegionId);
    singleLineData.value = data;
    growthStore.setHistoricalData('2', data);
  } catch (error) {
    console.error("加载单线数据失败:", error);
    medicalLoading.value = false;
  } finally {
    medicalLoading.value = false;

const resultByIdDisplay = computed(() => {
  const data = mapDataStore.populationData; // 获取人口数据
  console.log(data)
  // 关键校验：确保数据是数组且不为空
  if (Array.isArray(data) && data.length > 0) {
    // 只有数据有效时才调用排名函数
    const result = getValueAndRankById(data, regionStore.getRegionId); // 查找 ID 为 5 的数据及其排名
    if (result) {
      analyseStore.rankInfos[2]=result.rank;
      return `人口总数: ${result.value}万人, 排名: ${result.rank}`;
    }

  }
};

onMounted(() => {
  loadSingleLineData();
  if (regionStore.getRegionId) {
    fetchPopulationData([regionStore.getRegionId]);
  }
});

watch(() => regionStore.getRegionId, (newId) => {
  if (newId) {
    fetchPopulationData([newId]);
    loadSingleLineData();
  }
}, { immediate: true });
</script>

<style scoped>


/* 保持原有样式不变，添加返回按钮样式 */
.header-content {
  position: relative;
}

.back-button {
  position: absolute;
  top: -10px;
  left: -10px;
  display: flex;
  align-items: center;
  padding: 8px 15px 8px 10px;
  background: rgba(3, 4, 94, 0.5);
  border: 1px solid rgba(74, 207, 255, 0.3);
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  z-index: 10;
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.1);
}

.back-button:hover {
  background: rgba(3, 4, 94, 0.8);
  border-color: rgba(74, 207, 255, 0.6);
  box-shadow: 0 0 20px rgba(74, 207, 255, 0.3);
  transform: translateY(-2px);
}

.back-button:hover .back-icon {
  transform: translateX(-3px);
}

.back-button:hover .back-text {
  text-shadow: 0 0 8px rgba(0, 224, 255, 0.7);
}

.back-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  color: #00e0ff;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon svg {
  width: 100%;
  height: 100%;
}

.back-text {
  color: #00e0ff;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.button-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  border-radius: 30px;
}

.effect-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: rgba(0, 224, 255, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.6s ease-out;
}

.back-button:hover .effect-circle {
  transform: translate(-50%, -50%) scale(15);
  opacity: 0;
}

.effect-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle, rgba(0, 224, 255, 0.8) 1px, transparent 1px);
  background-size: 10px 10px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.back-button:hover .effect-particles {
  opacity: 0.3;
  animation: particlesMove 2s linear infinite;
}

@keyframes particlesMove {
  0% { background-position: 0 0; }
  100% { background-position: 20px 20px; }
}

.dashboard-title {
  padding-top: 10px;
}

@media (max-width: 768px) {
  .back-button {
    position: relative;
    top: 0;
    left: 0;
    margin-bottom: 15px;
  }
}

.dashboard-container {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #0a192f 0%, #000a1a 100%);
  color: #e0f2f7;
  font-family: 'Inter', sans-serif, 'Microsoft YaHei', 'PingFang SC';
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 60vh;
  color: #00e0ff;
}

.loading-spinner {
  border: 4px solid rgba(0, 224, 255, 0.2);
  border-top: 4px solid #00e0ff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.dashboard-header {
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(16, 26, 60, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(74, 207, 255, 0.2);
  box-shadow: 0 0 15px rgba(74, 207, 255, 0.2);
  backdrop-filter: blur(5px);
}

.dashboard-title {
  margin: 0;
  padding-bottom: 15px;
  color: #00e0ff;
  font-size: 28px;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(0, 224, 255, 0.5);
  border-bottom: 1px solid rgba(74, 207, 255, 0.3);
  position: relative;
  text-align: center;
}

.dashboard-title::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, #00e0ff, transparent);
  animation: titleUnderline 3s infinite alternate;
}

@keyframes titleUnderline {
  0% { width: 100px; }
  100% { width: 100%; }
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  padding: 20px;
  background: rgba(3, 4, 94, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(74, 207, 255, 0.2);
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.1);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: translateY(20px);
  opacity: 0;
  animation: statCardAppear 0.6s forwards;
  animation-delay: var(--delay);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 224, 255, 0.1), transparent);
  transition: 0.5s;
}

.stat-card:hover::before {
  left: 100%;
}

@keyframes statCardAppear {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.stat-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 20px rgba(74, 207, 255, 0.3);
  background: rgba(3, 4, 94, 0.7);
}

.stat-label {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: rgba(224, 242, 247, 0.8);
}

.stat-value {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #00e0ff;
  text-shadow: 0 0 8px rgba(0, 224, 255, 0.5);
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
  gap: 30px;
  width: 100%;
}

.chart-card {
  background: rgba(16, 26, 60, 0.7);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(74, 207, 255, 0.2);
  box-shadow: 0 0 15px rgba(74, 207, 255, 0.1);
  transition: all 0.5s ease;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(5px);
  position: relative;
  overflow: hidden;
}

.chart-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00e0ff, #7d5fff);
  opacity: 0.7;
  transition: all 0.5s ease;
}

.chart-card:hover::after {
  height: 5px;
  opacity: 1;
}

.chart-card:hover {
  box-shadow: 0 0 30px rgba(74, 207, 255, 0.3);
  transform: translateY(-5px);
}

.multi-line-chart {
  grid-row: 1;
}

.line-chart {
  grid-row: 2;
}

.pie-chart {
  grid-row: 3;
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }

  .dashboard-title {
    font-size: 24px;
  }

  .chart-card {
    padding: 15px;
  }

  .stat-card {
    padding: 15px;
  }
}
</style>