<template>
  <button
      class="tech-edge-button"
      :class="positionClass"
      @click="handleClick"
      @mouseenter="startHoverAnimation"
      @mouseleave="stopHoverAnimation"
  >
    <span class="button-content">
      <span class="button-icon">▶</span>
<!--      <span class="button-text">更多</span>-->
    </span>
    <span class="button-glow"></span>
    <span class="particle-ring"></span>
    <span class="electric-arc"></span>
  </button>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
const props = defineProps({
  position: {
    type: String,
    default: 'right',
    validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value)
  },
  targetRoute: {
    type: String,
    default: '/home'
  }
});

const router = useRouter();
const isHovering = ref(false);
let hoverInterval = null;

const positionClass = computed(() => `position-${props.position}`);

const handleClick = () => {
  // 添加点击动画效果
  const button = document.querySelector(`.tech-edge-button.position-${props.position}`);
  if (button) {
    button.classList.add('click-effect');
    setTimeout(() => {
      button.classList.remove('click-effect');
      router.push(props.targetRoute);
    }, 800);
  } else {
    router.push(props.targetRoute);
  }
};

const startHoverAnimation = () => {
  isHovering.value = true;
  hoverInterval = setInterval(() => {
    // 可以添加更复杂的动画逻辑
  }, 100);
};

const stopHoverAnimation = () => {
  isHovering.value = false;
  if (hoverInterval) {
    clearInterval(hoverInterval);
    hoverInterval = null;
  }
};
</script>

