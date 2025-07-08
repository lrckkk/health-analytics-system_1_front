<template>
  <div class="ranking-list-container">
    <h4 v-if="title" class="ranking-title">{{ title }}</h4>
    <ul v-if="displayData.length" class="ranking-list">
      <li
          v-for="item in displayData"
          :key="item.id"
          class="ranking-item"
          :class="{ 'is-selected': item.id === selectedRegionId }"
      >
        <span class="rank">{{ item.rank }}</span>
        <span class="name">{{ item.regionName }}</span>
        <span class="value">{{ formatValue(item.value) }}</span>
      </li>
    </ul>
    <div v-else class="no-data-placeholder">
      暂无有效数据
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from 'vue';
import { provinceIdMap } from '@/utils/mapid.js';

const props = defineProps({
  title: {
    type: String,
    default: '排行榜'
  },
  data: {
    type: Array,
    required: true,
  },
  selectedRegionId: {
    type: Number,
    required: true,
  },
});

const { data, selectedRegionId } = toRefs(props);

const provinceIdToNameMap = Object.entries(provinceIdMap).reduce((acc, [id, name]) => {
  acc[id] = name;
  return acc;
}, {});

const displayData = computed(() => {
  if (!data.value || data.value.length === 0) {
    return [];
  }

  const processedData = data.value
      .map(item => ({
        ...item,
        regionName: provinceIdToNameMap[String(item.id)] || '未知地区',
      }))
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

  const totalItems = processedData.length;
  if (totalItems === 0) return [];

  const selectedIndex = processedData.findIndex(item => item.id === selectedRegionId.value);

  if (selectedRegionId.value === 0 || selectedIndex === -1) {
    return processedData.slice(0, 7);
  }

  const displayCount = 7;
  const half = Math.floor(displayCount / 2);

  let startIndex = selectedIndex - half;
  let endIndex = selectedIndex + half + 1;

  if (startIndex < 0) {
    startIndex = 0;
    endIndex = Math.min(displayCount, totalItems);
  }
  if (endIndex > totalItems) {
    endIndex = totalItems;
    startIndex = Math.max(0, totalItems - displayCount);
  }

  return processedData.slice(startIndex, endIndex);
});

const formatValue = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString();
};
</script>

<style scoped>
.ranking-list-container {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  width: 100%;
  height: 100%;
  padding: 0;
  background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.25),
      0 2px 4px -1px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(100, 116, 139, 0.3);
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

.ranking-title {
  text-align: center;
  margin: 0;
  padding: 12px 10px 10px;
  color: #7dd3fc;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid rgba(125, 211, 252, 0.2);
  text-shadow: 0 0 6px rgba(125, 211, 252, 0.3);
  letter-spacing: 0.8px;
  background: rgba(15, 23, 42, 0.3);
}

.ranking-list {
  list-style: none;
  padding: 8px 4px 8px 10px;
  margin: 0;
  flex-grow: 1;
  overflow-y: overlay;
  scrollbar-gutter: stable;
}

/* 现代滚动条样式 */
.ranking-list::-webkit-scrollbar {
  width: 10px;
}

.ranking-list::-webkit-scrollbar-track {
  background: transparent;
  margin: 4px 0;
}

.ranking-list::-webkit-scrollbar-thumb {
  background-color: rgba(100, 150, 255, 0.3);
  border-radius: 5px;
  border: 2px solid transparent;
  background-clip: content-box;
  transition: background-color 0.3s;
}

.ranking-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 150, 255, 0.5);
}

.ranking-list::-webkit-scrollbar-corner {
  background: transparent;
}

.ranking-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  margin: 2px 0;
  border-radius: 3px;
  transition: all 0.25s ease;
  background-color: rgba(15, 23, 42, 0.6);
  font-size: 13px;
  color: #e2e8f0;
  border: 1px solid rgba(71, 85, 105, 0.3);
  font-weight: 400;
}

.ranking-item:hover {
  background-color: rgba(30, 41, 59, 0.8);
  transform: translateX(2px);
}

.ranking-item .rank {
  font-weight: 600;
  color: #38bdf8;
  width: 24px;
  text-align: center;
  font-size: 13px;
  font-family: 'Roboto Mono', 'Courier New', monospace;
  opacity: 0.9;
}

.ranking-item .name {
  flex-grow: 1;
  text-align: left;
  color: #b8d0ff;
  margin-left: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.ranking-item .value {
  font-weight: 500;
  color: #7dd3fc;
  min-width: 80px;
  text-align: right;
  font-family: 'Roboto Mono', 'Courier New', monospace;
  font-size: 13px;
  letter-spacing: 0.5px;
  padding-left: 8px;
}

.ranking-item.is-selected {
  background-color: rgba(56, 189, 248, 0.2);
  color: #ffffff;
  border: 1px solid rgba(56, 189, 248, 0.5);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
  font-weight: 500;
}

.ranking-item.is-selected .rank {
  color: #38bdf8;
  font-weight: 700;
  opacity: 1;
}

.ranking-item.is-selected .name,
.ranking-item.is-selected .value {
  color: #ffffff;
  font-weight: 600;
}

.no-data-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(100, 150, 255, 0.6);
  flex-grow: 1;
  font-size: 14px;
  background-color: rgba(15, 23, 42, 0.3);
  border-radius: 4px;
  font-style: italic;
  border: 1px dashed rgba(100, 150, 255, 0.2);
  margin: 10px;
}
</style>