<template>
  <!--
    主容器：负责鼠标感应区域和定位。
    它自身不进行动画，只作为子组件的定位参考和鼠标感应区。
  -->
  <div
      class="button-container"
      @mouseenter="startExpandTimer"
      @mouseleave="startCollapseTimer"
  >
    <!--
      箭头指示器：在组件未弹出时显示，指示组件位置。
      使用 v-show="!isExpanded" 直接控制其 display 属性。
    -->
    <div class="arrow-indicator" v-show="!isExpanded">
      <div class="arrow-icon"></div>
      <span class="arrow-text">鼠标移入此处</span>
    </div>

    <!--
      按钮内容包装器：实际进行动画的元素。
      通过 max-height 和 opacity 控制展开/收起。
    -->
    <div
        class="button-wrapper"
        :class="{ 'is-collapsed': !isExpanded }"
    >
      <!-- 第一行按钮容器 -->
      <div class="button-row">
        <button
            v-for="button in buttonsRow1"
            :key="button.id"
            @click="handleButtonClick(1, button.id)"
            class="action-button"
            :class="{ 'is-active': activeButtonRow1 === button.id }"
        >
          {{ button.label }}
        </button>
      </div>

      <!-- 第二行按钮容器 -->
      <div class="button-row">
        <button
            v-for="button in buttonsRow2"
            :key="button.id"
            @click="handleButtonClick(2, button.id)"
            class="action-button"
            :class="{ 'is-active': activeButtonRow2 === button.id }"
        >
          {{ button.label }}
        </button>
      </div>

      <!-- 引入 ProvinceDataViewer 组件，并在展开时显示 -->
      <ProvinceDataViewer
          v-if="isExpanded"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ProvinceDataViewer from './Dataget.vue'; // 确保路径正确，指向 ProvinceDataViewer.vue

// 定义组件接收的 props
const props = defineProps({
  // 第一行按钮的数据，数组形式，每个对象应包含 id 和 label
  buttonsRow1: {
    type: Array,
    default: () => [
      { id: 'populationData', label: '人口' },
      { id: 'institutionData', label: '医疗机构' },
      { id: 'personnelData', label: '医疗人员' },
      { id: 'bedData', label: '床位总数' },
      { id: 'outpatientVisitsData', label: '就诊人数' },
      { id:'totalCostData',label:'医疗费用'},
    ],
  },
  // 第二行按钮的数据，数组形式，每个对象应包含 id 和 label
  buttonsRow2: {
    type: Array,
    default: () => [
      { id: 'r2b1', label: '按钮 2-1' },
      { id: 'r2b2', label: '按钮 2-2' },
      { id: 'r2b3', label: '按钮 2-3' },
    ],
  },
});

// 定义组件发出的事件
const emit = defineEmits(['button-clicked']);

// 控制组件是否展开的响应式状态
const isExpanded = ref(false);
// 用于存储 setTimeout 的 ID，以便在鼠标快速移入移出时清除计时器
const collapseTimeoutId = ref(null);

// 存储第一行当前被选中的按钮ID
// 默认选中第一行的第一个按钮
const activeButtonRow1 = ref(props.buttonsRow1.length > 0 ? props.buttonsRow1[0].id : null);
// 存储第二行当前被选中的按钮ID
// 默认选中第二行的第二个按钮
const activeButtonRow2 = ref(props.buttonsRow2.length > 1 ? props.buttonsRow2[1].id : null);

/**
 * 处理鼠标移入事件，清除收起计时器并展开组件。
 */
const startExpandTimer = () => {
  if (collapseTimeoutId.value) {
    clearTimeout(collapseTimeoutId.value);
    collapseTimeoutId.value = null;
  }
  isExpanded.value = true;
};

/**
 * 处理鼠标移出事件，设置收起计时器。
 */
const startCollapseTimer = () => {
  collapseTimeoutId.value = setTimeout(() => {
    isExpanded.value = false;
    collapseTimeoutId.value = null;
  }, 100); // 100毫秒的延迟，允许快速重新进入
};

/**
 * 处理按钮点击事件。
 * @param {number} row - 按钮所在的行 (1 或 2)。
 * @param {string} buttonId - 被点击按钮的唯一ID。
 */
const handleButtonClick = (row, buttonId) => {
  if (row === 1) {
    // 如果点击的不是当前行已选中的按钮，则更新选中状态并发出事件
    if (activeButtonRow1.value !== buttonId) {
      activeButtonRow1.value = buttonId;
      emit('button-clicked', { id: buttonId });
    }
  } else if (row === 2) {
    // 如果点击的不是当前行已选中的按钮，则更新选中状态并发出事件
    if (activeButtonRow2.value !== buttonId) {
      activeButton2.value = buttonId;
      emit('button-clicked', { id: buttonId });
    }
  }
};
</script>

<style scoped>
/* 主容器样式 */
.button-container {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1340px; /* 宽度增加 30% (800px * 1.3 = 1040px) */
  padding: 0 8px; /* 侧边内边距，顶部和底部内边距由 button-wrapper 控制 */
  z-index: 50;
  /* 鼠标感应区 */
}

