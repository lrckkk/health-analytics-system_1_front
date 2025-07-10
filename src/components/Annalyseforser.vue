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

        <h1 class="dashboard-title">{{regionStore.selectedRegion}} - 医疗服务分析</h1>
        <div class="stats-container">
          <div class="stat-card" v-for="(stat, index) in stats" :key="index" :style="`--delay: ${index * 0.1}s`">
            <p class="stat-label">{{ stat.label }}</p>
            <p class="stat-value">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 主图表区域 -->
    <div class="chart-grid">
      <!-- 每万人门诊量变化趋势折线图 -->
      <div class="chart-card line-chart">
        <simpleline
            ref="outChart"
            :chart-data="outData"
            :title="`每万人门诊量变化趋势 - ${regionStore.getDisplayRegion}`"
            height="400px"
            width="100%"
            x-field="year"
            y-field="count"
            :loading="medicalLoading"
        />
      </div>

      <!-- 每万人住院量变化趋势折线图 -->
      <div class="chart-card line-chart">
        <simpleline
            ref="inChart"
            :chart-data="inData"
            :title="`每万人住院量变化趋势 - ${regionStore.getDisplayRegion}`"
            height="400px"
            width="100%"
            x-field="year"
            y-field="count"
            :loading="medicalLoading"
        />
      </div>

      <!-- 决策分析组件 -->
      <div class="chart-card analysis-card">
        <decide :metric-index="5" />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="medicalLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>数据加载中...</p>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch, computed, nextTick} from 'vue';
import { useRegionStore } from '@/stores/RegionData.js';
import { useMapDataStore } from '@/stores/TotalData.js';
import { useGrowthStore } from '@/utils/countgrow.js';
import Simpleline from '/src/components/simpleline.vue'
import {getValueAndRankById} from "@/utils/countround.js";
import { useRouter } from 'vue-router';
import decide from './decide.vue';
import {useAnalysisDataStore} from "@/stores/AnalysisData.js"

const router = useRouter();
const regionStore = useRegionStore();
const mapDataStore = useMapDataStore();
const growthStore = useGrowthStore();
const analyseStore = useAnalysisDataStore();

const medicalLoading = ref(true);
const outData = ref([]);
const inData = ref([]);

// 图表引用
const outChart = ref(null);
const inChart = ref(null);

const stats = computed(() => [
  {
    label: '门诊次数',
    value: resultByIdDisplay2.value
  },
  {
    label: '住院次数',
    value: resultByIdDisplay.value
  },
  {
    label: '门诊增长率',
    value: growthStore.getAverageGrowthRate('5') !== 0
        ? `${(growthStore.getAverageGrowthRate('5') * 100).toFixed(2)}%`
        : '数据不足或增长率为零'
  },
  {
    label: '门诊估算值',
    value: growthStore.getEstimatedNextYearValue('5') !== null
        ? `${growthStore.getEstimatedNextYearValue('5')?.toFixed(2)} (${growthStore.getNextYear('5')}年)`
        : '无法估算(数据不足)'
  }
]);

const resultByIdDisplay = computed(() => {
  const data = mapDataStore.inpatientAdmissions;
  if (Array.isArray(data) && data.length > 0) {
    const result = getValueAndRankById(data, regionStore.getRegionId);
    if (result) {
      return `${result.value}次 (排名: ${result.rank})`;
    }
  }
  return '数据加载中或无效 ID';
});

const resultByIdDisplay2 = computed(() => {
  const data = mapDataStore.outpatientVisitsData;
  if (Array.isArray(data) && data.length > 0) {
    const result = getValueAndRankById(data, regionStore.getRegionId);
    if (result) {
      analyseStore.rankInfos[5] = result.rank;
      return `${result.value}次 (排名: ${result.rank})`;
    }
  }
  return '数据加载中或无效 ID';
});

const navigateBack = () => {
  router.push('/province');
};

const loadCharts = async () => {
  try {
    medicalLoading.value = true;

    // 并行加载数据
    const [outDataRes, inDataRes] = await Promise.all([
      regionStore.fetchoutpatientavgIfNeeded(regionStore.getRegionId),
      regionStore.fetchoinpatientavgavgIfNeeded(regionStore.getRegionId)
    ]);

    outData.value = outDataRes;
    inData.value = inDataRes;
    growthStore.setHistoricalData('5', outDataRes);
    analyseStore.growthRates[5] = (growthStore.getAverageGrowthRate('5') * 100).toFixed(2);

    // 确保DOM更新
    await nextTick();

    // 手动触发图表重新渲染
    if (outChart.value) outChart.value.initChart();
    if (inChart.value) inChart.value.initChart();

  } catch (error) {
    console.error("图表加载失败:", error);
  } finally {
    medicalLoading.value = false;
  }
};

onMounted(() => {
  loadCharts();
});

watch(
    () => regionStore.getRegionId,
    (newRegionId) => {
      if (newRegionId) {
        loadCharts();
      }
    },
    { immediate: true }
);
</script>

<style scoped>
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
  margin: 0;
  padding-bottom: 15px;
  color: #00e0ff;
  font-size: 28px;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(0, 224, 255, 0.5);
  border-bottom: 1px solid rgba(74, 207, 255, 0.3);
  position: relative;
  text-align: center;
  padding-top: 10px;
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
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
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

.line-chart {
  grid-column: span 1;
  grid-row: 1;
}

.analysis-card {
  grid-column: 1 / span 2;
  grid-row: 2;
  background: rgba(16, 26, 60, 0.9);
}

/* 图表容器样式 */
.simpleline-container {
  flex: 1;
  width: 100%;
  min-height: 400px;
}

@media (max-width: 1200px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }

  .line-chart,
  .analysis-card {
    grid-column: 1;
  }

  .analysis-card {
    grid-row: 3;
  }
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

  .back-button {
    position: relative;
    top: 0;
    left: 0;
    margin-bottom: 15px;
  }
}
</style>
