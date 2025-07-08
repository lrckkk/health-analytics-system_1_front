<template>
  <div class="category-cards">
    <el-card
      v-for="catId in usedCategories"
      :key="catId"
      class="category-card tech-card"
    >
      <div class="category-title">{{ (categories.find(c => c.id === catId) || {}).name }}</div>
      <div class="file-list tech-file-list">
        <el-card
            body-style="padding: 0"
            v-for="(file, index) in filesByCategory[catId]"
            :key="file && file.name ? file.name + (file.tag || '') + index : index"
            class="file-card tech-file-card"
        >
          <div class="file-info tech-file-info">
            <span class="file-name">{{ file.name }}</span>
            <el-tag size="small" class="file-tag">{{ getTagName(file.tag) }}</el-tag>
            <el-button
              type="danger"
              :icon="Delete"
              size="small"
              @click="() => removeFileFromCategory(catId, index)"
            />
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
// Props: categories, usedCategories, filesByCategory, getTagName, removeFileFromCategory
import { defineProps } from 'vue'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  categories: Array,
  usedCategories: Array,
  filesByCategory: Object,
  getTagName: Function,
  removeFileFromCategory: Function
})
</script>

<style scoped>
.category-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.category-card {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  min-height: 180px;
  overflow: hidden;
}
.category-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
}
.file-list {
  display: block;
  width: 100%;
  min-height: 120px;
  max-height: 60vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding-right: 4px;
}
.file-card {
  margin-bottom: 8px;
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
.file-tag {
  margin-left: 4px;
}
</style>
