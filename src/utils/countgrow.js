// src/stores/useGrowthStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useGrowthStore = defineStore('growthStore', () => {
    // 存储多组历史数据，每个键对应一个数据数组
    // 例如: { '0': [{ count: 100, year: 2008 }], '1': [{ count: 50, year: 2010 }] }
    const historicalData = ref({});

    /**
     * 设置特定键的历史数据
     * @param {string} key 数据的唯一标识符 (例如 '0', '1', 'medicalData', 'populationData')
     * @param {Array<Object>} data 传入的数据数组，例如: [{ count: 100, year: 2008 }, ...]
     */
    const setHistoricalData = (key, data) => {
        if (!key) {
            console.error("setHistoricalData: 必须提供一个有效的键 (key)。");
            return;
        }
        if (Array.isArray(data)) {
            // 确保数据按年份排序
            historicalData.value[key] = [...data].sort((a, b) => a.year - b.year);
        } else if (data === null || data === undefined) {
            // 如果传入 null 或 undefined，则清空该键的数据
            delete historicalData.value[key];
        } else {
            console.error(`setHistoricalData: 键 '${key}' 传入的数据不是一个有效的数组。`);
            historicalData.value[key] = [];
        }
    };

    /**
     * 获取特定键的平均增长率 (返回一个函数，而不是 Computed Property)
     * @param {string} key 数据的唯一标识符
     * @returns {number} 平均增长率，如果数据不足或无法计算则返回 0
     */
    const getAverageGrowthRate = (key) => {
        const data = historicalData.value[key];
        if (!data || data.length < 2) {
            return 0; // 至少需要两年数据才能计算增长率
        }

        let totalGrowthRate = 0;
        let validGrowthRatesCount = 0;

        for (let i = 1; i < data.length; i++) {
            const currentCount = data[i].count;
            const previousCount = data[i - 1].count;

            if (previousCount > 0) { // 避免除以零
                const growth = (currentCount - previousCount) / previousCount;
                totalGrowthRate += growth;
                validGrowthRatesCount++;
            }
        }

        return validGrowthRatesCount > 0 ? totalGrowthRate / validGrowthRatesCount : 0;
    };

    /**
     * 估计特定键的下一年的值 (返回一个函数，而不是 Computed Property)
     * 基于最后一个年份的值和平均增长率
     * @param {string} key 数据的唯一标识符
     * @returns {number|null} 估计值，如果无法估计则返回 null
     */
    const getEstimatedNextYearValue = (key) => {
        const data = historicalData.value[key];
        if (!data || data.length === 0) {
            return null; // 没有历史数据，无法估计
        }

        const lastDataPoint = data[data.length - 1];
        const lastYearCount = lastDataPoint.count;
        const avgGrowthRate = getAverageGrowthRate(key); // 调用对应键的增长率

        // 如果没有有效的平均增长率，并且数据不足两年，则直接返回最后一年的值
        if (data.length < 2 || avgGrowthRate === 0) {
            return lastYearCount;
        }

        return lastYearCount * (1 + avgGrowthRate);
    };

    /**
     * 获取特定键的下一年的年份 (返回一个函数，而不是 Computed Property)
     * @param {string} key 数据的唯一标识符
     * @returns {number|null} 下一年的年份，如果无法获取则返回 null
     */
    const getNextYear = (key) => {
        const data = historicalData.value[key];
        if (!data || data.length === 0) {
            return null;
        }
        const lastDataPoint = data[data.length - 1];
        return lastDataPoint.year + 1;
    };

    return {
        historicalData,
        setHistoricalData,
        getAverageGrowthRate, // 现在是函数
        getEstimatedNextYearValue, // 现在是函数
        getNextYear // 现在是函数
    };
});