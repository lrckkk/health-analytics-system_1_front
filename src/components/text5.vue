<template>
  <div>
    <button @click="runAnalysis">运行数据分析</button>

    <div v-if="analysisMatrix.length > 0">
      <h3>分析矩阵结果 (6x6)</h3>
      <div v-for="(row, rowIndex) in analysisMatrix" :key="'row-' + rowIndex">
        指标 {{ getMetricName(rowIndex) }}: [{{ row.join(', ') }}]
      </div>

      <hr>

      <h3>分析描述</h3>
      <div v-if="analysisDescriptions.length > 0">
        <ul v-for="(descriptions, metricIndex) in analysisDescriptions" :key="'desc-group-' + metricIndex">
          <li v-if="descriptions.length > 0">
            <strong>{{ getMetricName(metricIndex) }}:</strong>
            <ul>
              <li v-for="(desc, descIndex) in descriptions" :key="'desc-' + metricIndex + '-' + descIndex">
                {{ desc }}
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div v-else>
        <p>没有匹配的分析描述。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAnalysisDataStore } from '@/stores/AnalysisData.js';
import { generateAnalysisMatrix } from '@/utils/analyseMetrics.js'; // 导入分析函数
import { metricDescriptions } from '@/utils/metricDescriptions.js'; // 导入描述矩阵

const analysisStore = useAnalysisDataStore();
const analysisMatrix = ref([]); // 存储生成的分析矩阵
const analysisDescriptions = ref([]); // 存储提取出的描述文本

// 定义指标名称的映射，方便显示和查找
const metricNames = [
  "医疗机构数", "病床数", "人口", "医疗费用", "医疗人员数量", "问诊人数"
];

const getMetricName = (index) => metricNames[index];

// 运行分析的函数 (与之前相同)
const runAnalysis = () => {
  if (analysisStore.growthRates.every(val => val !== null) &&
      analysisStore.rankInfos.every(val => val !== null)) {

    analysisMatrix.value = generateAnalysisMatrix(
        analysisStore.growthRates,
        analysisStore.rankInfos
    );
    console.log('生成的分析矩阵:', analysisMatrix.value);

    // 生成矩阵后，立即提取描述
    extractDescriptions();
  } else {
    console.warn('数据未完全加载，无法进行分析。');
    analysisMatrix.value = []; // 清空之前的矩阵
    analysisDescriptions.value = []; // 清空之前的描述
  }
};

// 新增函数：根据 analysisMatrix 提取描述
const extractDescriptions = () => {
  const extracted = [];
  analysisMatrix.value.forEach((row, metricIndex) => {
    const descriptionsForThisMetric = [];
    row.forEach((isMatched, standardIndex) => {
      if (isMatched === 1) {
        // 从导入的 metricDescriptions 矩阵中提取对应描述
        if (metricDescriptions[metricIndex] && metricDescriptions[metricIndex][standardIndex]) {
          descriptionsForThisMetric.push(metricDescriptions[metricIndex][standardIndex]);
        }
      }
    });
    // 为每个指标存储其匹配的所有描述
    extracted.push(descriptionsForThisMetric);
  });
  analysisDescriptions.value = extracted;
  console.log('提取的描述:', analysisDescriptions.value);
};

// 监听 Pinia Store 中数据的变化，自动触发分析 (与之前相同)
watch(
    () => [analysisStore.growthRates, analysisStore.rankInfos],
    ([newGrowthRates, newRankInfos]) => {
      if (newGrowthRates.every(val => val !== null) && newRankInfos.every(val => val !== null)) {
        runAnalysis();
      }
    },
    { deep: true, immediate: true }
);

// 注意：这里省略了其他的 Pinia store 导入和数据加载逻辑，
// 请确保您的组件中包含了这些必要的依赖和数据流。
</script>