<template>
  <div class="decision-simulator-container">
    <h1>医疗决策模拟器</h1>
    <hr/>

    <div class="budget-section">
      <h2>经费设定</h2>
      <p>2020年医用支出下限: <strong>{{ decisionStore.initialMedicalExpenseLowerBound.toFixed(2) }} 万元</strong></p>
      <div>
        <label for="upperLimit">设定决策经费上限 (万元): </label>
        <input
            id="upperLimit"
            type="number"
            v-model.number="upperLimitInput"
            :min="decisionStore.initialMedicalExpenseLowerBound"
            @input="updateBudgetUpperLimit"
        />
        <button @click="setBudget" :disabled="!upperLimitInput || upperLimitInput < decisionStore.initialMedicalExpenseLowerBound">设定经费</button>
        <button @click="resetSimulator" class="reset-button" :disabled="!isResetButtonEnabled">一键重置</button>
      </div>
      <p v-if="decisionStore.isBudgetSet">
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

    <hr/>

    <div class="projection-section">
      <h2>数据预测</h2>
      <label for="projectionYear">选择预测年份: </label>
      <input type="number" id="projectionYear" v-model.number="decisionStore.selectedYearForProjection" min="2021" max="2050">
      <p>（基准年份：2020年）</p>
    </div>

    <hr/>

    <div class="metrics-section">
      <h2>各项指标决策</h2>
      <div v-for="(metricName, metricIndex) in decisionStore.METRIC_NAMES" :key="metricIndex" class="metric-card">
        <h3>{{ metricName }}</h3>
        <p>原始增长率: <strong>{{ decisionStore.initialGrowthRates[metricIndex]?.toFixed(2) || 'N/A' }}%</strong></p>
        <p>当前增长率: <strong :style="{ color: (decisionStore.currentGrowthRates[metricIndex] && decisionStore.currentGrowthRates[metricIndex] < 0) ? 'red' : 'green' }">{{ decisionStore.currentGrowthRates[metricIndex]?.toFixed(2) || 'N/A' }}%</strong></p>
        <p>
          预测 {{ decisionStore.selectedYearForProjection }} 年数据:<br>

          原始预测: <strong>{{ decisionStore.projectedDataComparison.original[metricIndex] ? decisionStore.projectedDataComparison.original[metricIndex].toFixed(2) : 'N/A' }}</strong><br>
          <div>
          <span v-if="metricIndex===0">排名：{{getRankOfGivenValue(mapDataStore.institutionData, decisionStore.projectedDataComparison.original[metricIndex].toFixed(2)).rank}}</span>
            <span v-if="metricIndex===1">排名：{{getRankOfGivenValue(mapDataStore.bedData, decisionStore.projectedDataComparison.original[metricIndex].toFixed(2)).rank}}</span>
            <span v-if="metricIndex===2">排名：{{getRankOfGivenValue(mapDataStore.populationData, decisionStore.projectedDataComparison.original[metricIndex].toFixed(2)).rank}}</span>
            <span v-if="metricIndex===3">排名：{{getRankOfGivenValue(mapDataStore.totalCostData, decisionStore.projectedDataComparison.original[metricIndex].toFixed(2)).rank}}</span>
            <span v-if="metricIndex===4">排名：{{getRankOfGivenValue(mapDataStore.personnelData, decisionStore.projectedDataComparison.original[metricIndex].toFixed(2)).rank}}</span>
            <span v-if="metricIndex===5">排名：{{getRankOfGivenValue(mapDataStore.inpatientAdmissions, decisionStore.projectedDataComparison.original[metricIndex].toFixed(2)).rank}}</span>
          </div>
          当前预测: <strong>{{ decisionStore.projectedDataComparison.current[metricIndex] ? decisionStore.projectedDataComparison.current[metricIndex].toFixed(2) : 'N/A' }}</strong>
          <div>
          <span v-if="metricIndex===0">排名：{{getRankOfGivenValue(mapDataStore.institutionData, decisionStore.projectedDataComparison.current[metricIndex].toFixed(2)).rank}}</span>
            <span v-if="metricIndex===1">排名：{{getRankOfGivenValue(mapDataStore.bedData, decisionStore.projectedDataComparison.current[metricIndex].toFixed(2)).rank}}</span>
            <span v-if="metricIndex===2">排名：{{getRankOfGivenValue(mapDataStore.populationData, decisionStore.projectedDataComparison.current[metricIndex].toFixed(2)).rank}}</span>
            <span v-if="metricIndex===3">排名：{{getRankOfGivenValue(mapDataStore.totalCostData, decisionStore.projectedDataComparison.current[metricIndex].toFixed(2)).rank}}</span>
            <span v-if="metricIndex===4">排名：{{getRankOfGivenValue(mapDataStore.personnelData, decisionStore.projectedDataComparison.current[metricIndex].toFixed(2)).rank}}</span>
            <span v-if="metricIndex===5">排名：{{getRankOfGivenValue(mapDataStore.inpatientAdmissions, decisionStore.projectedDataComparison.current[metricIndex].toFixed(2)).rank}}</span>
          </div>
          <span v-if="decisionStore.projectedDataComparison.current[metricIndex] > decisionStore.projectedDataComparison.original[metricIndex]" style="color: green; font-weight: bold;"> (↑ {{ (decisionStore.projectedDataComparison.current[metricIndex] - decisionStore.projectedDataComparison.original[metricIndex]).toFixed(2) }})</span>
          <span v-else-if="decisionStore.projectedDataComparison.current[metricIndex] < decisionStore.projectedDataComparison.original[metricIndex]" style="color: red; font-weight: bold;"> (↓ {{ (decisionStore.projectedDataComparison.original[metricIndex] - decisionStore.projectedDataComparison.current[metricIndex]).toFixed(2) }})</span>
        </p>

        <p class="description">
          **分析描述**: {{ getMetricDescription(metricIndex) }}
        </p>

        <div class="policy-buttons">
          <div v-for="(policyDef, policyIndex) in decisionStore.POLICY_DEFINITIONS_BY_METRIC[metricIndex]" :key="policyDef.id" class="policy-button-group">
            <button
                @click="handlePolicyClick(metricIndex, policyIndex)"
                :disabled="!decisionStore.isPolicyButtonEnabled(metricIndex, policyIndex) || !decisionStore.isBudgetSet || decisionStore.currentRemainingBudget <= 0"
                :class="{
                'policy-p0': policyIndex === 0,
                'policy-p1': policyIndex === 1,
                'policy-p2': policyIndex === 2,
                'policy-p3': policyIndex === 3,
                'policy-p4': policyIndex === 4,
                'policy-p5': policyIndex === 5,
                'is-selected': isPolicySelected(metricIndex, policyIndex)
              }"
                :title="getPolicyDescription(metricIndex, policyIndex)"
            >
              {{ policyDef.name }}
            </button>

            <div v-if="selectedPolicyForSelection.metricIndex === metricIndex && selectedPolicyForSelection.policyIndex === policyIndex && policyDef.affectCount > 1" class="affected-metrics-selector">
              <p>选择额外影响的指标 (共需选择 {{ policyDef.affectCount - 1 }} 个):</p>
              <div class="checkbox-group">
                <label v-for="(otherMetricName, otherMetricIndex) in decisionStore.METRIC_NAMES" :key="otherMetricIndex">
                  <input
                      type="checkbox"
                      :value="otherMetricIndex"
                      v-model="temporaryAffectedMetrics"
                      :disabled="
                                otherMetricIndex === metricIndex ||
                                !policyDef.additionalAffectedPool.includes(otherMetricIndex) ||
                                (temporaryAffectedMetrics.length >= (policyDef.affectCount - 1) && !temporaryAffectedMetrics.includes(otherMetricIndex))
                            "
                  />
                  {{ otherMetricName }}
                </label>
              </div>
              <button @click="confirmApplyPolicy" :disabled="temporaryAffectedMetrics.length !== (policyDef.affectCount - 1)">确认应用</button>
              <button @click="cancelSelection">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr/>

    <div class="report-section">
      <button @click="generateReport">生成决策报告</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useDecisionStore } from '@/stores/useDecisionStore';
