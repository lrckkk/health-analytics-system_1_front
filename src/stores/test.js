// src/stores/useDecisionStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// ==============================================================================
// ** 重要提示：请将以下 MOCK_ 数据替换为你的真实数据和业务逻辑 **
// 这些是占位符值，以便模拟器能够直接运行。
// ==============================================================================

// 假设这是从你的数据源获取的2020年医用支出下限 (万元)
const MOCK_2020_MEDICAL_EXPENSE_LOWER_BOUND = 5000;

// 假设这是你的各项指标在2020年的初始基准数据 (用于预测计算)
const MOCK_2020_BASE_DATA = [
    100, // 医疗机构数
    200, // 病床数
    300, // 人口
    400, // 医疗费用
    500, // 医疗人员数量
    600  // 问诊人数
];

// 假设这是你的各项指标在2020年的初始增长率 (%)
const MOCK_INITIAL_GROWTH_RATES = [2.21, 4.91, 0.09, 12.55, 2.21, 0.77];

// 各项指标的名称，用于界面显示
const METRIC_NAMES = ["医疗机构数", "病床数", "人口", "医疗费用", "医疗人员数量", "问诊人数"];

/**
 * 政策效果和名称定义
 * 结构：POLICY_DEFINITIONS_BY_METRIC[metricIndex][policyIndex]
 * - id: 唯一ID，例如 'M0P0' (Metric 0 Policy 0)
 * - name: 政策的独有名称，显示在按钮上
 * - costPercentage: 扣费百分比 (0-100)，基于 initialMedicalExpenseLowerBound 计算
 * - growthAdd: 增长率加成 (例如 2 代表 +2%)
 * - affectCount: 影响的指标总数量 (自身 + 额外影响数量)。例如 affectCount: 2 表示影响自身 + 1个额外指标。
 * - additionalAffectedPool: Array<number> 可选。对于 affectCount > 1 的政策，定义该政策可额外影响的指标索引池。
 * 用户只能从这个池子中选择额外的受影响指标。
 */
