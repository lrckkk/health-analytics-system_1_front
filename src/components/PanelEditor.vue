<template>
  <div class="panel-editor">
    <!-- 左栏：组件列表 -->
    <div class="panel-sidebar">
      <h4>可用组件</h4>
      <div
        v-for="widget in filteredWidgets"
        :key="widget.type"
        class="widget-item"
        draggable="true"
        @dragstart="onDragStart(widget)"
      >
        {{ widget.label }}
      </div>
      <div
        class="recycle-bin"
        @dragover.prevent
        @drop="onRecycleDrop"
      >
        <span class="recycle-icon">🗑️</span> 拖到这里回收
      </div>
    </div>

    <!-- 中栏：预览区 -->
    <div class="panel-preview" @dragover.prevent @drop="onDrop">
      <div
        v-for="(item, idx) in droppedWidgets"
        :key="item.id"
        class="preview-widget"
        :style="{ left: item.x + 'px', top: item.y + 'px' }"
        :draggable="true"
        @mousedown="onWidgetMouseDown($event, idx)"
        @click="selectWidget(idx)"
        @dragstart="onPreviewDragStart(idx)"
        :class="{ selected: selectedIdx === idx }"
      >
        {{ item.label }}
      </div>
    </div>

    <!-- 右栏：数据设置区 -->
    <div class="panel-settings">
      <h4>数据设置</h4>
      <div v-if="selectedWidget">
        <label>数据名称：
          <el-select v-model="selectedWidget.data" placeholder="请选择数据名称" style="width: 180px;">
            <el-option v-for="file in uploadedFiles" :key="file.id || file.fileId || file.name" :label="file.name" :value="file.name" />
          </el-select>
        </label><br />
        <label>年份：<input v-model="selectedWidget.year" type="number" /></label><br />
        <label>X: <input v-model.number="selectedWidget.x" type="number" /></label><br />
        <label>Y: <input v-model.number="selectedWidget.y" type="number" /></label><br />
      </div>
      <div v-else>请选择中间的组件进行设置</div>
      <button @click="saveConfig">保存</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import request from '@/utils/request';

const props = defineProps({
  widgets: {
    type: Array,
    default: () => []
  },
  allowedTypes: {
    type: Array,
    default: () => ['number','pie','bar','line','stack','doughnut']
  }
});
const emit = defineEmits(['update:widgets', 'save']);

const widgets = [
  { type: 'number', label: '数字牌' },
  { type: 'pie', label: '扇形统计图' },
  { type: 'bar', label: '条形统计图' },
  { type: 'line', label: '折线统计图' },
  { type: 'stack', label: '条形分布图' },
  { type: 'doughnut', label: '环形分布图' },
];

const droppedWidgets = ref([]);

// 初始化和同步外部 widgets
watch(() => props.widgets, (val) => {
  droppedWidgets.value = val ? JSON.parse(JSON.stringify(val)) : [];
}, { immediate: true });

watch(droppedWidgets, (val) => {
  emit('update:widgets', JSON.parse(JSON.stringify(val)));
}, { deep: true });

const dragWidget = ref(null);
const selectedIdx = ref(null);
let draggingPreviewIdx = null;

function onDragStart(widget) {
  dragWidget.value = widget;
  draggingPreviewIdx = null;
}

function onPreviewDragStart(idx) {
  draggingPreviewIdx = idx;
  dragWidget.value = null;
}

function onDrop(e) {
  if (!dragWidget.value) return;
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  droppedWidgets.value.push({
    ...dragWidget.value,
    id: Date.now() + Math.random(),
    x,
    y,
    data: '',
    year: new Date().getFullYear(),
  });
  dragWidget.value = null;
}

function onRecycleDrop(e) {
  if (draggingPreviewIdx !== null) {
    droppedWidgets.value.splice(draggingPreviewIdx, 1);
    if (selectedIdx.value === draggingPreviewIdx) selectedIdx.value = null;
    draggingPreviewIdx = null;
  }
}

function selectWidget(idx) {
  selectedIdx.value = idx;
}

const selectedWidget = computed(() =>
  selectedIdx.value !== null ? droppedWidgets.value[selectedIdx.value] : null
);

