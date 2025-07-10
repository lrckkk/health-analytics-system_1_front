<template>
  <div class="container">
    <!-- 使用 Collapse 子组件 -->
    <Collapse title="人口分析"  :initial-open="false">
      <Analyseforpop></Analyseforpop>
    </Collapse>

    <Collapse title="病床分析" :initial-open="false" >
      <Annalyseforbed></Annalyseforbed>
    </Collapse>

    <Collapse title="医疗机构分析"  :initial-open="false">
      <Analyseforins></Analyseforins>
    </Collapse>
    <Collapse title="医疗花费分析" :initial-open="false">
      <Analyseforcost></Analyseforcost>
    </Collapse>
    <Collapse title="医疗人员分析" :initial-open="false">
      <Analyseforper></Analyseforper>
    </Collapse>
    <Collapse title="健康服务分析" :initial-open="false">
      <Annalyseforser></Annalyseforser>
    </Collapse>
    <Collapse title="综合医疗分析" :initialOpen="true">
      <test></test>
    </Collapse>

    <!-- 可以继续添加更多 Collapse -->

  </div>
</template>

<script setup>
import Collapse from './Collapse.vue'; // 导入子组件
import Analyseforcost from "@/components/Analyseforcost.vue";
import Analyseforins from "@/components/Analyseforins.vue";
import Analyseforper from "@/components/Analyseforper.vue";
import Analyseforpop from "@/components/Analyseforpop.vue";
import Annalyseforbed from "@/components/Annalyseforbed.vue";
import Annalyseforser from "@/components/Annalyseforser.vue";
import test from "@/components/test.vue";
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
