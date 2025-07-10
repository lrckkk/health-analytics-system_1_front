// utils/analyseMetrics.js

/**
 * 根据增长率和排名数据生成分析矩阵。
 * 矩阵的每一行 (i) 对应一个指标/数据所有者，每一列 (j) 对应一种分析标准。
 * 如果某个指标满足第 j 个标准，则 matrix[i][j] 设为 1。
 *
 * @param {Array<number>} growthRates - 包含 6 个增长率数字的数组（例如 [2.39, 6.05, ...]）。
 * @param {Array<number>} rankInfos - 包含 6 个排名数字的数组（例如 [8, 24, ...]）。
 * @returns {Array<Array<number>>} 一个 6x6 的二进制矩阵，表示每个指标满足的标准。
 */
export function generateAnalysisMatrix(growthRates, rankInfos) {
    // 初始化一个 6x6 的矩阵，所有值为 0
    const analysisMatrix = Array(6).fill(0).map(() => Array(6).fill(0));

    // 优化后的 6 种分析标准，旨在提高命中率并覆盖更广的数据范围
    // 注意：rank 值越小表示排名越靠前
    const analysisStandards = [
        // 标准 0: 【领先且快速增长】 增长强劲且排名靠前，处于行业前沿。
        // 增长率 >= 5% 且排名在前 15 位
        (growth, rank) => growth >= 5 && rank <= 15,

        // 标准 1: 【稳健发展】 增长稳定，排名处于中上游，基础良好。
        // 增长率在 0% 到 5% 之间，且排名在前 30 位
        (growth, rank) => growth >= 0 && growth < 5 && rank <= 30,

        // 标准 2: 【增长放缓/持平】 增长率较低或接近零，但排名尚可，需观察。
        // 增长率在 -2% 到 0% 之间（含 0），且排名在前 40 位
        (growth, rank) => growth >= -2 && growth < 0 && rank <= 40,

        // 标准 3: 【明显下滑】 增长率为负且排名开始下降，面临较大挑战。
        // 增长率小于 -2%，且排名在 20 到 50 位之间
        (growth, rank) => growth < -2 && rank > 20 && rank <= 50,

        // 标准 4: 【急需关注】 增长率极低或严重负增长，且排名靠后。
        // 增长率小于 -5%，且排名在 50 位之后
        (growth, rank) => growth < -5 && rank > 50,

        // 标准 5: 【一般表现/待提升】 增长率中等或偏低，排名也处于中下游，有提升空间。
        // 增长率在 -2% 到 5% 之间（不含 5%），且排名在 15 到 50 位之间
        // 这个标准设计得比较宽泛，用于捕获那些没有特别突出但也不是很差的情况，增加整体命中率。
        (growth, rank) => growth >= -2 && growth < 5 && rank > 15 && rank <= 50,
    ];

    // 遍历 6 个数据所有者（指标）
    for (let i = 0; i < 6; i++) {
        const currentGrowth = growthRates[i];
        const currentRank = rankInfos[i];

        // 对每个数据所有者，检查它满足哪些标准
        for (let j = 0; j < 6; j++) {
            // 确保数据有效，避免对 null 进行判断
            if (currentGrowth !== null && currentRank !== null) {
                if (analysisStandards[j](currentGrowth, currentRank)) {
                    analysisMatrix[i][j] = 1; // 如果满足标准，将矩阵对应位置设为 1
                }
            }
        }
    }

    return analysisMatrix;
}