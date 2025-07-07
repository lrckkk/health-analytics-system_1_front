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
          <!-- 移除 el-select，替换为自定义年份选择按钮 -->
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
            <span class="value">{{ formatValue(currentYearData.populationData?.count) }}</span>
          </div>
        </div>

        <h4 class="section-title mt-4">
          <el-icon><TrendCharts /></el-icon>
          历年数据
        </h4>
        <el-table
            :data="Object.values(historicalData)"
            style="width: 100%"
            max-height="600"
            class="futuristic-table"
        >
          <el-table-column prop="year" label="年份" width="80" fixed sortable></el-table-column>
          <el-table-column label="医疗机构" width="120">
            <template #default="{ row }">{{ formatValue(row.medicalData?.count) }}</template>
          </el-table-column>
          <el-table-column label="病床数量" width="120">
            <template #default="{ row }">{{ formatValue(row.medicalData2?.count) }}</template>
          </el-table-column>
          <el-table-column label="医疗花费" width="120">
            <template #default="{ row }">{{ formatValue(row.costData?.count) }}</template>
          </el-table-column>
          <el-table-column label="医疗人员" width="120">
            <template #default="{ row }">{{ formatValue(row.personnelData?.count) }}</template>
          </el-table-column>
          <el-table-column label="门诊量" width="120">
            <template #default="{ row }">{{ formatValue(row.serviceData?.outpatientVisits) }}</template>
          </el-table-column>
          <el-table-column label="住院量" width="120">
            <template #default="{ row }">{{ formatValue(row.serviceData?.inpatientAdmissions) }}</template>
          </el-table-column>
          <el-table-column label="人口数量" width="120">
            <template #default="{ row }">{{ formatValue(row.populationData?.count) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useRegionStore } from '@/stores/RegionData.js'; // 确保路径正确
import { ElCard, ElButton, ElTable, ElTableColumn, ElIcon, ElLoading } from 'element-plus'; // 移除 ElSelect, ElOption
import { Calendar, TrendCharts } from '@element-plus/icons-vue';

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
 * Formats a numerical value for display.
 * Displays '-' if the value is null, undefined, or NaN.
 * Returns an integer if the value is an integer, otherwise rounds to one decimal place.
 * @param {number} value - The numerical value to format.
 * @returns {string|number} The formatted string or the original number.
 */
const formatValue = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }
  // If it's an integer, return as integer; otherwise, round to one decimal place.
  return Number.isInteger(value) ? value : value.toFixed(1);
};

/**
 * Asynchronously fetches and processes all six data types.
 * Integrates the data into the historicalData object and updates available years.
 */
const fetchAndProcessAllData = async () => {
  isLoading.value = true;
  const regionId = regionStore.getRegionId;
  const currentRegionName = regionStore.getDisplayRegion; // Get current region name

  console.log(`[ProvinceDataViewer] Starting data fetch for ${currentRegionName} (ID: ${regionId})...`);

  // Clear existing data and years
  historicalData.value = {};
  availableYears.value = [];
  selectedYear.value = null;
  currentYearData.value = {};

  try {
    // Concurrently request all data
    const [
      medicalData,
      medicalData2,
      costData,
      personnelData,
      serviceData,
      populationData
    ] = await Promise.all([
      regionStore.fetchMedicalDataIfNeeded(regionId),
      regionStore.fetchMedicalData2IfNeeded(regionId),
      regionStore.fetchCostDataIfNeeded(regionId),
      regionStore.fetchbarChartWidthIfNeeded(regionId), // Note: This is personnel data in the store
      regionStore.fetchserviceDataIfNeeded(regionId),
      regionStore.fetchPopulationDataIfNeeded(regionId),
    ]);

    console.log(`[ProvinceDataViewer] Raw serviceData fetched from Pinia:`, serviceData); // DEBUG LOG 1

    // Integrate data into the historicalData object
    const allYears = new Set();

    // Helper function to merge data into historicalData
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
        // Merge fields based on data type
        if (type === 'serviceData') {
          console.log(`[ProvinceDataViewer] mergeData: Merging serviceData for year ${year}, item:`, item); // DEBUG LOG 2
          historicalData.value[year].serviceData = {
            outpatientVisits: item.outpatientVisits,
            inpatientAdmissions: item.inpatientAdmissions
          };
          console.log(`[ProvinceDataViewer] mergeData: Merged historicalData.value[${year}].serviceData:`, historicalData.value[year].serviceData); // DEBUG LOG 3
        } else {
          // For other data types with only a 'count' field
          historicalData.value[year][type] = { count: item.count };
        }
      });
    };

    mergeData(medicalData, 'medicalData');
    mergeData(medicalData2, 'medicalData2');
    mergeData(costData, 'costData');
    mergeData(personnelData, 'personnelData');
    mergeData(serviceData, 'serviceData'); // The type parameter here is 'serviceData'
    mergeData(populationData, 'populationData');

    // Update and sort available years
    availableYears.value = Array.from(allYears).sort((a, b) => parseInt(a) - parseInt(b));

    // Default to selecting the latest year
    if (availableYears.value.length > 0) {
      selectedYear.value = availableYears.value[availableYears.value.length - 1];
    }

    console.log(`[ProvinceDataViewer] Data fetch completed for ${currentRegionName} (ID: ${regionId}).`);
    console.log(`[ProvinceDataViewer] Final historicalData structure:`, historicalData.value); // DEBUG LOG 4

  } catch (error) {
    console.error(`[ProvinceDataViewer] Failed to fetch data for ${currentRegionName} (ID: ${regionId}):`, error);
    // You can set an error state here, e.g., display an error message
  } finally {
    isLoading.value = false;
  }
};

