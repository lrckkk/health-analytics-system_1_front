<template>
  <div class="collapsible-component" :class="{ 'collapsed': !isOpen }">
    <div class="component-header" @click="toggleCollapse">
      <!-- 使用 slot 来允许父组件传入标题内容 -->
      <slot name="header">
        <span>{{ title }}</span> <!-- 如果没有传入 header slot，则显示 title prop -->
      </slot>
      <span class="toggle-icon">&#9660;</span> <!-- 向下箭头 Unicode 字符 -->
    </div>
    <div class="component-content">
      <!-- 使用默认 slot 来允许父组件传入详细内容 -->
      <slot></slot>
    </div>
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
/* 组件的局部样式，只作用于当前组件 */
.collapsible-component {
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 15px;
  overflow: hidden; /* 隐藏溢出内容，配合max-height动画 */
  transition: all 0.3s ease-out; /* 平滑过渡效果 */
}

.component-header {
  background-color: #e9f2f9;
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #2c3e50;
  user-select: none; /* 防止文本被选中 */
  border-bottom: 1px solid #e0e0e0;
}

.component-header:hover {
  background-color: #dbeaf5;
}

.toggle-icon {
  font-size: 1.2em;
  transition: transform 0.3s ease-out;
  transform: rotate(0deg); /* 初始为向下箭头 */
}

.collapsible-component.collapsed .toggle-icon {
  transform: rotate(-90deg); /* 折叠时旋转箭头 */
}

.component-content {
  max-height: 2600px; /* 足够高以显示内容，确保大于内容的实际高度 */
  padding: 0 20px;
  opacity: 1;
  box-sizing: border-box; /* 包含padding在内的盒模型 */
  transition: max-height 0.3s ease-out, padding 0.3s ease-out, opacity 0.3s ease-out;
}

.collapsible-component.collapsed .component-content {
  max-height: 0; /* 折叠时高度为0 */
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}

/* 内部内容样式，方便区分 */
.component-content p {
  line-height: 1.6;
  margin: 15px 0;
  color: #666;
}

.component-content ul {
  padding-left: 20px;
  margin-bottom: 15px;
}

.component-content li {
  margin-bottom: 8px;
  color: #666;
}
</style>
