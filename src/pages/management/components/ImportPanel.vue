<template>
  <div class="import-panel">
    <h2 class="title">数据导入</h2>
    <AddFiles ref="addFilesRef" />
    <el-divider/>
    <CategoryCards
      :categories="categories"
      :usedCategories="usedCategories"
      :filesByCategory="filesByCategory"
      :getTagName="getTagName"
      :removeFileFromCategory="removeFileFromCategory"
    />
    <div class="bottom-right">
      <el-button type="primary" @click="submitUpload" :disabled="allFiles.length === 0">
        上传
      </el-button>
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
  alert(`上传 ${allFiles.value.length} 个文件`)
}
</script>

<style scoped>
.import-panel {
  padding: 24px 0;
}
h2 {
  margin: 0 0 16px 0;
  font-weight: 600;
  color: #a0eaff;
}

.bottom-right {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
