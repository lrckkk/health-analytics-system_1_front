<template>


  <div

      style="
    width: 100%;
    height: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    background-image: url('/pictures/da62758027756af19dfdafded3e29d4b_720.png'); /* 替换为你的图片路径 */
    background-size: cover; /* 根据需要调整 */
    background-position: center;
    background-repeat: no-repeat;
  "
  >

    <router-view v-slot="{ Component }">
      <transition name="tech-swirl">
        <component :is="Component" />
      </transition>
    </router-view>

  </div>

</template>

<script setup lang="ts">


</script>


<style>
/* 科技风漩涡动画 */
.tech-swirl-enter-active,
.tech-swirl-leave-active {
  transition: all 0.7s ease-in-out;
  position: absolute;
  width: 100%;
}

.tech-swirl-enter-from {
  opacity: 0;
  transform: scale(0.9) rotateY(30deg);
  filter: blur(5px) hue-rotate(90deg);
}

.tech-swirl-enter-to {
  opacity: 1;
  transform: scale(1) rotateY(0);
  filter: blur(0) hue-rotate(0);
}

.tech-swirl-leave-to {
  opacity: 0;
  transform: scale(0.9) rotateY(-30deg);
  filter: blur(5px) hue-rotate(-90deg);
}

/* 添加科技感光效 */
.tech-swirl-enter-active::before,
.tech-swirl-leave-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
      135deg,
      rgba(0, 240, 255, 0.3) 0%,
      transparent 50%,
      rgba(125, 95, 255, 0.3) 100%
  );
  z-index: -1;
  opacity: 0;
}

.tech-swirl-enter-active::before {
  animation: techGlow 0.7s ease-in-out;
}

@keyframes techGlow {
  0% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 0.8; }
  100% { opacity: 0; transform: scale(1.2); }
}

</style>