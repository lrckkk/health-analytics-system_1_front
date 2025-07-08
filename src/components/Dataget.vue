<template>
  <el-card class="futuristic-card province-data-viewer-card">
    <template #header>
      <div class="card-header">
        <h3 class="futuristic-title">
          {{ regionStore.getDisplayRegion }} 数据概览
          <span v-if="regionStore.getRegionId !== 0" class="region-id-display">
            (ID: {{ regionStore.getRegionId }})
          </span>
        </h3>
        <div class="controls">
          <div class="year-selection-buttons" :class="{ 'is-disabled': availableYears.length === 0 || isLoading }">
            <button
                v-for="year in availableYears"
                :key="year"
                @click="selectedYear = year"
                class="futuristic-year-button"
                :class="{ 'is-active': selectedYear === year }"
                :disabled="isLoading"
            >
              {{ year }}
            </button>
          </div>
          <el-button
              type="primary"
              class="futuristic-button export-button"
              @click="exportDataToTxt"
              :disabled="!hasData || isLoading"
          >
            导出数据为TXT
          </el-button>
          <el-button
              type="success"
              class="futuristic-button export-excel-button"
              @click="exportDataToExcel"
              :disabled="!hasData || isLoading"
          >
            导出数据为Excel
          </el-button>
        </div>
      </div>
    </template>

    <div v-loading="isLoading" element-loading-background="rgba(0, 0, 0, 0.7)" class="data-content">
      <div v-if="!hasData" class="empty-placeholder">
        <span>暂无数据或正在加载...</span>
      </div>
      <div v-else>
        <h4 class="section-title">
          <el-icon><Calendar /></el-icon>
          {{ selectedYear }} 年数据
        </h4>
        <div class="current-year-data-grid">
          <div class="data-item">
            <span class="label">医疗机构:</span>
            <span class="value">{{ formatValue(currentYearData.medicalData?.count) }}</span>
          </div>
          <div class="data-item">
            <span class="label">病床数量:</span>
            <span class="value">{{ formatValue(currentYearData.medicalData2?.count) }}</span>
          </div>
          <div class="data-item">
            <span class="label">医疗花费:</span>
            <span class="value">{{ formatValue(currentYearData.costData?.count) }}</span>
          </div>
          <div class="data-item">
            <span class="label">医疗人员:</span>
            <span class="value">{{ formatValue(currentYearData.personnelData?.count) }}</span>
          </div>
          <div class="data-item">
            <span class="label">门诊量:</span>
            <span class="value">{{ formatValue(currentYearData.serviceData?.outpatientVisits) }}</span>
          </div>
          <div class="data-item">
            <span class="label">住院量:</span>
            <span class="value">{{ formatValue(currentYearData.serviceData?.inpatientAdmissions) }}</span>
          </div>
          <div class="data-item">
            <span class="label">人口数量:</span>
            <span class="value">{{ formatValue(currentYearData.populationData?.count, true) }}</span>
          </div>

          <div class="data-item">
            <span class="label">每万人床位:</span>
            <span class="value">{{ formatValue(currentYearData.bedavg?.count) }}</span>
          </div>
          <div class="data-item">
            <span class="label">每万人门诊:</span>
            <span class="value">{{ formatValue(currentYearData.outpatientavg?.count) }}</span>
          </div>
          <div class="data-item">
            <span class="label">每万人住院:</span>
            <span class="value">{{ formatValue(currentYearData.inpatientavg?.count) }}</span>
          </div>
          <div class="data-item">
            <span class="label">每万人机构:</span>
            <span class="value">{{ formatValue(currentYearData.institutionavg?.count) }}</span>
          </div>
          <div class="data-item">
            <span class="label">人均医疗费:</span>
            <span class="value">{{ formatValue(currentYearData.costavg?.count) }}</span>
          </div>
          <div class="data-item">
            <span class="label">每万人人员:</span>
            <span class="value">{{ formatValue(currentYearData.personnelavg?.count) }}</span>
          </div>
        </div>

        <h4 class="section-title mt-4">
          <el-icon><TrendCharts /></el-icon>
          历年数据
        </h4>
        <el-table
            :data="Object.values(historicalData)"
            style="width: 100%"
            max-height="450"
            class="futuristic-table"
        >
          <el-table-column prop="year" label="年份" width="77" fixed sortable></el-table-column>
          <el-table-column label="医疗机构" width="78">
            <template #default="{ row }">{{ formatValue(row.medicalData?.count) }}</template>
          </el-table-column>
          <el-table-column label="病床数量" width="78">
            <template #default="{ row }">{{ formatValue(row.medicalData2?.count) }}</template>
          </el-table-column>
          <el-table-column label="医疗花费" width="78">
            <template #default="{ row }">{{ formatValue(row.costData?.count) }}</template>
          </el-table-column>
          <el-table-column label="医疗人员" width="78">
            <template #default="{ row }">{{ formatValue(row.personnelData?.count) }}</template>
          </el-table-column>
          <el-table-column label="门诊量" width="78">
            <template #default="{ row }">{{ formatValue(row.serviceData?.outpatientVisits) }}</template>
          </el-table-column>
          <el-table-column label="住院量" width="78">
            <template #default="{ row }">{{ formatValue(row.serviceData?.inpatientAdmissions) }}</template>
          </el-table-column>
          <el-table-column label="人口数量" width="78">
            <template #default="{ row }">{{ formatValue(row.populationData?.count, true) }}</template>
          </el-table-column>

          <el-table-column label="每万人床位" width="90">
            <template #default="{ row }">{{ formatValue(row.bedavg?.count) }}</template>
          </el-table-column>
          <el-table-column label="每万人门诊" width="90">
            <template #default="{ row }">{{ formatValue(row.outpatientavg?.count) }}</template>
          </el-table-column>
          <el-table-column label="每万人住院" width="90">
            <template #default="{ row }">{{ formatValue(row.inpatientavg?.count) }}</template>
          </el-table-column>
          <el-table-column label="每万人机构" width="90">
            <template #default="{ row }">{{ formatValue(row.institutionavg?.count) }}</template>
          </el-table-column>
          <el-table-column label="人均医疗费" width="90">
            <template #default="{ row }">{{ formatValue(row.costavg?.count) }}</template>
          </el-table-column>
          <el-table-column label="每万人人员" width="90">
            <template #default="{ row }">{{ formatValue(row.personnelavg?.count) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useRegionStore } from '@/stores/RegionData.js'; // 确保路径正确
