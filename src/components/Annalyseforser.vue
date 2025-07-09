<template>
  <div class="main-container">
    <div class="Line-row">
      <simpleline
          :chart-data="outData"
          :title="`每万人门诊量变化趋势 - ${regionStore.getDisplayRegion}`"
          height=440px
          width=100%
          x-field="year"
          y-field="count"
          :loading="medicalLoading"
      />
    </div>
    <div class="chart-row">

    </div>
    <div class="card-content-inner-a">
      <simpleline
          :chart-data="inData"
          :title="`每万人住院量变化趋势 - ${regionStore.getDisplayRegion}`"
          height=440px
          width=100%
          x-field="year"
          y-field="count"
          :loading="medicalLoading"
      />
    </div>
    <div class="right-column1">
      <h1>{{regionStore.selectedRegion}}</h1>
      <p>{{ resultByIdDisplay }}</p>
      <p>{{ resultByIdDisplay2}}</p>
      <div v-if="growthStore.historicalData.length > 0">
        <p>平均增长率:
          <span v-if="growthStore.averageGrowthRate !== 0">
          {{ (growthStore.averageGrowthRate * 100).toFixed(2) }}%
        </span>
          <span v-else>
          数据不足或增长率为零
        </span>
        </p>
        <p v-if="growthStore.estimatedNextYearValue !== null">
          估算每万人门诊量 2021 年的值: {{ growthStore.estimatedNextYearValue.toFixed(2) }}
        </p>
        <p v-else>
          无法估算下一年的值 (数据不足)
        </p>
      </div>
      <div v-else>
        <p>没有加载历史数据。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// ... (script 部分保持完全不变，与您提供的代码一致)
import {ref, onMounted, watch, computed} from 'vue';
import { useRegionStore } from '@/stores/RegionData.js'; // 导入区域数据 Pinia Store
import { useMapDataStore } from '@/stores/TotalData.js'; // 导入总数据 Pinia Store (虽然在此组件中未使用其状态，但如果你后续需要，保持导入)
import { provinceIdMap } from '@/utils/mapid.js'; // 导入省份 ID 映射
import { getValueAndRankById, getRankOfGivenValue } from '@/utils/countround.js'; // 如果这些函数在这个组件中不直接使用，可以不导入
import MultiLineChart from "@/components/MutipleLineCharts.vue";
import request from "@/utils/request.js"; // 确保你的请求工具正确配置
import { IdToNameMapper } from "@/utils/IdToNameMapper.js";
import {useGrowthStore} from "@/utils/countgrow.js";
import Simpleline from '/src/components/simpleline.vue' // 请确保路径正确，可能需要调整
// --- Pinia Stores ---
const regionStore = useRegionStore();
const mapDataStore = useMapDataStore(); // 保持导入，以防将来需要
const growthStore = useGrowthStore(); // 如果这个组件不直接使用，可以暂时移除
const medicalLoading = ref(true)
const outData=ref([]);
const inData = ref([]);

// --- 响应式数据 ---
const populationData = ref([]);
const populationLoading = ref(true);
const loadData = () => {
  const mockData = regionStore.outpatientavg[regionStore.getRegionId];
  growthStore.setHistoricalData(mockData);
};
const resultByIdDisplay = computed(() => {
  const data = mapDataStore.inpatientAdmissions; // 获取人口数据


  // 关键校验：确保数据是数组且不为空
  if (Array.isArray(data) && data.length > 0) {
    // 只有数据有效时才调用排名函数
    const result = getValueAndRankById(data, regionStore.getRegionId); // 查找 ID 为 5 的数据及其排名
    if (result) {
      return `住院次数为 ${result.value}, 排名: ${result.rank}`;
    }
  }
  return '数据加载中或无效 ID'; // 数据未加载或 ID 无效时的提示
});
// --- 生命周期钩子与监听器 ---
const resultByIdDisplay2 = computed(() => {
  const data = mapDataStore.outpatientVisitsData; // 获取人口数据


  // 关键校验：确保数据是数组且不为空
  if (Array.isArray(data) && data.length > 0) {
    // 只有数据有效时才调用排名函数
    const result = getValueAndRankById(data, regionStore.getRegionId); // 查找 ID 为 5 的数据及其排名
    if (result) {
      return ` 问诊次数为${result.value}, 排名: ${result.rank}`;
    }
  }
  return '数据加载中或无效 ID'; // 数据未加载或 ID 无效时的提示
});
// 首次挂载时触发数据请求
onMounted(() => {
  loadData();
});

