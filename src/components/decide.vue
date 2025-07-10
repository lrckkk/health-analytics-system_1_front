<template>
  <div class="analysis-section">
    <h4>分析结果：</h4>
    <div v-if="currentDescriptions.length > 0" class="description-tags-container">
      <span v-for="(desc, index) in currentDescriptions" :key="index" class="description-tag">
        {{ desc }}
      </span>
    </div>
    <div v-else class="no-descriptions">
      <p>当前无匹配的分析描述。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useAnalysisDataStore } from '@/stores/AnalysisData.js';
import { generateAnalysisMatrix } from '@/utils/analyseMetrics.js'; // 导入通用分析函数
import { metricDescriptions } from '@/utils/metricDescriptions.js'; // 导入描述矩阵

// --- 核心：通过 defineProps 接收 metricIndex ---
// 这个组件现在会从外部接收它需要分析的指标索引
const props = defineProps({
  metricIndex: {
    type: Number,
    required: true // 强烈建议设置为 required，确保父组件总是传递这个关键数据
  }
});

const analysisStore = useAnalysisDataStore();
const currentDescriptions = ref([]); // 存储当前指标的描述

// 从 Pinia Store 获取当前组件负责的指标的增长率和排名数据
// 注意这里使用了 props.metricIndex 来动态获取数据
const currentGrowthRate = computed(() => analysisStore.growthRates[props.metricIndex]);
const currentRankInfo = computed(() => analysisStore.rankInfos[props.metricIndex]);

// 监听组件所负责的指标数据变化，然后进行分析
watch(
    [currentGrowthRate, currentRankInfo],
    ([newGrowth, newRank]) => {
      // 只有当两个数据都有效时才进行分析
      if (newGrowth !== null && newRank !== null) {
        // 调用 generateAnalysisMatrix 函数，传入完整的 Pinia Store 数据数组
        // 因为 generateAnalysisMatrix 需要所有数据来构建完整的分析矩阵
        const fullMatrix = generateAnalysisMatrix(
            analysisStore.growthRates,
            analysisStore.rankInfos
        );

        // 从完整的分析矩阵中，提取本组件（由 props.metricIndex 指定）对应的那一行结果
        const metricRow = fullMatrix[props.metricIndex];

        const extractedDescriptions = [];
        if (metricRow) {
          metricRow.forEach((isMatched, standardIndex) => {
            if (isMatched === 1) {
              // 根据匹配到的标准，从描述矩阵中提取对应的描述文本
              // 这里也使用 props.metricIndex 来选择正确的描述行
              if (metricDescriptions[props.metricIndex] && metricDescriptions[props.metricIndex][standardIndex]) {
                extractedDescriptions.push(metricDescriptions[props.metricIndex][standardIndex]);
              }
            }
          });
        }
        currentDescriptions.value = extractedDescriptions;
        console.log(`指标 ${props.metricIndex} 的描述:`, extractedDescriptions);
      } else {
        currentDescriptions.value = []; // 数据不完整时清空描述
      }
    },
    { immediate: true } // 组件加载时立即执行一次分析
);
</script>

<style scoped>
/* 组件的样式，确保其美观 */
.analysis-section {
  padding: 15px;
  background-color: #f0f8ff;
  border-left: 5px solid #007bff;
  border-radius: 4px;
  margin-top: 10px;
  margin-bottom: 10px;
}

h4 {
  color: #34495e;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1em;
}

.description-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.description-tag {
  background-color: #e0f7fa;
  color: #00796b;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.85em;
  font-weight: 500;
  border: 1px solid #b2ebf2;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  white-space: normal;
  line-height: 1.4;
}

.no-descriptions {
  color: #777;
  font-style: italic;
  font-size: 0.9em;
}
</style>