import { ElCard, ElButton, ElTable, ElTableColumn, ElIcon, ElLoading } from 'element-plus';
import { Calendar, TrendCharts } from '@element-plus/icons-vue';

// 引入 xlsx 和 file-saver 库，用于导出 Excel
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Pinia Store 实例
const regionStore = useRegionStore();

// 响应式变量
const selectedYear = ref(null); // 当前选中的年份
const availableYears = ref([]); // 可用的年份列表
const historicalData = ref({}); // 存储所有历年数据的对象，键为年份
const currentYearData = ref({}); // 存储当前选中年份的数据
const isLoading = ref(false); // 加载状态

// 计算属性：判断是否有数据可以显示
const hasData = computed(() => {
  return Object.keys(historicalData.value).length > 0;
});

/**
 * 格式化数值以便显示。
 * 如果值为 null, undefined 或 NaN，显示 '-'。
 * 如果值为整数，返回整数；否则四舍五入到一位小数。
 * 可选地添加 '万' 后缀。
 * @param {number} value - 要格式化的数值。
 * @param {boolean} addWanSuffix - 是否添加 '万' 后缀。
 * @returns {string|number} 格式化后的字符串或原始数值。
 */
const formatValue = (value, addWanSuffix = false) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }
  let formatted = Number.isInteger(value) ? value : value.toFixed(1);
  if (addWanSuffix) {
    return `${formatted}万`;
  }
  return formatted;
};

