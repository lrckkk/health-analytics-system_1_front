<template>
  <div class="add-files-panel">
    <!-- 分类、标签操作区 -->
    <div class="row">
      <el-select v-model="selectedYear" placeholder="选择年份" class="select-year short-select">
        <el-option v-for="year in years" :key="year" :label="year" :value="year" />
      </el-select>
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
        :on-change="(file, files) => { console.log('on-change', file, files); handleChange(file, files); }"
        :on-remove="(file, files) => { console.log('on-remove', file, files); handleRemove(file, files); }"
        :http-request="(options) => { console.log('http-request', options); customUpload(options); }"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import {Delete, UploadFilled} from '@element-plus/icons-vue'
import request from '@/utils/request'

// 分类（标签）列表
const tags = ref([])
const selectedTag = ref('')

// 分类（文件夹）列表
const categories = ref([])
const selectedCategory = ref('')

// 年份列表
const years = ref([])
const selectedYear = ref('')

// 获取分类、标签、年份
async function fetchCategories() {
  try {
    const res = await request.get('/api/cat')
    categories.value = Array.isArray(res) ? res : (res.data || [])
  } catch (e) {
    categories.value = []
  }
}
async function fetchTags() {
  try {
    const res = await request.get('/api/tag')
    tags.value = Array.isArray(res) ? res : (res.data || [])
  } catch (e) {
    tags.value = []
  }
}
function initYears() {
  const now = new Date().getFullYear()
  years.value = []
  for (let y = now; y >= now - 10; y--) years.value.push(String(y))
}

// 页面加载时拉取数据
import { onMounted } from 'vue'
onMounted(() => {
  fetchCategories()
  fetchTags()
  initYears()
})

// 文件临时存储
const tempFiles = ref([])
const uploadRef = ref(null)

// 分类文件映射
const filesByCategory = ref({})
const allFiles = computed(() => Object.values(filesByCategory.value).flat())

// 已有内容的分类列表
const usedCategories = ref([])

// 初始化分类文件映射
watch(categories, (newCats) => {
  newCats.forEach(cat => {
    if (cat && cat.id && !filesByCategory.value[cat.id]) {
      filesByCategory.value[cat.id] = []
    }
  })
}, { immediate: true, deep: true })

// 新建分类逻辑（允许用户输入）
async function createNewCategory() {
  try {
    const { value } = await ElMessageBox.prompt('请输入新分类名称', '新建分类', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^.{1,20}$/,
      inputErrorMessage: '分类名称不能为空且不超过20字'
    })
    if (!value) return
    // 后端接口：POST /api/cat?name=xxx
    await request.post(`/api/cat?name=${encodeURIComponent(value)}`)
    await fetchCategories()
    ElMessage.success('新分类添加成功')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('新建分类失败: ' + e)
  }
}

// 新建标签逻辑（允许用户输入）
async function createNewTag() {
  try {
    const { value } = await ElMessageBox.prompt('请输入新标签名称', '新建标签', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^.{1,20}$/,
      inputErrorMessage: '标签名称不能为空且不超过20字'
    })
    if (!value) return
    // 后端接口：POST /api/tag?name=xxx
    await request.post(`/api/tag?name=${encodeURIComponent(value)}`)
    await fetchTags()
    ElMessage.success('新标签添加成功')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('新建标签失败: ' + e)
  }
}

// 文件变化
function handleChange(file, files) {
  tempFiles.value = files
}

// 删除文件
function removeFile(index) {
  tempFiles.value.splice(index, 1)
}

// 自定义上传逻辑
async function customUpload({ file, onSuccess, onError }) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', selectedCategory.value);
    formData.append('tag', selectedTag.value);
    formData.append('year', selectedYear.value); // year 作为 formData 字段
    await request.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    onSuccess();
    ElMessage.success('上传成功');
    console.log('上传成功', file);
  } catch (err) {
    onError && onError(err);
    ElMessage.error('上传失败');
    console.error('上传失败', err);
  }
}

// 暴露上传方法供父组件调用
function uploadAll() {
  console.log('调用 uploadAll，uploadRef:', uploadRef.value)
  uploadRef.value && uploadRef.value.submit && uploadRef.value.submit();
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
  if (!selectedYear.value || !selectedCategory.value || tempFiles.value.length === 0) return;
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

// 批量上传所有 filesByCategory 里的文件
async function uploadAllFilesByCategory() {
  let total = 0, success = 0, fail = 0;
  for (const [catId, files] of Object.entries(filesByCategory.value)) {
    for (const file of files) {
      total++;
      let uploadFile = file;
      if (!(file instanceof File || file instanceof Blob)) {
        if (file.raw instanceof File || file.raw instanceof Blob) {
          uploadFile = file.raw;
        } else if (file.originFileObj instanceof File || file.originFileObj instanceof Blob) {
          uploadFile = file.originFileObj;
        } else {
          console.error('文件不是 File/Blob 类型，无法上传', file);
          fail++;
          continue;
        }
      }
      try {
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('category', catId);
        formData.append('tag', file.tag);
        formData.append('year', selectedYear.value); // year 作为 formData 字段
        await request.post('/api/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        success++;
        console.log('上传成功', file.name);
      } catch (err) {
        fail++;
        console.error('上传失败', file.name, err);
      }
    }
  }
  if (success > 0) ElMessage.success(`成功上传${success}个文件`);
  if (fail > 0) ElMessage.error(`上传失败${fail}个文件`);
  if (total === 0) ElMessage.info('没有可上传的文件');
  Object.keys(filesByCategory.value).forEach(key => filesByCategory.value[key] = []);
  usedCategories.value = [];
}

// expose to parent component
defineExpose({
  categories,
  usedCategories,
  filesByCategory,
  getTagName, // 正确暴露 getTagName
  removeFileFromCategory, // 正确暴露 removeFileFromCategory
  allFiles,
  uploadAll,
  uploadAllFilesByCategory,
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
.short-select .el-select {
  border-radius: 4px;
  background: rgba(255,255,255,0.08);
  color: #222;
  font-size: 15px;
  border: 1px solid #00d5ff33;
  transition: border 0.2s;
}
.short-select .el-select:focus {
  border: 1.5px solid #00bcd4;
}
.short-select .el-select-dropdown {
  background: #fff;
  border: 1.5px solid #00eaff;
  color: #222;
}
.short-select .el-select-dropdown__item {
  color: #222;
  background: transparent;
  transition: background 0.2s;
}
.short-select .el-select-dropdown__item.selected,
.short-select .el-select-dropdown__item.hover {
  background: #00eaff22;
  color: #00bcd4;
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
