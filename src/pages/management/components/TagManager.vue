<template>
  <div class="panel-content">
    <div class="manager-block">
      <h2>数据分类管理</h2>
      <div class="input-row">
        <input v-model="newCatName" :disabled="catLoading" placeholder="新增分类名称" @keyup.enter="addCat" />
        <button @click="addCat" :disabled="!newCatName.trim() || catLoading">添加分类</button>
      </div>
      <table v-if="cats.length" class="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>分类名称</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in cats" :key="cat.id">
            <td>{{ cat.id }}</td>
            <td>{{ cat.name }}</td>
            <td>
              <button @click="deleteCat(cat)" :disabled="catLoading">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-text">暂无分类数据</div>
    </div>
    <div class="manager-block">
      <h2>数据标签管理</h2>
      <div class="input-row">
        <input v-model="newTagName" :disabled="tagLoading" placeholder="新增标签名称" @keyup.enter="addTag" />
        <button @click="addTag" :disabled="!newTagName.trim() || tagLoading">添加标签</button>
      </div>
      <table v-if="tags.length" class="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>标签名称</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tag in tags" :key="tag.id">
            <td>{{ tag.id }}</td>
            <td>{{ tag.name }}</td>
            <td>
              <button @click="deleteTag(tag)" :disabled="tagLoading">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-text">暂无标签数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const cats = ref([])
const newCatName = ref('')
const catLoading = ref(false)
const fetchCats = async () => {
  catLoading.value = true
  try {
    const res = await request.get('/api/cat')
    cats.value = Array.isArray(res) ? res : (res.data || [])
  } catch (e) {
    cats.value = []
  } finally {
    catLoading.value = false
  }
}
const addCat = async () => {
  if (!newCatName.value.trim()) return
  catLoading.value = true
  try {
    await request.post(`/api/cat?name=${encodeURIComponent(newCatName.value.trim())}`)
    newCatName.value = ''
    await fetchCats()
  } catch (e) {
    alert('添加分类失败: ' + e)
  } finally {
    catLoading.value = false
  }
}
const deleteCat = async (row) => {
  if (!confirm(`确定要删除分类“${row.name}”吗？`)) return
  catLoading.value = true
  try {
    await request.delete(`/api/cat/${row.id}`)
    await fetchCats()
  } catch (e) {
    alert('删除分类失败: ' + e)
  } finally {
    catLoading.value = false
  }
}

const tags = ref([])
const newTagName = ref('')
const tagLoading = ref(false)
const fetchTags = async () => {
  tagLoading.value = true
  try {
    const res = await request.get('/api/tag')
    tags.value = Array.isArray(res) ? res : (res.data || [])
  } catch (e) {
    tags.value = []
  } finally {
    tagLoading.value = false
  }
}
const addTag = async () => {
  if (!newTagName.value.trim()) return
  tagLoading.value = true
  try {
    await request.post(`/api/tag?name=${encodeURIComponent(newTagName.value.trim())}`)
    newTagName.value = ''
    await fetchTags()
  } catch (e) {
    alert('添加标签失败: ' + e)
  } finally {
    tagLoading.value = false
  }
}
const deleteTag = async (row) => {
  if (!confirm(`确定要删除标签“${row.name}”吗？`)) return
  tagLoading.value = true
  try {
    await request.delete(`/api/tag/${row.id}`)
    await fetchTags()
  } catch (e) {
    alert('删除标签失败: ' + e)
  } finally {
    tagLoading.value = false
  }
}

onMounted(() => {
  fetchCats()
  fetchTags()
})
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
  display: flex;
  gap: 40px;
}
.manager-block {
  flex: 1;
}
.input-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.input-row input {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #00d5ff33;
  background: rgba(255,255,255,0.08);
  color: #00bcd4;
  font-size: 15px;
  font-weight: 500;
}
.input-row button {
  padding: 6px 16px;
  border-radius: 4px;
  border: none;
  background: #00d5ff33;
  color: #00bcd4;
  cursor: pointer;
  font-size: 15px;
}
.input-row button:disabled {
  background: #00d5ff22;
  color: #b2ebf2;
  cursor: not-allowed;
  opacity: 0.7;
}
.user-table {
  width: 100%;
  margin-top: 10px;
  border-collapse: collapse;
  background: rgba(255,255,255,0.08);
}
.user-table th, .user-table td {
  border: 1px solid #00d5ff33;
  padding: 8px 12px;
  text-align: left;
  font-size: 15px;
}
.user-table th {
  background: rgba(0,213,255,0.08);
}
.user-table button {
  margin-right: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  border: none;
  background: #00d5ff33;
  color: #00bcd4;
  cursor: pointer;
}
.user-table button:hover {
  background: #00bcd4;
  color: #fff;
}
.empty-text {
  color: #888;
  margin: 20px 0;
  text-align: center;
}
</style>