/**
 * 异步获取并处理所有数据类型，包括新增的平均数据。
 * 将数据整合到 historicalData 对象中，并更新可用年份。
 */
const fetchAndProcessAllData = async () => {
  isLoading.value = true;
  const regionId = regionStore.getRegionId;
  const currentRegionName = regionStore.getDisplayRegion;

  console.log(`[ProvinceDataViewer] Starting data fetch for ${currentRegionName} (ID: ${regionId})...`);

  // 清除现有数据和年份
  historicalData.value = {};
  availableYears.value = [];
  selectedYear.value = null;
  currentYearData.value = {};

  try {
    // 并发请求所有数据，包括新增的平均数据
    const [
      medicalData,
      medicalData2,
      costData,
      personnelData,
      serviceData,
      populationData,
      // --- 新增：平均数据请求 ---
      bedavgData,
      outpatientavgData,
      inpatientavgData,
      institutionavgData,
      costavgData,
      personnelavgData
    ] = await Promise.all([
      regionStore.fetchMedicalDataIfNeeded(regionId),
      regionStore.fetchMedicalData2IfNeeded(regionId),
      regionStore.fetchCostDataIfNeeded(regionId),
      regionStore.fetchbarChartWidthIfNeeded(regionId), // 对应 medical personnel 数据
      regionStore.fetchserviceDataIfNeeded(regionId),
      regionStore.fetchPopulationDataIfNeeded(regionId),
      // --- 新增：平均数据请求 Pinia action ---
      regionStore.fetchbedavgIfNeeded(regionId),
      regionStore.fetchoutpatientavgIfNeeded(regionId),
      regionStore.fetchoinpatientavgavgIfNeeded(regionId),
      regionStore.fetchinstitutionavgIfNeeded(regionId),
      regionStore.fetchcostavgIfNeeded(regionId),
      regionStore.fetchpersonnelavgIfNeeded(regionId)
    ]);

    // 将数据整合到 historicalData 对象中
    const allYears = new Set();

    // 辅助函数，将数据合并到 historicalData
    const mergeData = (dataArray, type) => {
      if (!dataArray || !Array.isArray(dataArray)) {
        console.warn(`[ProvinceDataViewer] mergeData: ${type} received invalid or empty array.`, dataArray);
        return;
      }
      dataArray.forEach(item => {
        const year = String(item.year);
        allYears.add(year);
        if (!historicalData.value[year]) {
          historicalData.value[year] = { year: year };
        }
        // 根据数据类型合并字段
        if (type === 'serviceData') {
          historicalData.value[year].serviceData = {
            outpatientVisits: item.outpatientVisits,
            inpatientAdmissions: item.inpatientAdmissions
          };
        } else {
          // 对于其他只有 'count' 字段的数据类型
          historicalData.value[year][type] = { count: item.count };
        }
      });
    };

    // 现有数据合并
    mergeData(medicalData, 'medicalData');
    mergeData(medicalData2, 'medicalData2');
    mergeData(costData, 'costData');
    mergeData(personnelData, 'personnelData'); // 确认这里使用 'personnelData'
    mergeData(serviceData, 'serviceData');
    mergeData(populationData, 'populationData');

    // --- 新增：平均数据合并 ---
    mergeData(bedavgData, 'bedavg');
    mergeData(outpatientavgData, 'outpatientavg');
    mergeData(inpatientavgData, 'inpatientavg');
    mergeData(institutionavgData, 'institutionavg');
    mergeData(costavgData, 'costavg');
    mergeData(personnelavgData, 'personnelavg');
    // --- 新增数据合并结束 ---

    // 更新并排序可用年份
    availableYears.value = Array.from(allYears).sort((a, b) => parseInt(a) - parseInt(b));

    // 默认选择最新年份
    if (availableYears.value.length > 0) {
      selectedYear.value = availableYears.value[availableYears.value.length - 1];
    }

    console.log(`[ProvinceDataViewer] Data fetch completed for ${currentRegionName} (ID: ${regionId}).`);
    console.log(`[ProvinceDataViewer] Final historicalData structure:`, historicalData.value);

  } catch (error) {
    console.error(`[ProvinceDataViewer] Failed to fetch data for ${currentRegionName} (ID: ${regionId}):`, error);
    // 可以在这里设置错误状态，例如显示错误消息
  } finally {
    isLoading.value = false;
  }
};

