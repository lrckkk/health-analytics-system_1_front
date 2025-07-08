// src/stores/mapData.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
// Assume you're using axios
// import axios from 'axios';

// 导入你的 ID 映射表 (确保路径正确，根据你的实际文件结构调整)
import { provinceIdMap } from '../utils/mapid.js'; // 假设 provinceIdMap 在 src/utils/mapid.js

// 导入你的通用转换类 (确保路径正确)
// import { IdToNameMapper } from '../utils/IdToNameMapper.js'; // 假设 IdToNameMapper 在 src/utils/IdToNameMapper.js
import request from "@/utils/request.js";

// === IdToNameMapper 类定义开始 ===
// 为了确保该文件独立运行，将 IdToNameMapper 的定义直接包含在此处。
// 如果您在 src/utils/IdToNameMapper.js 中有更复杂的实现，请确保它与此兼容。
export class IdToNameMapper {
    /**
     * 构造函数
     * @param {Object} idMap 一个键值对为 { id: name } 的映射对象。
     * 例如: { 1: '北京', 2: '上海', ... }
     */
    constructor(idMap) {
        if (typeof idMap !== 'object' || idMap === null) {
            throw new Error('IdToNameMapper: 构造函数需要一个有效的 idMap 对象。');
        }
        this.idMap = idMap;
    }

    /**
     * 将一个 ID 转换为对应的名称。
     * @param {number | string} id 要转换的 ID。
     * @returns {string | undefined} 对应的名称，如果未找到则返回 undefined。
     */
    getName(id) {
        return this.idMap[id];
    }

    /**
     * 递归地处理数据，将对象中特定字段的 ID 转换为名称。
     * 默认情况下，它会查找名为 'id' 的字段，并将其替换为 'name'。
     * 你可以通过 options 配置要查找的 ID 字段名和替换后的名称字段名。
     *
     * @param {any} data 要处理的原始数据 (可以是对象、数组或基本类型)。
     * @param {Object} [options] 配置选项。
     * @param {string} [options.idKey='id'] 原始数据中表示 ID 的字段名。
     * @param {string} [options.nameKey='name'] 转换后表示名称的字段名。
     * @param {boolean} [options.deleteOriginalId=true] 是否删除原始的 ID 字段。
     * @param {string | null} [options.unknownName='未知'] 如果找不到对应的名称，使用的默认名称。设置为 null 则保持 id 不变。
     * @returns {any} 转换后的数据副本。
     */
    mapData(data, options = {}) {
        const defaultOptions = {
            idKey: 'id',
            nameKey: 'name',
            deleteOriginalId: true,
            unknownName: '未知'
        };
        const opts = { ...defaultOptions, ...options };

        // 处理基本类型数据
        if (data === null || typeof data !== 'object') {
            return data;
        }

        // 处理数组
        if (Array.isArray(data)) {
            return data.map(item => this.mapData(item, opts));
        }

        // 处理对象
        const newData = { ...data }; // 创建一个浅拷贝以避免直接修改原数据

        if (newData.hasOwnProperty(opts.idKey)) {
            const idValue = newData[opts.idKey];
            const nameValue = this.getName(idValue);

            if (nameValue !== undefined) {
                newData[opts.nameKey] = nameValue;
            } else if (opts.unknownName !== null) {
                newData[opts.nameKey] = opts.unknownName;
                console.warn(`IdToNameMapper: 未找到 ID 为 "${idValue}" 的名称，使用默认值 "${opts.unknownName}"。`);
            } else {
                // 如果 unknownName 为 null，则保持原始 ID 字段不变
                console.warn(`IdToNameMapper: 未找到 ID 为 "${idValue}" 的名称，ID 字段保留。`);
            }

            if (opts.deleteOriginalId && newData.hasOwnProperty(opts.idKey) && opts.idKey !== opts.nameKey) {
                // 只有在 idKey 和 nameKey 不同时才删除，避免删除刚添加的 name
                delete newData[opts.idKey];
            }
        }

        // 递归处理对象中的其他属性
        for (const key in newData) {
            if (Object.prototype.hasOwnProperty.call(newData, key) && typeof newData[key] === 'object') {
                newData[key] = this.mapData(newData[key], opts);
            }
        }

        return newData;
    }
}
// === IdToNameMapper 类定义结束 ===


const sectorColors = {
    '工业': '#FF6B6B',
    '农业': '#4ECDC4',
    '服务业': '#FFD166',
    '旅游': '#70A1FF',
    '其他': '#B8B8B8',
    // 根据需要添加更多类别和颜色
};

