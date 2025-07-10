// dataProcessing.js

/**
 * 处理复杂数据结构，提取出 { id, value } 形式的数组。
 * 注意：根据您的说明，传入此函数的数据已经是 { id, value } 的扁平形式，
 * 因此此函数现在主要作用是进行类型校验并确保返回的是一个可用的数组。
 * @param {Array} rawData 原始数据数组
 * @returns {Array<{id: number, value: number}>} 提取后的简化数据数组
 */
function extractSimplifiedData(rawData) {
    if (!Array.isArray(rawData)) {
        console.error("输入数据不是一个数组。");
        return [];
    }
    // 【保留】：如果数据已经是 {id, value} 扁平结构，直接返回原始数据。
    return rawData;
}

/**
 * 方法一：根据ID查找对应的Value和排名。
 * @param {Array} rawData 原始数据数组，格式为 { id, value }。
 * @param {number} targetId 要查找的ID。
 * @returns {Object|null} 包含 value 和 rank 的对象，如果未找到则返回 null。
 */
function getValueAndRankById(rawData, targetId) {
    const simplifiedData = extractSimplifiedData(rawData);

    // 【保留】：数据为空或无法解析的警告，避免对空数组操作
    if (simplifiedData.length === 0) {
        console.warn("数据为空或无法解析，无法进行查找和排名。");
        return null;
    }

    // 找到目标ID对应的项
    const targetItem = simplifiedData.find(item => item.id === targetId);

    if (!targetItem) {
        console.warn(`未找到 ID 为 ${targetId} 的数据项。`);
        return null;
    }

    const targetValue = targetItem.value;

    // 对所有 value 进行降序排序，计算排名
    const sortedValues = simplifiedData
        .map(item => item.value)
        .sort((a, b) => b - a); // 降序排列

    let rank = 1;
    for (let i = 0; i < sortedValues.length; i++) {
        if (sortedValues[i] === targetValue) {
            rank = i + 1;
            break;
        }
    }

    return {
        id: targetId,
        value: targetValue,
        rank: rank
    };
}

/**
 * 方法二：计算给定值在所有Value中的排名（插入排名）。
 * @param {Array} rawData 原始数据数组，格式为 { id, value }。
 * @param {number} targetValue 要查找排名的值。
 * @returns {Object} 包含 targetValue 和 rank 的对象。
 */
function getRankOfGivenValue(rawData, targetValue) {
    const simplifiedData = extractSimplifiedData(rawData);

    if (simplifiedData.length === 0) {
        console.warn("数据为空或无法解析，无法计算排名。");
        return { targetValue: targetValue, rank: "无数据" }; // 返回一个特殊值或默认值
    }

    // 将所有 value 提取出来并排序（降序）
    const allValues = simplifiedData.map(item => item.value);
    const sortedValues = allValues.sort((a, b) => b - a);

    let rank = sortedValues.length + 1; // 默认排名：比所有现有数据都小，排在最后

    // 遍历排序后的数组，找到第一个小于或等于 targetValue 的位置
    // 如果 targetValue 比所有值都大，循环将不会进入 if，rank 保持 1 (第一个位置)
    for (let i = 0; i < sortedValues.length; i++) {
        if (targetValue >= sortedValues[i]) {
            rank = i + 1;
            break;
        }
    }

    return {
        targetValue: targetValue,
        rank: rank
    };
}

// 导出这些函数，以便其他文件可以导入它们
export {
    getValueAndRankById,
    getRankOfGivenValue
};