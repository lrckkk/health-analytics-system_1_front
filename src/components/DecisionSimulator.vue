<template>
  <div class="decision-simulator-container">
    <!-- 新增返回按钮 -->
    <div class="back-button" @click="navigateBack">
      <div class="back-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="back-text">返回</div>
      <div class="button-effects">
        <div class="effect-circle"></div>
        <div class="effect-particles"></div>
      </div>
    </div>

    <h1 class="main-title">医疗决策模拟器</h1>
    <hr class="title-divider"/>

    <div class="budget-section">
      <h2 class="section-title">经费设定</h2>
      <div class="budget-content">
        <p class="budget-info">2020年医用支出下限: <strong>{{ decisionStore.initialMedicalExpenseLowerBound.toFixed(2) }} 万元</strong></p>
        <div class="budget-controls">
          <label for="upperLimit" class="budget-info">设定决策经费上限 (万元): </label>
          <input
              id="upperLimit"
              type="number"
              v-model.number="upperLimitInput"
              :min="decisionStore.initialMedicalExpenseLowerBound"
              @input="updateBudgetUpperLimit"
              class="tech-input"
          />
          <button
              @click="setBudget"
              :disabled="!upperLimitInput || upperLimitInput < decisionStore.initialMedicalExpenseLowerBound"
              class="tech-button"
          >设定经费</button>
          <button
              @click="resetSimulator"
              class="tech-button reset-button"
              :disabled="!isResetButtonEnabled"
          >一键重置</button>
        </div>
        <div v-if="decisionStore.isBudgetSet" class="budget-details">
          <p>
            您的总决策经费: <strong>{{ decisionStore.totalDecisionBudget.toFixed(2) }} 万元</strong><br/>
            当前剩余经费: <strong>{{ decisionStore.currentRemainingBudget.toFixed(2) }} 万元</strong> ({{ decisionStore.remainingBudgetPercentage.toFixed(2) }}%)
          </p>
          <div class="budget-bar-wrapper">
            <div class="budget-bar" :style="{ width: (100 - decisionStore.remainingBudgetPercentage).toFixed(2) + '%' }"></div>
          </div>
          <p v-if="decisionStore.isBudgetSet && decisionStore.currentRemainingBudget <= 0" class="budget-alert">
            经费已用尽，请提升经费上限或停止决策。
          </p>
        </div>
      </div>
    </div>

    <hr class="section-divider"/>

    <div class="projection-section">
      <h2 class="section-title">数据预测</h2>
      <div class="projection-content">
        <label for="projectionYear" class="budget-info">选择预测年份: </label>
        <input
            type="number"
            id="projectionYear"
            v-model.number="decisionStore.selectedYearForProjection"
            min="2021"
            max="2050"
            class="tech-input"
        >
        <p class="base-year">（基准年份：2020年）</p>
      </div>
    </div>

    <hr class="section-divider"/>

    <div class="metrics-section">
      <h2 class="section-title">各项指标决策</h2>
      <div class="metrics-grid">
        <div v-for="(metricName, metricIndex) in decisionStore.METRIC_NAMES" :key="metricIndex" class="metric-card">
          <h3 class="metric-title">{{ metricName }}</h3>
          <div class="metric-data">
            <p style="color: #00e0ff;">原始增长率: <strong>{{ decisionStore.initialGrowthRates[metricIndex]?.toFixed(2) || 'N/A' }}%</strong></p>
            <p style="color: #00e0ff;">当前增长率: <strong :style="{ color: (decisionStore.currentGrowthRates[metricIndex] && decisionStore.currentGrowthRates[metricIndex] < 0) ? '#ff4d4f' : '#52c41a' }">{{ decisionStore.currentGrowthRates[metricIndex]?.toFixed(2) || 'N/A' }}%</strong></p>
            <div class="projection-data" style="color: #00e0ff;">
              <p>
                预测 {{ decisionStore.selectedYearForProjection }} 年数据:<br>
                原始预测: <strong>{{ decisionStore.projectedDataComparison.original[metricIndex] ? decisionStore.projectedDataComparison.original[metricIndex].toFixed(2) : 'N/A' }}</strong><br>
                <span v-if="metricIndex===0">排名：{{getRankOfGivenValue(mapDataStore.institutionData, decisionStore.projectedDataComparison.original[metricIndex].toFixed(2)).rank}}</span>
                <span v-if="metricIndex===1">排名：{{getRankOfGivenValue(mapDataStore.bedData, decisionStore.projectedDataComparison.original[metricIndex].toFixed(2)).rank}}</span>
                <span v-if="metricIndex===2">排名：{{getRankOfGivenValue(mapDataStore.populationData, decisionStore.projectedDataComparison.original[metricIndex].toFixed(2)).rank}}</span>
                <span v-if="metricIndex===3">排名：{{getRankOfGivenValue(mapDataStore.totalCostData, decisionStore.projectedDataComparison.original[metricIndex].toFixed(2)).rank}}</span>
                <span v-if="metricIndex===4">排名：{{getRankOfGivenValue(mapDataStore.personnelData, decisionStore.projectedDataComparison.original[metricIndex].toFixed(2)).rank}}</span>
                <span v-if="metricIndex===5">排名：{{getRankOfGivenValue(mapDataStore.inpatientAdmissions, decisionStore.projectedDataComparison.original[metricIndex].toFixed(2)).rank}}</span>
              </p>
              <p>
                当前预测: <strong>{{ decisionStore.projectedDataComparison.current[metricIndex] ? decisionStore.projectedDataComparison.current[metricIndex].toFixed(2) : 'N/A' }}</strong><br>
                <span v-if="metricIndex===0">排名：{{getRankOfGivenValue(mapDataStore.institutionData, decisionStore.projectedDataComparison.current[metricIndex].toFixed(2)).rank}}</span>
                <span v-if="metricIndex===1">排名：{{getRankOfGivenValue(mapDataStore.bedData, decisionStore.projectedDataComparison.current[metricIndex].toFixed(2)).rank}}</span>
                <span v-if="metricIndex===2">排名：{{getRankOfGivenValue(mapDataStore.populationData, decisionStore.projectedDataComparison.current[metricIndex].toFixed(2)).rank}}</span>
                <span v-if="metricIndex===3">排名：{{getRankOfGivenValue(mapDataStore.totalCostData, decisionStore.projectedDataComparison.current[metricIndex].toFixed(2)).rank}}</span>
                <span v-if="metricIndex===4">排名：{{getRankOfGivenValue(mapDataStore.personnelData, decisionStore.projectedDataComparison.current[metricIndex].toFixed(2)).rank}}</span>
                <span v-if="metricIndex===5">排名：{{getRankOfGivenValue(mapDataStore.inpatientAdmissions, decisionStore.projectedDataComparison.current[metricIndex].toFixed(2)).rank}}</span>
              </p>
              <span
                  v-if="decisionStore.projectedDataComparison.current[metricIndex] > decisionStore.projectedDataComparison.original[metricIndex]"
                  class="change-indicator positive"
              > (↑ {{ (decisionStore.projectedDataComparison.current[metricIndex] - decisionStore.projectedDataComparison.original[metricIndex]).toFixed(2) }})</span>
              <span
                  v-else-if="decisionStore.projectedDataComparison.current[metricIndex] < decisionStore.projectedDataComparison.original[metricIndex]"
                  class="change-indicator negative"
              > (↓ {{ (decisionStore.projectedDataComparison.original[metricIndex] - decisionStore.projectedDataComparison.current[metricIndex]).toFixed(2) }})</span>
            </div>
          </div>

          <p class="metric-description">
            **分析描述**: {{ getMetricDescription(metricIndex) }}
          </p>

          <div class="policy-buttons">
            <div v-for="(policyDef, policyIndex) in decisionStore.POLICY_DEFINITIONS_BY_METRIC[metricIndex]" :key="policyDef.id" class="policy-button-group">
              <button
                  @click="handlePolicyClick(metricIndex, policyIndex)"
                  :disabled="!decisionStore.isPolicyButtonEnabled(metricIndex, policyIndex) || !decisionStore.isBudgetSet || decisionStore.currentRemainingBudget <= 0"
                  :class="[
                    'policy-button',
                    `policy-p${policyIndex}`,
                    { 'is-selected': isPolicySelected(metricIndex, policyIndex) }
                  ]"
                  :title="getPolicyDescription(metricIndex, policyIndex)"
              >
                {{ policyDef.name }}
              </button>

              <div v-if="selectedPolicyForSelection.metricIndex === metricIndex && selectedPolicyForSelection.policyIndex === policyIndex && policyDef.affectCount > 1" class="affected-metrics-selector">
                <p class="selector-title">选择额外影响的指标 (共需选择 {{ policyDef.affectCount - 1 }} 个):</p>
                <div class="checkbox-group">
                  <label v-for="(otherMetricName, otherMetricIndex) in decisionStore.METRIC_NAMES" :key="otherMetricIndex"
                         class="checkbox-label"
                         :class="{
             'disabled': otherMetricIndex === metricIndex ||
                        !policyDef.additionalAffectedPool.includes(otherMetricIndex) ||
                        (temporaryAffectedMetrics.length >= (policyDef.affectCount - 1) &&
                        !temporaryAffectedMetrics.includes(otherMetricIndex))
           }">
                    <input
                        type="checkbox"
                        :value="otherMetricIndex"
                        v-model="temporaryAffectedMetrics"
                        :disabled="
            otherMetricIndex === metricIndex ||
            !policyDef.additionalAffectedPool.includes(otherMetricIndex) ||
            (temporaryAffectedMetrics.length >= (policyDef.affectCount - 1) &&
            !temporaryAffectedMetrics.includes(otherMetricIndex))
          "
                        class="checkbox-input"
                    />
                    <span class="checkbox-text">{{ otherMetricName }}</span>
                    <span class="checkbox-icon"></span>
                  </label>
                </div>
                <div class="selector-buttons">
                  <button @click="confirmApplyPolicy"
                          :disabled="temporaryAffectedMetrics.length !== (policyDef.affectCount - 1)"
                          class="confirm-button">
                    <span style="color: #00e0ff;">确认应用</span>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button @click="cancelSelection" class="cancel-button">
                    <span style="color: #00e0ff;">取消</span>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr class="section-divider"/>

    <div class="report-section">
      <button @click="generateReport" class="report-button">
        <span class="button-text">生成决策报告</span>
        <span class="button-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M8 12L16 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
        <div class="button-hover-effect"></div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useDecisionStore } from '@/stores/useDecisionStore';
