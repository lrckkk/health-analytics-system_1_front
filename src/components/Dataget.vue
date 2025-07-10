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
/* 全局覆盖Element表格样式 - 增强特效 */
.el-table.futuristic-table {
  --el-table-border-color: rgba(100, 220, 255, 0.2);
  --el-table-header-bg-color: rgba(0, 53, 102, 0.8);
  --el-table-tr-bg-color: rgba(0, 40, 80, 0.7);
  --el-table-row-hover-bg-color: rgba(0, 180, 255, 0.1);

  th.el-table__cell {
    background-color: var(--el-table-header-bg-color);
    color: #7DF9FF;
    font-weight: bold;
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, transparent, #7DF9FF, transparent);
      animation: headerGlow 3s linear infinite;
    }
  }

  .el-table__inner-wrapper::before {
    background-color: var(--el-table-border-color);
  }

  tr {
    background-color: var(--el-table-tr-bg-color);
    color: #CAF0F8;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--el-table-row-hover-bg-color) !important;
      transform: translateX(2px);
    }
  }

  td {
    border-bottom-color: rgba(100, 220, 255, 0.1);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(125, 249, 255, 0.05), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover::before {
      opacity: 1;
    }
  }
}

/* 全局覆盖Element按钮样式 - 增强特效 */
.el-button.futuristic-button {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  overflow: hidden;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
            to bottom right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0) 45%,
            rgba(255, 255, 255, 0.15) 48%,
            rgba(255, 255, 255, 0.15) 52%,
            rgba(255, 255, 255, 0) 55%,
            rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(30deg);
    animation: buttonShine 3s infinite linear;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  &.export-button {
    background: linear-gradient(90deg, rgba(0, 150, 255, 0.8), rgba(0, 200, 255, 0.6));
    border-color: rgba(74, 207, 255, 0.7);
    text-shadow: 0 0 5px rgba(0, 200, 255, 0.5);

    &:hover {
      background: linear-gradient(90deg, rgba(0, 180, 255, 0.9), rgba(0, 220, 255, 0.7));
      box-shadow: 0 0 15px rgba(74, 207, 255, 0.6), 0 0 30px rgba(0, 180, 255, 0.3);
    }
  }

  &.export-excel-button {
    background: linear-gradient(90deg, rgba(100, 100, 255, 0.8), rgba(125, 95, 255, 0.6));
    border-color: rgba(125, 95, 255, 0.7);
    text-shadow: 0 0 5px rgba(125, 95, 255, 0.5);

    &:hover {
      background: linear-gradient(90deg, rgba(120, 120, 255, 0.9), rgba(145, 95, 255, 0.7));
      box-shadow: 0 0 15px rgba(125, 95, 255, 0.6), 0 0 30px rgba(145, 95, 255, 0.3);
    }
  }
}
</style>

<style scoped lang="scss">
// 定义科技感主题颜色变量
$tech-blue: #03045E;
$tech-cyan: #7DF9FF;
$tech-lightblue: #90E0EF;
$tech-darkblue: #023E8A;
$tech-text: #CAF0F8;
$tech-highlight: rgba(0, 180, 255, 0.3);
$tech-purple: rgba(125, 95, 255, 0.6);

// 新增动画定义
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 5px rgba(125, 249, 255, 0.3); }
  50% { box-shadow: 0 0 15px rgba(125, 249, 255, 0.6); }
}

@keyframes headerGlow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes buttonShine {
  0% { transform: translateX(-100%) rotate(30deg); }
  100% { transform: translateX(100%) rotate(30deg); }
}

@keyframes dataGridPulse {
  0%, 100% { box-shadow: 0 0 0 rgba($tech-cyan, 0); }
  50% { box-shadow: 0 0 10px rgba($tech-cyan, 0.3); }
}