/**
 * 更新当前选中年份的显示数据。
 */
const updateCurrentYearDisplay = () => {
  if (selectedYear.value && historicalData.value[selectedYear.value]) {
    currentYearData.value = historicalData.value[selectedYear.value];
  } else {
    currentYearData.value = {};
  }
  console.log(`[ProvinceDataViewer] Current year data (${selectedYear.value}):`, currentYearData.value);
};

/**
 * 将数据导出为 TXT 文件。
 */
const exportDataToTxt = () => {
  if (!hasData.value) {
    console.warn('No data to export.');
    return;
  }

  const regionName = regionStore.getDisplayRegion;
  const regionId = regionStore.getRegionId;
  let exportContent = `--- ${regionName} (ID: ${regionId}) 历年医疗数据概览 ---\n`;
  exportContent += `导出时间: ${new Date().toLocaleString()}\n\n`;

  // 定义数据类型到中文标签的映射，包括新增项
  const dataLabels = {
    medicalData: '医疗机构数量',
    medicalData2: '病床数量',
    costData: '医疗花费',
    personnelData: '医疗人员',
    serviceData: '医疗服务',
    populationData: '人口数量',
    // --- 新增标签 ---
    bedavg: '每万人床位',
    outpatientavg: '每万人门诊诊疗人次',
    inpatientavg: '每万人住院人数',
    institutionavg: '每万人医疗机构',
    costavg: '人均医疗费用',
    personnelavg: '每万人医疗人员数'
  };

  // 遍历所有年份的数据
  const sortedYears = Object.keys(historicalData.value).sort((a, b) => parseInt(a) - parseInt(b));

  sortedYears.forEach(year => {
    const yearData = historicalData.value[year];
    exportContent += `=== 年份: ${year} ===\n`;

    // 现有数据
    if (yearData.medicalData?.count !== undefined) {
      exportContent += `  ${dataLabels.medicalData}: ${formatValue(yearData.medicalData.count)}\n`;
    }
    if (yearData.medicalData2?.count !== undefined) {
      exportContent += `  ${dataLabels.medicalData2}: ${formatValue(yearData.medicalData2.count)}\n`;
    }
    if (yearData.costData?.count !== undefined) {
      exportContent += `  ${dataLabels.costData}: ${formatValue(yearData.costData.count)}\n`;
    }
    if (yearData.personnelData?.count !== undefined) {
      exportContent += `  ${dataLabels.personnelData}: ${formatValue(yearData.personnelData.count)}\n`;
    }
    if (yearData.serviceData?.outpatientVisits !== undefined || yearData.serviceData?.inpatientAdmissions !== undefined) {
      exportContent += `  ${dataLabels.serviceData}:\n`;
      exportContent += `    门诊量: ${formatValue(yearData.serviceData?.outpatientVisits)}\n`;
      exportContent += `    住院量: ${formatValue(yearData.serviceData?.inpatientAdmissions)}\n`;
    }
    if (yearData.populationData?.count !== undefined) {
      exportContent += `  ${dataLabels.populationData}: ${formatValue(yearData.populationData.count, true)}\n`;
    }

    // --- 新增数据 for TXT ---
    if (yearData.bedavg?.count !== undefined) {
      exportContent += `  ${dataLabels.bedavg}: ${formatValue(yearData.bedavg.count)}\n`;
    }
    if (yearData.outpatientavg?.count !== undefined) {
      exportContent += `  ${dataLabels.outpatientavg}: ${formatValue(yearData.outpatientavg.count)}\n`;
    }
    if (yearData.inpatientavg?.count !== undefined) {
      exportContent += `  ${dataLabels.inpatientavg}: ${formatValue(yearData.inpatientavg.count)}\n`;
    }
    if (yearData.institutionavg?.count !== undefined) {
      exportContent += `  ${dataLabels.institutionavg}: ${formatValue(yearData.institutionavg.count)}\n`;
    }
    if (yearData.costavg?.count !== undefined) {
      exportContent += `  ${dataLabels.costavg}: ${formatValue(yearData.costavg.count)}\n`;
    }
    if (yearData.personnelavg?.count !== undefined) {
      exportContent += `  ${dataLabels.personnelavg}: ${formatValue(yearData.personnelavg.count)}\n`;
    }
    // --- 新增数据 for TXT 结束 ---

    exportContent += '\n'; // 每年数据之间添加空行
  });

  // 创建 Blob 并下载
  const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${regionName}_历年医疗数据.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`数据已导出到 ${a.download}`);
};

