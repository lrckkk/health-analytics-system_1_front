// src/stores/mapData.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
// Assume you're using axios
// import axios from 'axios';

export const useMapDataStore = defineStore('mapData', () => {
    // state: Stores your data
    const provinceData = ref([]);
    const scatterData = ref([]);
    const pieSeriesData = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    // actions: Used to modify state or perform asynchronous operations
    const fetchMapData = async () => {
        isLoading.value = true;
        error.value = null; // Reset any previous errors

        try {
            // **This is where your actual backend data fetching logic goes.**
            // Simulate asynchronous data fetching with a 2-second delay
            // await new Promise(resolve => setTimeout(resolve, 2000));

            // Assume the following data is fetched from the backend (in a real scenario, you'd use axios.get or fetch)
            const fetchedProvinceData = [
                { name: '广东', value: 126 }, { name: '河南', value: 94 }, { name: '山东', value: 101 },
                { name: '江苏', value: 85 }, { name: '四川', value: 83 }, { name: '河北', value: 75 },
                { name: '湖南', value: 66 }, { name: '安徽', value: 63 }, { name: '浙江', value: 65 },
                { name: '湖北', value: 59 }, { name: '广西', value: 49 }, { name: '江西', value: 45 },
                { name: '云南', value: 48 }, { name: '陕西', value: 39 }, { name: '辽宁', value: 43 },
                { name: '吉林', value: 27 }, { name: '山西', value: 37 }, { name: '新疆', value: 25.8 },
                { name: '甘肃', value: 26 }, { name: '海南', value: 10 }, { name: '宁夏', value: 6 },
                { name: '青海', value: 6 }, { name: '西藏', value: 3.5 }, { name: '北京', value: 21.9 },
                { name: '上海', value: 24.9 }, { name: '天津', value: 13 }, { name: '香港', value: 7.5 },
                { name: '澳门', value: 0.7 }, { name: '台湾', value: 0 }, { name: '黑龙江', value: 18 },
                { name: '内蒙古', value: 23.96 },
            ];

            const fetchedScatterData = [
                { name: '北京', value: [116.4074, 39.9042, 90] },
                { name: '上海', value: [121.4737, 31.2304, 85] },
                { name: '广州', value: [113.2644, 23.1291, 80] },
                { name: '成都', value: [104.0665, 30.5728, 75] },
                { name: '武汉', value: [114.3055, 30.5931, 70] },
                { name: '西安', value: [108.9398, 34.3416, 70] },
                { name: '杭州', value: [120.1551, 30.2741, 75] },
                { name: '南京', value: [118.7969, 32.0603, 70] },
                { name: '重庆', value: [106.5045, 29.5332, 68] },
                { name: '深圳', value: [114.0579, 22.5431, 82] },
                { name: '天津', value: [117.1902, 39.1255, 60] },
                { name: '苏州', value: [120.6196, 31.3179, 72] },
                { name: '长沙', value: [112.9823, 28.1941, 65] },
                { name: '郑州', value: [113.6654, 34.7579, 62] },
                { name: '青岛', value: [120.3551, 36.0883, 67] },
                { name: '厦门', value: [118.1000, 24.4600, 58] },
                { name: '福州', value: [119.3062, 26.0753, 55] },
                { name: '合肥', value: [117.2830, 31.8612, 59] },
                { name: '济南', value: [117.0009, 36.6758, 61] },
                { name: '沈阳', value: [123.4290, 41.7922, 53] },
                { name: '哈尔滨', value: [126.6424, 45.7569, 50] },
                { name: '长春', value: [125.3245, 43.8868, 52] },
                { name: '石家庄', value: [114.5025, 38.0455, 57] },
                { name: '太原', value: [112.5492, 37.8703, 54] },
                { name: '南昌', value: [115.8921, 28.6765, 56] },
                { name: '南宁', value: [108.3200, 22.8168, 48] },
                { name: '昆明', value: [102.7122, 25.0406, 47] },
                { name: '贵阳', value: [106.7134, 26.5783, 46] },
                { name: '拉萨', value: [91.1322, 29.6603, 30] },
                { name: '乌鲁木齐', value: [87.6177, 43.7928, 28] },
                { name: '兰州', value: [103.7342, 36.0827, 35] },
                { name: '银川', value: [106.2781, 38.4664, 32] },
                { name: '西宁', value: [101.7789, 36.6232, 29] },
                { name: '海口', value: [110.3312, 20.0319, 45] },
                { name: '呼和浩特', value: [111.7383, 40.8183, 38] },
            ];

            const piePositions = {
                '广东': [113.2644, 23.1291], '北京': [116.4074, 39.9042], '上海': [121.4737, 31.2304],
                '江苏': [118.7969, 32.0603], '浙江': [120.1551, 30.2741], '四川': [104.0665, 30.5728],
                '山东': [117.0009, 36.6758], '河南': [113.6654, 34.7579], '河北': [114.5025, 38.0455],
                '湖南': [112.9823, 28.1941], '湖北': [114.3055, 30.5931], '安徽': [117.2830, 31.8612],
                '辽宁': [123.4290, 41.7922], '陕西': [108.9398, 34.3416], '广西': [108.3200, 22.8168],
                '江西': [115.8921, 28.6765], '云南': [102.7122, 25.0406], '黑龙江': [126.6424, 45.7569],
                '吉林': [125.3245, 43.8868], '山西': [112.5492, 37.8703], '甘肃': [103.7342, 36.0827],
                '内蒙古': [111.7383, 40.8183], '新疆': [87.6177, 43.7928], '宁夏': [106.2781, 38.4664],
                '青海': [101.7789, 36.6232], '西藏': [91.1322, 29.6603], '海南': [110.3312, 20.0319],
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

            const fetchedPieSeriesData = Object.keys(provincePieData).map(provinceName => ({
                name: provinceName,
                value: piePositions[provinceName],
                pieData: provincePieData[provinceName]
            }));

            // Update the store's state
            provinceData.value = fetchedProvinceData;
            scatterData.value = fetchedScatterData;
            pieSeriesData.value = fetchedPieSeriesData;

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