import { metricDescriptions } from '@/utils/metricDescriptions'; // 确保路径正确
import {getRankOfGivenValue} from "@/utils/countround.js";
import { useMapDataStore } from '@/stores/TotalData.js';
import router from "@/pages/user/router.js";
const decisionStore = useDecisionStore();
const mapDataStore = useMapDataStore();

const upperLimitInput = ref(0);
const currentlyAppliedPolicy = ref(null);
const selectedPolicyForSelection = ref({
  metricIndex: null,
  policyIndex: null,
});
const temporaryAffectedMetrics = ref([]);
// 新增导航方法
const navigateBack = () => {
  router.push('/text');
};

// 计算属性：启用重置按钮
const isResetButtonEnabled = computed(() => {
  return decisionStore.isBudgetSet && (
      decisionStore.currentRemainingBudget !== decisionStore.totalDecisionBudget ||
      !decisionStore.currentGrowthRates.every((rate, i) => {
        // 处理 parseFloat 可能导致的 NaN 值，通过转换为字符串进行比较
        return (rate?.toFixed(2) || 'N/A') === (decisionStore.initialGrowthRates[i]?.toFixed(2) || 'N/A');
      })
  );
});

// 检查政策按钮是否当前被选中
const isPolicySelected = (metricIndex, policyIndex) => {
  return currentlyAppliedPolicy.value &&
      currentlyAppliedPolicy.value.metricIndex === metricIndex &&
      currentlyAppliedPolicy.value.policyIndex === policyIndex;
};