.province-data-viewer-card {
  width: 100%;
  max-width: 1232px;
  margin: 10px auto;
  border: none;
  background: linear-gradient(135deg, $tech-blue 0%, $tech-darkblue 100%);
  box-shadow:
      0 0 20px rgba(0, 180, 216, 0.5),
      0 10px 30px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  color: $tech-text;
  border: 1px solid rgba(74, 207, 255, 0.3);
  position: relative;
  overflow: hidden;
  animation: pulseGlow 4s infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
        radial-gradient(circle at 20% 30%, rgba(0, 240, 255, 0.1) 0%, transparent 30%),
        radial-gradient(circle at 80% 70%, $tech-purple 0%, transparent 30%);
    z-index: 0;
    animation: float 8s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
            to bottom right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0) 45%,
            rgba(255, 255, 255, 0.05) 48%,
            rgba(255, 255, 255, 0.05) 52%,
            rgba(255, 255, 255, 0) 55%,
            rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(30deg);
    animation: buttonShine 8s infinite linear;
    z-index: 0;
  }

  :deep(.el-card__header) {
    padding: 10px 15px;
    border-bottom: 1px solid rgba(72, 202, 228, 0.3);
    background: rgba(0, 53, 102, 0.5);
    backdrop-filter: blur(5px);
    position: relative;
    z-index: 1;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, transparent, $tech-cyan, transparent);
      animation: headerGlow 6s linear infinite;
    }
  }

  .card-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .futuristic-title {
    color: $tech-cyan;
    font-size: 16px;
    margin: 0;
    font-weight: 500;
    text-shadow: 0 0 8px rgba($tech-cyan, 0.5);
    display: flex;
    align-items: center;
    position: relative;
    animation: float 3s ease-in-out infinite;

    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, $tech-cyan, transparent);
    }
  }

  .region-id-display {
    font-size: 0.7em;
    opacity: 0.7;
    margin-left: 6px;
    color: $tech-lightblue;
    text-shadow: 0 0 4px rgba($tech-lightblue, 0.3);
  }

  .controls {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
    margin-left: auto;
  }

  .year-selection-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;

    &.is-disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  }

  .futuristic-year-button {
    background: rgba(0, 119, 182, 0.3);
    border: 1px solid rgba(72, 202, 228, 0.5);
    color: $tech-text;
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 0 4px rgba(125, 249, 255, 0.2);
    position: relative;
    overflow: hidden;
    z-index: 1;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, transparent, rgba($tech-cyan, 0.1));
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }

    &:hover:not(:disabled) {
      background: rgba(0, 180, 255, 0.4);
      box-shadow: 0 0 8px rgba(125, 249, 255, 0.4);
      transform: translateY(-1px);

      &::before {
        opacity: 1;
      }
    }

    &.is-active:not(:disabled) {
      background: linear-gradient(90deg, #007bff, #00c0ff);
      border-color: #00aaff;
      color: white;
      font-weight: bold;
      box-shadow: 0 0 10px rgba(0, 123, 255, 0.6);
      text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: $tech-cyan;
        animation: pulse 1.5s infinite;
      }

      &::before {
        background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.2));
        opacity: 1;
      }
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  .futuristic-button {
    &.export-button {
      background: linear-gradient(90deg, rgba(0, 150, 255, 0.8), rgba(0, 200, 255, 0.6));
      border: 1px solid rgba(74, 207, 255, 0.7);
      color: white;
      text-shadow: 0 0 5px rgba(0, 200, 255, 0.5);

      &:hover {
        background: linear-gradient(90deg, rgba(0, 180, 255, 0.9), rgba(0, 220, 255, 0.7));
        box-shadow: 0 0 15px rgba(74, 207, 255, 0.6), 0 0 30px rgba(0, 180, 255, 0.3);
      }
    }

    &.export-excel-button {
      background: linear-gradient(90deg, rgba(100, 100, 255, 0.8), rgba(125, 95, 255, 0.6));
      border: 1px solid rgba(125, 95, 255, 0.7);
      color: white;
      text-shadow: 0 0 5px rgba(125, 95, 255, 0.5);

      &:hover {
        background: linear-gradient(90deg, rgba(120, 120, 255, 0.9), rgba(145, 95, 255, 0.7));
        box-shadow: 0 0 15px rgba(125, 95, 255, 0.6), 0 0 30px rgba(145, 95, 255, 0.3);
      }
    }

    &:disabled {
      background: #4a4a4a !important;
      border-color: #666 !important;
      box-shadow: none !important;
      cursor: not-allowed;
      text-shadow: none !important;
    }
  }

  .data-content {
    padding: 15px;
    min-height: 200px;
    position: relative;
    z-index: 1;
  }

  .empty-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    color: rgba($tech-lightblue, 0.7);
    font-size: 14px;
    text-align: center;
    padding: 15px;
    position: relative;

    &::before {
      content: 'NO DATA';
      position: absolute;
      font-size: 60px;
      font-weight: bold;
      color: rgba($tech-darkblue, 0.3);
      z-index: -1;
      user-select: none;
    }
  }

  .section-title {
    color: $tech-cyan;
    font-size: 15px;
    margin-top: 10px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    text-shadow: 0 0 4px rgba($tech-cyan, 0.4);
    position: relative;
    padding-bottom: 5px;

    .el-icon {
      font-size: 1.1em;
      color: $tech-cyan;
      animation: float 3s ease-in-out infinite;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, $tech-cyan, transparent 80%);
    }

    &::before {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, $tech-cyan, transparent);
      animation: headerGlow 4s linear infinite;
      opacity: 0.5;
    }
  }

  .current-year-data-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 8px;
    margin-bottom: 10px;
    animation: dataGridPulse 4s infinite;

    .data-item {
      background-color: rgba($tech-darkblue, 0.5);
      border: 1px solid rgba($tech-lightblue, 0.2);
      border-radius: 5px;
      padding: 4px;
      text-align: left;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      z-index: 1;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, transparent, rgba($tech-cyan, 0.1));
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background: $tech-cyan;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
      }

      &:hover {
        border-color: $tech-cyan;
        box-shadow: 0 0 10px rgba($tech-cyan, 0.3);
        transform: translateY(-2px);

        &::before {
          opacity: 0.3;
        }

        &::after {
          transform: scaleX(1);
        }
      }

      .label {
        font-size: 10px;
        color: $tech-lightblue;
        display: block;
        margin-bottom: 0px;
      }

      .value {
        font-size: 13px;
        font-weight: bold;
        color: $tech-cyan;
        text-shadow: 0 0 5px rgba($tech-cyan, 0.3);
        position: relative;

        &::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, $tech-cyan, transparent);
        }
      }
    }
  }

  .futuristic-table {
    background-color: rgba($tech-darkblue, 0.3);
    border: 1px solid rgba($tech-lightblue, 0.2);
    border-radius: 8px;
    overflow: hidden;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
              135deg,
              rgba(0, 180, 255, 0.05) 0%,
              transparent 50%,
              rgba(125, 95, 255, 0.05) 100%
      );
      pointer-events: none;
      z-index: 0;
    }

    :deep(.el-table__inner-wrapper) {
      border-radius: 8px;
      position: relative;
      z-index: 1;
    }

    :deep(.el-table__header-wrapper) {
      .el-table__header {
        th {
          background-color: transparent;
          color: $tech-cyan;
          font-weight: bold;
          border-bottom: 1px solid rgba($tech-lightblue, 0.3);
          text-align: center;
          padding: 8px 0;
          font-size: 13px;
          position: relative;
          overflow: hidden;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, transparent, $tech-cyan, transparent);
            animation: headerGlow 3s linear infinite;
          }

          &.is-sortable:hover {
            background: rgba($tech-highlight, 0.5);
          }
        }
      }
    }

    :deep(.el-table__body-wrapper) {
      .el-table__body {
        td {
          background-color: rgba($tech-darkblue, 0.9);
          color: $tech-text;
          border-bottom: 1px solid rgba($tech-lightblue, 0.1);
          text-align: center;
          padding: 6px 0;
          font-size: 12px;
          transition: all 0.2s ease;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(125, 249, 255, 0.05), transparent);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
        }

        tr {
          &:hover {
            td {
              background-color: rgba($tech-lightblue, 0.1) !important;
              color: $tech-cyan;

              &::before {
                opacity: 1;
              }
            }
          }
        }
      }
    }

    :deep(.el-table__empty-block) {
      background-color: rgba($tech-darkblue, 0.5);
      color: $tech-text;
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}
</style>