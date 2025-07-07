<template>
  <div class="message-scroller-container" @mouseenter="pauseScroll" @mouseleave="resumeScroll">
    <div class="message-list-wrapper">
      <div
          v-for="(msg, index) in displayedMessages"
          :key="msg.id || index"
          class="message-item"
          :class="{ 'is-active': index === 1 }"
      >
        <span class="message-content" v-html="msg.text"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { gsap } from 'gsap';

// 定义组件的 props
const props = defineProps({
  // 接收后端返回的原始消息字符串数组
  messages: {
    type: Array,
    required: true,
    default: () => [],
  },
  // 每条消息停留的秒数，默认为 4.5 秒 (4到5秒之间)
  scrollInterval: {
    type: Number,
    default: 4.5,
  },
  // 滚动动画的持续时间，单位秒
  scrollDuration: {
    type: Number,
    default: 0.8, // 动画持续时间，保持流畅
  },
});

// 内部维护的消息列表，带有一个唯一ID，方便GSAP跟踪
const internalMessages = ref([]);
// 当前显示的 3 条消息
const displayedMessages = ref([]);
// 滚动动画的 Tween 实例
let scrollTween = null;
// 当前滚动到的消息在 internalMessages 中的索引
const currentIndex = ref(0);

// 用于计算要显示的消息列表
const computeDisplayedMessages = () => {
  if (internalMessages.value.length === 0) {
    displayedMessages.value = [
      { id: 'placeholder-1', text: '暂无消息' },
      { id: 'placeholder-2', text: '暂无消息' },
      { id: 'placeholder-3', text: '暂无消息' },
    ];
    return;
  }

  const len = internalMessages.value.length;
  // 确保至少有三条消息来填充显示
  if (len < 3) {
    // 如果消息少于3条，进行复制填充，保证能循环显示
    const tempArr = [...internalMessages.value];
    while (tempArr.length < 3) {
      tempArr.push(...internalMessages.value);
    }
    displayedMessages.value = [
      tempArr[currentIndex.value % tempArr.length],
      tempArr[(currentIndex.value + 1) % tempArr.length],
      tempArr[(currentIndex.value + 2) % tempArr.length],
    ];
  } else {
    displayedMessages.value = [
      internalMessages.value[currentIndex.value % len],
      internalMessages.value[(currentIndex.value + 1) % len],
      internalMessages.value[(currentIndex.value + 2) % len],
    ];
  }
};

// 启动滚动动画
const startScrollAnimation = () => {
  // 如果消息不足以滚动，则不启动动画
  if (internalMessages.value.length <= 1) { // 至少需要两条消息才能“滚动”
    return;
  }

  // 销毁之前的动画以避免冲突
  if (scrollTween) {
    scrollTween.kill();
  }

  // 获取消息项的 DOM 元素
  const messageItems = document.querySelectorAll('.message-item');
  if (messageItems.length === 0) {
    console.warn('消息项DOM元素未找到，无法启动滚动动画。');
    return;
  }

  // 将所有消息项向上移动一个单位的高度
  // 注意：这里我们移动的是 .message-list-wrapper，通过 CSS 巧妙地让内容向上滚动
  const wrapper = document.querySelector('.message-list-wrapper');

  scrollTween = gsap.to(wrapper, {
    y: '-33.33%', // 移动三分之一的高度，实现只显示下一条的效果
    duration: props.scrollDuration,
    ease: 'power2.inOut', // 平滑的缓动函数
    delay: props.scrollInterval - props.scrollDuration, // 在每次滚动前等待一段时间
    onComplete: () => {
      // 动画完成后，更新索引和显示的条目，并重置位置，实现无缝循环
      currentIndex.value = (currentIndex.value + 1) % internalMessages.value.length;
      computeDisplayedMessages(); // 更新要显示的消息
      gsap.set(wrapper, { y: '0%' }); // 立即重置位置
      startScrollAnimation(); // 递归调用以实现循环滚动
    },
  });
};

// 暂停滚动
const pauseScroll = () => {
  if (scrollTween) {
    scrollTween.pause();
    console.log('滚动暂停');
  }
};

// 恢复滚动
const resumeScroll = () => {
  if (scrollTween) {
    scrollTween.resume();
    console.log('滚动恢复');
  }
};

