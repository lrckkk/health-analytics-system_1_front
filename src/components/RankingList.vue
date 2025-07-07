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
// 子组件需要 id -> name 的映射关系
import { provinceIdMap } from '@/utils/mapid.js';

// --- Props Definition ---
const props = defineProps({
  /**
   * 排行榜的标题
   */
  title: {
    type: String,
    default: '排行榜'
  },
  /**
   * 排名数据，由父组件传入。
   * 格式: [{ id: 3, value: 380000 }, { id: 28, value: 135000 }, ...]
   */
  data: {
    type: Array,
    required: true,
  },
  /**
   * 当前需要高亮显示的省份 ID
   */
  selectedRegionId: {
    type: Number,
    required: true,
  },
});

const { data, selectedRegionId } = toRefs(props);

// 创建一个从 ID 到名称的反向映射，方便查找
const provinceIdToNameMap = Object.entries(provinceIdMap).reduce((acc, [id, name]) => {
  // 确保这里的 ID 是字符串，以匹配 Object.keys(provinceIdMap) 的行为
  acc[id] = name;
  return acc;
}, {});


// --- Core Computed Property for Display ---
const displayData = computed(() => {
  if (!data.value || data.value.length === 0) {
    return [];
  }

  // 1. 核心步骤：将父组件传来的 {id, value} 转换为 {id, value, regionName, rank}
  const processedData = data.value
      .map(item => ({
        ...item,
        // 在这里进行 ID 到 Name 的转换
        // 确保 item.id 是数字，provinceIdToNameMap 的键是字符串
        regionName: provinceIdToNameMap[String(item.id)] || '未知地区',
      }))
      .sort((a, b) => b.value - a.value) // 按 value 降序排序
      .map((item, index) => ({
        ...item,
        rank: index + 1, // 添加排名
      }));

  const totalItems = processedData.length;
  if (totalItems === 0) return [];

  // 2. 找到选中省份的索引
  const selectedIndex = processedData.findIndex(item => item.id === selectedRegionId.value);

  // 如果选中的是“全国”(ID为0)或未找到，则显示前7名
  if (selectedRegionId.value === 0 || selectedIndex === -1) {
    return processedData.slice(0, 7);
  }

  // 3. 计算切片位置，确保选中项在中间
  const displayCount = 7;
  const half = Math.floor(displayCount / 2); // 3

  let startIndex = selectedIndex - half;
  let endIndex = selectedIndex + half + 1;

  // 4. 处理边界情况
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

// --- Utility Functions ---
const formatValue = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString();
};
</script>

<style scoped>
/* 容器样式：宽度和高度由父组件决定 */
.ranking-list-container {
  width: 100%;
  height: 100%;
  padding: 2px;
  background-color: #e0f2f7; /* 浅蓝色背景 */
  border-radius: 3px;
  box-sizing: border-box; /* 确保 padding 不会增加总尺寸 */
  display: flex;
  flex-direction: column; /* 内容垂直排列 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* 柔和的阴影 */
}

/* 标题样式 */
.ranking-title {
  text-align: center;
  margin: 0 0 15px 0;
  color: #1976d2; /* 深蓝色标题 */
  font-size: 13px;
  font-weight: 500;
  border-bottom: 1px solid rgba(25, 118, 210, 0.2); /* 标题下划线 */
  padding-bottom: 10px;
}

/* 列表容器 */
.ranking-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1; /* 列表内容占据剩余空间 */
  overflow-y: auto; /* 如果内容超出容器，允许垂直滚动 */
  scrollbar-width: thin; /* Firefox 滚动条样式 */
  scrollbar-color: #bbdefb #f0f4f8; /* Firefox 滚动条颜色 */
}

/* Chrome/Safari 滚动条样式 */
.ranking-list::-webkit-scrollbar {
  width: 8px;
}

.ranking-list::-webkit-scrollbar-track {
  background: #f0f4f8; /* 滚动条轨道背景 */
  border-radius: 10px;
}

.ranking-list::-webkit-scrollbar-thumb {
  background-color: #bbdefb; /* 滚动条滑块颜色 */
  border-radius: 10px;
  border: 2px solid #f0f4f8; /* 滑块边框 */
}


/* 列表项 */
.ranking-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 0px;
  margin-bottom: 0px; /* 增加列表项之间的间距 */
  border-radius: 2px;
  transition: all 0.3s ease;
  background-color: #fcfdfe; /* 几乎白色的浅背景 */
  font-size: 14px;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* 列表项柔和阴影 */
  border: 1px solid #e3f2fd; /* 浅蓝色边框 */
}

.ranking-item:last-child {
  margin-bottom: 0; /* 最后一个列表项无下边距 */
}

/* 排名文本 */
.ranking-item .rank {
  font-weight: bold;
  color: #1e88e5; /* 中等蓝色 */
  width: 20px;
  text-align: left;
  font-size: 15px; /* 稍微大一点的排名数字 */
}

/* 地区名称 */
.ranking-item .name {
  flex-grow: 1;
  text-align: left; /* 左对齐名称 */
  color: #3f51b5; /* 靛蓝色 */
  margin-left: 15px; /* 排名和名称之间的间距 */
  white-space: nowrap; /* 防止名称换行 */
  overflow: hidden; /* 溢出隐藏 */
  text-overflow: ellipsis; /* 溢出显示省略号 */
}

/* 值文本 */
.ranking-item .value {
  font-weight: 500;
  color: #1565c0; /* 深蓝色 */
  min-width: 80px;
  text-align: right;
  font-family: 'Roboto Mono', monospace; /* 等宽字体 */
  font-size: 14px;
}

/* 选中项的样式 */
.ranking-item.is-selected {
  background-color: #fffde7; /* 极浅黄色作为选中背景 */
  color: #d84315; /* 深橙色文本 */
  box-shadow: 0 4px 10px rgba(255, 193, 7, 0.3); /* 更明显的黄色阴影 */
  border: 1px solid #ffcc80; /* 橙色边框 */
  font-weight: bold;
}

.ranking-item.is-selected .rank {
  color: #ffc107; /* 亮黄色排名 */
}

.ranking-item.is-selected .name,
.ranking-item.is-selected .value {
  color: #f57f17; /* 深黄色/橙色名称和值 */
}

/* 无数据占位符 */
.no-data-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #78909c; /* 蓝灰色文本 */
  flex-grow: 1;
  font-size: 16px;
  background-color: #f0f4f8; /* 稍深一点的背景 */
  border-radius: 6px;
}
</style>