const updateBudgetUpperLimit = () => {
  // 输入框 v-model 直接处理
};

const setBudget = () => {
  decisionStore.setBudgetUpperLimit(upperLimitInput.value);
  currentlyAppliedPolicy.value = null; // 设置/重置预算时清除已选政策
};

const resetSimulator = () => {
  decisionStore.resetDecisionState();
  currentlyAppliedPolicy.value = null;
  upperLimitInput.value = 0;
};

const getMetricDescription = (metricIndex) => {
  if (!decisionStore.currentAnalysisMatrix || decisionStore.currentAnalysisMatrix.length === 0) {
    return "数据加载中或暂无描述。";
  }

  const row = decisionStore.currentAnalysisMatrix[metricIndex];
  if (!row || row.length === 0) {
    return "该指标的分析数据不可用。";
  }

  let minJ = -1;
  for (let j = 0; j < row.length; j++) {
    if (row[j] === 1) {
      minJ = j;
      break;
    }
  }

  if (minJ !== -1 && metricDescriptions[metricIndex] && metricDescriptions[metricIndex][minJ]) {
    return metricDescriptions[metricIndex][minJ];
  }

  return "暂无描述或数据异常。";
};

const getPolicyDescription = (metricIndex, policyIndex) => {
  const policy = decisionStore.POLICY_DEFINITIONS_BY_METRIC[metricIndex]?.[policyIndex];
  if (!policy) return '未知政策';
  let description = `政策名称: ${policy.name}\n扣费: ${policy.costPercentage}% (基于2020年医用支出)\n增长加成: +${policy.growthAdd}%\n影响指标数量: ${policy.affectCount}`;

  if (policy.affectCount > 1 && policy.additionalAffectedPool) {
    const poolNames = policy.additionalAffectedPool.map(idx => decisionStore.METRIC_NAMES[idx]).join('、');
    description += `\n可额外影响池: ${poolNames}`;
  }
  return description;
};

