// src/stores/useGrowthStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useGrowthStore = defineStore('growthStore', () => {
    // 存储原始数据
    const historicalData = ref([]);

    /**
     * 设置历史数据
     * @param {Array<Object>} data 传入的数据数组，例如: [{ count: 100, year: 2008 }, ...]
     */
    const setHistoricalData = (data) => {
        if (Array.isArray(data)) {
            // 确保数据按年份排序，以正确计算增长率
            historicalData.value = [...data].sort((a, b) => a.year - b.year);
        } else {
            console.error("setHistoricalData: 传入的数据不是一个有效的数组。");
            historicalData.value = [];
        }
    };

    /**
     * 计算平均增长率 (Computed Property)
     * 如果数据不足两年，无法计算增长率，返回 0
     */
    const averageGrowthRate = computed(() => {
        if (historicalData.value.length < 2) {
            return 0; // 至少需要两年数据才能计算增长率
        }

        let totalGrowthRate = 0;
        let validGrowthRatesCount = 0;

        for (let i = 1; i < historicalData.value.length; i++) {
            const currentCount = historicalData.value[i].count;
            const previousCount = historicalData.value[i - 1].count;

            if (previousCount > 0) { // 避免除以零
                const growth = (currentCount - previousCount) / previousCount;
                totalGrowthRate += growth;
                validGrowthRatesCount++;
            }
        }

        return validGrowthRatesCount > 0 ? totalGrowthRate / validGrowthRatesCount : 0;
    });

    /**
     * 估计下一年的值 (Computed Property)
     * 基于最后一个年份的值和平均增长率
     */
    const estimatedNextYearValue = computed(() => {
        if (historicalData.value.length === 0) {
            return null; // 没有历史数据，无法估计
        }

        const lastDataPoint = historicalData.value[historicalData.value.length - 1];
        const lastYearCount = lastDataPoint.count;

        // 如果没有有效的平均增长率，则简单返回最后一年的值
        if (averageGrowthRate.value === 0 && historicalData.value.length >= 2) {
            console.warn("无法计算有效平均增长率，下一年度估计值将直接使用最后一个数据点的值。");
            return lastYearCount;
        }

        // 如果只有一年数据，无法计算增长率，也直接返回该年的值
        if (historicalData.value.length < 2) {
            return lastYearCount;
        }


        return lastYearCount * (1 + averageGrowthRate.value);
    });

    /**
     * 获取下一年的年份 (Computed Property)
     */
    const nextYear = computed(() => {
        if (historicalData.value.length === 0) {
            return null;
        }
        const lastDataPoint = historicalData.value[historicalData.value.length - 1];
        return lastDataPoint.year + 1;
    });

    return {
        historicalData,
        setHistoricalData,
        averageGrowthRate,
        estimatedNextYearValue,
        nextYear
    };
});