export const useMapDataStore = defineStore('mapData', () => {
    // state: Stores your data
    const provinceData = ref([]);
    const scatterData = ref([]);
    const pieSeriesData = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const populationData = ref([]);
    const institutionData = ref([]);
    const personnelData = ref([]);
    const bedData = ref([]);
    const outpatientVisitsData = ref([]);
    const totalCostData = ref([]);
    const inpatientAdmissions=ref([]);
    // 确保 fetchedScatterData 是一个常量，并且包含所有可能的省份坐标
    const fetchedScatterData = [
        { name: '北京', value: [116.4074, 39.9042, 90] },
        { name: '上海', value: [121.4737, 31.2304, 85] },
        { name: '广东', value: [113.2644, 23.1291, 80] }, // 广州所在省
        { name: '四川', value: [104.0665, 30.5728, 75] }, // 成都所在省
        { name: '湖北', value: [114.3055, 30.5931, 70] }, // 武汉所在省
        { name: '陕西', value: [108.9398, 34.3416, 70] }, // 西安所在省
        { name: '浙江', value: [120.1551, 30.2741, 75] }, // 杭州所在省
        { name: '江苏', value: [118.7969, 32.0603, 70] }, // 南京所在省
        { name: '重庆', value: [106.5045, 29.5332, 68] }, // 直辖市
        { name: '天津', value: [117.1902, 39.1255, 60] }, // 直辖市
        { name: '湖南', value: [112.9823, 28.1941, 65] }, // 长沙所在省
        { name: '河南', value: [113.6654, 34.7579, 62] }, // 郑州所在省
        { name: '山东', value: [120.3551, 36.0883, 67] }, // 青岛所在省
        { name: '福建', value: [118.1000, 24.4600, 58] }, // 厦门所在省
        { name: '安徽', value: [117.2830, 31.8612, 59] }, // 合肥所在省
        { name: '辽宁', value: [123.4290, 41.7922, 53] }, // 沈阳所在省
        { name: '黑龙江', value: [126.6424, 45.7569, 50] }, // 哈尔滨所在省
        { name: '吉林', value: [125.3245, 43.8868, 52] }, // 长春所在省
        { name: '河北', value: [114.5025, 38.0455, 57] }, // 石家庄所在省
        { name: '山西', value: [112.5492, 37.8703, 54] }, // 太原所在省
        { name: '江西', value: [115.8921, 28.6765, 56] }, // 南昌所在省
        { name: '广西', value: [108.3200, 22.8168, 48] }, // 南宁所在省
        { name: '云南', value: [102.7122, 25.0406, 47] }, // 昆明所在省
        { name: '贵州', value: [106.7134, 26.5783, 46] }, // 贵阳所在省
        { name: '西藏', value: [91.1322, 29.6603, 30] }, // 拉萨所在省
        { name: '新疆', value: [87.6177, 43.7928, 28] }, // 乌鲁木齐所在省
        { name: '甘肃', value: [103.7342, 36.0827, 35] }, // 兰州所在省
        { name: '宁夏', value: [106.2781, 38.4664, 32] }, // 银川所在省
        { name: '青海', value: [101.7789, 36.6232, 29] }, // 西宁所在省
        { name: '海南', value: [110.3312, 20.0319, 45] }, // 海口所在省
        { name: '内蒙古', value: [111.7383, 40.8183, 38] }, // 呼和浩特所在省
    ];


    // --- 新增：创建 IdToNameMapper 实例 ---
    const provinceMapper = new IdToNameMapper(provinceIdMap);

    const fetchcountryData =async () => {
        const rawdata = await request.get(`/api/provinces/latest`);

        populationData.value = [];
        institutionData.value = [];
        personnelData.value = [];
        bedData.value = [];
        inpatientAdmissions.value = [];
        outpatientVisitsData.value = [];
        totalCostData.value = [];
        rawdata.forEach(item => {
            const provinceId = item.provinceId;

            // 1. 人口总数
            if (item.population && item.population.total !== undefined) {
                populationData.value.push({ id: provinceId, value: item.population.total });
            }

            // 2. 医疗机构总数
            if (item.institution && item.institution.total !== undefined) {
                institutionData.value.push({ id: provinceId, value: item.institution.total });
            }

            // 3. 医疗人员总数
            if (item.personnel && item.personnel.total !== undefined) {
                personnelData.value.push({ id: provinceId, value: item.personnel.total });
            }

            // 4. 床位总数
            if (item.bed && item.bed.total !== undefined) {
                bedData.value.push({ id: provinceId, value: item.bed.total });
            }

            // 5. 门诊就诊人次
            if (item.service && item.service.outpatientVisits !== undefined) {
                outpatientVisitsData.value.push({ id: provinceId, value: item.service.outpatientVisits });
                inpatientAdmissions.value.push({ id: provinceId, value: item.service.inpatientAdmissions });
            }

            // 6. 医疗总费用
            if (item.cost && item.cost.total !== undefined) {
                totalCostData.value.push({ id: provinceId, value: item.cost.total });
            }
        });

    };
    // actions: Used to modify state or perform asynchronous operations
    const fetchMapData = async () => {
        isLoading.value = true;
        error.value = null; // Reset any previous errors

        try {
            await fetchcountryData()
            console.log("cnm"+populationData.value);
            provinceData.value = provinceMapper.mapData(populationData.value);

            // 打印转换后的 provinceData，以便你查看结果
            console.log("转换后的 provinceData:", provinceData.value);

            // 以下是其他数据的模拟，保持不变
            // 注意：这些数据目前已经是带 `name` 字段的，所以不需要额外转换

            // 为了不直接修改原始常量，我们先创建一个拷贝
            const updatedScatterData = JSON.parse(JSON.stringify(fetchedScatterData));

            // 创建一个 Map，用于快速查找后端数据中省份名称对应的值
            // provinceData.value 已经包含了从后端 id 转换来的 name 和对应的 value
            const backendValueMapForScatter = new Map();
            provinceData.value.forEach(item => {
                if (item.name && item.name !== '未知') {
                    backendValueMapForScatter.set(item.name, item.value);
                }
            });

            // 遍历 updatedScatterData，并根据 backendValueMapForScatter 更新其 value 数组的最后一个值
            updatedScatterData.forEach(scatterItem => {
                if (backendValueMapForScatter.has(scatterItem.name)) {
                    // 如果在后端数据中找到了对应的省份名称
                    // 则更新 scatterData 中该项的 value 数组的最后一个元素 (索引为 2)
                    scatterItem.value[2] = backendValueMapForScatter.get(scatterItem.name);
                }
            });




            const piePositions = {
                '广东': [113.2644, 23.1291], '北京': [116.4074, 39.9042], '上海': [121.4737, 31.2304],
                '江苏': [118.7969, 32.0603], '浙江': [120.1551, 30.2741], '四川': [104.0665, 30.5728],
                '山东': [117.0009, 36.6758], '河南': [113.6654, 34.7579], '河北': [114.5025, 38.0455],
                '湖南': [112.9823, 28.1941], '湖北': [114.3055, 30.5931], '安徽': [117.2830, 31.8612],
                '辽宁': [123.4290, 41.7922], '陕西': [108.9398, 34.3416], '广西': [108.3200, 22.8168],
                '江西': [115.8921, 28.6765], '云南': [102.7122, 25.0406], '黑龙江': [126.6424, 45.7569],
                '吉林': [125.3245, 43.8868], '山西': [112.5492, 37.8703], '甘肃': [103.7342, 36.0827],
                '内蒙古': [111.7383, 40.8183], '新疆': [87.6177, 43.7928], '宁夏': [106.2781, 38.4664],
                '青海': [101.7789, 36.6232], '西藏': [91.1322, 29.6603], // 这里增加了拉萨的 value 以匹配 scatterData
                '海南': [110.3312, 20.0319],
                '天津': [117.1902, 39.1255], '重庆': [106.5045, 29.5332], '香港': [114.1694, 22.3193],
                '澳门': [113.5439, 22.1987], '台湾': [120.9605, 23.6938] // Assuming a dummy position if no real data
            };

            const rawFetchedPieDataFromBackend = [
                {
                    id: 24, // 广东
                    data: [
                        { name: '工业', value: 70 },
                        { name: '农业', value: 20 },
                        { name: '服务业', value: 40 }
                    ]
                },
                {
                    id: 1, // 北京
                    data: [
                        { name: '服务业', value: 80 },
                        { name: '工业', value: 15 }
                    ]
                },
                {
                    id: 3, // 上海
                    data: [
                        { name: '工业', value: 50 },
                        { name: '服务业', value: 45 },
                        { name: '农业', value: 10 },
                        { name: '其他', value: 5 }
                    ]
                },
                {
                    id: 28, // 云南
                    data: [
                        { name: '农业', value: 60 },
                        { name: '旅游', value: 30 }
                    ]
                },
                {
                    id: 15, // 江苏
                    data: [
                        { name: '工业', value: 65 },
                        { name: '服务业', value: 30 }
                    ]
                },

            ];

            const processedPieSeriesData = [];

            rawFetchedPieDataFromBackend.forEach(backendPieItem => {
                const provinceName = provinceMapper.getName(backendPieItem.id);

                if (provinceName && provinceName !== '未知') {
                    const position = piePositions[provinceName];
                    if (position) {
                        // 转换后端 data 数组，添加颜色信息
                        const formattedPieData = backendPieItem.data.map(d => ({
                            name: d.name,
                            value: d.value,
                            color: sectorColors[d.name] || '#CCCCCC' // 如果没有预定义颜色，使用灰色
                        }));

                        processedPieSeriesData.push({
                            name: provinceName,
                            value: position, // 饼图中心点位置
                            pieData: formattedPieData // 包含 name, value, color 的数组
                        });
                    }
                }
            })

            //
            // const fetchedPieSeriesData = Object.keys(provincePieData).map(provinceName => ({
            //     name: provinceName,
            //     value: piePositions[provinceName],
            //     pieData: provincePieData[provinceName]
            // }));

            // Update the store's state
            // provinceData.value 已经在上面被转换并赋值
            pieSeriesData.value = processedPieSeriesData;
            // 将更新后的数据赋值给 store 的 scatterData 状态
            scatterData.value = updatedScatterData;
            console.log("更新后的 scatterData (已根据后端值修改):", scatterData.value);

        } catch (err) {
            console.error("Failed to fetch map data:", err);
            error.value = err.message || "Unknown error";
        } finally {
            isLoading.value = false;
        }
    };
    const fetchsatterdata = (param1) => {
        console.log(`fetchsatterdata called with: ${param1}`);

        let rawDataToMap = []; // 用于存储即将被映射的原始数据
        if (param1 === 'populationData') {
            rawDataToMap = populationData.value;
        } else if (param1 === 'institutionData') {
            rawDataToMap = institutionData.value;
        } else if (param1 === 'personnelData') {
            rawDataToMap = personnelData.value;
        } else if (param1 === 'bedData') {
            rawDataToMap = bedData.value;
        } else if (param1 === 'outpatientVisitsData') {
            rawDataToMap = outpatientVisitsData.value;
        } else if (param1 === 'totalCostData') {
            rawDataToMap = totalCostData.value;
        }
        console.log("fetchsatterdata: 原始数据 (rawDataToMap):", rawDataToMap);

        // 关键修复：将原始数据通过 provinceMapper.mapData 进行转换，确保 provinceData.value 包含 name 属性
        provinceData.value = provinceMapper.mapData(rawDataToMap);
        console.log("fetchsatterdata: provinceData.value (映射后):", provinceData.value);

        const updatedScatterData = JSON.parse(JSON.stringify(fetchedScatterData));

        // 创建一个 Map，用于快速查找后端数据中省份名称对应的值
        const backendValueMapForScatter = new Map();
        provinceData.value.forEach(item => {
            // 此时 item.name 应该已经存在且正确
            if (item.name && item.name !== '未知') {
                backendValueMapForScatter.set(item.name, item.value);
            }
        });
        console.log("fetchsatterdata: backendValueMapForScatter:", backendValueMapForScatter);


        // 遍历 updatedScatterData，并根据 backendValueMapForScatter 更新其 value 数组的最后一个值
        updatedScatterData.forEach(scatterItem => {
            if (backendValueMapForScatter.has(scatterItem.name)) {
                // 如果在后端数据中找到了对应的省份名称
                // 则更新 scatterData 中该项的 value 数组的最后一个元素 (索引为 2)
                scatterItem.value[2] = backendValueMapForScatter.get(scatterItem.name);
            } else {
                // 如果 scatterData 中的某个省份在当前 selectedData 中没有对应的值，可以考虑设置为0或保持不变
                // console.warn(`fetchsatterdata: Scatter item "${scatterItem.name}" not found in current selected data.`);
            }
        });
        scatterData.value = updatedScatterData;
        console.log("fetchsatterdata: 更新后的 scatterData:", scatterData.value);

    };

    return {
        provinceData,
        scatterData,
        pieSeriesData,
        isLoading,
        error,
        fetchMapData, // Expose the action
        fetchcountryData,
        fetchsatterdata,
        populationData,
        institutionData,
        inpatientAdmissions,
        personnelData,
        bedData,
        outpatientVisitsData,
        totalCostData,

    };
});
