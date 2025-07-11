<template>
  <div class="header-title-wrapper">
    <div class="header-title">
      <span class="title-text">大数据医疗可视化平台</span>
    </div>
    <!-- HUD 底部装饰图 -->
    <div class="hud-decoration"></div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.header-title-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
}

/* 标题文字 */
.header-title {
  display: flex;
  align-items: center;
  color: #00e0ff;
  font-size: 28px;
  font-weight: 600;
  user-select: none;
  z-index: 2;
  position: relative;
  text-shadow: 0 0 10px rgba(0, 224, 255, 0.5);
  letter-spacing: 1px;
}

.header-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00e0ff, transparent);
  border-radius: 2px;
}

/* HUD 装饰图 */
.hud-decoration {
  position: absolute;
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: 50px;
  background: url('../../public/pictures/title.png') center bottom no-repeat;
  background-size: contain;
  z-index: 1;
  pointer-events: none;
  filter: drop-shadow(0 0 5px rgba(0, 224, 255, 0.7));
}

/*禁止光标*/
.header-title-wrapper {
  user-select: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-title {
    font-size: 22px;
  }

  .hud-decoration {
    width: 300px;
  }
}
</style>