// src/stores/RegionStore.js\
//卡片一
import { defineStore } from 'pinia';
import { provinceIdMap } from '@/utils/mapid.js';
import request from "@/utils/request.js"; // 假设 provinceIdMap.js 位于 src/utils 目录下

// 为了方便反向查找（名称到ID），我们创建一个反向映射
const provinceNameToIdMap = Object.entries(provinceIdMap).reduce((acc, [id, name]) => {
    acc[name] = parseInt(id); // 确保 ID 是数字类型
    return acc;
}, {});

export const useRegionStore = defineStore('regionStore', {
    state: () => ({
        // 初始化时，默认选中“全国”，其ID可以设置为0或特定值，这里我们用0
        selectedRegion: '全国', // 默认选中“全国”
        selectedRegionId: 0,   // 0 可以作为“全国”的ID，或者根据您的业务逻辑定义
        // componentA，医疗机构
        medicalDataCache: {},
        // B数据，病床
        medicalData2Cache:{},
        // C数据，花费
        costDataCache: {},
        //D数据，人员
        barChartWidth:{},
        //E数据，服务
        serviceDataCache:{},
        //F数据，人口
        populationDataCache:{},

        //下面是人均数据
        // 每万人床位
        bedavg:{},
        // 每万人门诊诊疗人次
        outpatientavg:{},
        // 每万人住院人数
        inpatientavg:{},
        // 每万人医疗机构
        institutionavg:{},
        // 人均医疗费用
        costavg:{},
        // 每万人医疗人员数
        personnelavg:{},
    }),
    actions: {
        /**
         * 设置当前选定的区域及其ID。
         * 如果点击的区域已选中，则取消选择（设置为 '全国' 和 0）。
         * @param {string} regionName 被点击的区域名称。
         */
        setSelectedRegion(regionName) {
            if (this.selectedRegion === regionName) {
                // 如果点击的是当前已选中的区域，则取消选择，恢复到“全国”视图
                this.selectedRegion = '全国';
                this.selectedRegionId = 0; // 假设“全国”的ID是0
                console.log(`区域取消选择，恢复为“全国”视图。当前区域: ${this.selectedRegion}, ID: ${this.selectedRegionId}`);
            } else {
                // 查找对应的ID
                const newRegionId = provinceNameToIdMap[regionName];
                if (newRegionId !== undefined) {
                    this.selectedRegion = regionName;
                    this.selectedRegionId = newRegionId;
                    console.log(`区域选择: ${this.selectedRegion}, ID: ${this.selectedRegionId}`);
                } else {
                    // 如果传入的 regionName 不在 provinceNameToIdMap 中，可能是一个错误或者需要特殊处理
                    console.warn(`setSelectedRegion: 未知区域名称 "${regionName}"，状态未更改。`);
                    // 也可以选择在这种情况下重置为默认值
                    // this.selectedRegion = '全国';
                    // this.selectedRegionId = 0;
                }
            }
        },
        /**
         * 清除区域选择，恢复到“全国”视图。
         */
        clearRegionSelection() {
            this.selectedRegion = '全国';
            this.selectedRegionId = 0;
            console.log('区域选择已清除，恢复为“全国”视图。');
        },
        async fetchMedicalDataIfNeeded(regionId) {
            // 如果没有传入 regionId 或者为 0，我们默认查北京(id=1)
            const effectiveRegionId = regionId === undefined || regionId === 0 ? 0 : regionId;

            // 1. 检查缓存中是否存在数据
            if (this.medicalDataCache[effectiveRegionId]) {
                console.log(`从 Pinia 缓存中命中数据, regionId: ${effectiveRegionId}`);
                // 2. 如果存在，直接返回缓存的数据
                return this.medicalDataCache[effectiveRegionId];
            }
            // 3. 如果不存在，发起网络请求
            console.log(`缓存未命中，正在从 API 请求数据, regionId: ${effectiveRegionId}`);
            try {
                const response = await request.get(`/api/provinces/${effectiveRegionId}/institution/years`)
                const processedData = (response.data || response).map(item => ({
                    year: String(item.year),
                    count: Number(item.total)
                }));

                // 4. 请求成功后，将数据存入缓存
                this.medicalDataCache[effectiveRegionId] = processedData;
                console.log(`数据已存入 Pinia 缓存, regionId: ${effectiveRegionId}`);

                // 5. 返回新获取的数据
                return processedData;

            } catch (error) {
                console.error(`获取 regionId: ${effectiveRegionId} 的医疗机构数据失败:`, error);
                // 发生错误时，可以缓存一个空数组防止重复请求错误接口
                this.medicalDataCache[effectiveRegionId] = [];
                return []; // 或者可以抛出错误 throw error;
            }

    },
        async fetchMedicalData2IfNeeded(regionId) {
            // 如果没有传入 regionId 或者为 0，我们默认查北京(id=1)
            const effectiveRegionId = regionId === undefined || regionId === 0 ? 0 : regionId;

            // 1. 检查缓存中是否存在数据
            if (this.medicalData2Cache[effectiveRegionId]) {
                console.log(`从 Pinia 缓存中命中数据, regionId: ${effectiveRegionId}`);
                // 2. 如果存在，直接返回缓存的数据
                return this.medicalData2Cache[effectiveRegionId];
            }

            // 3. 如果不存在，发起网络请求
            console.log(`缓存未命中，正在从 API 请求数据, regionId: ${effectiveRegionId}`);
            try {
                const response = await request.get(`/api/provinces/${effectiveRegionId}/bed/years`)
                const processedData = (response.data || response).map(item => ({
                    year: String(item.year),
                    count: Number(item.total)
                }));

                // 4. 请求成功后，将数据存入缓存
                this.medicalData2Cache[effectiveRegionId] = processedData;
                console.log(`数据已存入 Pinia 缓存, regionId: ${effectiveRegionId}`);

                // 5. 返回新获取的数据
                return processedData;

            } catch (error) {
                console.error(`获取 regionId: ${effectiveRegionId} 的医疗机构数据失败:`, error);
                // 发生错误时，可以缓存一个空数组防止重复请求错误接口
                this.medicalData2Cache[effectiveRegionId] = [];
                return []; // 或者可以抛出错误 throw error;
            }

        },
        async fetchCostDataIfNeeded(regionId) {
            // 如果没有传入 regionId 或者为 0，我们默认查北京(id=1)
            const effectiveRegionId = regionId === undefined || regionId === 0 ? 0 : regionId;

            // 1. 检查缓存中是否存在数据
            if (this.costDataCache[effectiveRegionId]) {
                console.log(`从 Pinia 缓存中命中数据, regionId: ${effectiveRegionId}`);
                // 2. 如果存在，直接返回缓存的数据
                return this.costDataCache[effectiveRegionId];
            }

            // 3. 如果不存在，发起网络请求
            console.log(`缓存未命中，正在从 API 请求数据, regionId: ${effectiveRegionId}`);
            try {
                const response = await request.get(`/api/provinces/${effectiveRegionId}/cost/years`)
                const processedData = (response.data || response).map(item => ({
                    year: String(item.year),
                    count: Number(item.total)
                }));

                // 4. 请求成功后，将数据存入缓存
                this.costDataCache[effectiveRegionId] = processedData;
                console.log(`数据已存入 Pinia 缓存, regionId: ${effectiveRegionId}`);

                // 5. 返回新获取的数据
                return processedData;

            } catch (error) {
                console.error(`获取 regionId: ${effectiveRegionId} 的医疗机构数据失败:`, error);
                // 发生错误时，可以缓存一个空数组防止重复请求错误接口
                this.costDataCache[effectiveRegionId] = [];
                return []; // 或者可以抛出错误 throw error;
            }

        },
        async fetchbarChartWidthIfNeeded(regionId) {
            // 如果没有传入 regionId 或者为 0，我们默认查北京(id=1)
            const effectiveRegionId = regionId === undefined || regionId === 0 ? 0 : regionId;

            // 1. 检查缓存中是否存在数据
            if (this.barChartWidth[effectiveRegionId]) {
                console.log(`从 Pinia 缓存中命中数据, regionId: ${effectiveRegionId}`);
                // 2. 如果存在，直接返回缓存的数据
                return this.barChartWidth[effectiveRegionId];
            }

            // 3. 如果不存在，发起网络请求
            console.log(`缓存未命中，正在从 API 请求数据, regionId: ${effectiveRegionId}`);
            try {
                const response = await request.get(`/api/provinces/${effectiveRegionId}/personnel/years`)
                const processedData = (response.data || response).map(item => ({
                    year: String(item.year),
                    count: Number(item.total)
                }));

                // 4. 请求成功后，将数据存入缓存
                this.barChartWidth[effectiveRegionId] = processedData;
                console.log(`数据已存入 Pinia 缓存, regionId: ${effectiveRegionId}`);

                // 5. 返回新获取的数据
                return processedData;

            } catch (error) {
                console.error(`获取 regionId: ${effectiveRegionId} 的医疗机构数据失败:`, error);
                // 发生错误时，可以缓存一个空数组防止重复请求错误接口
                this.barChartWidth[effectiveRegionId] = [];
                return []; // 或者可以抛出错误 throw error;
            }

        },
        async fetchserviceDataIfNeeded(regionId) {
            // 如果没有传入 regionId 或者为 0，我们默认查北京(id=1)
            const effectiveRegionId = regionId === undefined || regionId === 0 ? 0 : regionId;

            // 1. 检查缓存中是否存在数据
            if (this.serviceDataCache[effectiveRegionId]) {
                console.log(`从 Pinia 缓存中命中数据, regionId: ${effectiveRegionId}`);
                // 2. 如果存在，直接返回缓存的数据
                return this.serviceDataCache[effectiveRegionId];
            }

            // 3. 如果不存在，发起网络请求
            console.log(`缓存未命中，正在从 API 请求数据, regionId: ${effectiveRegionId}`);
            try {
                const response = await request.get(`/api/provinces/${regionId}/service/years`)
                const processedData = (response.data || response).map(item => ({
                    year: String(item.year), // 强制转为字符串
                    outpatientVisits: Number(item.outpatientVisits), // 门诊量
                    inpatientAdmissions: Number(item.inpatientAdmissions) // 住院量
                }));

                // 4. 请求成功后，将数据存入缓存
                this.serviceDataCache[effectiveRegionId] = processedData;
                console.log(`数据已存入 Pinia 缓存, regionId: ${effectiveRegionId}`);

                // 5. 返回新获取的数据
                return processedData;

            } catch (error) {
                console.error(`获取 regionId: ${effectiveRegionId} 的医疗机构数据失败:`, error);
                // 发生错误时，可以缓存一个空数组防止重复请求错误接口
                this.serviceDataCache[effectiveRegionId] = [];
                return []; // 或者可以抛出错误 throw error;
            }

        },
        async fetchPopulationDataIfNeeded(regionId) {
            // 如果没有传入 regionId 或者为 0，我们默认查北京(id=1)
            const effectiveRegionId = regionId === undefined || regionId === 0 ? 0 : regionId;

            // 1. 检查缓存中是否存在数据
            if (this.populationDataCache[effectiveRegionId]) {
                console.log(`从 Pinia 缓存中命中数据, regionId: ${effectiveRegionId}`);
                // 2. 如果存在，直接返回缓存的数据
                return this.populationDataCache[effectiveRegionId];
            }

            // 3. 如果不存在，发起网络请求
            console.log(`缓存未命中，正在从 API 请求数据, regionId: ${effectiveRegionId}`);
            try {
                const response = await request.get(`/api/provinces/${effectiveRegionId}/population/years`)
                const processedData = (response.data || response).map(item => ({
                    year: String(item.year),
                    count: Number(item.total)
                }));

                // 4. 请求成功后，将数据存入缓存
                this.populationDataCache[effectiveRegionId] = processedData;
                console.log(`数据已存入 Pinia 缓存, regionId: ${effectiveRegionId}`);

                // 5. 返回新获取的数据
                return processedData;

            } catch (error) {
                console.error(`获取 regionId: ${effectiveRegionId} 的医疗机构数据失败:`, error);
                // 发生错误时，可以缓存一个空数组防止重复请求错误接口
                this.populationDataCache[effectiveRegionId] = [];
                return []; // 或者可以抛出错误 throw error;
            }

        },
        async fetchinstitutionavgIfNeeded(regionId) {
            // 如果没有传入 regionId 或者为 0，我们默认查北京(id=1)
            const effectiveRegionId = regionId === undefined || regionId === 0 ? 0 : regionId;

            // 1. 检查缓存中是否存在数据
            if (this.institutionavg[effectiveRegionId]) {
                console.log(`从 Pinia 缓存中命中数据, regionId: ${effectiveRegionId}`);
                // 2. 如果存在，直接返回缓存的数据
                return this.institutionavg[effectiveRegionId];
            }

            // 3. 如果不存在，发起网络请求
            try {
                const response = await request.get(`/api/provinces/${effectiveRegionId}/institution/per10k`)
                const processedData = (response.data || response).map(item => ({
                    year: String(item.year),
                    count: Number(item.total)
                }));

                // 4. 请求成功后，将数据存入缓存
                this.institutionavg[effectiveRegionId] = processedData;
                console.log(`数据已存入 Pinia 缓存, regionId: ${effectiveRegionId}`);

                // 5. 返回新获取的数据
                return processedData;

            } catch (error) {
                console.error(`获取 regionId: ${effectiveRegionId} 的医疗机构数据失败:`, error);
                // 发生错误时，可以缓存一个空数组防止重复请求错误接口
                this.institutionavg[effectiveRegionId] = [];
                return []; // 或者可以抛出错误 throw error;
            }

        },
        async fetchbedavgIfNeeded(regionId) {
            // 如果没有传入 regionId 或者为 0，我们默认查北京(id=1)
            const effectiveRegionId = regionId === undefined || regionId === 0 ? 0 : regionId;

            // 1. 检查缓存中是否存在数据
            if (this.bedavg[effectiveRegionId]) {
                console.log(`从 Pinia 缓存中命中数据, regionId: ${effectiveRegionId}`);
                // 2. 如果存在，直接返回缓存的数据
                return this.bedavg[effectiveRegionId];
            }

            // 3. 如果不存在，发起网络请求
            try {
                const response = await request.get(`/api/provinces/${effectiveRegionId}/bed/per10k`)
                const processedData = (response.data || response).map(item => ({
                    year: String(item.year),
                    count: Number(item.total)
                }));

                // 4. 请求成功后，将数据存入缓存
                this.bedavg[effectiveRegionId] = processedData;
                console.log(`数据已存入 Pinia 缓存, regionId: ${effectiveRegionId}`);

                // 5. 返回新获取的数据
                return processedData;

            } catch (error) {
                console.error(`获取 regionId: ${effectiveRegionId} 的医疗机构数据失败:`, error);
                // 发生错误时，可以缓存一个空数组防止重复请求错误接口
                this.bedavg[effectiveRegionId] = [];
                return []; // 或者可以抛出错误 throw error;
            }

        },
        async fetchpersonnelavgIfNeeded(regionId) {
            // 如果没有传入 regionId 或者为 0，我们默认查北京(id=1)
            const effectiveRegionId = regionId === undefined || regionId === 0 ? 0 : regionId;

            // 1. 检查缓存中是否存在数据
            if (this.personnelavg[effectiveRegionId]) {
                console.log(`从 Pinia 缓存中命中数据, regionId: ${effectiveRegionId}`);
                // 2. 如果存在，直接返回缓存的数据
                return this.personnelavg[effectiveRegionId];
            }

            // 3. 如果不存在，发起网络请求
            try {
                const response = await request.get(`/api/provinces/${effectiveRegionId}/personnel/per10k`)
                const processedData = (response.data || response).map(item => ({
                    year: String(item.year),
                    count: Number(item.total)
                }));

                // 4. 请求成功后，将数据存入缓存
                this.personnelavg[effectiveRegionId] = processedData;
                console.log(`数据已存入 Pinia 缓存, regionId: ${effectiveRegionId}`);

                // 5. 返回新获取的数据
                return processedData;

            } catch (error) {
                console.error(`获取 regionId: ${effectiveRegionId} 的医疗机构数据失败:`, error);
                // 发生错误时，可以缓存一个空数组防止重复请求错误接口
                this.personnelavg[effectiveRegionId] = [];
                return []; // 或者可以抛出错误 throw error;
            }

        },
        async fetchcostavgIfNeeded(regionId) {
            // 如果没有传入 regionId 或者为 0，我们默认查北京(id=1)
            const effectiveRegionId = regionId === undefined || regionId === 0 ? 0 : regionId;

            // 1. 检查缓存中是否存在数据
            if (this.costavg[effectiveRegionId]) {
                console.log(`从 Pinia 缓存中命中数据, regionId: ${effectiveRegionId}`);
                // 2. 如果存在，直接返回缓存的数据
                return this.costavg[effectiveRegionId];
            }

            // 3. 如果不存在，发起网络请求
            try {
                const response = await request.get(`/api/provinces/${effectiveRegionId}/cost/percapita`)
                const processedData = (response.data || response).map(item => ({
                    year: String(item.year),
                    count: Number(item.total)
                }));

                // 4. 请求成功后，将数据存入缓存
                this.costavg[effectiveRegionId] = processedData;
                console.log(`数据已存入 Pinia 缓存, regionId: ${effectiveRegionId}`);

                // 5. 返回新获取的数据
                return processedData;

            } catch (error) {
                console.error(`获取 regionId: ${effectiveRegionId} 的医疗机构数据失败:`, error);
                // 发生错误时，可以缓存一个空数组防止重复请求错误接口
                this.costavg[effectiveRegionId] = [];
                return []; // 或者可以抛出错误 throw error;
            }

        },

        async fetchoinpatientavgavgIfNeeded(regionId) {
            // 如果没有传入 regionId 或者为 0，我们默认查北京(id=1)
            const effectiveRegionId = regionId === undefined || regionId === 0 ? 0 : regionId;

            // 1. 检查缓存中是否存在数据
            if (this.inpatientavg[effectiveRegionId]) {
                console.log(`从 Pinia 缓存中命中数据, regionId: ${effectiveRegionId}`);
                // 2. 如果存在，直接返回缓存的数据
                return this.inpatientavg[effectiveRegionId];
            }

            // 3. 如果不存在，发起网络请求
            try {
                const response = await request.get(`/api/provinces/${effectiveRegionId}/service/inpatient/per10k`)
                const processedData = (response.data || response).map(item => ({
                    year: String(item.year),
                    count: Number(item.total)
                }));

                // 4. 请求成功后，将数据存入缓存
                this.inpatientavg[effectiveRegionId] = processedData;
                console.log(`数据已存入 Pinia 缓存, regionId: ${effectiveRegionId}`);

                // 5. 返回新获取的数据
                return processedData;

            } catch (error) {
                console.error(`获取 regionId: ${effectiveRegionId} 的医疗机构数据失败:`, error);
                // 发生错误时，可以缓存一个空数组防止重复请求错误接口
                this.inpatientavg[effectiveRegionId] = [];
                return []; // 或者可以抛出错误 throw error;
            }

        },
        async fetchoutpatientavgIfNeeded(regionId) {
            // 如果没有传入 regionId 或者为 0，我们默认查北京(id=1)
            const effectiveRegionId = regionId === undefined || regionId === 0 ? 0 : regionId;

            // 1. 检查缓存中是否存在数据
            if (this.outpatientavg[effectiveRegionId]) {
                console.log(`从 Pinia 缓存中命中数据, regionId: ${effectiveRegionId}`);
                // 2. 如果存在，直接返回缓存的数据
                return this.outpatientavg[effectiveRegionId];
            }

            // 3. 如果不存在，发起网络请求
            try {
                const response = await request.get(`/api/provinces/${effectiveRegionId}/service/outpatient/per10k`)
                const processedData = (response.data || response).map(item => ({
                    year: String(item.year),
                    count: Number(item.total)
                }));

                // 4. 请求成功后，将数据存入缓存
                this.outpatientavg[effectiveRegionId] = processedData;
                console.log(`数据已存入 Pinia 缓存, regionId: ${effectiveRegionId}`);

                // 5. 返回新获取的数据
                return processedData;

            } catch (error) {
                console.error(`获取 regionId: ${effectiveRegionId} 的医疗机构数据失败:`, error);
                // 发生错误时，可以缓存一个空数组防止重复请求错误接口
                this.outpatientavg[effectiveRegionId] = [];
                return []; // 或者可以抛出错误 throw error;
            }

        },

    },
    getters: {
        // 获取当前选定区域的显示名称
        getDisplayRegion: (state) => {
            return state.selectedRegion;
        },
        // 获取当前选定区域的ID
        getRegionId: (state) => {
            return state.selectedRegionId;
        },
        // 判断某个区域是否被选中
        isRegionSelected: (state) => (regionName) => state.selectedRegion === regionName,
    }
});