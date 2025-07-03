// src/stores/mapData.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
// Assume you're using axios
// import axios from 'axios';

// 导入你的 ID 映射表 (确保路径正确，根据你的实际文件结构调整)
import { provinceIdMap } from '../utils/mapid.js'; // 假设 provinceIdMap 在 src/utils/mapid.js

// 导入你的通用转换类 (确保路径正确)
import { IdToNameMapper } from '../utils/IdToNameMapper.js'; // 假设 IdToNameMapper 在 src/utils/IdToNameMapper.js
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

    // --- 新增：创建 IdToNameMapper 实例 ---
    const provinceMapper = new IdToNameMapper(provinceIdMap);

    // actions: Used to modify state or perform asynchronous operations
    const fetchMapData = async () => {
        isLoading.value = true;
        error.value = null; // Reset any previous errors

        try {
            // **这部分是模拟从后端获取的原始数据，其中包含 ID。**
            // 在实际应用中，你会用 axios.get 或 fetch 来从 API 获取数据，例如：
            // const backendResponse = await axios.get('/api/province-data-with-ids');
            // const rawFetchedProvinceDataFromBackend = backendResponse.data;

            // 模拟后端返回的原始省份数据（包含 ID）
            const rawFetchedProvinceDataFromBackend = [
                { id: 24, value: 126 }, // 广东
                { id: 21, value: 94 },  // 河南
                { id: 20, value: 101 }, // 山东
                { id: 15, value: 85 },  // 江苏
                { id: 26, value: 83 },  // 四川
                { id: 10, value: 75 },  // 河北
                { id: 23, value: 66 },  // 湖南
                { id: 17, value: 63 },  // 安徽
                { id: 16, value: 65 },  // 浙江
                { id: 22, value: 59 },  // 湖北
                { id: 6, value: 49 },   // 广西
                { id: 19, value: 45 },  // 江西
                { id: 28, value: 48 },  // 云南
                { id: 29, value: 39 },  // 陕西
                { id: 12, value: 43 },  // 辽宁
                { id: 13, value: 27 },  // 吉林
                { id: 11, value: 37 },  // 山西
                { id: 9, value: 25.8 }, // 新疆
                { id: 30, value: 26 },  // 甘肃
                { id: 25, value: 10 },  // 海南
                { id: 8, value: 6 },    // 宁夏
                { id: 31, value: 6 },   // 青海
                { id: 7, value: 3.5 },  // 西藏
                { id: 1, value: 21.9 }, // 北京
                { id: 3, value: 24.9 }, // 上海
                { id: 2, value: 13 },   // 天津
                { id: 32, value: 7.5 }, // 香港
                { id: 33, value: 0.7 }, // 澳门
                { id: 34, value: 0 },   // 台湾
                { id: 14, value: 18 },  // 黑龙江
                { id: 5, value: 23.96 }, // 内蒙古
                { id: 4, value: 16 },    // 重庆
                { id: 999, value: 100 }  // 模拟一个不存在的ID，用于测试 '未知' 处理
            ];

            // --- 使用 IdToNameMapper 转换 provinceData ---
            // provinceMapper.mapData 会遍历 rawFetchedProvinceDataFromBackend
            // 找到每个对象的 'id' 字段，并根据 provinceIdMap 将其转换为 'name' 字段。
            // 转换后的数据将赋值给 provinceData.value。
            provinceData.value = provinceMapper.mapData(rawFetchedProvinceDataFromBackend);

            // 打印转换后的 provinceData，以便你查看结果
            console.log("转换后的 provinceData:", provinceData.value);

            // 以下是其他数据的模拟，保持不变
            // 注意：这些数据目前已经是带 `name` 字段的，所以不需要额外转换
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
                { name: '广东', value: [114.0579, 22.5431, 82] }, // 深圳所在省
                { name: '天津', value: [117.1902, 39.1255, 60] }, // 直辖市
                { name: '江苏', value: [120.6196, 31.3179, 72] }, // 苏州所在省
                { name: '湖南', value: [112.9823, 28.1941, 65] }, // 长沙所在省
                { name: '河南', value: [113.6654, 34.7579, 62] }, // 郑州所在省
                { name: '山东', value: [120.3551, 36.0883, 67] }, // 青岛所在省
                { name: '福建', value: [118.1000, 24.4600, 58] }, // 厦门所在省
                { name: '福建', value: [119.3062, 26.0753, 55] }, // 福州所在省
                { name: '安徽', value: [117.2830, 31.8612, 59] }, // 合肥所在省
                { name: '山东', value: [117.0009, 36.6758, 61] }, // 济南所在省
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

            const provincePieData = {
                '广东': [{ name: '工业', value: 60, color: '#FF6B6B' }, { name: '农业', value: 30, color: '#4ECDC4' }, { name: '服务业', value: 36, color: '#FFD166' }],
                '北京': [{ name: '工业', value: 20, color: '#FF6B6B' }, { name: '农业', value: 5, color: '#4ECDC4' }, { name: '服务业', value: 75, color: '#FFD166' }],
                '上海': [{ name: '工业', value: 45, color: '#FF6B6B' }, { name: '农业', value: 5, color: '#4ECDC4' }, { name: '服务业', value: 50, color: '#FFD166' }],
                '江苏': [{ name: '工业', value: 55, color: '#FF6B6B' }, { name: '农业', value: 20, color: '#4ECDC4' }, { name: '服务业', value: 35, color: '#FFD166' }],
                '浙江': [{ name: '工业', value: 48, color: '#FF6B6B' }, { name: '农业', value: 15, color: '#4ECDC4' }, { name: '服务业', value: 37, color: '#FFD166' }],
                '四川': [{ name: '工业', value: 40, color: '#FF6B6B' }, { name: '农业', value: 30, color: '#4ECDC4' }, { name: '服务业', value: 30, color: '#FFD166' }],
                '山东': [{ name: '工业', value: 50, color: '#FF6B6B' }, { name: '农业', value: 25, color: '#4ECDC4' }, { name: '服务业', value: 25, color: '#FFD166' }],
                '河南': [{ name: '工业', value: 40, color: '#FF6B6B' }, { name: '农业', value: 40, color: '#4ECDC4' }, { name: '服务业', value: 20, color: '#FFD166' }],
                '河北': [{ name: '工业', value: 45, color: '#FF6B6B' }, { name: '农业', value: 35, color: '#4ECDC4' }, { name: '服务业', value: 20, color: '#FFD166' }],
                '湖南': [{ name: '工业', value: 35, color: '#FF6B6B' }, { name: '农业', value: 30, color: '#4ECDC4' }, { name: '服务业', value: 35, color: '#FFD166' }],
                '湖北': [{ name: '工业', value: 42, color: '#FF6B6B' }, { name: '农业', value: 28, color: '#4ECDC4' }, { name: '服务业', value: 30, color: '#FFD166' }],
                '安徽': [{ name: '工业', value: 38, color: '#FF6B6B' }, { name: '农业', value: 32, color: '#4ECDC4' }, { name: '服务业', value: 30, color: '#FFD166' }],
                '辽宁': [{ name: '工业', value: 40, color: '#FF6B6B' }, { name: '农业', value: 25, color: '#4ECDC4' }, { name: '服务业', value: 35, color: '#FFD166' }],
                '陕西': [{ name: '工业', value: 30, color: '#FF6B6B' }, { name: '农业', value: 20, color: '#4ECDC4' }, { name: '服务业', value: 50, color: '#FFD166' }],
                '广西': [{ name: '工业', value: 25, color: '#FF6B6B' }, { name: '农业', value: 40, color: '#4ECDC4' }, { name: '服务业', value: 35, color: '#FFD166' }],
                '江西': [{ name: '工业', value: 30, color: '#FF6B6B' }, { name: '农业', value: 35, color: '#4ECDC4' }, { name: '服务业', value: 35, color: '#FFD166' }],
                '云南': [{ name: '工业', value: 20, color: '#FF6B6B' }, { name: '农业', value: 50, color: '#4ECDC4' }, { name: '服务业', value: 30, color: '#FFD166' }],
                '黑龙江': [{ name: '工业', value: 30, color: '#FF6B6B' }, { name: '农业', value: 50, color: '#4ECDC4' }, { name: '服务业', value: 20, color: '#FFD166' }],
                '吉林': [{ name: '工业', value: 35, color: '#FF6B6B' }, { name: '农业', value: 45, color: '#4ECDC4' }, { name: '服务业', value: 20, color: '#FFD166' }],
                '山西': [{ name: '工业', value: 50, color: '#FF6B6B' }, { name: '农业', value: 20, color: '#4ECDC4' }, { name: '服务业', value: 30, color: '#FFD166' }],
                '甘肃': [{ name: '工业', value: 25, color: '#FF6B6B' }, { name: '农业', value: 40, color: '#4ECDC4' }, { name: '服务业', value: 35, color: '#FFD166' }],
                '内蒙古': [{ name: '工业', value: 30, color: '#FF6B6B' }, { name: '农业', value: 40, color: '#4ECDC4' }, { name: '服务业', value: 30, color: '#FFD166' }],
                '新疆': [{ name: '工业', value: 20, color: '#FF6B6B' }, { name: '农业', value: 40, color: '#4ECDC4' }, { name: '服务业', value: 40, color: '#FFD166' }],
                '宁夏': [{ name: '工业', value: 30, color: '#FF6B6B' }, { name: '农业', value: 30, color: '#4ECDC4' }, { name: '服务业', value: 40, color: '#FFD166' }],
                '青海': [{ name: '工业', value: 20, color: '#FF6B6B' }, { name: '农业', value: 50, color: '#4ECDC4' }, { name: '服务业', value: 30, color: '#FFD166' }],
                '西藏': [{ name: '工业', value: 10, color: '#FF6B6B' }, { name: '农业', value: 60, color: '#4ECDC4' }, { name: '服务业', value: 30, color: '#FFD166' }],
                '海南': [{ name: '工业', value: 20, color: '#FF6B6B' }, { name: '农业', value: 30, color: '#4ECDC4' }, { name: '服务业', value: 50, color: '#FFD166' }],
                '天津': [{ name: '工业', value: 50, color: '#FF6B6B' }, { name: '农业', value: 10, color: '#4ECDC4' }, { name: '服务业', value: 40, color: '#FFD166' }],
                '重庆': [{ name: '工业', value: 45, color: '#FF6B6B' }, { name: '农业', value: 20, color: '#4ECDC4' }, { name: '服务业', value: 35, color: '#FFD166' }],
                '香港': [{ name: '工业', value: 5, color: '#FF6B6B' }, { name: '农业', value: 0, color: '#4ECDC4' }, { name: '服务业', value: 95, color: '#FFD166' }],
                '澳门': [{ name: '工业', value: 0, color: '#FF6B6B' }, { name: '农业', value: 0, color: '#4ECDC4' }, { name: '服务业', value: 100, color: '#FFD166' }],
                '台湾': [{ name: '工业', value: 40, color: '#FF6B6B' }, { name: '农业', value: 20, color: '#4ECDC4' }, { name: '服务业', value: 40, color: '#FFD166' }] // Dummy data if not provided by backend
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
            scatterData.value = fetchedScatterData;
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

    return {
        provinceData,
        scatterData,
        pieSeriesData,
        isLoading,
        error,
        fetchMapData // Expose the action
    };
});