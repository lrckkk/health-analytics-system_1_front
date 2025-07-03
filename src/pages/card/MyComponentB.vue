<template>
  <div class="card-content-inner-b">
    <h3>这是第二张卡片</h3>

    <ul style="list-style: none; padding: 0; margin-top: 15px;">
      <li>特性 1</li>
      <li>特性 2</li>
      <li>特性 3</li>
    </ul>
  </div>
</template>

<script setup>
</script>

<style scoped>
.card-content-inner-b {
  padding: 25px;
  background-color: #e3f2fd; /* 淡蓝色背景 */
  border-radius: 10px;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
  width: 100%;
  text-align: center;
  color: #1976d2; /* 深蓝色文本 */
}
h3 {
  color: #1565c0;
  margin-bottom: 10px;
}
ul {
  display: inline-block; /* 让 ul 居中 */
  text-align: left; /* 列表项左对齐 */
}
</style>