<style scoped>
.tech-edge-button {
  position: absolute;
  z-index: 20;
  background: linear-gradient(135deg, rgba(10, 25, 47, 0.9) 0%, rgba(5, 15, 30, 0.95) 100%);
  border: none;
  color: #4acfff;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  outline: none;
}
/* 右侧按钮 - 用于左侧卡片 */
.tech-edge-button.position-right1 {


  top: 12%; /* 与地图顶部对齐 */
  left: 21.2%; /* 距离左侧边缘 */
  width: 30px; /* 限定宽度 */
  height: 10%; /* 限定高度，与地图高度相同，保持视觉平衡 */
  overflow: hidden; /* 确保内部内容不会超出带有圆角的边框 */
  border-radius: 0 8px 8px 0;

  background: linear-gradient(135deg, rgba(3, 4, 94, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);

  /* 边框效果：通过多层box-shadow模拟发光边框 */
  border: 3px solid rgba(74, 207, 255, 0.2); /* 内部更细的弱透明边框 */
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.4), /* 内部蓝色微光 */ 0 0 20px rgba(74, 207, 255, 0.2), /* 外部蓝色光晕 */ inset 0 0 10px rgba(74, 207, 255, 0.3); /* 内部向内发光，增加立体感 */

  /* 圆角：如果图片中有圆角，可以添加 */
}
.tech-edge-button.position-right2 {
  top: 35%; /* 与地图顶部对齐 */
  left: 21.2%; /* 距离左侧边缘 */
  width: 30px; /* 限定宽度 */
  height: 10%; /* 限定高度，与地图高度相同，保持视觉平衡 */
  overflow: hidden; /* 确保内部内容不会超出带有圆角的边框 */
  border-radius: 0 8px 8px 0;

  background: linear-gradient(135deg, rgba(3, 4, 94, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);

  /* 边框效果：通过多层box-shadow模拟发光边框 */
  border: 3px solid rgba(74, 207, 255, 0.2); /* 内部更细的弱透明边框 */
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.4), /* 内部蓝色微光 */ 0 0 20px rgba(74, 207, 255, 0.2), /* 外部蓝色光晕 */ inset 0 0 10px rgba(74, 207, 255, 0.3); /* 内部向内发光，增加立体感 */

  /* 圆角：如果图片中有圆角，可以添加 */
}
.tech-edge-button.position-right3 {
  top: 57.4%; /* 与地图顶部对齐 */
  left: 21.2%; /* 距离左侧边缘 */
  width: 30px; /* 限定宽度 */
  height: 10%; /* 限定高度，与地图高度相同，保持视觉平衡 */
  overflow: hidden; /* 确保内部内容不会超出带有圆角的边框 */
  border-radius: 0 8px 8px 0;

  background: linear-gradient(135deg, rgba(3, 4, 94, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);

  /* 边框效果：通过多层box-shadow模拟发光边框 */
  border: 3px solid rgba(74, 207, 255, 0.2); /* 内部更细的弱透明边框 */
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.4), /* 内部蓝色微光 */ 0 0 20px rgba(74, 207, 255, 0.2), /* 外部蓝色光晕 */ inset 0 0 10px rgba(74, 207, 255, 0.3); /* 内部向内发光，增加立体感 */

  /* 圆角：如果图片中有圆角，可以添加 */
}
/* 左侧按钮 - 用于右侧卡片 */
.tech-edge-button.position-left1 {
  position: fixed;
  top: 12%; /* 与地图顶部对齐 */
  right: 1%; /* 距离左侧边缘 */
  width: 30px; /* 限定宽度 */
  height: 10%; /* 限定高度，与地图高度相同，保持视觉平衡 */
  box-sizing: border-box; /* 确保 padding 不增加元素总尺寸 */
  overflow: hidden; /* 确保内部内容不会超出带有圆角的边框 */
  background: linear-gradient(135deg, rgba(3, 4, 94, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);

  /* 边框效果：通过多层box-shadow模拟发光边框 */
  border: 3px solid rgba(74, 207, 255, 0.2); /* 内部更细的弱透明边框 */
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.4), /* 内部蓝色微光 */ 0 0 20px rgba(74, 207, 255, 0.2), /* 外部蓝色光晕 */ inset 0 0 10px rgba(74, 207, 255, 0.3); /* 内部向内发光，增加立体感 */

  /* 圆角：如果图片中有圆角，可以添加 */

  border-radius: 0 8px 8px 0;
}
.tech-edge-button.position-left2 {
  position: fixed;
  top: 35%; /* 与地图顶部对齐 */
  right: 1%; /* 距离左侧边缘 */
  width: 30px; /* 限定宽度 */
  height: 10%; /* 限定高度，与地图高度相同，保持视觉平衡 */
  box-sizing: border-box; /* 确保 padding 不增加元素总尺寸 */
  overflow: hidden; /* 确保内部内容不会超出带有圆角的边框 */
  background: linear-gradient(135deg, rgba(3, 4, 94, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);

  /* 边框效果：通过多层box-shadow模拟发光边框 */
  border: 3px solid rgba(74, 207, 255, 0.2); /* 内部更细的弱透明边框 */
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.4), /* 内部蓝色微光 */ 0 0 20px rgba(74, 207, 255, 0.2), /* 外部蓝色光晕 */ inset 0 0 10px rgba(74, 207, 255, 0.3); /* 内部向内发光，增加立体感 */

  /* 圆角：如果图片中有圆角，可以添加 */

  border-radius: 0 8px 8px 0;
}
.tech-edge-button.position-left3 {
  position: fixed;
  top: 58%; /* 与地图顶部对齐 */
  right: 1%; /* 距离左侧边缘 */
  width: 30px; /* 限定宽度 */
  height: 10%; /* 限定高度，与地图高度相同，保持视觉平衡 */
  box-sizing: border-box; /* 确保 padding 不增加元素总尺寸 */
  overflow: hidden; /* 确保内部内容不会超出带有圆角的边框 */
  background: linear-gradient(135deg, rgba(3, 4, 94, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);

  /* 边框效果：通过多层box-shadow模拟发光边框 */
  border: 3px solid rgba(74, 207, 255, 0.2); /* 内部更细的弱透明边框 */
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.4), /* 内部蓝色微光 */ 0 0 20px rgba(74, 207, 255, 0.2), /* 外部蓝色光晕 */ inset 0 0 10px rgba(74, 207, 255, 0.3); /* 内部向内发光，增加立体感 */

  /* 圆角：如果图片中有圆角，可以添加 */

  border-radius: 0 8px 8px 0;
}

.button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 3;
  transition: all 0.3s ease;
}

.button-icon {
  font-size: 12px;
  transition: all 0.3s ease;
  text-shadow: 0 0 8px rgba(74, 207, 255, 0.8);
}
.button-text {
  font-size: 10px;
  margin-top: 4px;
  opacity: 0;
  transform: translateY(5px);
  transition: all 0.3s ease;
  text-shadow: 0 0 5px rgba(74, 207, 255, 0.6);
}

