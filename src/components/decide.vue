<template>
  <div class="analysis-section">
    <h4 class="analysis-title">分析结果：</h4>
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
import { generateAnalysisMatrix } from '@/utils/analyseMetrics.js';
import { metricDescriptions } from '@/utils/metricDescriptions.js';

const props = defineProps({
  metricIndex: {
    type: Number,
    required: true
  }
});

const analysisStore = useAnalysisDataStore();
const currentDescriptions = ref([]);

const currentGrowthRate = computed(() => analysisStore.growthRates[props.metricIndex]);
const currentRankInfo = computed(() => analysisStore.rankInfos[props.metricIndex]);

watch(
    [currentGrowthRate, currentRankInfo],
    ([newGrowth, newRank]) => {
      if (newGrowth !== null && newRank !== null) {
        const fullMatrix = generateAnalysisMatrix(
            analysisStore.growthRates,
            analysisStore.rankInfos
        );

        const metricRow = fullMatrix[props.metricIndex];

        const extractedDescriptions = [];
        if (metricRow) {
          metricRow.forEach((isMatched, standardIndex) => {
            if (isMatched === 1) {
              if (metricDescriptions[props.metricIndex] && metricDescriptions[props.metricIndex][standardIndex]) {
                extractedDescriptions.push(metricDescriptions[props.metricIndex][standardIndex]);
              }
            }
          });
        }
        currentDescriptions.value = extractedDescriptions;
      } else {
        currentDescriptions.value = [];
      }
    },
    { immediate: true }
);
</script>

<style scoped>
.analysis-section {
  padding: 20px;
  background: rgba(16, 26, 60, 0.9);
  border-radius: 8px;
  border: 1px solid rgba(74, 207, 255, 0.3);
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.2);
  color: #e0f2f7;
}

.analysis-title {
  color: #00e0ff;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2em;
  text-shadow: 0 0 8px rgba(0, 224, 255, 0.3);
  border-bottom: 1px solid rgba(74, 207, 255, 0.2);
  padding-bottom: 8px;
}

.description-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.description-tag {
  background: rgba(0, 224, 255, 0.1);
  color: #00e0ff;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9em;
  border: 1px solid rgba(0, 224, 255, 0.3);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.description-tag:hover {
  background: rgba(0, 224, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 224, 255, 0.2);
}

.no-descriptions {
  color: rgba(224, 242, 247, 0.7);
  font-style: italic;
  font-size: 0.95em;
}
</style>