/**
 * 将数据导出为 Excel 文件。
 */
const exportDataToExcel = () => {
  if (!hasData.value) {
    console.warn('No data to export to Excel.');
    return;
  }

  const regionName = regionStore.getDisplayRegion;

  // 定义 Excel 表格的列头，包括新增项
  const headers = [
    "年份",
    "医疗机构数量",
    "病床数量",
    "医疗花费",
    "医疗人员",
    "门诊量",
    "住院量",
    "人口数量",
    // --- 新增表头 ---
    "每万人床位",
    "每万人门诊",
    "每万人住院",
    "每万人机构",
    "人均医疗费",
    "每万人人员"
  ];

  // 为 Excel 准备数据
  // 遍历 historicalData 对象，将其转换为符合 Excel 格式的二维数组
  const excelData = Object.values(historicalData.value).map(yearData => {
    return [
      yearData.year,
      formatValue(yearData.medicalData?.count),
      formatValue(yearData.medicalData2?.count),
      formatValue(yearData.costData?.count),
      formatValue(yearData.personnelData?.count),
      formatValue(yearData.serviceData?.outpatientVisits),
      formatValue(yearData.serviceData?.inpatientAdmissions),
      formatValue(yearData.populationData?.count, true),
      // --- 新增数据 for Excel rows ---
      formatValue(yearData.bedavg?.count),
      formatValue(yearData.outpatientavg?.count),
      formatValue(yearData.inpatientavg?.count),
      formatValue(yearData.institutionavg?.count),
      formatValue(yearData.costavg?.count),
      formatValue(yearData.personnelavg?.count)
    ];
  });

  // 将列头添加到数据数组的开头
  const dataForSheet = [headers, ...excelData];

  // 创建一个新的工作簿和工作表
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(dataForSheet); // AoA (Array of Arrays) 转为 sheet

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(wb, ws, "历年医疗数据");

  // 从工作簿生成二进制缓冲区
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  // 使用 file-saver 保存文件
  const fileName = `${regionName}_历年医疗数据.xlsx`;
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);

  console.log(`数据已导出到 ${fileName}`);
};


// --- Watchers ---
// 监听 Pinia store 中 selectedRegionId 的变化，当省份改变时重新获取数据
watch(() => regionStore.selectedRegionId, (newId, oldId) => {
  if (newId !== oldId) {
    fetchAndProcessAllData();
  }
}, { immediate: true }); // immediate: true 确保组件挂载时立即运行一次

// 监听 selectedYear 的变化，更新当前年份的显示数据
watch(selectedYear, (newYear) => {
  updateCurrentYearDisplay();
});

// --- 生命周期钩子 ---
onMounted(() => {
  // 初始数据获取已由 selectedRegionId 的 immediate watch 触发
});
</script>

<style scoped lang="scss">
// 定义科技感主题颜色变量
$tech-blue: #03045E;        // 深蓝色，作为基础背景
$tech-cyan: #7DF9FF;        // 亮青色，用于标题和突出显示
$tech-lightblue: #90E0EF;   // 浅蓝色，用于次要文本和边框
$tech-darkblue: #023E8A;    // 较深的蓝色，用于卡片和表格背景
$tech-text: #CAF0F8;        // 浅色文本，接近白色