/**
 * Updates the displayed data for the selected year.
 */
const updateCurrentYearDisplay = () => {
  if (selectedYear.value && historicalData.value[selectedYear.value]) {
    currentYearData.value = historicalData.value[selectedYear.value];
  } else {
    currentYearData.value = {};
  }
  console.log(`[ProvinceDataViewer] Current year data (${selectedYear.value}):`, currentYearData.value); // DEBUG LOG 5
};

/**
 * Exports data to a TXT file.
 */
const exportDataToTxt = () => {
  if (!hasData.value) {
    console.warn('No data to export.');
    return;
  }

  const regionName = regionStore.getDisplayRegion;
  const regionId = regionStore.getRegionId;
  let exportContent = `--- ${regionName} (ID: ${regionId}) Historical Medical Data Overview ---\n`;
  exportContent += `Export Time: ${new Date().toLocaleString()}\n\n`;

  // Define mapping from data type to Chinese label
  const dataLabels = {
    medicalData: '医疗机构数量',
    medicalData2: '病床数量',
    costData: '医疗花费',
    personnelData: '医疗人员',
    serviceData: '医疗服务',
    populationData: '人口数量'
  };

  // Iterate through data for all years
  const sortedYears = Object.keys(historicalData.value).sort((a, b) => parseInt(a) - parseInt(b));

  sortedYears.forEach(year => {
    const yearData = historicalData.value[year];
    exportContent += `=== Year: ${year} ===\n`;

    // Medical Institutions Data
    if (yearData.medicalData?.count !== undefined) {
      exportContent += `  ${dataLabels.medicalData}: ${formatValue(yearData.medicalData.count)}\n`;
    }
    // Bed Count
    if (yearData.medicalData2?.count !== undefined) {
      exportContent += `  ${dataLabels.medicalData2}: ${formatValue(yearData.medicalData2.count)}\n`;
    }
    // Medical Cost
    if (yearData.costData?.count !== undefined) {
      exportContent += `  ${dataLabels.costData}: ${formatValue(yearData.costData.count)}\n`;
    }
    // Medical Personnel
    if (yearData.personnelData?.count !== undefined) {
      exportContent += `  ${dataLabels.personnelData}: ${formatValue(yearData.personnelData.count)}\n`;
    }
    // Medical Services (Outpatient Visits and Inpatient Admissions)
    if (yearData.serviceData?.outpatientVisits !== undefined || yearData.serviceData?.inpatientAdmissions !== undefined) {
      exportContent += `  ${dataLabels.serviceData}:\n`;
      exportContent += `    门诊量: ${formatValue(yearData.serviceData?.outpatientVisits)}\n`;
      exportContent += `    住院量: ${formatValue(yearData.serviceData?.inpatientAdmissions)}\n`;
    }
    // Population Count
    if (yearData.populationData?.count !== undefined) {
      exportContent += `  ${dataLabels.populationData}: ${formatValue(yearData.populationData.count)}\n`;
    }
    exportContent += '\n'; // Add a newline between data for each year
  });

  // Create Blob and download
  const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${regionName}_历年医疗数据.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`Data exported to ${a.download}`);
};


// --- Watchers ---
// Watch for changes in selectedRegionId from Pinia store, re-fetch data when province changes
watch(() => regionStore.selectedRegionId, (newId, oldId) => {
  if (newId !== oldId) {
    fetchAndProcessAllData();
  }
}, { immediate: true }); // immediate: true ensures it runs once on component mount

