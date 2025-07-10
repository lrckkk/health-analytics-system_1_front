import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAnalysisDataStore } from '@/stores/AnalysisData.js';
import { useRegionStore } from '@/stores/RegionData.js';
import { useMapDataStore } from '@/stores/TotalData.js';

// --- 模拟数据（作为回退值或初始值）---
// 这些值在实际数据加载后将被覆盖。
const MOCK_2020_BASE_DATA = [
    100, // 医疗机构数
    200, // 病床数
    300, // 人口
    400, // 医疗费用
    500, // 医疗人员数量
    600  // 问诊人数
];

// 确保模拟增长率是数字
const MOCK_INITIAL_GROWTH_RATES = [2.21, 4.91, 0.09, 12.55, 2.21, 0.77];

// --- 常量（不变）---
const METRIC_NAMES = ["医疗机构数", "病床数", "人口", "医疗费用", "医疗人员数量", "问诊人数"];

const POLICY_DEFINITIONS_BY_METRIC = {
    0: [ // 医疗机构数 (Metric 0)
        { id: 'M0P0', name: '机构-医联体建设', costPercentage: 30, growthAdd: 0.5, affectCount: 1 },
        { id: 'M0P1', name: '机构-老区翻新', costPercentage: 26, growthAdd: 0.9, affectCount: 1 },
        { id: 'M0P2', name: '机构-中型升级', costPercentage: 22, growthAdd: 1.4, affectCount: 2, additionalAffectedPool: [1, 4] },
        { id: 'M0P3', name: '机构-鼓励医院扩张', costPercentage: 18, growthAdd: 1.8, affectCount: 2, additionalAffectedPool: [1, 3] },
        { id: 'M0P4', name: '机构-招标扩建', costPercentage: 14, growthAdd: 3.4, affectCount: 3, additionalAffectedPool: [1, 4, 5] },
        { id: 'M0P5', name: '机构-出资建设附属医院', costPercentage: 10, growthAdd: 4.0, affectCount: 3, additionalAffectedPool: [1, 3, 5] }
    ],
    1: [ // 病床数 (Metric 1)
        { id: 'M1P0', name: '病床-日常维保', costPercentage: 30, growthAdd: 0.2, affectCount: 1 },
        { id: 'M1P1', name: '病床-微调增设', costPercentage: 26, growthAdd: 0.7, affectCount: 1 },
        { id: 'M1P2', name: '病床-专科增容', costPercentage: 22, growthAdd: 1.2, affectCount: 2, additionalAffectedPool: [0, 5] },
        { id: 'M1P3', name: '病床-效率提升', costPercentage: 18, growthAdd: 1.8, affectCount: 2, additionalAffectedPool: [3, 4] },
        { id: 'M1P4', name: '病床-ICU扩建', costPercentage: 14, growthAdd: 2.4, affectCount: 3, additionalAffectedPool: [0, 4, 5] },
        { id: 'M1P5', name: '病床-智慧病房', costPercentage: 10, growthAdd: 3.0, affectCount: 3, additionalAffectedPool: [0, 3, 5] }
    ],
    2: [ // 人口 (Metric 2)
        { id: 'M2P0', name: '人口-基础监测', costPercentage: 30, growthAdd: 0.3, affectCount: 1 },
        { id: 'M2P1', name: '人口-结构优化', costPercentage: 26, growthAdd: 0.7, affectCount: 1 },
        { id: 'M2P2', name: '人口-人才引进', costPercentage: 22, growthAdd: 1, affectCount: 2, additionalAffectedPool: [3, 4] },
        { id: 'M2P3', name: '人口-生育支持', costPercentage: 18, growthAdd: 1.2, affectCount: 2, additionalAffectedPool: [3, 5] },
        { id: 'M2P4', name: '人口-公共卫生普及', costPercentage: 14, growthAdd: 1.9, affectCount: 3, additionalAffectedPool: [0, 1, 5] },
        { id: 'M2P5', name: '人口-产假实施', costPercentage: 10, growthAdd: 2.8, affectCount: 3, additionalAffectedPool: [0, 3, 4] }
    ],
    3: [ // 医疗费用 (Metric 3)
        { id: 'M3P0', name: '费用-创新支付', costPercentage: 30, growthAdd: 0.8, affectCount: 1 },
        { id: 'M3P1', name: '费用-提高医疗占笔', costPercentage: 26, growthAdd: 1.6, affectCount: 1 },
        { id: 'M3P2', name: '费用-创新医保', costPercentage: 22, growthAdd: 2.2, affectCount: 2, additionalAffectedPool: [0, 1] },
        { id: 'M3P3', name: '费用-启用招标', costPercentage: 18, growthAdd: 2.8, affectCount: 2, additionalAffectedPool: [4, 5] },
        { id: 'M3P4', name: '费用-企业援助', costPercentage: 14, growthAdd: 3.4, affectCount: 3, additionalAffectedPool: [0, 1, 5] },
        { id: 'M3P5', name: '费用-向国家贷款', costPercentage: 10, growthAdd: 4.0, affectCount: 3, additionalAffectedPool: [0, 4, 5] }
    ],
    4: [ // 医疗人员数量 (Metric 4)
        { id: 'M4P0', name: '人员-建设医科大学', costPercentage: 30, growthAdd: 0.4, affectCount: 1 },
        { id: 'M4P1', name: '人员-国外人才引进', costPercentage: 26, growthAdd: 0.5, affectCount: 1 },
        { id: 'M4P2', name: '人员-招聘激励', costPercentage: 22, growthAdd: 0.7, affectCount: 2, additionalAffectedPool: [0, 1] },
        { id: 'M4P3', name: '人员-待遇改善', costPercentage: 18, growthAdd: 1.1, affectCount: 2, additionalAffectedPool: [3, 5] },
        { id: 'M4P4', name: '人员-医疗人才落户补贴', costPercentage: 14, growthAdd: 2.4, affectCount: 3, additionalAffectedPool: [0, 1, 5] },
        { id: 'M4P5', name: '人员-请求宏观调控', costPercentage: 10, growthAdd: 5.0, affectCount: 3, additionalAffectedPool: [0, 3, 5] }
    ],
    5: [ // 问诊人数 (Metric 5)
        { id: 'M5P0', name: '问诊-推行医疗大数据', costPercentage: 30, growthAdd: 0.5, affectCount: 1 },
        { id: 'M5P1', name: '问诊-流程优化', costPercentage: 26, growthAdd: 0.8, affectCount: 1 },
        { id: 'M5P2', name: '问诊-线上预约', costPercentage: 22, growthAdd: 1.2, affectCount: 2, additionalAffectedPool: [0, 1] },
        { id: 'M5P3', name: '问诊-社区义诊', costPercentage: 18, growthAdd: 1.8, affectCount: 2, additionalAffectedPool: [2, 3] },
        { id: 'M5P4', name: '问诊-特色科室推广', costPercentage: 14, growthAdd: 2.4, affectCount: 3, additionalAffectedPool: [0, 1, 4] },
        { id: 'M5P5', name: '问诊-健康教育普及', costPercentage: 10, growthAdd: 3.0, affectCount: 3, additionalAffectedPool: [0, 2, 4] }
    ]
};