const handlePolicyClick = (metricIndex, policyIndex) => {
  const policyDef = decisionStore.POLICY_DEFINITIONS_BY_METRIC[metricIndex][policyIndex];

  if (policyDef.affectCount > 1) {
    selectedPolicyForSelection.value = { metricIndex, policyIndex };
    temporaryAffectedMetrics.value = [];
  } else {
    const success = decisionStore.applyPolicy(metricIndex, policyIndex);
    if (success) {
      currentlyAppliedPolicy.value = { metricIndex, policyIndex };
      // 对于 P0/P1 政策，也立即记录
      // 注意：applyPolicy 内部已经有记录逻辑，这里是为了防止在组件层做额外的记录，
      // 但实际上，只要 applyPolicy 成功执行，它就会自己记录。
      // 所以这一段如果已经由 applyPolicy 内部处理，这里可以移除，避免重复记录。
      // 我建议移除这里重复的 push，只依赖 applyPolicy 内部的 push。
      // current code is fine, because applyPolicy only records IF it's successful.
      // So this additional push is actually redundant and should be removed.
      // Let's rely solely on the recording inside applyPolicy.
      // 检查：applyPolicy 方法中已经包含了 appliedPolicyRecords.value.push(...)
      // 所以这里可以省略，避免重复记录
    }
  }
};

const confirmApplyPolicy = () => {
  const { metricIndex, policyIndex } = selectedPolicyForSelection.value;
  // 直接将 additionalAffectedMetrics 传递给 applyPolicy
  const success = decisionStore.applyPolicy(metricIndex, policyIndex, temporaryAffectedMetrics.value);
  if (success) {
    currentlyAppliedPolicy.value = { metricIndex, policyIndex };
  }
  cancelSelection(); // 关闭选择器
};

const cancelSelection = () => {
  selectedPolicyForSelection.value = { metricIndex: null, policyIndex: null };
  temporaryAffectedMetrics.value = [];
};