// 拖动已放置组件
let dragOffset = { x: 0, y: 0 };
let draggingIdx = null;
function onWidgetMouseDown(e, idx) {
  draggingIdx = idx;
  dragOffset = {
    x: e.offsetX,
    y: e.offsetY,
  };
  document.addEventListener('mousemove', onWidgetMouseMove);
  document.addEventListener('mouseup', onWidgetMouseUp);
}
function onWidgetMouseMove(e) {
  if (draggingIdx === null) return;
  const previewRect = document.querySelector('.panel-preview').getBoundingClientRect();
  const x = e.clientX - previewRect.left - dragOffset.x;
  const y = e.clientY - previewRect.top - dragOffset.y;
  droppedWidgets.value[draggingIdx].x = Math.max(0, x);
  droppedWidgets.value[draggingIdx].y = Math.max(0, y);
}
function onWidgetMouseUp() {
  draggingIdx = null;
  document.removeEventListener('mousemove', onWidgetMouseMove);
  document.removeEventListener('mouseup', onWidgetMouseUp);
}

function saveConfig() {
  emit('save', JSON.parse(JSON.stringify(droppedWidgets.value)));
}

const filteredWidgets = computed(() =>
  widgets.filter(w => props.allowedTypes.includes(w.type))
)

const uploadedFiles = ref([]);

onMounted(async () => {
  try {
    const res = await request.get('/uploadedfiles');
    uploadedFiles.value = res.data || [];
  } catch (e) {
    uploadedFiles.value = [];
  }
});
</script>

<style scoped>
.panel-editor {
  display: flex;
  height: 600px;
  border: 1px solid #eee;
  background: #f6f8fa;
  border-radius: 12px;
  box-shadow: 0 4px 24px #0001;
}
.panel-sidebar {
  width: 200px;
  border-right: 1px solid #eee;
  padding: 18px 12px 12px 12px;
  background: #fafdff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.widget-item {
  background: #fff;
  border: 1.5px solid #e0e6ed;
  margin-bottom: 12px;
  padding: 12px 10px;
  cursor: grab;
  border-radius: 8px;
  user-select: none;
  font-size: 15px;
  box-shadow: 0 2px 8px #0001;
  transition: border 0.2s, box-shadow 0.2s;
}
.widget-item:hover {
  border: 1.5px solid #409eff;
  box-shadow: 0 4px 16px #409eff22;
}
.recycle-bin {
  margin-top: auto;
  background: #f8d7da;
  border: 2px dashed #e57373;
  color: #b71c1c;
  border-radius: 8px;
  padding: 18px 0 12px 0;
  text-align: center;
  font-size: 16px;
  min-height: 56px;
  transition: background 0.2s, border 0.2s;
}
.recycle-bin.dragover {
  background: #ffcdd2;
  border-color: #b71c1c;
}
.recycle-icon {
  font-size: 22px;
  vertical-align: middle;
  margin-right: 6px;
}
.panel-preview {
  flex: 1;
  position: relative;
  background: #f5f7fa;
  min-width: 300px;
  border-radius: 0 12px 12px 0;
  margin: 12px 0;
}
.preview-widget {
  position: absolute;
  min-width: 90px;
  min-height: 44px;
  background: #fff;
  border: 2px solid #bbb;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: move;
  box-shadow: 0 2px 12px #0002;
  transition: border 0.2s, box-shadow 0.2s;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-widget.selected {
  border: 2px solid #409eff;
  box-shadow: 0 4px 16px #409eff22;
}
.panel-settings {
  width: 240px;
  border-left: 1px solid #eee;
  padding: 24px 18px;
  background: #fafbfc;
  border-radius: 0 12px 12px 0;
}
.panel-settings h4 {
  margin-bottom: 18px;
}
.panel-settings label {
  display: block;
  margin-bottom: 10px;
  font-size: 15px;
}
.panel-settings input {
  margin-left: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 15px;
}
.panel-settings button {
  margin-top: 18px;
  padding: 8px 24px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}
.panel-settings button:hover {
  background: #3076c9;
}
</style>
