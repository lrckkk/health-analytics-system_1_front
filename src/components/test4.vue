<template>
  <div class="container">
    <!-- 使用 Collapse 子组件 -->
    <Collapse title="组件标题 1：用户基本信息" :initialOpen="true">
     <test2></test2>
    </Collapse>

    <Collapse title="组件标题 2：订单列表" :initialOpen="true">
     <test3></test3>
    </Collapse>

    <Collapse title="组件标题 3：联系方式">
      <Analyseforins></Analyseforins>
    </Collapse>

    <!-- 可以继续添加更多 Collapse -->

  </div>
</template>

<script setup>
import Collapse from './Collapse.vue'; // 导入子组件
import test2 from './text2.vue';
import test3 from './test3.vue';
import test from './test.vue';
import Analyseforins from "@/components/Analyseforins.vue";
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
