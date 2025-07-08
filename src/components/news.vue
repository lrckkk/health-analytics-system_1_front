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
import { ref, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import request from "@/utils/request.js"; // 引入 request 用于数据获取

// 不再定义 props，因为数据将由组件内部获取

// 内部维护的消息列表，带有一个唯一ID和格式化后的文本
const internalMessages = ref([]);
// 当前显示的 3 条消息
const displayedMessages = ref([]);
// 滚动动画的 Tween 实例
let scrollTween = null;
// 当前滚动到的消息在 internalMessages 中的索引
const currentIndex = ref(0);

// 定义滚动参数，现在可以在组件内部自由控制
const scrollInterval = 4.5; // 每条消息停留的秒数
const scrollDuration = 0.8; // 滚动动画的持续时间

// 用于获取新闻数据
const fetchNewsData = async () => {
  try {
    const response = await request.get('/api/crawler/homepage');
    // 调试信息现在直接打印 response，因为它就是数据数组
    console.log("News data fetched in scroll.vue:", response);

    // 检查 response 是否存在且是数组，并且长度大于 0
    if (Array.isArray(response) && response.length > 0) {
      internalMessages.value = response.map((item, index) => ({ // 将 response.data 改为 response
        id: `msg-${Date.now()}-${index}`,
        text: `<span class="message-date">${item.date ? item.date.substring(5) + '&nbsp;' : ''}</span><a href="${item.url}" target="_blank">${item.title}</a>`,
      }));
    } else {
      internalMessages.value = [];
    }
    currentIndex.value = 0; // 数据更新后，重置滚动位置
    computeDisplayedMessages(); // 重新计算要显示的消息
    startScrollAnimation(); // 重新启动动画，确保使用新数据
  } catch (error) {
    console.error("Failed to fetch news data:", error);
    // 可以在这里设置错误状态，显示错误消息或占位符
    internalMessages.value = [
      { id: 'error-1', text: '加载新闻失败，请稍后再试。' },
      { id: 'error-2', text: '网络连接异常或服务器问题。' },
      { id: 'error-3', text: '新闻数据暂时不可用。' },
    ];
    computeDisplayedMessages();
    if (scrollTween) { // 如果之前有动画，停止它
      scrollTween.kill();
      scrollTween = null;
    }
  }
};

// 用于计算要显示的消息列表
const computeDisplayedMessages = () => {
  if (internalMessages.value.length === 0) {
    // 如果没有消息，显示占位符
    displayedMessages.value = [
      { id: 'placeholder-1', text: '暂无最新消息，请稍候...' },
      { id: 'placeholder-2', text: '正在加载数据...' },
      { id: 'placeholder-3', text: '欢迎使用本系统！' },
    ];
    return;
  }

  const len = internalMessages.value.length;
  // 确保至少有三条消息来填充显示
  if (len < 3) {
    // 如果消息少于3条，进行复制填充，保证能循环显示
    const tempArr = [];
    // 循环填充，直到至少有3条或达到某个上限（防止无限循环如果数据一直很少）
    let safetyCounter = 0;
    while (tempArr.length < 3 && safetyCounter < 100) { // 增加安全计数器
      tempArr.push(...internalMessages.value);
      safetyCounter++;
    }
    // 从复制后的数组中取出当前三条
    displayedMessages.value = [
      tempArr[currentIndex.value % tempArr.length],
      tempArr[(currentIndex.value + 1) % tempArr.length],
      tempArr[(currentIndex.value + 2) % tempArr.length],
    ];
  } else {
    // 正常情况下，直接从 internalMessages 中取出3条
    displayedMessages.value = [
      internalMessages.value[currentIndex.value % len],
      internalMessages.value[(currentIndex.value + 1) % len],
      internalMessages.value[(currentIndex.value + 2) % len],
    ];
  }
};


// 启动滚动动画
const startScrollAnimation = () => {
  // 如果消息不足以滚动（例如只有1条或0条），则不启动动画
  if (internalMessages.value.length <= 1) {
    if (scrollTween) { // 如果之前有动画，停止它
      scrollTween.kill();
      scrollTween = null;
    }
    return;
  }

  // 销毁之前的动画以避免冲突
  if (scrollTween) {
    scrollTween.kill();
  }

  const wrapper = document.querySelector('.message-list-wrapper');
  if (!wrapper) {
    console.warn('消息列表包装器DOM元素未找到，无法启动滚动动画。');
    return;
  }

  scrollTween = gsap.to(wrapper, {
    y: '-33.33%', // 向上移动一个消息项的高度 (1/3 容器高度)
    duration: scrollDuration,
    ease: 'power2.inOut', // 平滑的缓动函数
    delay: scrollInterval - scrollDuration, // 在每次滚动前等待一段时间
    onComplete: () => {
      // 动画完成后，更新索引和显示的条目，并重置位置，实现无缝循环
      currentIndex.value = (currentIndex.value + 1) % internalMessages.value.length;
      computeDisplayedMessages(); // 更新要显示的消息
      gsap.set(wrapper, { y: '0%' }); // 立即重置位置，准备下一次滚动
      startScrollAnimation(); // 递归调用以实现循环滚动
    },
  });
};

// 暂停滚动
const pauseScroll = () => {
  if (scrollTween) {
    scrollTween.pause();
  }
};

// 恢复滚动
const resumeScroll = () => {
  if (scrollTween) {
    scrollTween.resume();
  }
};

onMounted(() => {
  fetchNewsData(); // 组件挂载时立即获取新闻数据
});

onUnmounted(() => {
  // 组件卸载时销毁动画，防止内存泄漏
  if (scrollTween) {
    scrollTween.kill();
    scrollTween = null; // 清除引用
  }
});
</script>

<style scoped>
/* 样式与之前保持一致 */
.message-scroller-container {
  width: 90%;
  height: 150px; /* 每条消息高 50px，共显示 3 条 */
  overflow: hidden; /* 隐藏超出容器的消息 */
  position: relative;
  border: 1px solid rgba(0, 150, 255, 0.4); /* 科技感边框 */
  border-radius: 8px;
  background-color: rgba(10, 25, 40, 0.6); /* 科技感背景 */
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.2); /* 科技感阴影 */
  user-select: none; /* 防止文本被选中 */
}