/* 按钮内容包装器样式 */
.button-wrapper {
  background: linear-gradient(to bottom right, #001f3f, #003366); /* 深蓝色渐变 */
  border: 1px solid #004080; /* 深蓝色边框 */
  border-radius: 16px 16px 0 0; /* 顶部圆角 */
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5), 0 -5px 15px rgba(0, 0, 0, 0.3); /* 顶部阴影 */

  display: flex;
  flex-direction: column;

  /* 动画效果 - 展开状态 */
  max-height: 900px; /* 保持高度以容纳 ProvinceDataViewer */
  padding: 16px; /* 展开时恢复内边距 */
  gap: 16px; /* 行间距 */
  opacity: 1; /* 展开时完全显示 */
  pointer-events: auto; /* 展开时可点击 */
  /* 移除 overflow: hidden; 避免阻止内部滚动 */

  transition: max-height 0.3s ease-out, padding 0.3s ease-out, opacity 0.3s ease-out; /* 平滑过渡 */
}

/* 收起状态 */
.button-wrapper.is-collapsed {
  max-height: 0; /* 高度为0，不占据空间 */
  padding-top: 0;
  padding-bottom: 0;
  gap: 0; /* 间距也为0 */
  opacity: 0; /* 隐藏时透明 */
  pointer-events: none; /* 隐藏时不可点击 */
  overflow: hidden; /* 仅在收起状态下隐藏溢出内容，以保证动画平滑 */
}

/* 展开状态下允许内容滚动 */
.button-wrapper:not(.is-collapsed) {
  overflow-y: auto; /* 允许垂直滚动 */
  overflow-x: auto; /* 允许水平滚动 */
}

/* 按钮行样式 */
.button-row {
  display: flex;
  flex-wrap: wrap; /* 允许按钮换行 */
  justify-content: center;
  gap: 30px; /* 按钮间距 */
}

/* 单个按钮样式 */
.action-button {
  padding: 10px 20px;
  border-radius: 12px; /* 圆角 */
  font-weight: 600; /* 加粗字体 */
  font-size: 14px; /* 默认字体大小 */
  cursor: pointer;
  outline: none; /* 移除默认焦点轮廓 */
  border: 1px solid transparent; /* 默认透明边框 */

  transition: all 0.3s ease-in-out; /* 所有属性的平滑过渡 */
  transform: scale(1); /* 默认缩放 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* 默认阴影 */

  /* 未选中状态样式 */
  background: linear-gradient(to bottom right, #003366, #002244); /* 深蓝色渐变 */
  color: #a0c0e0; /* 浅蓝色文字 */
  border-color: #004080; /* 深蓝色边框 */
}

/* 按钮悬停效果 */
.action-button:hover {
  background: linear-gradient(to bottom right, #004080, #003366); /* 悬停时颜色变亮 */
  color: #ffffff; /* 悬停时文字变白 */
  transform: scale(1.05); /* 放大 */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(0, 100, 255, 0.5); /* 更大阴影和蓝色光圈 */
}

/* 按钮焦点效果 */
.action-button:focus {
  box-shadow: 0 0 0 4px rgba(0, 150, 255, 0.7); /* 蓝色光圈 */
}

/* 按钮选中状态样式 */
.action-button.is-active {
  background: linear-gradient(to right, #007bff, #00c0ff); /* 亮蓝色渐变 */
  color: #ffffff; /* 白色文字 */
  border-color: #00aaff; /* 亮蓝色边框 */
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.6), 0 0 0 4px rgba(0, 150, 255, 0.8); /* 强烈蓝色阴影和光圈 */
  transform: scale(1.05); /* 保持放大 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .button-container {
    max-width: 95%; /* 小屏幕上占据更多宽度 */
    padding: 0 12px;
  }
  .button-wrapper {
    padding: 12px;
    gap: 10px;
  }
  .button-row {
    gap: 8px;
  }
  .action-button {
    padding: 8px 16px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .action-button {
    padding: 6px 12px;
    font-size: 12px;
  }
}

/* 箭头指示器样式 */
.arrow-indicator {
  position: absolute;
  bottom: 0; /* 箭头底部与 button-container 底部对齐 */
  left: 50%;
  transform: translateX(-50%); /* 水平居中 */
  display: flex; /* 默认 flex 布局 */
  flex-direction: column;
  align-items: center;
  gap: 5px;
  color: #a0c0e0; /* 浅蓝色文字 */
  pointer-events: none; /* 确保不阻挡鼠标事件 */
  z-index: 49; /* 确保在 button-wrapper 下方 */
  padding-bottom: 20px; /* 调整箭头和文字与容器底部的距离 */
}

/* 箭头图标的三角形部分 */
.arrow-icon {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 15px solid #007bff; /* 蓝色箭头 */
  animation: bounce 1.5s infinite; /* 弹跳动画 */
}

.arrow-text {
  font-size: 12px;
  white-space: nowrap; /* 防止文字换行 */
}

/* 箭头弹跳动画 */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px); /* 向上弹跳 */
  }
  60% {
    transform: translateY(-3px); /* 稍微向下 */
  }
}
</style>