.button-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(74, 207, 255, 0.4) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}
.particle-ring {
  position: absolute;
  width: 150%;
  height: 150%;
  border: 2px solid transparent;
  border-radius: 50%;
  z-index: 0;
  opacity: 0;
  pointer-events: none;
  background: radial-gradient(circle, transparent 60%, rgba(74, 207, 255, 0.2) 100%);
}
.electric-arc {
  position: absolute;
  width: 100%;
  height: 100%;
  background:
      linear-gradient(90deg, transparent 45%, rgba(74, 207, 255, 0.7) 50%, transparent 55%),
      linear-gradient(45deg, transparent 45%, rgba(74, 207, 255, 0.5) 50%, transparent 55%),
      linear-gradient(-45deg, transparent 45%, rgba(74, 207, 255, 0.5) 50%, transparent 55%);
  opacity: 0;
  z-index: 2;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
/* 悬停效果 - 增强版 */
.tech-edge-button:hover {
  box-shadow: 0 0 20px rgba(74, 207, 255, 0.8);
  transform: scale(1.05);
}

.tech-edge-button:hover .button-icon {
  transform: scale(1.5);
  animation: iconPulse 1s infinite alternate;
}

.tech-edge-button:hover .button-text {
  opacity: 1;
  transform: translateY(0);
  animation: textGlow 1.5s infinite alternate;
}

.tech-edge-button:hover .button-glow {
  opacity: 0.8;
  animation: pulse 1.5s infinite;
}

.tech-edge-button:hover .particle-ring {
  opacity: 1;
  animation:
      ringExpand 2s infinite,
      ringRotate 4s linear infinite;
}

.tech-edge-button:hover .electric-arc {
  opacity: 0.7;
  animation:
      arcFlicker 0.5s infinite alternate,
      arcMove 3s linear infinite;
}

/* 点击效果 - 增强版 */
.tech-edge-button.click-effect {
  animation:
      buttonClick 0.8s forwards,
      electricSurge 0.8s forwards;
}

.tech-edge-button.click-effect .button-icon {
  animation: iconSpin 0.8s forwards;
}

.tech-edge-button.click-effect .particle-ring {
  animation:
      ringExplode 0.8s forwards,
      ringFade 0.8s forwards;
}
/* 动画定义 */
@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.6; }
  50% { transform: scale(1.05); opacity: 0.3; }
  100% { transform: scale(0.95); opacity: 0.6; }
}

@keyframes iconPulse {
  0% { transform: scale(1.2); text-shadow: 0 0 8px rgba(74, 207, 255, 0.8); }
  100% { transform: scale(1.5); text-shadow: 0 0 15px rgba(74, 207, 255, 1); }
}

@keyframes textGlow {
  0% { text-shadow: 0 0 5px rgba(74, 207, 255, 0.6); }
  100% { text-shadow: 0 0 10px rgba(74, 207, 255, 1); }
}

@keyframes ringExpand {
  0% { transform: scale(0.8); opacity: 0; }
  50% { opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes ringRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes arcFlicker {
  0% { opacity: 0.3; }
  100% { opacity: 0.7; }
}

@keyframes arcMove {
  0% { background-position: 0 0; }
  100% { background-position: 100% 100%; }
}

@keyframes buttonClick {
  0% { transform: scale(1); box-shadow: 0 0 20px rgba(74, 207, 255, 0.8); }
  50% { transform: scale(0.9); box-shadow: 0 0 40px rgba(74, 207, 255, 1); }
  100% { transform: scale(1); box-shadow: 0 0 20px rgba(74, 207, 255, 0.8); }
}

@keyframes electricSurge {
  0% { filter: drop-shadow(0 0 5px rgba(74, 207, 255, 0.5)); }
  50% { filter: drop-shadow(0 0 20px rgba(74, 207, 255, 1)); }
  100% { filter: drop-shadow(0 0 5px rgba(74, 207, 255, 0.5)); }
}

@keyframes iconSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes ringExplode {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(3); opacity: 0; }
}

@keyframes ringFade {
  0% { opacity: 0.8; }
  100% { opacity: 0; }
}
</style>