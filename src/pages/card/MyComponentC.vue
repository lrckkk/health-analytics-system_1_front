<template>
  <div class="card-content-inner-c">
    <h3>第三张卡片</h3>
    <p>恭喜您，探索完所有卡片！这是组件C的终点。</p>
    <button class="action-button">点击了解更多</button>
  </div>
</template>

<script setup>
</script>

<style scoped>
.card-content-inner-c {
  padding: 25px;
  background-color: #fffde7; /* 淡黄色背景 */
  border-radius: 10px;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
  width: 100%;
  text-align: center;
  color: #fbc02d; /* 深黄色文本 */
}
h3 {
  color: #f9a825;
  margin-bottom: 10px;
}
.action-button {
  margin-top: 20px;
  padding: 10px 25px;
  background-color: #ffc107;
  color: #333;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.action-button:hover {
  background-color: #e0a800;
  transform: translateY(-2px);
}
</style>