const POLICY_DEFINITIONS_BY_METRIC = {
    0: [ // 医疗机构数 (Metric 0)
        { id: 'M0P0', name: '机构-基础维护', costPercentage: 30, growthAdd: 2.0, affectCount: 1 },
        { id: 'M0P1', name: '机构-小幅扩建', costPercentage: 26, growthAdd: 3.6, affectCount: 1 },
        { id: 'M0P2', name: '机构-中型升级', costPercentage: 22, growthAdd: 5.2, affectCount: 2, additionalAffectedPool: [1, 4] }, // 关联病床数, 医疗人员数
        { id: 'M0P3', name: '机构-区域布局优化', costPercentage: 18, growthAdd: 6.8, affectCount: 2, additionalAffectedPool: [1, 3] }, // 关联病床数, 医疗费用
        { id: 'M0P4', name: '机构-智慧化转型', costPercentage: 14, growthAdd: 8.4, affectCount: 3, additionalAffectedPool: [1, 4, 5] }, // 关联病床数, 医疗人员数, 问诊人数
        { id: 'M0P5', name: '机构-医联体建设', costPercentage: 10, growthAdd: 10.0, affectCount: 3, additionalAffectedPool: [1, 3, 5] } // 关联病床数, 医疗费用, 问诊人数
    ],
    1: [ // 病床数 (Metric 1)
        { id: 'M1P0', name: '病床-日常维保', costPercentage: 30, growthAdd: 2.0, affectCount: 1 },
        { id: 'M1P1', name: '病床-微调增设', costPercentage: 26, growthAdd: 3.6, affectCount: 1 },
        { id: 'M1P2', name: '病床-专科增容', costPercentage: 22, growthAdd: 5.2, affectCount: 2, additionalAffectedPool: [0, 5] }, // 关联机构数, 问诊人数
        { id: 'M1P3', name: '病床-效率提升', costPercentage: 18, growthAdd: 6.8, affectCount: 2, additionalAffectedPool: [3, 4] }, // 关联医疗费用, 医疗人员数
        { id: 'M1P4', name: '病床-ICU扩建', costPercentage: 14, growthAdd: 8.4, affectCount: 3, additionalAffectedPool: [0, 4, 5] }, // 关联机构数, 医疗人员数, 问诊人数
        { id: 'M1P5', name: '病床-智慧病房', costPercentage: 10, growthAdd: 10.0, affectCount: 3, additionalAffectedPool: [0, 3, 5] } // 关联机构数, 医疗费用, 问诊人数
    ],
    2: [ // 人口 (Metric 2)
        { id: 'M2P0', name: '人口-基础监测', costPercentage: 30, growthAdd: 2.0, affectCount: 1 },
        { id: 'M2P1', name: '人口-结构优化', costPercentage: 26, growthAdd: 3.6, affectCount: 1 },
        { id: 'M2P2', name: '人口-人才引进', costPercentage: 22, growthAdd: 5.2, affectCount: 2, additionalAffectedPool: [3, 4] }, // 关联医疗费用, 医疗人员数
        { id: 'M2P3', name: '人口-生育支持', costPercentage: 18, growthAdd: 6.8, affectCount: 2, additionalAffectedPool: [3, 5] }, // 关联医疗费用, 问诊人数
        { id: 'M2P4', name: '人口-公共卫生普及', costPercentage: 14, growthAdd: 8.4, affectCount: 3, additionalAffectedPool: [0, 1, 5] }, // 关联机构数, 病床数, 问诊人数
        { id: 'M2P5', name: '人口-宜居环境建设', costPercentage: 10, growthAdd: 10.0, affectCount: 3, additionalAffectedPool: [0, 3, 4] } // 关联机构数, 医疗费用, 医疗人员数
    ],
    3: [ // 医疗费用 (Metric 3)
        { id: 'M3P0', name: '费用-基础保障', costPercentage: 30, growthAdd: 2.0, affectCount: 1 },
        { id: 'M3P1', name: '费用-微调控费', costPercentage: 26, growthAdd: 3.6, affectCount: 1 },
        { id: 'M3P2', name: '费用-结构优化', costPercentage: 22, growthAdd: 5.2, affectCount: 2, additionalAffectedPool: [0, 1] }, // 关联机构数, 病床数
        { id: 'M3P3', name: '费用-效率提升', costPercentage: 18, growthAdd: 6.8, affectCount: 2, additionalAffectedPool: [4, 5] }, // 关联医疗人员数, 问诊人数
        { id: 'M3P4', name: '费用-医保改革', costPercentage: 14, growthAdd: 8.4, affectCount: 3, additionalAffectedPool: [0, 1, 5] }, // 关联机构数, 病床数, 问诊人数
        { id: 'M3P5', name: '费用-创新支付', costPercentage: 10, growthAdd: 10.0, affectCount: 3, additionalAffectedPool: [0, 4, 5] } // 关联机构数, 医疗人员数, 问诊人数
    ],
    4: [ // 医疗人员数量 (Metric 4)
        { id: 'M4P0', name: '人员-基础培训', costPercentage: 30, growthAdd: 2.0, affectCount: 1 },
        { id: 'M4P1', name: '人员-技能提升', costPercentage: 26, growthAdd: 3.6, affectCount: 1 },
        { id: 'M4P2', name: '人员-招聘激励', costPercentage: 22, growthAdd: 5.2, affectCount: 2, additionalAffectedPool: [0, 1] }, // 关联机构数, 病床数
        { id: 'M4P3', name: '人员-待遇改善', costPercentage: 18, growthAdd: 6.8, affectCount: 2, additionalAffectedPool: [3, 5] }, // 关联医疗费用, 问诊人数
        { id: 'M4P4', name: '人员-人才梯队建设', costPercentage: 14, growthAdd: 8.4, affectCount: 3, additionalAffectedPool: [0, 1, 5] }, // 关联机构数, 病床数, 问诊人数
        { id: 'M4P5', name: '人员-职称晋升改革', costPercentage: 10, growthAdd: 10.0, affectCount: 3, additionalAffectedPool: [0, 3, 5] } // 关联机构数, 医疗费用, 问诊人数
    ],
    5: [ // 问诊人数 (Metric 5)
        { id: 'M5P0', name: '问诊-基础服务', costPercentage: 30, growthAdd: 2.0, affectCount: 1 },
        { id: 'M5P1', name: '问诊-流程优化', costPercentage: 26, growthAdd: 3.6, affectCount: 1 },
        { id: 'M5P2', name: '问诊-线上预约', costPercentage: 22, growthAdd: 5.2, affectCount: 2, additionalAffectedPool: [0, 1] }, // 关联机构数, 病床数
        { id: 'M5P3', name: '问诊-社区义诊', costPercentage: 18, growthAdd: 6.8, affectCount: 2, additionalAffectedPool: [2, 3] }, // 关联人口, 医疗费用
        { id: 'M5P4', name: '问诊-特色科室推广', costPercentage: 14, growthAdd: 8.4, affectCount: 3, additionalAffectedPool: [0, 1, 4] }, // 关联机构数, 病床数, 医疗人员数
        { id: 'M5P5', name: '问诊-健康教育普及', costPercentage: 10, growthAdd: 10.0, affectCount: 3, additionalAffectedPool: [0, 2, 4] } // 关联机构数, 人口, 医疗人员数
    ]
};


