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
  height: 50px; /* 可调整为适应图+文字 */
}

/* 标题文字 */
.header-title {
  display: flex;
  align-items: center;
  color: white;
  font-size: 30px;
  user-select: none;
  z-index: 2; /* 让文字在图片之上 */
  position: relative;
}

/* HUD 装饰图 */
.hud-decoration {
  position: absolute;
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
  width: 500px; /* 可根据图片尺寸或文字宽度微调 */
  height: 50px;
  background: url('../../public/pictures/title.png') center bottom no-repeat;
  background-size: contain;
  z-index: 1;
  pointer-events: none;
}
/*禁止光标*/
.header-title-wrapper {
  user-select: none;
}

</style>