watch(
    () => regionStore.getRegionId, // 侦听 Pinia store 中的 ID
    async (newRegionId) => {
      console.log(`检测到区域变化: ${newRegionId}，准备从 Store 获取数据...`);
      medicalLoading.value = true;
      try {
        // 直接调用 store 的 action，它会处理缓存逻辑
        const data = await regionStore.fetchoutpatientavgIfNeeded(newRegionId);
        outData.value = data;
      } catch (error) {
        console.error("在组件中处理数据获取失败:", error);
        outData.value = [];
      } finally {
        medicalLoading.value = false;
      }
    },
    {
      immediate: true // 立即执行一次，确保组件挂载时就能加载初始数据
    }
);
watch(
    () => regionStore.getRegionId, // 侦听 Pinia store 中的 ID
    async (newRegionId) => {
      console.log(`检测到区域变化: ${newRegionId}，准备从 Store 获取数据...`);
      medicalLoading.value = true;
      try {
        // 直接调用 store 的 action，它会处理缓存逻辑
        const data = await regionStore.fetchoinpatientavgavgIfNeeded(newRegionId);
        inData.value = data;
      } catch (error) {
        console.error("在组件中处理数据获取失败:", error);
        inData.value = [];
      } finally {
        medicalLoading.value = false;
      }
    },
    {
      immediate: true // 立即执行一次，确保组件挂载时就能加载初始数据
    }
);
</script>

<style scoped>
.main-container {
  width: 100%; /* 组件整体占据父容器的 100% 宽度 */
  box-sizing: border-box; /* 边框和内边距包含在宽度内 */
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #90E0EF;

  /* **关键：设置为定位上下文，以便子元素可以相对于它进行绝对定位** */
  position: relative;
  /* 增加最小高度，确保内容在绝对定位时不会导致容器高度坍塌 */
  min-height: 1000px; /* 示例值，根据实际内容和定位需要调整 */
}

/* line-row 和 chart-row 默认是块级元素，会垂直堆叠 */
.Line-row {
  width: 50%; /* 折线图容器占据父容器 main-container 的 50% 宽度 */
  /* height 已经由 MultiLineChart 组件的 prop 控制 */
}

.chart-row {

}

.right-column1 {
  /* **关键：设置为绝对定位，这样 left 和 top 才能生效** */
  position: absolute;

  /* **使用百分比设置位置** */
  left: 57%;   /* 距离父容器左侧 50% 的位置 */
  top: 50%;    /* 距离父容器顶部 70% 的位置 */

  /* **可选：如果希望元素根据自身中心点进行定位，可以使用 transform** */
  /* 例如，left: 50%; transform: translateX(-50%); 会使其水平居中 */
  /* top: 70%; transform: translateY(-50%); 会使其垂直居中于 70% 的位置 */

  /* 示例：调整宽度以适应百分比布局 */
  width: 45%; /* 占据父容器的 45% 宽度 */
  /* 如果内容较少，可以设置最大宽度 */
  max-width: 400px; /* 示例：最大宽度 400px */
}
.card-content-inner-a {
  top:0%;
  width: 50%;
  height: 50%;
  position: absolute;
  left: 50%;

}

/* 您可以通过媒体查询来调整在不同屏幕尺寸下的百分比或定位 */
@media (max-width: 768px) {
  .Line-row {
    width: 95%; /* 在小屏幕上占据更宽的百分比 */
    margin: 0 auto 20px auto; /* 居中并增加间距 */
  }

  .chart-row {
    /* 饼图组件本身是 50%，可能需要一个外层容器来调整整体宽度 */
    /* 或者直接在 PieChart 组件的 width prop 处调整 */
    width: 95%; /* 示例：让饼图容器占据 95% 宽度 */
    margin: 0 auto 20px auto; /* 居中并增加间距 */
  }

  .right-column1 {
    left: 50%;
    top: auto; /* 移除固定的 top，让它在正常流中（如果需要）或设置底部距离 */
    bottom: 20px; /* 示例：在小屏幕上，定位到底部 20px */
    width: 90%; /* 在小屏幕上占据 90% 宽度 */
    transform: translateX(-50%); /* 保持水平居中 */
  }
}
</style>