// --- 新增：生成报告逻辑 ---
const generateReport = () => {
  let reportContent = "===== 医疗决策模拟报告 =====\n\n";

  // 1. 经费设定总结
  reportContent += "--- 经费设定 ---\n";
  reportContent += `2020年医用支出下限: ${decisionStore.initialMedicalExpenseLowerBound?.toFixed(2) || 'N/A'} 万元\n`;
  reportContent += `设定决策经费上限: ${decisionStore.decisionBudgetUpperLimit?.toFixed(2) || 'N/A'} 万元\n`;
  reportContent += `总决策经费: ${decisionStore.totalDecisionBudget?.toFixed(2) || 'N/A'} 万元\n`;
  reportContent += `当前剩余经费: ${decisionStore.currentRemainingBudget?.toFixed(2) || 'N/A'} 万元 (${decisionStore.remainingBudgetPercentage?.toFixed(2) || 'N/A'}%)\n\n`;

  // 2. 预测年份
  reportContent += "--- 数据预测 ---\n";
  reportContent += `选定预测年份: ${decisionStore.selectedYearForProjection} 年\n`;
  reportContent += `（基准年份：2020年）\n\n`;

  // 3. 选定的政策记录
  reportContent += "--- 已选择政策总结 ---\n";
  if (decisionStore.appliedPolicyRecords.length === 0) {
    reportContent += "未应用任何政策。\n\n";
  } else {
    decisionStore.appliedPolicyRecords.forEach((record, index) => {
      reportContent += `政策 ${index + 1}: ${record.policyName}\n`;
      reportContent += `  应用于指标: ${decisionStore.METRIC_NAMES[record.metricIndex]}\n`;
      if (record.additionalAffectedMetrics && record.additionalAffectedMetrics.length > 0) {
        const affectedNames = record.additionalAffectedMetrics.map(idx => decisionStore.METRIC_NAMES[idx]).join('、');
        reportContent += `  额外影响指标: ${affectedNames}\n`;
      }
      // 重新获取政策定义以显示原始的 costPercentage 和 growthAdd
      const policyDef = decisionStore.POLICY_DEFINITIONS_BY_METRIC[record.metricIndex]?.[record.policyIndex];
      if (policyDef) {
        reportContent += `  扣费比例: ${policyDef.costPercentage}%\n`;
        reportContent += `  增长加成: +${policyDef.growthAdd}%\n`;
      }
      reportContent += "\n";
    });
  }
  reportContent += "\n";

  // 4. 各项指标数据对比
  reportContent += "--- 各项指标数据对比 ---\n";
  reportContent += `指标名称 | 2020年基准值 | 原始增长率 | 当前增长率 | 原始 ${decisionStore.selectedYearForProjection}年预测 | 当前 ${decisionStore.selectedYearForProjection}年预测 | 变化量\n`;
  reportContent += `--------|----------|----------|----------|------------------|------------------|-------\n`;

  decisionStore.METRIC_NAMES.forEach((metricName, metricIndex) => {
    const baseValue = decisionStore.base2020Data[metricIndex]?.toFixed(2) || 'N/A';
    const initialRate = decisionStore.initialGrowthRates[metricIndex]?.toFixed(2) || 'N/A';
    const currentRate = decisionStore.currentGrowthRates[metricIndex]?.toFixed(2) || 'N/A';

    const originalProj = decisionStore.projectedDataComparison.original[metricIndex]?.toFixed(2) || 'N/A';
    const currentProj = decisionStore.projectedDataComparison.current[metricIndex]?.toFixed(2) || 'N/A';

    let change = 'N/A';
    const originalNum = decisionStore.projectedDataComparison.original[metricIndex];
    const currentNum = decisionStore.projectedDataComparison.current[metricIndex];

    if (typeof originalNum === 'number' && typeof currentNum === 'number' && !isNaN(originalNum) && !isNaN(currentNum)) {
      const diff = currentNum - originalNum;
      change = `${diff > 0 ? '↑' : (diff < 0 ? '↓' : '')} ${Math.abs(diff).toFixed(2)}`;
    }

    reportContent += `${metricName} | ${baseValue} | ${initialRate}% | ${currentRate}% | ${originalProj} | ${currentProj} | ${change}\n`;
  });
  reportContent += "\n";

  // 5. 生成TXT文件并下载
  const filename = `医疗决策报告_${new Date().toISOString().slice(0,10)}.txt`; // 例如：医疗决策报告_2025-07-10.txt
  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href); // 释放URL对象
};
</script>
<style scoped>
/* 基础样式 */
.decision-simulator-container {
  font-family: 'Inter', sans-serif, 'Microsoft YaHei', 'PingFang SC';
  max-width: 1250px;
  margin: 0 auto;
  padding: 30px;
  background: linear-gradient(135deg, #0a192f 0%, #000a1a 100%);
  border-radius: 10px;
  box-shadow: 0 4px 30px rgba(0, 180, 255, 0.2);
  color: #e0f2f7;
  position: relative;
}

/* 返回按钮样式 - 与test4.vue保持一致 */
.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
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

.back-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  color: #00e0ff;
  transition: all 0.3s ease;
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

/* 标题样式 */
.main-title {
  text-align: center;
  color: #00e0ff;
  font-size: 2.2rem;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(0, 224, 255, 0.5);
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 15px;
}

.main-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00e0ff, transparent);
  border-radius: 3px;
}

