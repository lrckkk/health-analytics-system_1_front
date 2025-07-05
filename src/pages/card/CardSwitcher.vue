<template>
  <div class="card-switcher-wrapper stacked">
    <div
        class="card-stack-container"
        @mousedown="handleStart"
        @touchstart="handleStart"
        ref="cardContainerRef"
    >
      <div
          v-for="(Comp, index) in components"
          :key="index"
          :data-index="index"
          class="card-item-stacked"
          ref="cardItems"
      >
        <component :is="Comp"></component>
      </div>
    </div>

<!--    <div class="card-navigation">-->
<!--      <button @click="prevCard" class="nav-button prev">-->
<!--        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>-->
<!--      </button>-->
<!--      <div class="card-dots">-->
<!--        <span-->
<!--            v-for="(_, index) in components"-->
<!--            :key="'dot-' + index"-->
<!--            :class="{ dot: true, active: index === currentIndex }"-->
<!--            @click="goToCard(index)"-->
<!--        ></span>-->
<!--      </div>-->
<!--      <button @click="nextCard" class="nav-button next">-->
<!--        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>-->
<!--      </button>-->
<!--    </div>-->
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'

const props = defineProps({
  components: {
    type: Array,
    required: true,
    validator: (value) => value.every(comp => typeof comp === 'object' || typeof comp === 'function')
  },
  swipeThreshold: {
    type: Number,
    default: 80 // 像素，触发切换的最小拖动距离
  },
  rotationFactor: {
    type: Number,
    default: 0.15 // 控制拖动时卡片倾斜的幅度
  },
  stackDepthFactor: {
    type: Number,
    default: 0.05 // 控制堆叠时卡片的缩放
  },
  stackOffsetFactor: {
    type: Number,
    default: 15 // 控制非当前卡片层叠时的水平/垂直偏移
  }
})

const currentIndex = ref(0)
const startX = ref(0)
const deltaX = ref(0)
const isDragging = ref(false)

const cardContainerRef = ref(null)
const cardItems = ref([]) // 用于获取所有卡片 DOM 元素

let animationTimeline = null // 用于管理卡片的动画时间线

// 计算卡片在堆叠状态下的目标属性
const getStackProps = (absDistance) => {
  const scale = 1 - absDistance * props.stackDepthFactor
  const translateY = absDistance * props.stackOffsetFactor
  const translateX = absDistance * props.stackOffsetFactor * 0.5
  const opacity = 1 - absDistance * 0.2
  return { x: translateX, y: translateY, scale, opacity, rotationY: 0 }
}

// 获取考虑循环后的索引差
const getWrappedIndexDiff = (targetIndex, currentIdx, total) => {
  let diff = targetIndex - currentIdx
  if (diff > total / 2) {
    diff -= total
  } else if (diff < -total / 2) {
    diff += total
  }
  return diff
}