/* 穿透作用域设置 <a> 标签样式，使其在深色背景下更显眼 */
.message-scroller-container :deep(a) {
  color: #00FFFF; /* 青色：在深蓝色背景下非常醒目 */
  text-decoration: none; /* 默认不显示下划线 */
  font-weight: bold;
  transition: color 0.3s ease, text-decoration 0.3s ease; /* 添加颜色和下划线过渡效果 */
  cursor: pointer; /* 指示可点击 */
}
.message-scroller-container :deep(a:hover) {
  color: #FFFF00; /* 鼠标悬停时变为黄色：提供视觉反馈 */
  text-decoration: underline; /* 悬停时显示下划线 */
}

/* 日期文本的样式 */
.message-scroller-container :deep(.message-date) {
  color: #88c0d0; /* 柔和的蓝色，与链接区分开 */
  margin-right: 8px; /* 与标题之间保持距离 */
  font-size: 0.9em; /* 稍微小一点 */
  white-space: nowrap; /* 确保日期不换行 */
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
  padding: 0 15px;
  box-sizing: border-box;
  color: #e0f2f7; /* 浅蓝色文字 */
  font-size: 16px;
  white-space: nowrap; /* 默认不换行 */
  overflow: hidden; /* 隐藏超出部分 */
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
  height: 100%; /* 确保内部滚动条能占据整个区域 */
  display: flex; /* 使用 flexbox 确保内容垂直居中 */
  align-items: center;
  /* 默认隐藏滚动条 */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  overflow: hidden; /* 默认隐藏滚动条，内容不溢出时不显示 */
}

.message-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 鼠标悬停在容器上时，移除省略号，显示消息内部的滚动条 */
.message-scroller-container:hover .message-item {
  white-space: normal; /* 允许换行 */
  text-overflow: clip; /* 移除省略号 */
  align-items: flex-start; /* 悬停时内容从顶部开始显示，以适应多行文本 */
  height: auto; /* 允许高度自适应，以显示完整内容 */
  min-height: 50px; /* 至少保持一行的高度 */
}

.message-scroller-container:hover .message-content {
  overflow-y: auto; /* 鼠标悬停时显示滚动条 */
  -ms-overflow-style: scrollbar; /* 强制 IE/Edge 显示滚动条 */
  scrollbar-width: auto; /* 强制 Firefox 显示滚动条 */
  padding-right: 5px; /* 为滚动条留出一些空间 */
}

.message-scroller-container:hover .message-content::-webkit-scrollbar {
  display: block; /* Chrome, Safari, Opera 鼠标悬停时显示滚动条 */
  width: 6px; /* 滚动条宽度 */
  background-color: rgba(0, 150, 255, 0.1); /* 滚动条背景色 */
  border-radius: 3px;
}

.message-scroller-container:hover .message-content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 150, 255, 0.5); /* 滚动条滑块颜色 */
  border-radius: 3px;
}

.message-scroller-container:hover .message-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 150, 255, 0.7); /* 滚动条滑块悬停颜色 */
}
</style>