// 监听 props.messages 变化，更新 internalMessages
watch(
    () => props.messages,
    (newMessages) => {
      // 为每条消息生成一个唯一的ID，方便 Vue 和 GSAP 跟踪
      internalMessages.value = newMessages.map((text, index) => ({
        id: `msg-${Date.now()}-${index}`, // 使用时间戳和索引确保唯一性
        text,
      }));
      currentIndex.value = 0; // 数据更新后，重置滚动位置
      computeDisplayedMessages(); // 重新计算要显示的消息
      // 重新启动动画，确保使用新数据
      startScrollAnimation();
    },
    { immediate: true, deep: true } // 立即执行一次，并深度监听数组内容变化
);

onMounted(() => {
  // 在组件挂载时，如果消息列表不为空，则启动滚动
  if (internalMessages.value.length > 0) {
    startScrollAnimation();
  }
});

onUnmounted(() => {
  // 组件卸载时销毁动画，防止内存泄漏
  if (scrollTween) {
    scrollTween.kill();
  }
});
</script>

<style scoped>
.message-scroller-container {
  width: 90%;
  height: 150px; /* 每条消息高 50px，共显示 3 条 */
  overflow: hidden; /* 隐藏超出容器的消息 */
  position: relative;
  border: 1px solid rgba(0, 150, 255, 0.4); /* 科技感边框 */
  border-radius: 8px;
  background-color: rgba(10, 25, 40, 0.6); /* 科技感背景 */
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.2); /* 科技感阴影 */
}
/* 穿透作用域设置 <a> 标签样式，使其在深色背景下更显眼 */
.message-scroller-container :deep(a) {
  color: #00FFFF; /* **青色：在深蓝色背景下非常醒目** */
  text-decoration: underline; /* **下划线：增强可点击性** */
  font-weight: bold; /* **加粗：进一步突出** */
  transition: color 0.3s ease; /* 添加颜色过渡效果 */
}
.message-scroller-container :deep(a:hover) {
  color: #FFFF00; /* **鼠标悬停时变为黄色：提供视觉反馈** */
}

.message-scroller-container :deep(a:hover) {
  color: #FFFF00; /* **鼠标悬停时变为黄色：提供视觉反馈** */
}

.message-list-wrapper {
  position: absolute;
  width: 100%;
  height: 100%; /* 包装器高度与容器相同，但其内容会超出 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 从顶部开始排列 */
}


.message-item {
  height: 50px; /* 每条消息项的固定高度 */
  line-height: 50px; /* 使单行文本垂直居中 */
  padding: 0 15px;
  box-sizing: border-box;
  color: #e0f2f7; /* 浅蓝色文字 */
  font-size: 16px;
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 隐藏超出部分，后面再处理滚动 */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
  transition: background-color 0.3s ease; /* 背景色过渡 */
  flex-shrink: 0; /* 防止项目收缩 */
  display: flex;
  align-items: center; /* 文本垂直居中 */
}

.message-item:nth-child(even) {
  background-color: rgba(10, 25, 40, 0.4); /* 交替背景色 */
}

/* 突出显示中间的活动消息 */
.message-item.is-active {
  color: #e0e0e0; /* 亮蓝色 */
  font-weight: bold;
  background-color: rgba(0, 150, 255, 0.1);
  box-shadow: inset 0 0 10px rgba(0, 180, 255, 0.3);
}

.message-content {
  width: 100%;
  overflow-y: auto; /* **内容溢出时内部滚动** */
  height: 100%; /* 确保内部滚动条能占据整个区域 */
  display: flex; /* 确保内容在纵向居中，即使有滚动条 */
  align-items: center;
  /* 隐藏默认滚动条，使其更具科技感 */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.message-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 鼠标悬停在容器上时，停止平滑滚动，并显示消息内部的滚动条 */
.message-scroller-container:hover .message-content {
  overflow-y: auto; /* 鼠标悬停时显示滚动条 */
}

/* 鼠标悬停在容器上时，移除省略号，显示完整内容（如果有内部滚动） */
.message-scroller-container:hover .message-item {
  white-space: normal; /* 允许换行 */
  text-overflow: clip; /* 移除省略号 */
}
</style>