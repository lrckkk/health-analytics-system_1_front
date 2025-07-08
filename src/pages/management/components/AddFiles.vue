<template>
  <div class="add-files-panel">
    <!-- 分类、标签操作区 -->
    <div class="row">
      <el-select v-model="selectedCategory" placeholder="选择分类" class="select-category short-select">
        <el-option
          v-for="cat in categories"
          :key="cat.id"
          :label="cat.name"
          :value="cat.id"
        />
      </el-select>
      <el-button type="primary" @click="createNewCategory">新建分类</el-button>
      <el-select v-model="selectedTag" placeholder="选择标签" class="select-tag short-select">
        <el-option
          v-for="tag in tags"
          :key="tag.id"
          :label="tag.name"
          :value="tag.id"
        />
      </el-select>
      <el-button type="primary" @click="createNewTag">新建标签</el-button>
    </div>
    <!-- 上传区域 -->
    <div class="row upload-row">
      <el-upload
        ref="uploadRef"
        class="upload-area-full"
        drag
        action="/api/upload"
        :multiple="true"
        :auto-upload="false"
        :on-change="handleChange"
        :on-remove="handleRemove"
        :http-request="customUpload"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">拖拽或<em>点击上传</em></div>
      </el-upload>
    </div>
    <!-- 确定按钮 -->
    <div class="row confirm-row">
      <el-button type="success" class="confirm-btn" :disabled="!selectedCategory || !selectedTag || tempFiles.length === 0" @click="addFilesToCategory">
        确定
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {Delete, UploadFilled} from '@element-plus/icons-vue'
import CategoryCards from './CategoryCards.vue'

// 分类（标签）列表
const tags = ref([
  { id: 'tag1', name: '标签一' },
  { id: 'tag2', name: '标签二' }
])
const selectedTag = ref('')

// 分类（文件夹）列表
const categories = ref([
  { id: 'cat1', name: '分类一' },
  { id: 'cat2', name: '分类二' }
])
const selectedCategory = ref('')

// 文件临时存储
const tempFiles = ref([])
const uploadRef = ref(null)

// 分类文件映射
const filesByCategory = ref({})
const allFiles = computed(() => Object.values(filesByCategory.value).flat())

// 已有内容的分类列表
const usedCategories = ref([])

// 保��categories和filesByCategory同步，防止卡片不���示
watch(categories, (newCats) => {
  newCats.forEach(cat => {
    if (cat && cat.id && !filesByCategory.value[cat.id]) {
      filesByCategory.value[cat.id] = []
    }
  })
}, { immediate: true, deep: true })

// 新建分类逻辑
function createNewCategory() {
  const newId = `cat${categories.value.length + 1}`
  const newName = `分类${categories.value.length + 1}`
  categories.value.push({ id: newId, name: newName })
  filesByCategory.value[newId] = []
  selectedCategory.value = newId
  ElMessage.success('已添加新分类')
}

// 新建标签���辑
function createNewTag() {
  const newId = `tag${tags.value.length + 1}`
  const newName = `标签${tags.value.length + 1}`
  tags.value.push({ id: newId, name: newName })
  ElMessage.success('已添加新标签')
}

// 文件变化
function handleChange(file, files) {
  tempFiles.value = files
}

// 删除文件
function removeFile(index) {
  tempFiles.value.splice(index, 1)
}

// 自定义上传逻辑（模拟）
function customUpload({ file, onSuccess }) {
  setTimeout(() => {
    onSuccess()
  }, 1000)
}

function handleRemove(file, files) {
  tempFiles.value = files
}


// 获取标签名称
function getTagName(tagId) {
  const tag = tags.value.find(t => t.id === tagId)
  return tag ? tag.name : ''
}

// 添加文件到分类
function addFilesToCategory() {
  if (!selectedCategory.value || tempFiles.value.length === 0) return;
  // 确保分类已初始化
  if (!filesByCategory.value[selectedCategory.value]) {
    filesByCategory.value[selectedCategory.value] = [];
  }
  // 检查重复文件
  const existingNames = filesByCategory.value[selectedCategory.value].map(f => f.name);
  const duplicateFiles = tempFiles.value.filter(file => existingNames.includes(file.name));
  if (duplicateFiles.length > 0) {
    ElMessage.error(`文件重复：${duplicateFiles.map(f => f.name).join('、')}`);
    // 只添加未重复的文件
    tempFiles.value = tempFiles.value.filter(file => !existingNames.includes(file.name));
    // 刷新el-upload状态（即使全部重复也要刷新）
    if (uploadRef.value) {
      uploadRef.value.clearFiles && uploadRef.value.clearFiles();
    }
    if (tempFiles.value.length === 0) return;
  }
  tempFiles.value.forEach(file => {
    const fileWithTag = { ...file, tag: selectedTag.value };
    filesByCategory.value[selectedCategory.value].push(fileWithTag);
  });
  // 记录已用分类
  if (!usedCategories.value.includes(selectedCategory.value)) {
    usedCategories.value.push(selectedCategory.value);
  }
  tempFiles.value = [];
  // 刷新el-upload状态
  if (uploadRef.value) {
    uploadRef.value.clearFiles && uploadRef.value.clearFiles();
  }
  ElMessage.success('已将文件添加到分类');
}

// 从指定分类中删除文件
function removeFileFromCategory(catId, index) {
  filesByCategory.value[catId].splice(index, 1)
  // 如果该分类下已无文件，则从usedCategories��移除
  if (filesByCategory.value[catId].length === 0) {
    const idx = usedCategories.value.indexOf(catId)
    if (idx !== -1) usedCategories.value.splice(idx, 1)
  }
}

// 分类或标签变化时，自动清空el-upload
watch([selectedCategory, selectedTag], () => {
  tempFiles.value = []
  if (uploadRef.value) {
    uploadRef.value.clearFiles && uploadRef.value.clearFiles()
  }
})

// expose to parent component
defineExpose({
  categories,
  usedCategories,
  filesByCategory,
  getTagName,
  removeFileFromCategory,
  allFiles
})
</script>

<style scoped>
.add-files-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 0;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0;
}
.short-select {
  min-width: 100px;
  max-width: 140px;
  /* 科技感样式 */
  background: linear-gradient(90deg, #232526 0%, #414345 100%);
  border-radius: 8px;
  border: 1.5px solid #00eaff;
  box-shadow: 0 2px 8px rgba(0,234,255,0.15);
  color: #00eaff;
  font-weight: 500;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.short-select .el-input__inner {
  background: transparent;
  color: #00eaff;
  border: none;
  font-weight: 500;
}
.short-select .el-input__inner:focus {
  box-shadow: 0 0 0 2px #00eaff44;
}
.short-select .el-input__wrapper {
  background: transparent;
  border: none;
  box-shadow: none;
}
.short-select .el-select-dropdown {
  background: #232526;
  border: 1.5px solid #00eaff;
  color: #00eaff;
}
.short-select .el-select-dropdown__item {
  color: #00eaff;
  background: transparent;
  transition: background 0.2s;
}
.short-select .el-select-dropdown__item.selected,
.short-select .el-select-dropdown__item.hover {
  background: #00eaff22;
  color: #fff;
}
.upload-row {
  width: 100%;
}
.upload-area-full {
  flex: 1;
  width: 100%;
  min-width: 0;
  max-width: none;
}
.confirm-row {
  justify-content: flex-start;
}
.confirm-btn {
  min-width: 100px;
}
</style>
