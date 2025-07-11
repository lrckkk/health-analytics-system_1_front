<template>
  <div class="collapsible-component" :class="{ 'collapsed': !isOpen }">
    <div class="component-header" @click="toggleCollapse">
      <!-- 使用 slot 来允许父组件传入标题内容 -->
      <slot name="header">
        <span class="header-title">{{ title }}</span> <!-- 如果没有传入 header slot，则显示 title prop -->
      </slot>
      <span class="toggle-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>
    <div class="component-content">
      <!-- 使用默认 slot 来允许父组件传入详细内容 -->
      <div class="content-inner">
        <slot></slot>
      </div>
    </div>
    <div class="component-glow"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 定义组件接收的 props
const props = defineProps({
  title: {
    type: String,
    default: '可伸缩组件标题' // 默认标题
  },
  initialOpen: {
    type: Boolean,
    default: true // 默认是展开状态
  }
});

// 使用 ref 管理组件的展开/折叠状态
const isOpen = ref(props.initialOpen);

// 切换展开/折叠状态的方法
const toggleCollapse = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style scoped>
/* 科技风格可折叠面板 */
.collapsible-component {
  position: relative;
  border: 1px solid rgba(74, 207, 255, 0.2);
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
  background: rgba(16, 26, 60, 0.7);
  box-shadow: 0 0 15px rgba(74, 207, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(5px);
}

.collapsible-component:hover {
  border-color: rgba(74, 207, 255, 0.4);
  box-shadow: 0 0 25px rgba(74, 207, 255, 0.3);
}

.component-header {
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #00e0ff;
  user-select: none;
  position: relative;
  z-index: 2;
  background: rgba(3, 4, 94, 0.5);
  transition: all 0.3s ease;
}

.component-header:hover {
  background: rgba(3, 4, 94, 0.7);
}

.header-title {
  text-shadow: 0 0 8px rgba(0, 224, 255, 0.5);
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.component-header:hover .header-title {
  text-shadow: 0 0 12px rgba(0, 224, 255, 0.8);
}

.toggle-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00e0ff;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toggle-icon svg {
  width: 100%;
  height: 100%;
}

.collapsible-component.collapsed .toggle-icon {
  transform: rotate(-90deg);
}

.component-content {
  max-height: 5000px;
  padding: 0;
  opacity: 1;
  box-sizing: border-box;
  transition:
      max-height 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275),
      opacity 0.4s ease-out;
  overflow: hidden;
}

.content-inner {
  padding: 20px;
}

.collapsible-component.collapsed .component-content {
  max-height: 0;
  opacity: 0;
}

.component-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 224, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 1;
}

.collapsible-component:hover .component-glow {
  opacity: 0.3;
}

/* 内部内容样式调整 */
.component-content p {
  line-height: 1.6;
  margin: 15px 0;
  color: #e0f2f7;
}

.component-content ul {
  padding-left: 20px;
  margin-bottom: 15px;
}

.component-content li {
  margin-bottom: 8px;
  color: #e0f2f7;
}

/* 展开/折叠动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.collapsible-component:not(.collapsed) .content-inner {
  animation: fadeIn 0.5s ease forwards;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .component-header {
    padding: 14px 16px;
  }

  .content-inner {
    padding: 16px;
  }

  .header-title {
    font-size: 15px;
  }
}
</style>