import { metricDescriptions } from '@/utils/metricDescriptions'; // 确保路径正确
import {getRankOfGivenValue} from "@/utils/countround.js";
import { useMapDataStore } from '@/stores/TotalData.js';

const decisionStore = useDecisionStore();
const mapDataStore = useMapDataStore();

const upperLimitInput = ref(0);
const currentlyAppliedPolicy = ref(null);
const selectedPolicyForSelection = ref({
  metricIndex: null,
  policyIndex: null,
});
const temporaryAffectedMetrics = ref([]);

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
/* Main container styles */
.decision-simulator-container {
  font-family: 'Arial', sans-serif;
  max-width: 1200px;
  margin: 20px auto;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

h1, h2 {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

hr {
  border: 0;
  height: 1px;
  background-color: #eee;
  margin: 30px 0;
}

/* Section styles */
.budget-section, .projection-section {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Form elements */
label {
  font-weight: bold;
  margin-right: 10px;
}

input[type="number"] {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
  width: 120px;
}

/* Button general styles */
button {
  padding: 10px 15px;
  background-color: #3498db; /* Default blue */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, opacity 0.3s ease, transform 0.2s ease;
}

button:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-1px);
}

/* Disabled button styles */
button:disabled {
  background-color: #cccccc;
  color: #888888;
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
  transform: none;
}

.budget-alert {
  color: #e74c3c;
  font-weight: bold;
  margin-top: 10px;
}

/* Budget progress bar */
.budget-bar-wrapper {
  width: 100%;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 15px;
  border: 1px solid #bbb;
}

.budget-bar {
  height: 100%;
  background-color: #e74c3c; /* Red for used portion */
  width: 0%;
  float: left;
  transition: width 0.5s ease-out;
}

/* Metric display blocks */
.metrics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.metric-card {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
}

.metric-card h3 {
  color: #333;
  margin-top: 0;
  margin-bottom: 15px;
}

.metric-card p {
  margin-bottom: 8px;
  line-height: 1.6;
  font-size: 0.95em;
}

.metric-card strong {
  color: #34495e;
}

.description {
  font-style: italic;
  color: #555;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}

/* Policy button layout */
.policy-buttons {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.policy-button-group {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1 1 auto;
  min-width: 120px;
}

.policy-button-group button {
  width: 100%;
  border: 1px solid transparent;
}

/* Specific policy styles */
.policy-p0 { background-color: #f39c12; } /* Yellow - lowest tier */
.policy-p1 { background-color: #27ae60; } /* Green */
.policy-p2 { background-color: #1abc9c; } /* Teal */
.policy-p3 { background-color: #3498db; } /* Blue */
.policy-p4 { background-color: #9b59b6; } /* Purple */
.policy-p5 { background-color: #e74c3c; } /* Red - highest tier/worst case */

/* Hover effect for enabled policy buttons */
.policy-button-group button:hover:not(:disabled) {
  opacity: 0.8;
}

/* Selected button effect */
.policy-button-group button.is-selected {
  border: 2px solid #ffee00;
  box-shadow: 0 0 10px rgba(255, 255, 0, 0.7), 0 0 5px rgba(255, 255, 0, 0.5);
  transform: scale(1.02);
  transition: all 0.2s ease-in-out;
  font-weight: bold;
  color: #fff;
}

/* 确保选中样式覆盖禁用样式 */
.policy-button-group button:disabled.is-selected {
  border: 2px solid #999;
  box-shadow: none;
  transform: none;
  font-weight: normal;
  color: #ccc;
  background-color: #e0e0e0;
}

/* 重置按钮特定样式 */
.reset-button {
  background-color: #f0ad4e; /* 警告或中性颜色 */
  margin-left: 10px;
}

.reset-button:hover:not(:disabled) {
  background-color: #ec971f;
}

/* 额外受影响指标选择器样式 */
.affected-metrics-selector {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #f0f8ff;
  border: 1px solid #a8dadc;
  border-radius: 8px;
  padding: 15px;
  margin-top: 5px;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 250px;
}

.affected-metrics-selector p {
  margin-bottom: 10px;
  font-weight: bold;
  color: #457b9d;
  font-size: 0.9em;
}

.affected-metrics-selector .checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.affected-metrics-selector label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
  font-size: 0.85em;
  color: #333;
  cursor: pointer;
}

.affected-metrics-selector input[type="checkbox"] {
  transform: scale(1.2);
  cursor: pointer;
}

.affected-metrics-selector button {
  margin-right: 10px;
  padding: 8px 12px;
  font-size: 0.85em;
  width: auto;
}

.affected-metrics-selector button:first-of-type {
  background-color: #28a745;
}
.affected-metrics-selector button:first-of-type:hover:not(:disabled) {
  background-color: #218838;
}

.affected-metrics-selector button:last-of-type {
  background-color: #dc3545;
}
.affected-metrics-selector button:last-of-type:hover:not(:disabled) {
  background-color: #c82333;
}

/* 新增：报告部分样式 */
.report-section {
  margin-top: 30px;
  text-align: center;
}

.report-section button {
  background-color: #28a745; /* 绿色按钮 */
  padding: 12px 25px;
  font-size: 1.1em;
}

.report-section button:hover:not(:disabled) {
  background-color: #218838;
}
</style>