export const useDecisionStore = defineStore('decision', () => {
    // --- Store 实例 ---
    const analysisStore = useAnalysisDataStore();
    const regionStore = useRegionStore();
    const mapDataStore = useMapDataStore();

    // --- 状态 (State) ---
    const _initialMedicalExpenseLowerBound = ref(0);
    const _base2020Data = ref([...MOCK_2020_BASE_DATA]);
    const _initialGrowthRates = ref([...MOCK_INITIAL_GROWTH_RATES]);

    const decisionBudgetUpperLimit = ref(0);
    const currentRemainingBudget = ref(0);
    const isBudgetSet = ref(false);

    const currentGrowthRates = ref([...MOCK_INITIAL_GROWTH_RATES]);
    const selectedYearForProjection = ref(2025);
    const currentAnalysisMatrix = ref([]);

    // 新增状态：记录已应用的政策
    const appliedPolicyRecords = ref([]);


    // --- 计算属性 (Getters) ---
    const initialMedicalExpenseLowerBound = computed(() => _initialMedicalExpenseLowerBound.value);
    const base2020Data = computed(() => _base2020Data.value);
    const initialGrowthRates = computed(() => _initialGrowthRates.value);

    const totalDecisionBudget = computed(() => {
        if (!isBudgetSet.value) return 0;
        return decisionBudgetUpperLimit.value - _initialMedicalExpenseLowerBound.value;
    });

    const remainingBudgetPercentage = computed(() => {
        if (!totalDecisionBudget.value || totalDecisionBudget.value === 0) return 0;
        return (currentRemainingBudget.value / totalDecisionBudget.value) * 100;
    });

    const isPolicyButtonEnabled = computed(() => (metricIndex, policyIndex) => {
        if (!isBudgetSet.value) return false;
        if (_initialMedicalExpenseLowerBound.value === 0) return false;

        const policyDef = POLICY_DEFINITIONS_BY_METRIC[metricIndex][policyIndex];
        const policyCost = policyDef.costPercentage / 100 * _initialMedicalExpenseLowerBound.value;
        if (currentRemainingBudget.value < policyCost) return false;

        if (!currentAnalysisMatrix.value || currentAnalysisMatrix.value.length === 0 || !currentAnalysisMatrix.value[metricIndex]) {
            console.warn(`指标 ${metricIndex} 的分析矩阵未加载。政策按钮可能已禁用。`);
            return false;
        }

        const row = currentAnalysisMatrix.value[metricIndex];
        let minJ = -1;
        for (let j = 0; j < row.length; j++) {
            if (row[j] === 1) {
                minJ = j;
                break;
            }
        }

        if (minJ === -1) {
            return false;
        } else if (minJ === 0) {
            return policyIndex === 0;
        } else if (minJ === 5) {
            return true;
        } else {
            return policyIndex >= minJ;
        }
    });

    const projectedDataComparison = computed(() => {
        const projectionYear = selectedYearForProjection.value;
        const baseYear = 2020;
        const yearsToProject = projectionYear - baseYear;

        if (_base2020Data.value.length === 0 || _initialGrowthRates.value.length === 0) {
            return { original: [], current: [] };
        }

        const originalProjections = _initialGrowthRates.value.map((growthRate, index) => {
            // 确保 base2020Data[index] 在计算前是数字
            const baseVal = parseFloat(_base2020Data.value[index]);
            if (isNaN(baseVal)) return NaN; // 处理基准数据可能无效的情况
            return baseVal * Math.pow(1 + growthRate / 100, yearsToProject);
        });

        const currentProjections = currentGrowthRates.value.map((growthRate, index) => {
            const baseVal = parseFloat(_base2020Data.value[index]);
            if (isNaN(baseVal)) return NaN;
            return baseVal * Math.pow(1 + growthRate / 100, yearsToProject);
        });

        return {
            original: originalProjections,
            current: currentProjections
        };
    });

    // --- 操作 (Actions) ---

    /**
     * 获取决策模拟器所需的所有初始数据，
     * 包括基本医疗支出、指标基准数据、增长率和分析矩阵。
     * 此 action 应在组件挂载且区域选中后调用。
     */
    async function fetchInitialData() {
        try {
            const regionId = regionStore.getRegionId; // 获取当前区域 ID

            if (!regionId) {
                console.warn("fetchInitialData: 未提供有效的区域 ID，无法加载数据。回退到模拟数据。");
                _initialMedicalExpenseLowerBound.value = 0;
                _base2020Data.value = [...MOCK_2020_BASE_DATA];
                _initialGrowthRates.value = [...MOCK_INITIAL_GROWTH_RATES];
                currentGrowthRates.value = [...MOCK_INITIAL_GROWTH_RATES];
                currentAnalysisMatrix.value = [
                    [0, 1, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0],
                    [1, 0, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0]
                ];
                return;
            }

            // 2. 从 RegionData Store 获取 2020 年医疗支出
            const costForRegion = regionStore.costDataCache[regionId];
            console.log("缓存中的 costForRegion:", costForRegion);

            const insRegion=mapDataStore.institutionData;
            const bedRegion=mapDataStore.bedData;
            const perRegion=mapDataStore.personnelData;
            const popRegion=mapDataStore.populationData;
            const outRegion=mapDataStore.outpatientVisitsData;
            const costRegion=mapDataStore.totalCostData;

            console.log("医疗机构数据:", insRegion);
            console.log("人口数据:", popRegion);
            console.log("门诊量数据:", outRegion);
            console.log("医疗人员数据:", perRegion);
            console.log("病床数据:", bedRegion);
            console.log("总成本数据:", costRegion);


            if (costForRegion && Array.isArray(costForRegion)) {
                // IMPORTANT: 将 item.year 转换为数字进行严格比较
                const cost2020 = costForRegion.find(item => parseInt(item.year) === 2020);
                if (cost2020) {
                    // IMPORTANT: 将 cost2020.count 转换为数字
                    _initialMedicalExpenseLowerBound.value = parseFloat(cost2020.count);
                    console.log(`DEBUG: 2020 年医疗支出（基准）：${_initialMedicalExpenseLowerBound.value}, 类型: ${typeof _initialMedicalExpenseLowerBound.value}`);
                } else {
                    console.warn(`区域 ${regionId} 的 2020 年成本数据未找到。使用默认值 0。`);
                    _initialMedicalExpenseLowerBound.value = 0;
                }
            } else {
                console.warn(`区域 ${regionId} 的成本数据不可用或格式不正确。使用默认值 0。`);
                _initialMedicalExpenseLowerBound.value = 0;
            }

            // 3. 从 AnalysisData Store 获取初始指标数据和增长率
            const foundItempop = popRegion.find(item => item.id === regionId);
            const foundItembed = bedRegion.find(item => item.id === regionId);
            const foundItemper = perRegion.find(item => item.id === regionId);
            const foundItemout = outRegion.find(item => item.id === regionId);
            const foundItemins = insRegion.find(item => item.id === regionId);
            const foundItemcost = costRegion.find(item => item.id === regionId);

            _base2020Data.value = [
                parseFloat(foundItemins?.value) || MOCK_2020_BASE_DATA[0],
                parseFloat(foundItembed?.value) || MOCK_2020_BASE_DATA[1],
                parseFloat(foundItempop?.value) || MOCK_2020_BASE_DATA[2],
                parseFloat(foundItemcost?.value) || MOCK_2020_BASE_DATA[3],
                parseFloat(foundItemper?.value) || MOCK_2020_BASE_DATA[4],
                parseFloat(foundItemout?.value) || MOCK_2020_BASE_DATA[5]
            ];

            if (analysisStore.growthRates && Array.isArray(analysisStore.growthRates) && analysisStore.growthRates.length > 0) {
                // IMPORTANT: 将每个增长率解析为数字
                _initialGrowthRates.value = analysisStore.growthRates.map(rate => parseFloat(rate));
                console.log("DEBUG: 已加载初始增长率：", _initialGrowthRates.value, _initialGrowthRates.value.map(rate => typeof rate));
            } else {
                console.warn("AnalysisData Store 未提供增长率。使用默认模拟增长率。");
                _initialGrowthRates.value = [...MOCK_INITIAL_GROWTH_RATES];
                console.log("DEBUG: 使用模拟增长率：", _initialGrowthRates.value, _initialGrowthRates.value.map(rate => typeof rate));
            }

            currentGrowthRates.value = [..._initialGrowthRates.value]; // 用解析后的初始增长率初始化 currentGrowthRates
            console.log("已加载 2020 年基准数据：", _base2020Data.value);


            // 4. 设置分析矩阵
            if (analysisStore.fullAnalysisMatrix && analysisStore.fullAnalysisMatrix.length > 0) {
                currentAnalysisMatrix.value = analysisStore.fullAnalysisMatrix;
                console.log("已加载分析矩阵：", currentAnalysisMatrix.value);
            } else {
                console.warn("AnalysisData Store 未提供分析矩阵。使用默认模拟矩阵。");
                currentAnalysisMatrix.value = [
                    [0, 1, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0],
                    [1, 0, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0]
                ];
            }

        } catch (error) {
            console.error("加载初始数据失败：", error);
            alert("加载初始数据失败。请检查网络或联系管理员。");
            // 错误时回退到模拟数据或清除状态
            _initialMedicalExpenseLowerBound.value = 0;
            _base2020Data.value = [...MOCK_2020_BASE_DATA];
            _initialGrowthRates.value = [...MOCK_INITIAL_GROWTH_RATES];
            currentGrowthRates.value = [...MOCK_INITIAL_GROWTH_RATES];
            currentAnalysisMatrix.value = [
                [0, 1, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0],
                [1, 0, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0]
            ];
        }
    }


    /**
     * 设置决策经费上限。
     * @param {number} newLimit 决策者输入的经费上限金额。
     */
    function setBudgetUpperLimit(newLimit) {
        if (_initialMedicalExpenseLowerBound.value === 0) {
            alert("初始医疗支出数据未加载。请等待或确保数据源可用。");
            return;
        }

        if (newLimit >= _initialMedicalExpenseLowerBound.value) {
            decisionBudgetUpperLimit.value = newLimit;
            currentRemainingBudget.value = newLimit - _initialMedicalExpenseLowerBound.value;
            isBudgetSet.value = true;
        } else {
            alert("经费上限必须大于或等于2020年医用支出下限！");
            isBudgetSet.value = false;
            decisionBudgetUpperLimit.value = 0;
            currentRemainingBudget.value = 0;
        }
    }

    /**
     * 选择预测年份。
     * @param {number} year 目标预测年份。
     */
    function selectProjectionYear(year) {
        selectedYearForProjection.value = year;
    }

    /**
     * 对某个指标应用政策，更新增长率和预算。
     * @param {number} metricIndex 当前指标的索引 (0-5)。
     * @param {number} policyIndex 政策的索引 (0-5, 对应 P0-P5)。
     * @param {Array<number>} [additionalAffectedMetricIndices=[]] - 可选的额外受政策影响的指标索引数组。
     * @returns {boolean} - true 表示政策应用成功，false 表示失败。
     */
    function applyPolicy(metricIndex, policyIndex, additionalAffectedMetricIndices = []) {
        const policyDef = POLICY_DEFINITIONS_BY_METRIC[metricIndex][policyIndex];

        if (!isPolicyButtonEnabled.value(metricIndex, policyIndex)) {
            console.warn(`指标 ${METRIC_NAMES[metricIndex]} 的政策 P${policyIndex} ('${policyDef.name}') 不可用或经费不足。`);
            return false;
        }

        if (policyDef.affectCount > 1) {
            const requiredCount = policyDef.affectCount - 1;
            if (additionalAffectedMetricIndices.length !== requiredCount) {
                console.error(`指标 ${METRIC_NAMES[metricIndex]} 的政策 P${policyIndex} ('${policyDef.name}') 需要 ${requiredCount} 个额外受影响指标，但提供了 ${additionalAffectedMetricIndices.length} 个。`);
                return false;
            }
            const combinedAffected = new Set([metricIndex, ...additionalAffectedMetricIndices]);
            if (combinedAffected.size !== policyDef.affectCount) {
                console.error(`无效的额外受影响指标选择：包含自身或重复选择。`);
                return false;
            }
            const pool = policyDef.additionalAffectedPool || [];
            const isValidSelection = additionalAffectedMetricIndices.every(idx => pool.includes(idx));
            if (!isValidSelection) {
                console.error(`所选额外受影响指标不在该政策的允许范围内。`);
                return false;
            }

        } else if (additionalAffectedMetricIndices.length > 0) {
            console.warn(`指标 ${METRIC_NAMES[metricIndex]} 的政策 P${policyIndex} ('${policyDef.name}') 不影响额外指标。已忽略提供的额外指标。`);
            additionalAffectedMetricIndices = [];
        }

        const costAmount = policyDef.costPercentage / 100 * _initialMedicalExpenseLowerBound.value;
        currentRemainingBudget.value -= costAmount;

        const newGrowthRates = [...currentGrowthRates.value];
        newGrowthRates[metricIndex] += policyDef.growthAdd;

        if (policyDef.affectCount > 1) {
            additionalAffectedMetricIndices.forEach(idx => {
                newGrowthRates[idx] += policyDef.growthAdd * 0.5;
            });
        }
        currentGrowthRates.value = newGrowthRates;

        console.log(`应用于指标 ${METRIC_NAMES[metricIndex]} 的政策: ${policyDef.name}。 扣费: ${costAmount.toFixed(2)}。 新增长率:`, currentGrowthRates.value);
        console.log(`受影响指标: ${METRIC_NAMES[metricIndex]}${additionalAffectedMetricIndices.length > 0 ? ', ' + additionalAffectedMetricIndices.map(idx => METRIC_NAMES[idx]).join(', ') : ''}`);

        // 记录应用的政策
        appliedPolicyRecords.value.push({
            policyName: policyDef.name,
            metricIndex: metricIndex,
            policyIndex: policyIndex,
            cost: costAmount,
            growthAdd: policyDef.growthAdd,
            additionalAffectedMetrics: additionalAffectedMetricIndices
        });

        return true;
    }

    /**
     * 重置所有决策相关状态：预算、增长率等。
     */
    function resetDecisionState() {
        decisionBudgetUpperLimit.value = 0;
        currentRemainingBudget.value = 0;
        isBudgetSet.value = false;

        currentGrowthRates.value = [..._initialGrowthRates.value]; // 重置为加载的初始增长率
        selectedYearForProjection.value = 2025;

        // 重置已应用的政策记录
        appliedPolicyRecords.value = [];

        console.log("所有决策状态已重置。");
    }

    // --- 暴露的状态和方法 ---
    return {
        initialMedicalExpenseLowerBound, // 作为计算属性暴露
        base2020Data: _base2020Data,                    // 直接暴露 ref
        initialGrowthRates: _initialGrowthRates,              // 直接暴露 ref

        decisionBudgetUpperLimit,
        currentRemainingBudget,
        isBudgetSet,
        currentGrowthRates,
        selectedYearForProjection,
        currentAnalysisMatrix,
        METRIC_NAMES,
        POLICY_DEFINITIONS_BY_METRIC,

        totalDecisionBudget,
        remainingBudgetPercentage,
        isPolicyButtonEnabled,
        projectedDataComparison,
        appliedPolicyRecords, // 暴露已应用的政策记录

        setBudgetUpperLimit,
        selectProjectionYear,
        applyPolicy,
        resetDecisionState,
        fetchInitialData // 确保这个 action 被暴露并在你的组件中调用
    };
});