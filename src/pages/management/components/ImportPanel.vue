<template>
  <div class="import-panel">
    <p class="title">数据导入</p>

    <!-- 上传区域 -->
    <AddFiles/>




    <el-divider />

    <!-- 上传文件展示列表 -->
    <el-table :data="uploadedFiles" style="width: 100%" v-if="uploadedFiles.length > 0">
      <el-table-column prop="name" label="文件名" />
      <el-table-column label="标签">
        <template #default="{ row }">
          <el-tag
              v-for="tag in row.tags"
              :key="tag"
              type="info"
              class="mr-1"
              closable
              @close="removeTag(row, tag)"
          >
            {{ getTagName(tag) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="openTagDialog(row)">添加标签</el-button>
          <el-button size="small" type="danger" @click="deleteFile(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 标签选择弹窗 -->
    <el-dialog v-model="tagDialogVisible" title="添加标签">
      <el-select
          v-model="selectedTags"
          multiple
          placeholder="选择标签"
          style="width: 100%"
      >
        <el-option
            v-for="tag in allTags"
            :key="tag.id"
            :label="tag.name"
            :value="tag.id"
        />
      </el-select>

      <div class="mt-3">
        <el-input
            v-model="newTagName"
            placeholder="新标签名称"
            @keyup.enter="addNewTag"
        />
        <el-button class="mt-2" type="success" @click="addNewTag" :disabled="!newTagName.trim()">添加标签</el-button>
      </div>

      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="applyTags">应用</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import AddFiles from "@/pages/management/components/AddFiles.vue";

const fileList = ref([])
const uploadRef = ref()
const uploadedFiles = ref([])

const allTags = ref([])
const selectedTags = ref([])
const newTagName = ref('')
const tagDialogVisible = ref(false)
const currentFile = ref(null)

function handleChange(file, fileList_) {
  fileList.value = fileList_
}

async function customUpload({ file }) {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await axios.post('/api/upload', formData)
    uploadedFiles.value.push({ name: file.name, id: res.data.id, tags: [] })
    ElMessage.success(`文件 "${file.name}" 上传成功`)
  } catch (e) {
    ElMessage.error('上传失败')
    console.error(e)
  }
}

function submitUpload() {
  uploadRef.value.submit()
}

function handleSuccess() {
  ElMessage.success('上传成功')
}

function handleRemove(file, fileList_) {
  fileList.value = fileList_
}

function deleteFile(file) {
  axios.delete(`/api/files/${file.id}`).then(() => {
    uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== file.id)
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.error('删除失败')
  })
}

function openTagDialog(file) {
  currentFile.value = file
  selectedTags.value = file.tags ? [...file.tags] : []
  tagDialogVisible.value = true
}

function applyTags() {
  const file = currentFile.value
  file.tags = [...selectedTags.value]
  tagDialogVisible.value = false
}

function removeTag(file, tagId) {
  file.tags = file.tags.filter(id => id !== tagId)
}

function getTagName(id) {
  const tag = allTags.value.find(t => t.id === id)
  return tag ? tag.name : `#${id}`
}

async function loadTags() {
  try {
    const res = await axios.get('/api/tags')
    allTags.value = res.data || []
  } catch (e) {
    console.error('获取标签失败', e)
  }
}

async function addNewTag() {
  const name = newTagName.value.trim()
  if (!name) return
  try {
    const res = await axios.post('/api/tags', { name })
    allTags.value.push(res.data)
    selectedTags.value.push(res.data.id)
    newTagName.value = ''
    ElMessage.success('标签添加成功')
  } catch (e) {
    console.error('添加标签失败', e)
    ElMessage.error('添加标签失败')
  }
}

onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.import-panel {
  width: 100%;
  height: 100%;
  padding: 20px;
  color: #eafcff;
  box-sizing: border-box;
}
.title {
  font-size: 40px;
  margin-top: 5px;
  margin-bottom: 10px;
}


.mt-2 {
  margin-top: 8px;
}
.mt-3 {
  margin-top: 12px;
}
.mr-1 {
  margin-right: 4px;
}
</style>
