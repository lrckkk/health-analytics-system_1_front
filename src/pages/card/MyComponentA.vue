<template>
  <div class="card-content-inner-a">
    <h3>欢迎来到第一张卡片</h3>
    <p>这里展示的是组件A</p>

  </div>
</template>

<script setup>
// 这里可以添加组件 A 自己的逻辑
</script>

<style scoped>
.card-content-inner-a {
  padding: 25px;
  background-color: #e8f5e9; /* 淡绿色背景 */
  border-radius: 10px;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
  width: 100%; /* 确保填满父容器 */
  text-align: center;
  color: #388e3c; /* 深绿色文本 */
}
h3 {
  color: #2e7d32;
  margin-bottom: 10px;
}
p {
  line-height: 1.6;
}
</style>