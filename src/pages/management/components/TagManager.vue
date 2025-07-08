<template>
  <div class="no-scroll">
    <div class="cat-manager">
      <h2>数据分类管理</h2>
      <el-form @submit.prevent="addTag" class="add-tag-form" :inline="true">
        <el-form-item>
          <el-input
              v-model="newTagName"
              placeholder="新增种类名称"
              :disabled="loading"
              @keyup.enter="addTag"
              clearable
              size="medium"
          />
        </el-form-item>
        <el-form-item>
          <el-button
              type="primary"
              @click="addTag"
              :disabled="!newTagName.trim() || loading"
              size="medium"
          >
            添加种类
          </el-button>
        </el-form-item>
      </el-form>
      <el-divider>已添加的数据分类</el-divider>
      <el-empty v-if="!tags.length && !loading" description="还没有种类" />
      <el-table
        v-else
        :data="tags"
        v-loading="loading"
        element-loading-text="操作中..."
        class="table-flex"
        :row-style="rowStyle"
        border
      >
        <el-table-column label="标签名称" prop="name" min-width="240">
          <template #default="{ row }">
            <div v-if="editId === row.id" style="display:flex; gap:8px; align-items:center;">
              <el-input
                  v-model="editName"
                  size="small"
                  @keyup.enter="saveEdit(row)"
                  :disabled="loading"
                  style="flex:1"
              />
              <el-button
                  type="success"
                  size="small"
                  icon="el-icon-check"
                  @click="saveEdit(row)"
                  :disabled="!editName.trim() || loading"
              />
              <el-button
                  type="danger"
                  size="small"
                  icon="el-icon-close"
                  @click="cancelEdit"
                  :disabled="loading"
              />
            </div>
            <div v-else style="display:flex; justify-content: space-between; align-items:center;">
              <span>{{ row.name }}</span>
              <div>
                <el-button
                    type="primary"
                    size="small"
                    icon="el-icon-edit"
                    @click="startEdit(row)"
                    :disabled="loading"
                />
                <el-button
                    type="danger"
                    size="small"
                    icon="el-icon-delete"
                    @click="deleteTag(row)"
                    :disabled="loading"
                />
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="tag-manager">
      <h2>数据标签管理</h2>
      <el-form @submit.prevent="addTag" class="add-tag-form" :inline="true">
        <el-form-item>
          <el-input
              v-model="newTagName"
              placeholder="新增标签名称"
              :disabled="loading"
              @keyup.enter="addTag"
              clearable
              size="medium"
          />
        </el-form-item>
        <el-form-item>
          <el-button
              type="primary"
              @click="addTag"
              :disabled="!newTagName.trim() || loading"
              size="medium"
          >
            添加标签
          </el-button>
        </el-form-item>
      </el-form>
      <el-divider>已添加的数据标签</el-divider>
      <el-empty v-if="!tags.length && !loading" description="还没有标签" />
      <el-table
        v-else
        :data="tags"
        v-loading="loading"
        element-loading-text="操作中..."
        class="table-flex"
        :row-style="rowStyle"
        border
      >
        <el-table-column label="标签名称" prop="name" min-width="240">
          <template #default="{ row }">
            <div v-if="editId === row.id" style="display:flex; gap:8px; align-items:center;">
              <el-input
                  v-model="editName"
                  size="small"
                  @keyup.enter="saveEdit(row)"
                  :disabled="loading"
                  style="flex:1"
              />
              <el-button
                  type="success"
                  size="small"
                  icon="el-icon-check"
                  @click="saveEdit(row)"
                  :disabled="!editName.trim() || loading"
              />
              <el-button
                  type="danger"
                  size="small"
                  icon="el-icon-close"
                  @click="cancelEdit"
                  :disabled="loading"
              />
            </div>
            <div v-else style="display:flex; justify-content: space-between; align-items:center;">
              <span>{{ row.name }}</span>
              <div>
                <el-button
                    type="primary"
                    size="small"
                    icon="el-icon-edit"
                    @click="startEdit(row)"
                    :disabled="loading"
                />
                <el-button
                    type="danger"
                    size="small"
                    icon="el-icon-delete"
                    @click="deleteTag(row)"
                    :disabled="loading"
                />
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const tags = ref([])
const newTagName = ref('')
const loading = ref(false)

const editId = ref(null)
const editName = ref('')

function rowStyle() {
  return {
    color: '#e7faff',
    fontSize: '14px'
  }
}

async function loadTags() {
  loading.value = true
  try {
    const res = await axios.get('/api/tags')
    tags.value = (res.data || []).filter(t => t.id && t.name)
  } catch (e) {
    ElMessage.error('加载标签失败')
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function addTag() {
  const name = newTagName.value.trim()
  if (!name) return

  loading.value = true
  try {
    const res = await axios.post('/api/tags', { name })
    tags.value.push(res.data)
    newTagName.value = ''
    ElMessage.success('添加成功')
  } catch (e) {
    ElMessage.error('添加标签失败')
    console.error(e)
  } finally {
    loading.value = false
  }
}

function startEdit(tag) {
  editId.value = tag.id
  editName.value = tag.name
}

function cancelEdit() {
  editId.value = null
  editName.value = ''
}

async function saveEdit(tag) {
  const name = editName.value.trim()
  if (!name) {
    ElMessage.warning('标签名称不能为空')
    return
  }

  loading.value = true
  try {
    await axios.put(`/api/tags/${tag.id}`, { name })
    const index = tags.value.findIndex(t => t.id === tag.id)
    if (index !== -1) tags.value[index].name = name
    cancelEdit()
    ElMessage.success('更新成功')
  } catch (e) {
    ElMessage.error('更新标签失败')
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function deleteTag(tag) {
  try {
    await ElMessageBox.confirm(
        `确认删除标签 "${tag.name}" 吗？`,
        '提示',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )
  } catch {
    return
  }

  loading.value = true
  try {
    await axios.delete(`/api/tags/${tag.id}`)
    tags.value = tags.value.filter(t => t.id !== tag.id)
    ElMessage.success('删除成功')
  } catch (e) {
    ElMessage.error('删除标签失败')
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.no-scroll {
  width: 81vw;
  height: 98vh;
  overflow: hidden;
  display: flex;
  min-width: 0;
  min-height: 0;
}
.cat-manager, .tag-manager {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  box-sizing: border-box;
  color: #e7faff;
  user-select: none;
  cursor: default;
  /* 让两栏之间有间隔 */
}
.cat-manager {
  max-width: 50vw;
  border-right: 1px solid #2a3b4d;
}
.tag-manager {
  max-width: 50vw;
}
.table-flex {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  width: 100%;
  overflow: auto;
}
h2 {
  margin: 0 0 16px 0;
  font-weight: 600;
  color: #a0eaff;
}
.add-tag-form {
  margin-bottom: 16px;
}
.el-divider {
  margin: 0 0 16px 0;
}
.el-empty__description {
  color: #9ecfff !important;
  font-style: italic;
}
</style>
