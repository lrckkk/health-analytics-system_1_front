<template>
  <div class="data-display-component">
    <h3>{{ regionStore.getDisplayRegion }} 的数据</h3>
    <div v-if="isLoadingData">加载数据中...</div>
    <div v-else-if="errorData">加载数据失败: {{ errorData }}</div>
    <div v-else>
      <p>这里显示从后端获取的 **{{ regionStore.getDisplayRegion }}** 的具体数据。</p>
      <pre>{{ backendData }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRegionStore } from '@/stores/RegionStore.js'; // 导入 Pinia store
import axios from 'axios'; // 假设您使用 axios 进行 HTTP 请求

const regionStore = useRegionStore();

const backendData = ref(null);
const isLoadingData = ref(false);
const errorData = ref(null);

// 定义一个异步函数来获取数据
const fetchData = async (region) => {
  isLoadingData.value = true;
  errorData.value = null;
  backendData.value = null; // 清空旧数据

  try {
    // 模拟后端请求
    const response = await axios.get(`/api/data/${region}`); // 使用 region 作为请求参数
    backendData.value = response.data;
  } catch (err) {
    console.error('获取数据失败:', err);
    errorData.value = '无法加载数据。';
  } finally {
    isLoadingData.value = false;
  }
};

// 监听 regionStore.selectedRegion 的变化，并在变化时触发数据请求
watch(
    () => regionStore.selectedRegion, // 侦听 Pinia store 中的 selectedRegion
    (newRegion) => {
      console.log(`检测到区域变化: ${newRegion}，正在重新请求数据...`);
      fetchData(newRegion); // 使用新的区域值作为参数发起请求
    },
    { immediate: true } // 立即执行一次，以便在组件挂载时就获取数据
);

// onMounted 也可以用来在组件首次挂载时触发，但 watch with { immediate: true } 更简洁
// onMounted(() => {
//   fetchData(regionStore.selectedRegion);
// });
</script>

<style scoped>
.data-display-component {
  background-color: rgba(10, 25, 40, 0.7);
  border: 1px solid rgba(0, 150, 255, 0.4);
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px; /* 确保不与地图和 header 重叠 */
  color: #e0f2f7;
  text-align: center;
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.2);
}

h3 {
  color: #00e0ff;
  margin-bottom: 15px;
  text-shadow: 0 0 8px rgba(0, 224, 255, 0.7);
}

pre {
  white-space: pre-wrap; /* 允许文本换行 */
  text-align: left;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 5px;
  max-height: 200px;
  overflow-y: auto;
}
</style>