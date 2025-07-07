<template>
  <div class="upload-panel">
    <!-- 顶部标签选择 -->
    <div class="top-bar">
      <el-select v-model="selectedTag" placeholder="选择标签" style="width: 200px;">
        <el-option
            v-for="tag in tags"
            :key="tag.id"
            :label="tag.name"
            :value="tag.id"
        />
      </el-select>
      <el-button type="primary" @click="createNewTag">新建标签</el-button>
    </div>

    <!-- 拖拽上传区域 -->
    <div class="upload-area-wrapper">
      <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          action="/api/upload"
          :multiple="true"
          :auto-upload="false"
          :file-list="fileList"
          :on-change="handleChange"
          :on-remove="handleRemove"
          :http-request="customUpload"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
      </el-upload>
    </div>

    <!-- 文件列表 -->
    <div class="file-list">
      <el-card
          v-for="(file, index) in fileList"
          :key="index"
          class="file-card"
      >
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <el-button
              type="danger"
              :icon="Delete"
              size="small"
          />
        </div>
      </el-card>
    </div>

    <!-- 右下角按钮 -->
    <div class="bottom-right">
      <el-button type="primary" @click="submitUpload" :disabled="fileList.length === 0">
        添加
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {Delete, UploadFilled} from '@element-plus/icons-vue'

// 文件列表
const fileList = ref([])

// 标签列表
const tags = ref([
  { id: 'tag1', name: '标签一' },
  { id: 'tag2', name: '标签二' }
])
const selectedTag = ref('')

// 新建标签逻辑
function createNewTag() {
  const newId = `tag${tags.value.length + 1}`
  const newName = `标签${tags.value.length + 1}`
  tags.value.push({ id: newId, name: newName })
  selectedTag.value = newId
  ElMessage.success('已添加新标签')
}

// 文件变化
function handleChange(file, files) {
  fileList.value = files
}

// 删除文件
function removeFile(index) {
  fileList.value.splice(index, 1)
}

// 自定义上传逻辑（模拟）
function customUpload({ file, onSuccess }) {
  setTimeout(() => {
    onSuccess()
  }, 1000)
}

function handleRemove(file, files) {
  fileList.value = files
}

// 提交上传
function submitUpload() {
  ElMessage.info(`上传 ${fileList.value.length} 个文件，标签为 ${selectedTag.value || '无'}`)
}
</script>

<style scoped>
.upload-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

/* 顶部标签栏 */
.top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* 上传区域 */
.upload-area-wrapper {
  flex: 1;
  min-height: 100px;
}
.upload-area {
  width: 100%;
  border: 2px dashed #409eff;
  border-radius: 6px;
  text-align: center;
  padding: 12px;
  box-sizing: border-box;
}

/* 文件列表 */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  box-sizing: border-box;
}

.file-card {
  background-color: white;
  padding: 8px 12px;
  border-radius: 6px;
  word-break: break-all;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.file-name {
  font-size: 14px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 底部按钮 */
.bottom-right {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
