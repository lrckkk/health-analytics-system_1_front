<template>
  <div class="panel-content">
    <h2 class="title">数据导入</h2>
    <AddFiles ref="addFilesRef" />
    <hr class="divider" />
    <CategoryCards
      :categories="categories"
      :usedCategories="usedCategories"
      :filesByCategory="filesByCategory"
      :getTagName="getTagName"
      :removeFileFromCategory="removeFileFromCategory"
    />
    <div class="bottom-right">
      <button class="upload-btn" @click="submitUpload" :disabled="allFiles.length === 0">
        上传
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AddFiles from './AddFiles.vue'
import CategoryCards from './CategoryCards.vue'

const addFilesRef = ref(null)

const categories = computed(() => addFilesRef.value?.categories || [])
const usedCategories = computed(() => addFilesRef.value?.usedCategories || [])
const filesByCategory = computed(() => addFilesRef.value?.filesByCategory || {})
const getTagName = (...args) => addFilesRef.value?.getTagName?.(...args)
const removeFileFromCategory = (...args) => addFilesRef.value?.removeFileFromCategory?.(...args)
const allFiles = computed(() => addFilesRef.value?.allFiles || [])

function submitUpload() {
  if (allFiles.value.length === 0) return
  addFilesRef.value?.uploadAllFilesByCategory && addFilesRef.value.uploadAllFilesByCategory()
}
</script>

<style scoped>
.panel-content {
  user-select: none;
  cursor: default;
  background: rgba(255, 255, 255, 0.06);
  padding: 24px;
  border-radius: 10px;
  border: 1px solid rgba(0, 213, 255, 0.15);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.08);
  margin-bottom: 0;
}
.divider {
  border: none;
  border-top: 1px solid #00d5ff33;
  margin: 18px 0 18px 0;
}
.bottom-right {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
.upload-btn {
  padding: 6px 24px;
  border-radius: 4px;
  border: none;
  background: #00d5ff33;
  color: #00bcd4;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}
.upload-btn:disabled {
  background: #eee;
  color: #aaa;
  cursor: not-allowed;
  opacity: 1;
}
.upload-btn:not(:disabled):hover {
  background: #00bcd4;
  color: #fff;
}
select, .panel-content select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #00d5ff33;
  background: rgba(255,255,255,0.08);
  color: #222;
  font-size: 15px;
  outline: none;
  transition: border 0.2s;
}
select:focus, .panel-content select:focus {
  border: 1.5px solid #00bcd4;
}
</style>
