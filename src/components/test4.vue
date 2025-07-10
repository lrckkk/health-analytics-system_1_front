<template>
  <div class="container">
    <!-- 使用 Collapse 子组件 -->
    <Collapse title="人口分析"  :initial-open="false">
      <Analyseforpop></Analyseforpop>
      <decide :metricIndex="2"></decide>
    </Collapse>

    <Collapse title="病床分析" :initial-open="false" >
      <Annalyseforbed></Annalyseforbed>
      <decide :metricIndex="1"></decide>
    </Collapse>

    <Collapse title="医疗机构分析"  :initial-open="false">
      <Analyseforins></Analyseforins>
      <decide :metricIndex="0"></decide>
    </Collapse>
    <Collapse title="医疗花费分析" :initial-open="false">
      <Analyseforcost></Analyseforcost>
      <decide :metricIndex="3"></decide>
    </Collapse>
    <Collapse title="医疗人员分析" :initial-open="false">
      <Analyseforper></Analyseforper>
      <decide :metricIndex="4"></decide>
    </Collapse>
    <Collapse title="健康服务分析" :initial-open="false">
      <Annalyseforser></Annalyseforser>
      <decide :metricIndex="5"></decide>
    </Collapse>
    <Collapse title="综合医疗分析" :initialOpen="true">
      <test></test>
    </Collapse>
    <button @click="trybu">hahahhahhahhahaha</button>


    <!-- 可以继续添加更多 Collapse -->

  </div>
</template>

<script setup>
import { watch } from 'vue'; // <--- 添加这一行
import Collapse from './Collapse.vue'; // 导入子组件
import Analyseforcost from "@/components/Analyseforcost.vue";
import Analyseforins from "@/components/Analyseforins.vue";
import Analyseforper from "@/components/Analyseforper.vue";
import Analyseforpop from "@/components/Analyseforpop.vue";
import Annalyseforbed from "@/components/Annalyseforbed.vue";
import Annalyseforser from "@/components/Annalyseforser.vue";
import test from "@/components/test.vue";
import router from "@/pages/user/router.js";
import { useAnalysisDataStore } from '@/stores/AnalysisData.js';
import { useRegionStore } from '@/stores/RegionData.js';
import Decide from "@/components/decide.vue";
import { useDecisionStore } from '@/stores/useDecisionStore'; // 调整路径以适应你的项目结构
const analysisStore = useAnalysisDataStore();
const decisionStore = useDecisionStore();
const regionStore = useRegionStore();
const trybu = async() => {
  const currentRegionId = regionStore.getRegionId;
  try {
    // 2. 调用 Pinia Store 的异步 action，并等待它完成
    await decisionStore.fetchInitialData(currentRegionId);
    console.log("[test4.vue] 决策模拟器数据预加载完毕。");

    // 3. 数据加载完成后，再进行路由跳转
    router.push({
      name: 'Decideforp' // 确保 'Decideforp' 对应你的 DecisionSimulator.vue 路由
    });
  } catch (error) {
    console.error("[test4.vue] 预加载决策模拟器数据失败：", error);
    alert("无法进入决策模拟器，数据加载出现问题。");
    // 你可以根据需要导航到错误页面或显示更详细的提示
  }
};
watch(
    () => [analysisStore.growthRates, analysisStore.rankInfos],
    () => {
      // 当数据变化时，调用 Pinia Store 中的 action 来更新完整的分析矩阵
      analysisStore.updateFullAnalysisMatrix();
    },
    { deep: true, immediate: true } // 深度监听数组变化，并在组件加载时立即执行一次
);
</script>

<style>
/* 全局或父组件的样式 */
body {
  font-family: Arial, sans-serif;
  margin: 20px;
  background-color: #f4f7f6;
  color: #333;
}

.container {
  width: 100%;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 20px;
}
</style>