.province-data-viewer-card {
  width: 100%;
  max-width: 1232px; /* 保持最大宽度 */
  margin: 10px auto; /* 缩小外边距 */
  border: none;
  background: linear-gradient(135deg, $tech-blue 0%, $tech-darkblue 100%); /* 渐变背景 */
  box-shadow: 0 0 20px rgba(0, 180, 216, 0.5); /* 科技感阴影 */
  border-radius: 8px;
  color: $tech-text; /* 整体文字颜色 */

  :deep(.el-card__header) {
    padding: 10px 15px; /* 缩小内边距 */
    border-bottom: 1px solid rgba(72, 202, 228, 0.3); /* 底部边框 */
    background: rgba(0, 53, 102, 0.3); /* 头部背景 */
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap; /* 允许换行 */
  }

  .card-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px; /* 缩小间距 */
  }

  .futuristic-title {
    color: $tech-cyan; /* 标题颜色 */
    font-size: 16px; /* 缩小字体大小 */
    margin: 0;
    font-weight: 500;
    text-shadow: 0 0 8px rgba($tech-cyan, 0.5); /* 标题阴影 */
    display: flex;
    align-items: center;
    flex-shrink: 0; /* 防止标题缩小 */
  }

  .region-id-display {
    font-size: 0.7em; /* 缩小字体大小 */
    opacity: 0.7;
    margin-left: 6px; /* 缩小边距 */
  }

  .controls {
    display: flex;
    gap: 10px; /* 缩小间距 */
    flex-wrap: wrap; /* 允许控件换行 */
    align-items: center;
    margin-left: auto; /* 推到右侧 */
  }

  /* 新增：年份选择按钮容器样式 */
  .year-selection-buttons {
    display: flex;
    gap: 15px; /* 按钮间距 */
    flex-wrap: wrap;
    align-items: center;

    &.is-disabled {
      opacity: 0.6;
      pointer-events: none; /* 禁用鼠标事件 */
    }
  }

  /* 新增：单个年份按钮样式 */
  .futuristic-year-button {
    background: rgba(0, 119, 182, 0.3); /* 按钮背景 */
    border: 1px solid rgba(72, 202, 228, 0.5); /* 按钮边框 */
    color: $tech-text;
    padding: 4px 8px; /* 缩小内边距 */
    border-radius: 5px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 0 4px rgba(125, 249, 255, 0.2);

    &:hover:not(:disabled) {
      background: rgba(0, 119, 182, 0.5);
      box-shadow: 0 0 8px rgba(125, 249, 255, 0.4);
    }

    &.is-active:not(:disabled) {
      background: linear-gradient(90deg, #007bff, #00c0ff); /* 激活状态渐变背景 */
      border-color: #00aaff;
      color: white;
      font-weight: bold;
      box-shadow: 0 0 10px rgba(0, 123, 255, 0.6);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  /* 导出TXT按钮样式 */
  .futuristic-button.export-button {
    background: linear-gradient(90deg, #007bff, #00c0ff); /* 蓝色渐变，与TXT按钮区分 */
    border: 1px solid #00aaff;
    color: white;
    padding: 6px 12px;
    border-radius: 5px;
    font-size: 12px;
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    flex-shrink: 0;

    &:hover {
      background: linear-gradient(90deg, #00c0ff, #007bff); /* Adjusted hover gradient for blue button */
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    &.is-disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: #4a4a4a;
      border-color: #666;
      box-shadow: none;
    }
  }

  /* 新增：导出 Excel 按钮的样式 */
  .futuristic-button.export-excel-button {
    background: linear-gradient(90deg, #238636, #2ea043); /* 绿色渐变 */
    border: 1px solid #4CAF50;
    color: white;
    padding: 6px 12px;
    border-radius: 5px;
    font-size: 12px;
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    flex-shrink: 0;

    &:hover {
      background: linear-gradient(90deg, #2ea043, #238636); /* Adjusted hover gradient for green button */
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    &.is-disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: #4a4a4a;
      border-color: #666;
      box-shadow: none;
    }
  }


  .data-content {
    padding: 15px; /* 缩小内边距 */
    min-height: 200px; /* 缩小最小高度 */
    position: relative; /* 用于加载动画叠加 */
  }

  .empty-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 120px; /* 缩小最小高度 */
    color: rgba($tech-lightblue, 0.7);
    font-size: 14px; /* 缩小字体大小 */
    text-align: center;
    padding: 15px; /* 缩小内边距 */
  }

  .section-title {
    color: $tech-cyan;
    font-size: 15px; /* 缩小字体大小 */
    margin-top: 10px; /* 缩小上边距 */
    margin-bottom: 8px; /* 缩小下边距 */
    display: flex;
    align-items: center;
    gap: 6px; /* 缩小间距 */
    text-shadow: 0 0 4px rgba($tech-cyan, 0.4); /* 缩小阴影 */

    .el-icon {
      font-size: 1.1em; /* 缩小图标大小 */
    }
  }

  .current-year-data-grid {
    display: grid;
    /* Adjusted grid-template-columns to fit more items per row,
       allowing 3 or 4 items per row depending on screen size,
       making each item smaller */
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); /* Adjusted min-width for more columns */
    gap: 8px; /* 缩小间距 */
    margin-bottom: 10px; /* 缩小下边距 */

    .data-item {
      background-color: rgba($tech-darkblue, 0.5); /* 数据项背景 */
      border: 1px solid rgba($tech-lightblue, 0.3); /* 数据项边框 */
      border-radius: 5px; /* 缩小圆角 */
      padding: 4px; /* 进一步减少内边距 */
      text-align: left;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); /* 缩小阴影 */
      display: flex; /* Make it a flex container */
      flex-direction: column; /* Stack label and value vertically */
      justify-content: center; /* Center content vertically */
      align-items: flex-start; /* Align text to the start */
      min-height: 40px; /* Ensure a consistent minimum height for data items */


      .label {
        font-size: 10px; /* 进一步减小字体大小 */
        color: $tech-lightblue;
        display: block;
        margin-bottom: 0px; /* 进一步减少下边距 */
      }
      .value {
        font-size: 13px; /* 进一步减小字体大小 */
        font-weight: bold;
        color: $tech-cyan;
      }
    }
  }

  .futuristic-table {
    background-color: rgba($tech-darkblue, 0.3);
    border: 1px solid rgba($tech-lightblue, 0.2);
    border-radius: 8px;
    overflow: hidden; /* 确保圆角和边框在滚动时也适用 */

    :deep(.el-table__inner-wrapper) {
      border-radius: 8px; /* 保持内部圆角 */
    }

    :deep(.el-table__header-wrapper) {
      background-color: rgba($tech-darkblue, 0.8);
      .el-table__header {
        th {
          background-color: transparent;
          color: $tech-cyan;
          font-weight: bold;
          border-bottom: 1px solid rgba($tech-lightblue, 0.3);
          text-align: center; /* 表头文本居中 */
          padding: 8px 0; /* 缩小表头内边距 */
          font-size: 13px; /* 缩小表头字体 */
        }
      }
    }

    :deep(.el-table__body-wrapper) {
      .el-table__body {
        td {
          background-color: rgba($tech-darkblue, 0.9); /* 深蓝色背景 */
          color: white; /* 白色文字 */
          border-bottom: 1px solid rgba($tech-lightblue, 0.1); /* 调整边框颜色 */
          text-align: center; /* 内容居中 */
          padding: 6px 0; /* 缩小单元格内边距 */
          font-size: 12px; /* 缩小单元格字体 */
        }
        tr {
          &:hover {
            background-color: rgba($tech-lightblue, 0.1) !important; /* 悬停时稍微亮一点的背景 */
          }
        }
      }
    }
  }
}
</style>