// 更新所有卡片的动画状态
const updateCardAnimation = (progress = 0, targetIndex = currentIndex.value, duration = 0.6, ease = "power2.out", isInstant = false) => {
  if (!cardItems.value.length || !cardContainerRef.value) return

  const totalCards = props.components.length
  // 使用当前容器的宽度来计算卡片移动的距离，确保响应性
  const cardContainerWidth = cardContainerRef.value.offsetWidth * 0.9

  // 杀死现有动画，创建新时间线
  if (animationTimeline) {
    animationTimeline.kill()
  }
  animationTimeline = gsap.timeline({
    paused: isInstant, // 如果是即时设置（拖动中），则暂停
    defaults: { duration: isInstant ? 0 : duration, ease: ease, overwrite: true }
  })

  cardItems.value.forEach((cardEl, index) => {
    // 根据拖动进度计算当前卡片和相邻卡片的实时位置
    let x, y, scale, rotationY, opacity, zIndex
    let pointerEvents = 'none'

    // 计算当前卡片在循环数组中的“逻辑”位置
    const logicIndex = getWrappedIndexDiff(index, targetIndex, totalCards)

    if (logicIndex === 0) { // 当前（逻辑上在最前面）卡片
      pointerEvents = 'auto'
      // 拖动时：从 0 到 deltaX.value
      x = isInstant ? gsap.utils.interpolate(0, deltaX.value, progress) : 0
      y = 0
      scale = 1 // 拖动时保持 1
      // 拖动时：从 0 到计算出的旋转角度
      rotationY = isInstant ? gsap.utils.interpolate(0, Math.max(-15, Math.min(15, (deltaX.value / cardContainerWidth) * 30 * props.rotationFactor)), progress) : 0
      opacity = 1 // 拖动时保持 1
      zIndex = 100
    } else if (logicIndex === -1) { // 逻辑上的前一张卡片 (将要滑出或滑入)
      // 动画目标：从中心滑出左侧，透明，缩小，旋转
      const startX = -cardContainerWidth * 1.5 // 如果是点击切换或滑回，则从这里开始
      const startY = 0
      const startScale = 0.8
      const startOpacity = 0
      const startRotationY = -30

      const endX = 0 // 拖动时目标是回到中心
      const endY = 0
      const endScale = 1
      const endOpacity = 1
      const endRotationY = 0

      // 向右拖动时，progress 0->1，卡片从滑出位置回到中心
      x = isInstant && deltaX.value > 0 ? gsap.utils.interpolate(startX, endX, progress) : startX
      y = isInstant && deltaX.value > 0 ? gsap.utils.interpolate(startY, endY, progress) : startY
      scale = isInstant && deltaX.value > 0 ? gsap.utils.interpolate(startScale, endScale, progress) : startScale
      rotationY = isInstant && deltaX.value > 0 ? gsap.utils.interpolate(startRotationY, endRotationY, progress) : startRotationY
      opacity = isInstant && deltaX.value > 0 ? gsap.utils.interpolate(startOpacity, endOpacity, progress) : startOpacity
      zIndex = 1

    } else if (logicIndex === 1) { // 逻辑上的下一张卡片 (将要滑入或滑出)
      // 动画目标：从堆叠位置滑入中心
      const stackProps = getStackProps(1)
      const startX = stackProps.x
      const startY = stackProps.y
      const startScale = stackProps.scale
      const startOpacity = stackProps.opacity
      const startRotationY = stackProps.rotationY

      const endX = 0 // 拖动时目标是回到中心
      const endY = 0
      const endScale = 1
      const endOpacity = 1
      const endRotationY = 0

      // 向左拖动时，progress 0->1，卡片从堆叠位置到中心
      x = isInstant && deltaX.value < 0 ? gsap.utils.interpolate(startX, endX, progress) : startX
      y = isInstant && deltaX.value < 0 ? gsap.utils.interpolate(startY, endY, progress) : startY
      scale = isInstant && deltaX.value < 0 ? gsap.utils.interpolate(startScale, endScale, progress) : startScale
      rotationY = isInstant && deltaX.value < 0 ? gsap.utils.interpolate(startRotationY, endRotationY, progress) : startRotationY
      opacity = isInstant && deltaX.value < 0 ? gsap.utils.interpolate(startOpacity, endOpacity, progress) : startOpacity
      zIndex = props.components.length - index

    } else if (logicIndex > 1) { // 逻辑上的更远的堆叠卡片 (例如下一张的下一张)
      const currentStackProps = getStackProps(logicIndex)
      const nextStackProps = getStackProps(logicIndex - 1) // 如果当前卡片向左移动，它会变成前一个堆叠层级

      // 向左拖动时，progress 0->1，这些卡片会向更靠近活跃卡片的方向移动一层
      x = isInstant && deltaX.value < 0 ? gsap.utils.interpolate(currentStackProps.x, nextStackProps.x, progress) : currentStackProps.x
      y = isInstant && deltaX.value < 0 ? gsap.utils.interpolate(currentStackProps.y, nextStackProps.y, progress) : currentStackProps.y
      scale = isInstant && deltaX.value < 0 ? gsap.utils.interpolate(currentStackProps.scale, nextStackProps.scale, progress) : currentStackProps.scale
      rotationY = 0
      opacity = isInstant && deltaX.value < 0 ? gsap.utils.interpolate(currentStackProps.opacity, nextStackProps.opacity, progress) : currentStackProps.opacity
      zIndex = props.components.length - index
    } else { // 逻辑上更远的前方卡片 (已滑出，或在拖动过程中不参与动画)
      x = -cardContainerWidth * 1.5
      y = 0
      scale = 0.8
      rotationY = -30
      opacity = 0
      zIndex = 0
    }

    animationTimeline.to(cardEl, { x, y, scale, rotationY, opacity, zIndex, pointerEvents }, 0) // 所有动画都在时间线开始
  })

  if (isInstant) {
    animationTimeline.progress(1) // 立即应用计算出的实时位置
  } else {
    animationTimeline.play() // 播放平滑过渡动画
  }
}

// 切换到下一张卡片 (循环)
const nextCard = () => {
  currentIndex.value = (currentIndex.value + 1) % props.components.length
}

// 切换到上一张卡片 (循环)
const prevCard = () => {
  currentIndex.value = (currentIndex.value - 1 + props.components.length) % props.components.length
}

// 直接跳转到指定索引的卡片
const goToCard = (index) => {
  if (index >= 0 && index < props.components.length && index !== currentIndex.value) {
    currentIndex.value = index
  }
}