.title-divider, .section-divider {
  border: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 224, 255, 0.5), transparent);
  margin: 25px 0;
}

/* 各部分通用样式 */
.section-title {
  text-align: center;
  color: #00e0ff;
  font-size: 1.5rem;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
  width: 100%;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background: rgba(0, 224, 255, 0.7);
}

.budget-section, .projection-section, .metrics-section {
  background: rgba(3, 4, 94, 0.2);
  border-radius: 8px;
  margin-bottom: 30px;
  border: 1px solid rgba(74, 207, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 180, 255, 0.1);
  transition: all 0.3s ease;
}

.budget-section:hover, .projection-section:hover, .metrics-section:hover {
  box-shadow: 0 0 20px rgba(0, 180, 255, 0.2);
  border-color: rgba(74, 207, 255, 0.3);
}

/* 预算部分样式 */
.budget-content {
  max-width: 800px;
  margin: 0 auto;
}

.budget-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
}

.budget-info, .budget-details p {
  margin: 10px 0;
  line-height: 1.6;
  color: #00e0ff;
}

.budget-details {
  margin-top: 20px;
}

.budget-bar-wrapper {
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  margin: 15px 0;
  border: 1px solid rgba(74, 207, 255, 0.3);
}

.budget-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff4d4f, #f5222d);
  width: 0%;
  transition: width 0.5s ease-out, background 0.3s ease;
  position: relative;
  overflow: hidden;
}

.budget-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg,
  rgba(255,255,255,0) 0%,
  rgba(255,255,255,0.3) 50%,
  rgba(255,255,255,0) 100%);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.budget-alert {
  color: #ff4d4f;
  font-weight: bold;
  text-align: center;
  padding: 8px;
  background: rgba(255, 77, 79, 0.1);
  border-radius: 4px;
  border-left: 3px solid #ff4d4f;
  animation: pulseAlert 1.5s infinite;
}

@keyframes pulseAlert {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}

/* 预测部分样式 */
.projection-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.base-year {
  color: #8b949e;
  font-size: 0.9em;
}

/* 指标卡片样式 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.metric-card {
  background: rgba(3, 4, 94, 0.3);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid rgba(74, 207, 255, 0.2);
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 180, 255, 0.2);
  border-color: rgba(74, 207, 255, 0.4);
}

.metric-title {
  color: #00e0ff;
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(74, 207, 255, 0.3);
}

.metric-data {
  margin-bottom: 15px;
}

.metric-data p {
  margin: 8px 0;
}

.projection-data {
  background: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 6px;
  margin: 10px 0;
}

.change-indicator {
  font-weight: bold;
  margin-left: 5px;
}

.positive {
  color: #52c41a;
}

.negative {
  color: #ff4d4f;
}

.metric-description {
  font-style: italic;
  color: #00e0ff;
  font-size: 0.9em;
  padding: 10px 0;
  border-top: 1px dashed rgba(74, 207, 255, 0.3);
}

/* 政策按钮样式 */
.policy-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.policy-button-group {
  position: relative;
  flex: 1 1 auto;
  min-width: 100px;
}

.policy-button {
  width: 100%;
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.policy-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.policy-button:hover:not(:disabled)::before {
  opacity: 1;
}

.policy-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.policy-p0 { background-color: #faad14; } /* 黄色 */
.policy-p1 { background-color: #52c41a; } /* 绿色 */
.policy-p2 { background-color: #13c2c2; } /* 青色 */
.policy-p3 { background-color: #1890ff; } /* 蓝色 */
.policy-p4 { background-color: #722ed1; } /* 紫色 */
.policy-p5 { background-color: #f5222d; } /* 红色 */

.policy-button.is-selected {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #00e0ff;
  animation: pulseSelected 1.5s infinite;
}

@keyframes pulseSelected {
  0% { box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0, 224, 255, 0.7); }
  50% { box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0, 224, 255, 0.9); }
  100% { box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0, 224, 255, 0.7); }
}

/* 受影响指标选择器 - 改进样式 */
.affected-metrics-selector {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  min-width: 280px;
  background: rgba(3, 4, 94, 0.95);
  border: 1px solid rgba(74, 207, 255, 0.5);
  border-radius: 8px;
  padding: 15px;
  margin-top: 5px;
  z-index: 10;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.selector-title {
  color: #00e0ff;
  font-size: 0.95em;
  margin-bottom: 12px;
  font-weight: 500;
  text-align: center;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 15px;
  max-height: 200px;
  overflow-y: auto;
  padding: 5px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85em;
  color: #00e0ff;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  background: rgba(0, 224, 255, 0.05);
  border: 1px solid rgba(74, 207, 255, 0.2);
}

.checkbox-label:hover:not(.disabled) {
  background: rgba(0, 224, 255, 0.1);
  border-color: rgba(74, 207, 255, 0.4);
}

.checkbox-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  color: #8b949e;
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1);
}

.checkbox-input {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid rgba(74, 207, 255, 0.5);
  border-radius: 4px;
  background: transparent;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin: 0;
}

.checkbox-input:checked {
  background: rgba(0, 224, 255, 0.3);
  border-color: #00e0ff;
}

.checkbox-input:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #00e0ff;
  font-size: 12px;
}

.checkbox-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.2);
}