export const useDecisionStore = defineStore('decision', () => {
    // --- 状态 (State) ---
    const initialMedicalExpenseLowerBound = ref(MOCK_2020_MEDICAL_EXPENSE_LOWER_BOUND);
    const decisionBudgetUpperLimit = ref(0);   // 决策者设定的上限
    const currentRemainingBudget = ref(0);     // 当前剩余的预算
    const isBudgetSet = ref(false);            // 标记预算是否已设定

    // 保留一份原始的增长率，不会被政策修改
    const initialGrowthRates = ref([...MOCK_INITIAL_GROWTH_RATES]);
    // 实时更新的增长率，会因为政策应用而改变
    const currentGrowthRates = ref([...MOCK_INITIAL_GROWTH_RATES]);

    // 用于数据预测的年份
    const selectedYearForProjection = ref(2025); // 默认预测到2025年

    // 存储当前省份的分析矩阵 (从 useAnalysisDataStore 获取)
    // 假设这是从 useAnalysisDataStore 获取的示例矩阵，你需要替换为实际数据
    const currentAnalysisMatrix = ref([
        [0, 1, 0, 0, 0, 0], // 指标 0
        [1, 0, 0, 0, 0, 0], // 指标 1
        [0, 0, 1, 0, 0, 0], // 指标 2
        [1, 0, 0, 0, 0, 0], // 指标 3
        [0, 1, 0, 0, 0, 0], // 指标 4
        [0, 1, 0, 0, 0, 0]  // 指标 5
    ]);


    // --- 计算属性 (Getters) ---

    // 计算总决策经费
    const totalDecisionBudget = computed(() => {
        if (!isBudgetSet.value) return 0;
        return decisionBudgetUpperLimit.value - initialMedicalExpenseLowerBound.value;
    });

    // 计算剩余经费百分比 (相对于总决策经费，不是医用支出下限)
    const remainingBudgetPercentage = computed(() => {
        if (!totalDecisionBudget.value || totalDecisionBudget.value === 0) return 0;
        return (currentRemainingBudget.value / totalDecisionBudget.value) * 100;
    });

    // 判断特定按钮是否可用
    // metricIndex: 0-5 (六个指标)
    // policyIndex: 0-5 (P0-P5)
    const isPolicyButtonEnabled = computed(() => (metricIndex, policyIndex) => {
        // 1. 检查预算是否已设定
        if (!isBudgetSet.value) return false;

        // 2. 检查是否有剩余经费 (根据该政策的扣费)
        const policyDef = POLICY_DEFINITIONS_BY_METRIC[metricIndex][policyIndex];
        const policyCost = policyDef.costPercentage / 100 * initialMedicalExpenseLowerBound.value;
        if (currentRemainingBudget.value < policyCost) return false;

        // 3. 根据 minJ 规则检查政策可用性
        const row = currentAnalysisMatrix.value[metricIndex];
        let minJ = -1; // 代表该指标的“最差”（最高索引）情况等级
        for (let j = 0; j < row.length; j++) {
            if (row[j] === 1) {
                minJ = j; // 找到列索引（情况等级）
                break;
            }
        }

        if (minJ === -1) { // 如果该行全是0（正常数据下不应发生）
            return false;
        } else if (minJ === 0) { // 最好情况（minJ = 0），只能用 P0
            return policyIndex === 0;
        } else if (minJ === 5) { // 最差情况（minJ = 5），P0 到 P5 都可用
            return true;
        } else { // minJ 在 1 到 4 之间，PminJ 到 P5 可用
            return policyIndex >= minJ;
        }
    });

    // 计算预测数据，同时返回原始预测和当前（应用政策后）预测
    const projectedDataComparison = computed(() => {
        const projectionYear = selectedYearForProjection.value;
        const baseYear = 2020;
        const yearsToProject = projectionYear - baseYear;

        // 原始预测：基于初始增长率
        const originalProjections = initialGrowthRates.value.map((growthRate, index) => {
            // 简单复利计算： 初始值 * (1 + 增长率/100)^年数
            return MOCK_2020_BASE_DATA[index] * Math.pow(1 + growthRate / 100, yearsToProject);
        });

        // 当前预测：基于当前（可能已受政策影响）增长率
        const currentProjections = currentGrowthRates.value.map((growthRate, index) => {
            return MOCK_2020_BASE_DATA[index] * Math.pow(1 + growthRate / 100, yearsToProject);
        });

        return {
            original: originalProjections,
            current: currentProjections
        };
    });

    // --- 操作 (Actions) ---

    /**
     * 设置决策经费上限
     * @param {number} newLimit 决策者输入的经费上限金额
     */
    function setBudgetUpperLimit(newLimit) {
        if (newLimit >= initialMedicalExpenseLowerBound.value) {
            decisionBudgetUpperLimit.value = newLimit;
            currentRemainingBudget.value = newLimit - initialMedicalExpenseLowerBound.value;
            isBudgetSet.value = true;
        } else {
            alert("经费上限必须大于或等于2020年医用支出下限！");
            isBudgetSet.value = false;
            decisionBudgetUpperLimit.value = 0;
            currentRemainingBudget.value = 0;
        }
    }

    /**
     * 选择预测年份
     * @param {number} year 目标预测年份
     */
    function selectProjectionYear(year) {
        selectedYearForProjection.value = year;
    }

    /**
     * 应用某个政策
     * @param {number} metricIndex 当前指标的索引 (0-5)
     * @param {number} policyIndex 政策的索引 (0-5, 对应 P0-P5)
     * @param {Array<number>} [additionalAffectedMetricIndices=[]] - 额外影响的指标索引数组
     * @returns {boolean} - true 表示政策应用成功，false 表示失败
     */
    function applyPolicy(metricIndex, policyIndex, additionalAffectedMetricIndices = []) {
        const policyDef = POLICY_DEFINITIONS_BY_METRIC[metricIndex][policyIndex];

        // 1. 检查按钮是否可用 (再次检查，防止直接调用)
        if (!isPolicyButtonEnabled.value(metricIndex, policyIndex)) {
            console.warn(`政策 P${policyIndex} ('${policyDef.name}') for metric ${METRIC_NAMES[metricIndex]} 不可用或经费不足。`);
            return false;
        }

        // 2. 验证额外影响指标的数量和来源
        if (policyDef.affectCount > 1) { // P2-P5 政策需要额外选择
            const requiredCount = policyDef.affectCount - 1; // 需要额外选择的指标数量
            // 数量检查
            if (additionalAffectedMetricIndices.length !== requiredCount) {
                console.error(`政策 P${policyIndex} ('${policyDef.name}') 对 ${METRIC_NAMES[metricIndex]} 需选择 ${requiredCount} 个额外影响指标，但实际选择了 ${additionalAffectedMetricIndices.length} 个。`);
                return false;
            }
            // 确保没有选择自身，也没有重复选择
            const combinedAffected = new Set([metricIndex, ...additionalAffectedMetricIndices]);
            if (combinedAffected.size !== policyDef.affectCount) {
                console.error(`无效的额外影响指标选择：包含自身或重复选择。`);
                return false;
            }
            // 检查所选指标是否都在 policyDef.additionalAffectedPool 中
            const pool = policyDef.additionalAffectedPool || []; // 如果没有定义池，则视为空
            const isValidSelection = additionalAffectedMetricIndices.every(idx => pool.includes(idx));
            if (!isValidSelection) {
                console.error(`所选额外影响指标不在该政策的允许范围内。`);
                return false;
            }

        } else if (additionalAffectedMetricIndices.length > 0) { // P0, P1 不应有额外影响
            console.warn(`政策 P${policyIndex} ('${policyDef.name}') 对 ${METRIC_NAMES[metricIndex]} 不影响额外指标。已忽略提供的额外指标。`);
            additionalAffectedMetricIndices = [];
        }


        // 3. 扣除经费
        const costAmount = policyDef.costPercentage / 100 * initialMedicalExpenseLowerBound.value;
        currentRemainingBudget.value -= costAmount;

        // 4. 应用增长率加成
        // 克隆一份增长率数组以进行修改，确保响应式更新
        const newGrowthRates = [...currentGrowthRates.value];
        newGrowthRates[metricIndex] += policyDef.growthAdd; // 对自身指标的加成

        // 对额外影响指标的加成
        if (policyDef.affectCount > 1) {
            additionalAffectedMetricIndices.forEach(idx => {
                // ** 重要提示：这里可以根据业务需求，为每个政策和被影响指标定义不同的影响比例 **
                newGrowthRates[idx] += policyDef.growthAdd * 0.5; // 示例：假设对其他指标影响是自身的一半
            });
        }
        currentGrowthRates.value = newGrowthRates; // 更新响应式状态

        console.log(`应用于指标 ${METRIC_NAMES[metricIndex]} 的政策: ${policyDef.name}。 扣费: ${costAmount.toFixed(2)}。 新增长率: ${currentGrowthRates.value}`);
        console.log(`受影响指标: ${METRIC_NAMES[metricIndex]}${additionalAffectedMetricIndices.length > 0 ? ', ' + additionalAffectedMetricIndices.map(idx => METRIC_NAMES[idx]).join(', ') : ''}`);
        return true; // 返回 true 表示应用成功
    }

    /**
     * 重置所有决策状态：返还经费，重置增长率，取消所有政策选中
     */
    function resetDecisionState() {
        // 重置预算相关
        decisionBudgetUpperLimit.value = 0;
        currentRemainingBudget.value = 0;
        isBudgetSet.value = false;

        // 重置增长率到初始状态
        currentGrowthRates.value = [...initialGrowthRates.value];

        // 重置预测年份 (如果需要)
        selectedYearForProjection.value = 2025;

        // 如果 currentAnalysisMatrix 会动态变化，这里也需要从 AnalysisData Store 重新获取或重置
        // currentAnalysisMatrix.value = [...YOUR_INITIAL_ANALYSIS_MATRIX_HERE];

        // 注意：按钮的“选中”状态 (currentlyAppliedPolicy) 是在组件中维护的，
        // 这里不需要直接操作，因为组件会监听 isBudgetSet 的变化并清空选中。
        console.log("所有决策状态已重置。");
    }


    // 暴露给外部的状态和方法
    return {
        initialMedicalExpenseLowerBound,
        decisionBudgetUpperLimit,
        currentRemainingBudget,
        isBudgetSet,
        initialGrowthRates,
        currentGrowthRates,
        selectedYearForProjection,
        currentAnalysisMatrix, // 需要在组件中根据实际的 analysisStore.fullAnalysisMatrix 更新
        METRIC_NAMES, // 暴露指标名称
        POLICY_DEFINITIONS_BY_METRIC, // 暴露政策定义

        totalDecisionBudget,
        remainingBudgetPercentage,
        isPolicyButtonEnabled,
        projectedDataComparison, // 暴露对比数据

        setBudgetUpperLimit,
        selectProjectionYear,
        applyPolicy,
        resetDecisionState // 确保这个 action 被暴露
    };
});