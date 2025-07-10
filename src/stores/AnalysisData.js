// stores/AnalysisData.js
import { defineStore } from 'pinia';
import { generateAnalysisMatrix } from '@/utils/analyseMetrics.js'; // 在这里导入分析函数

export const useAnalysisDataStore = defineStore('analysisData', {
    state: () => ({
        growthRates: Array(6).fill(null), // 0:医疗机构, 1:病床数, 2:人口, 3:医疗费用, 4:医疗人员, 5:问诊人数
        rankInfos: Array(6).fill(null),   // 0:医疗机构, 1:病床数, 2:人口, 3:医疗费用, 4:医疗人员, 5:问诊人数
        fullAnalysisMatrix: [], // <--- 新增：用于存储完整的 6x6 矩阵
    }),
    actions: {
        // <--- 新增：计算并更新完整矩阵的 action
        updateFullAnalysisMatrix() {
            // 确保所有数据都已加载完毕，避免计算空矩阵
            if (this.growthRates.every(val => val !== null) &&
                this.rankInfos.every(val => val !== null)) {
                this.fullAnalysisMatrix = generateAnalysisMatrix(this.growthRates, this.rankInfos);
                console.log('Pinia: 完整的分析矩阵已更新:', this.fullAnalysisMatrix);
            } else {
                console.warn('Pinia: 数据不完整，无法更新完整的分析矩阵。');
                this.fullAnalysisMatrix = []; // 如果数据不完整则清空
            }
        }
    }
});