.checkbox-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
}

.checkbox-icon {
  display: none;
}

.selector-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 10px;
}

.confirm-button, .cancel-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  position: relative;
  overflow: hidden;
}

.confirm-button {
  background: linear-gradient(135deg, rgba(0, 224, 255, 0.8) 0%, rgba(24, 144, 255, 0.8) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 180, 255, 0.3);
}

.confirm-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 180, 255, 0.4);
}

.confirm-button:disabled {
  background: rgba(140, 140, 140, 0.5);
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

.confirm-button svg {
  width: 16px;
  height: 16px;
  stroke: currentColor;
}

.cancel-button {
  background: transparent;
  color: #e0f2f7;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.cancel-button svg {
  width: 16px;
  height: 16px;
  stroke: currentColor;
}

/* 输入框样式 */
.tech-input {
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(74, 207, 255, 0.3);
  border-radius: 6px;
  color: #00e0ff;
  transition: all 0.3s ease;
}

.tech-input:focus {
  outline: none;
  border-color: #00e0ff;
  box-shadow: 0 0 0 2px rgba(0, 224, 255, 0.2);
}

/* 按钮样式 */
.tech-button {
  padding: 10px 20px;
  background: rgba(0, 150, 255, 0.2);
  border: 1px solid rgba(74, 207, 255, 0.5);
  border-radius: 6px;
  color: #e0f2f7;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tech-button:hover:not(:disabled) {
  background: rgba(0, 150, 255, 0.4);
  box-shadow: 0 0 10px rgba(0, 224, 255, 0.3);
  transform: translateY(-1px);
}

.tech-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-button {
  background: rgba(255, 150, 0, 0.2);
  border-color: rgba(255, 180, 0, 0.5);
}

.reset-button:hover:not(:disabled) {
  background: rgba(255, 150, 0, 0.4);
  box-shadow: 0 0 10px rgba(255, 180, 0, 0.3);
}
/* 修改报告按钮部分 - 增加上边距和下边距 */
.report-section {
  text-align: center;
  margin-top: 50px;  /* 从原来的30px增加到50px */
  margin-bottom: 30px; /* 新增底部边距保持整齐 */
  position: relative;
  z-index: 1; /* 确保按钮在正常层级 */
}
.report-button {
  position: relative;
  padding: 12px 30px;
  background: linear-gradient(90deg, rgba(0, 224, 255, 0.8) 0%, rgba(125, 95, 255, 0.8) 100%);
  border: none;
  border-radius: 50px;
  color: #0a192f;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 224, 255, 0.4);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
}

.report-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 30px rgba(0, 224, 255, 0.7);
}

.button-text {
  position: relative;
  z-index: 2;
  margin-right: 10px;
}

.button-icon {
  width: 18px;
  height: 18px;
  color: #0a192f;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.button-hover-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  opacity: 0;
  transition: all 0.3s;
  z-index: 1;
}

.report-button:hover .button-hover-effect {
  opacity: 1;
  animation: shine 1.5s infinite;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .decision-simulator-container {
    padding: 20px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .budget-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .checkbox-group {
    grid-template-columns: 1fr;
  }

  .affected-metrics-selector {
    min-width: 100%;
  }
}
</style>