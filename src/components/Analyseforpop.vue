<template>
  <div class="main-container">
    <div class="Line-row">
      <multi-line-chart
          width="100%"
          :chart-data="populationData"
          title="人口统计趋势"
          height="350px"
          :show-data-zoom="true"
          :show-legend="true"
          :smooth="true"
          :loading="populationLoading"
          @provinceChange="handleProvinceChange"
      />
    </div>
    <div class="chart-row">
      <pie-chart
          width="50%"
          :chart-data="marketShareData"
          :title="`人口组成 - ${regionStore.getDisplayRegion}`"
          name-field="company"
          value-field="share"
          height="450px"
          rose-type="radius"
      />
    </div>
    <div class="card-content-inner-a">
      <simpleline
          :chart-data="populationData"
          :title="`人口数量变化趋势 - ${regionStore.getDisplayRegion}`"
          height=440px
          width=50%
          x-field="year"
          y-field="count"
          :loading="medicalLoading"
      />

    </div>
    <div class="right-column1">
      <h1>{{regionStore.selectedRegion}}</h1>
      <p>{{ resultByIdDisplay }}</p>
      <div v-if="growthStore.historicalData['2']?.length > 0">
        <p>平均增长率:
          <span v-if="growthStore.getAverageGrowthRate('2') !== 0">
          {{ (growthStore.getAverageGrowthRate('2') * 100).toFixed(2) }}%
        </span>
          <span v-else>
          数据不足或增长率为零
        </span>
        </p>
        <p v-if="growthStore.getEstimatedNextYearValue('2') !== null">
          估算 {{ growthStore.getNextYear('2') }} 年的值: {{ growthStore.getEstimatedNextYearValue('2')?.toFixed(2) }}
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
import {ref, onMounted, watch, computed} from 'vue';
import { useRegionStore } from '@/stores/RegionData.js'; // 导入区域数据 Pinia Store
import { useMapDataStore } from '@/stores/TotalData.js'; // 导入总数据 Pinia Store (虽然在此组件中未使用其状态，但如果你后续需要，保持导入)
import { provinceIdMap } from '@/utils/mapid.js'; // 导入省份 ID 映射
import { getValueAndRankById, getRankOfGivenValue } from '@/utils/countround.js'; // 如果这些函数在这个组件中不直接使用，可以不导入
import PieChart from "@/components/PieChart.vue";
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

// --- 响应式数据 ---
const populationData = ref([]);
const populationLoading = ref(true);
const loadData = () => {
  const mockData = regionStore.populationDataCache[regionStore.getRegionId];
  // **关键修改：将人口数据缓存存储到 growthStore 的 '2' 号键下**
  growthStore.setHistoricalData('2', mockData);
};
// 假设这些是静态的，或者你会在组件加载后动态更新它们
const marketShareData = ref([
  { company: '儿童（0-14）', share: 16 },
  { company: '青年（14-44）', share: 20 },
  { company: '中年（45-59岁）', share: 20 },
  { company: '中老年（60-74岁', share: 15 },
  { company: '老年（75岁及以上）', share: 9 }
]);

const provinceMapper = new IdToNameMapper(provinceIdMap);

// --- 数据获取函数 ---
const fetchPopulationData = async (provinceIds) => {
  if (!Array.isArray(provinceIds) || provinceIds.length === 0 || provinceIds.some(id => id === undefined || id === null)) {
    console.warn('fetchPopulationData: 无效的省份ID列表，跳过请求。', provinceIds);
    populationData.value = []; // 清空数据或保持现有状态
    populationLoading.value = false;
    return;
  }

  try {
    populationLoading.value = true;
    const requests = provinceIds.map(provinceId =>
        request.get(`/api/provinces/${provinceId}/population/years`)
    );
    const responses = await Promise.all(requests);

    const allData = {};
    responses.forEach((response, index) => {
      const provinceId = provinceIds[index];
      const provinceName = provinceMapper.getName(provinceId) || `省份${provinceId}`; // 提供一个回退名称
      allData[provinceName] = response.map(item => ({
        year: String(item.year),
        population: Number(item.total)
      }));
    });

    populationData.value = mergeProvinceData(allData);
  } catch (error) {
    console.error('获取人口数据失败:', error);
    populationData.value = []; // 错误时清空数据
  } finally {
    populationLoading.value = false;
  }
};