// Watch for changes in selectedYear, update current year's displayed data
watch(selectedYear, (newYear) => {
  updateCurrentYearDisplay();
});

// --- Lifecycle Hooks ---
onMounted(() => {
  // Initial data fetch is triggered by the immediate watch on selectedRegionId
});
</script>

<style scoped lang="scss">
$tech-blue: #03045E;
$tech-cyan: #7DF9FF;
$tech-lightblue: #90E0EF;
$tech-darkblue: #023E8A;
$tech-text: #CAF0F8; // Original text color, might be light

.province-data-viewer-card {
  width: 100%;
  max-width: 800px; /* 保持最大宽度 */
  margin: 10px auto; /* 缩小外边距 */
  border: none;
  background: linear-gradient(135deg, $tech-blue 0%, $tech-darkblue 100%);
  box-shadow: 0 0 20px rgba(0, 180, 216, 0.5);
  border-radius: 8px;
  color: $tech-text;

  :deep(.el-card__header) {
    padding: 10px 15px; /* 缩小内边距 */
    border-bottom: 1px solid rgba(72, 202, 228, 0.3);
    background: rgba(0, 53, 102, 0.3);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap; /* Allow wrapping */
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
    color: $tech-cyan;
    font-size: 16px; /* 缩小字体大小 */
    margin: 0;
    font-weight: 500;
    text-shadow: 0 0 8px rgba($tech-cyan, 0.5);
    display: flex;
    align-items: center;
    flex-shrink: 0; /* Prevent shrinking */
  }

  .region-id-display {
    font-size: 0.7em; /* 缩小字体大小 */
    opacity: 0.7;
    margin-left: 6px; /* 缩小边距 */
  }

  .controls {
    display: flex;
    gap: 10px; /* 缩小间距 */
    flex-wrap: wrap; /* Allow controls to wrap */
    align-items: center;
    margin-left: auto; /* Push to the right */
  }

  /* 新增：年份选择按钮容器样式 */
  .year-selection-buttons {
    display: flex;
    gap: 5px; /* 按钮间距 */
    flex-wrap: wrap;
    align-items: center;

    &.is-disabled {
      opacity: 0.6;
      pointer-events: none; /* 禁用鼠标事件 */
    }
  }

  /* 新增：单个年份按钮样式 */
  .futuristic-year-button {
    background: rgba(0, 119, 182, 0.3);
    border: 1px solid rgba(72, 202, 228, 0.5);
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
      background: linear-gradient(90deg, #007bff, #00c0ff);
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

  .futuristic-button.export-button {
    background: linear-gradient(90deg, #238636, #2ea043);
    border: 1px solid #4CAF50;
    color: white;
    padding: 6px 12px; /* 缩小内边距 */
    border-radius: 5px; /* 缩小圆角 */
    font-size: 12px; /* 缩小字体大小 */
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2); /* 缩小阴影 */
    flex-shrink: 0;

    &:hover {
      background: linear-gradient(90deg, #2ea043, #3cb353);
      transform: translateY(-1px); /* 缩小悬停位移 */
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* 缩小悬停阴影 */
    }
    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* 缩小点击阴影 */
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
    min-height: 200px; /* 修复：缩小最小高度 */
    position: relative; /* For loading overlay positioning */
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
    margin-top: 10px; /* 修复：缩小上边距 */
    margin-bottom: 8px; /* 修复：缩小下边距 */
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
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); /* 恢复最小宽度 */
    gap: 8px; /* 缩小间距 */
    margin-bottom: 10px; /* 修复：缩小下边距 */

    .data-item {
      background-color: rgba($tech-darkblue, 0.5);
      border: 1px solid rgba($tech-lightblue, 0.3);
      border-radius: 5px; /* 缩小圆角 */
      padding: 4px; /* 进一步减少内边距 */
      text-align: left;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); /* 缩小阴影 */

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
    overflow: hidden; /* Ensure rounded corners and border apply with scrolling */

    :deep(.el-table__inner-wrapper) {
      border-radius: 8px; /* Keep inner rounded corners */
    }

    :deep(.el-table__header-wrapper) {
      background-color: rgba($tech-darkblue, 0.8);
      .el-table__header {
        th {
          background-color: transparent;
          color: $tech-cyan;
          font-weight: bold;
          border-bottom: 1px solid rgba($tech-lightblue, 0.3);
          text-align: center; /* Header text alignment */
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
          text-align: center; /* Content alignment */
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