// --- 鼠标/触摸事件处理 ---
const handleStart = (event) => {
  isDragging.value = true
  startX.value = event.clientX || event.touches[0].clientX
  deltaX.value = 0

  // 鼠标按下/触摸开始时，停止任何正在进行的平滑动画，并立即应用静态布局
  if (animationTimeline) {
    animationTimeline.kill()
  }
  updateCardAnimation(0, currentIndex.value, 0, "none", true) // 0 progress, instant true

  window.addEventListener('mousemove', handleMove)
  window.addEventListener('touchmove', handleMove)
  window.addEventListener('mouseup', handleEnd)
  window.addEventListener('touchend', handleEnd)
}

const handleMove = (event) => {
  if (!isDragging.value) return
  const clientX = event.clientX || event.touches[0].clientX
  deltaX.value = clientX - startX.value

  const cardContainerWidth = cardContainerRef.value ? cardContainerRef.value.offsetWidth * 0.9 : 300
  // 拖动进度，限制在 0 到 1 之间
  const progress = Math.min(1, Math.abs(deltaX.value) / props.swipeThreshold)

  // 实时更新拖动动画
  updateCardAnimation(progress, currentIndex.value, 0, "none", true) // 实时更新，instant true
}

const handleEnd = () => {
  if (!isDragging.value) return

  const thresholdMet = Math.abs(deltaX.value) > props.swipeThreshold

  // 根据拖动方向和阈值决定目标索引
  let targetIdx = currentIndex.value
  if (thresholdMet) {
    if (deltaX.value > 0) { // 向右滑动
      targetIdx = (currentIndex.value - 1 + props.components.length) % props.components.length
    } else { // 向左滑动
      targetIdx = (currentIndex.value + 1) % props.components.length
    }
    currentIndex.value = targetIdx // 更新当前索引
    updateCardAnimation(1, currentIndex.value, 0.6) // 播放到目标状态，时长0.6s
  } else {
    // 未达到阈值，动画回初始状态
    updateCardAnimation(0, currentIndex.value, 0.3) // 播放回初始状态，时长0.3s
  }

  isDragging.value = false
  deltaX.value = 0 // 重置拖动距离

  window.removeEventListener('mousemove', handleMove)
  window.removeEventListener('touchmove', handleMove)
  window.removeEventListener('mouseup', handleEnd)
  window.removeEventListener('touchend', handleEnd)
}

// --- 生命周期钩子 ---
onMounted(() => {
  // 确保 DOM 渲染完成后，再初始化卡片位置
  nextTick(() => {
    updateCardAnimation(0, currentIndex.value, 0, "none", true) // 初始设置卡片位置
  })
})

onUnmounted(() => {
  // 确保移除所有事件监听器
  window.removeEventListener('mousemove', handleMove)
  window.removeEventListener('touchmove', handleMove)
  window.removeEventListener('mouseup', handleEnd)
  window.removeEventListener('touchend', handleEnd)

  // 清理 GSAP 动画实例
  if (animationTimeline) animationTimeline.kill()
})

// 监听 currentIndex 变化，触发卡片切换动画
watch(currentIndex, (newVal, oldVal) => {
  // 仅在非拖动状态下（例如点击导航按钮）触发平滑动画
  if (!isDragging.value) {
    updateCardAnimation(1, newVal, 0.6) // 播放到目标状态，时长0.6s
  }
}, { immediate: true }) // immediate: true 确保组件加载时会执行一次动画初始化
</script>

<style scoped>
/* 整个卡片容器的包裹器 */
.card-switcher-wrapper.stacked {

  width: 100%;
 height: 100%;
}

/* 堆叠卡片的核心容器 */
.card-stack-container {
  position: relative;
  width: 100%;
  height: 100%; /* 填充父容器高度 */
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px; /* 创建3D透视效果 */
  cursor: grab;
}

.card-stack-container.is-dragging {
  cursor: grabbing;
}

/* 单个卡片项的样式 */
.card-item-stacked {
  position: absolute; /* 所有卡片绝对定位堆叠 */
  width: 100%; /* 卡片自身宽度，比容器小一些形成堆叠感 */
  height: 100%; /* 卡片自身高度，会基于 card-stack-container 的 height 计算 */

  background-color: #f9f9f9; /* 默认背景色 */
  transform-origin: center center;
  will-change: transform, opacity; /* 告知浏览器这些属性会变化，优化性能 */

  display: flex; /* 让内部组件居中 */
  justify-content: center;
  align-items: center;

  box-sizing: border-box;
  overflow: hidden; /* 防止内部内容溢出卡片边界 */
}

/* 导航按钮和圆点指示器样式 */
.card-navigation {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 0 20px;
  z-index: 1000; /* 确保导航在所有卡片之上 */
}

.nav-button {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #333;
}

.nav-button:hover:not(:disabled) {
  background-color: #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.nav-button:disabled {
  background-color: #f0f0f0;
  color: #bbb;
  cursor: not-allowed;
  opacity: 0.7;
}

.nav-button svg {
  width: 20px;
  height: 20px;
}

.card-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background-color: #007bff;
  transform: scale(1.2);
}

.dot:hover {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>