const mergeProvinceData = (dataByProvince) => {
  const result = [];
  // 获取所有省份的所有年份，并去重排序
  const allYears = [...new Set(
      Object.values(dataByProvince).flatMap(data => data.map(item => item.year))
  )].sort();

  allYears.forEach(year => {
    const yearData = { year };
    Object.entries(dataByProvince).forEach(([provinceName, data]) => {
      const item = data.find(d => d.year === year);
      yearData[provinceName] = item ? item.population : null;
    });
    result.push(yearData);
  });

  return result;
};

// --- 事件处理函数 ---
const handleProvinceChange = async (selectedProvinceIds) => {
  // 如果 MultiLineChart 传回的 selectedProvinceIds 为空，你可以决定默认行为
  // 例如，继续显示当前区域的数据，或者显示一个预设的默认省份数据
  let finalProvinceIds = selectedProvinceIds;
  if (!selectedProvinceIds || selectedProvinceIds.length === 0) {
    // 假设 regionStore.getRegionId 是一个有效的默认ID
    // 并且它在 regionStore 中被可靠地初始化了
    if (regionStore.getRegionId) {
      finalProvinceIds = [regionStore.getRegionId];
    } else {
      // 没有任何有效ID，可能需要提供一个硬编码的默认值，或者显示空数据
      console.warn("没有选择省份，且 regionStore.getRegionId 也无效。");
      populationData.value = [];
      populationLoading.value = false;
      return;
    }
  }
  await fetchPopulationData(finalProvinceIds);
};

const resultByIdDisplay = computed(() => {
  const data = mapDataStore.populationData; // 获取人口数据
  console.log(data)
  // 关键校验：确保数据是数组且不为空
  if (Array.isArray(data) && data.length > 0) {
    // 只有数据有效时才调用排名函数
    const result = getValueAndRankById(data, regionStore.getRegionId); // 查找 ID 为 5 的数据及其排名
    if (result) {
      return `人口总数: ${result.value}万人, 排名: ${result.rank}`;
    }
  }
  return '数据加载中或无效 ID'; // 数据未加载或 ID 无效时的提示
});
// --- 生命周期钩子与监听器 ---

// 首次挂载时触发数据请求
onMounted(() => {
  // 确保 regionStore.getRegionId 此时已经有一个值
  // 如果它是一个异步设置的，那么这里可能还是默认值。
  // watch 钩子会处理后续的变化。
  loadData();
  if (regionStore.getRegionId) {
    fetchPopulationData([regionStore.getRegionId]);
  } else {
    console.warn("onMounted: regionStore.getRegionId 初始为 undefined/null，等待 watch 监听变化。");
    // 如果 regionStore.getRegionId 初始为空，此处不发送请求，等待 watch 触发
  }
});

// 监听 regionStore.getRegionId 的变化
// immediate: true 会在组件挂载后立即执行一次回调，无论值是否变化。
// 这可以捕获到 regionStore.getRegionId 首次变为有效值的情况。
watch(() => regionStore.getRegionId, (newId) => {
  // 只有当 newId 是一个有效值且与当前显示的数据不完全相同时才触发请求
  // 这里简化处理，只要 newId 有效就触发
  if (newId !== undefined && newId !== null) {
    fetchPopulationData([newId]);
  }
}, { immediate: true }); // 确保在组件加载时立即执行一次，检查 getRegionId
watch(
    () => regionStore.getRegionId, // 侦听 Pinia store 中的 ID
    async (newRegionId) => {
      console.log(`检测到区域变化: ${newRegionId}，准备从 Store 获取数据...`);
      medicalLoading.value = true;
      try {
        // 直接调用 store 的 action，它会处理缓存逻辑
        const data = await regionStore.fetchPopulationDataIfNeeded(newRegionId);
        populationData.value = data;
        // **关键修改：将从 fetchPopulationDataIfNeeded 获取的数据存储到 growthStore 的 '2' 号键下**
        growthStore.setHistoricalData('2', data);
      } catch (error) {
        console.error("在组件中处理数据获取失败:", error);
        populationData.value = [];
        growthStore.setHistoricalData('2', []); // 错误时清空 '2' 键的数据
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
  width: 100%; /* 确保填满父容器 */
  height: 50%; /* 确保填满父容器的高度 */
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