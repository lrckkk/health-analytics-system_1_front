<template>
  <div class="panel-content">
    <h2>人员管理</h2>
    <p>你可以在此添加、修改、删除平台用户或设置权限。</p>
    <table v-if="users.length" class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>用户名</th>
          <th>邮箱</th>
          <th>手机号</th>
          <th>地址</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.userId">
          <td>{{ user.userId }}</td>
          <td v-if="editId !== user.userId">{{ user.username }}</td>
          <td v-else><input v-model="editUser.username" /></td>
          <td v-if="editId !== user.userId">{{ user.email || '-' }}</td>
          <td v-else><input v-model="editUser.email" /></td>
          <td v-if="editId !== user.userId">{{ user.phone || '-' }}</td>
          <td v-else><input v-model="editUser.phone" /></td>
          <td v-if="editId !== user.userId">{{ user.address || '-' }}</td>
          <td v-else><input v-model="editUser.address" /></td>
          <td>
            <button v-if="editId !== user.userId" @click="startEdit(user)">修改</button>
            <button v-if="editId === user.userId" @click="submitEdit(user.userId)">保存</button>
            <button v-if="editId === user.userId" @click="cancelEdit">取消</button>
            <button @click="deleteUser(user.userId)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else>暂无用户数据</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const users = ref([])
const editId = ref(null)
const editUser = ref({ username: '', email: '', phone: '', address: '', role: '' })

const fetchUsers = async () => {
  try {
    users.value = (await request.get('/api/admin/users')).data || []
  } catch (e) {
    users.value = []
  }
}

const startEdit = (user) => {
  editId.value = user.userId
  editUser.value = { username: user.username, email: user.email, phone: user.phone, address: user.address, role: user.role }
}

const cancelEdit = () => {
  editId.value = null
  editUser.value = { username: '', email: '', phone: '', address: '', role: '' }
}

const submitEdit = async (id) => {
  try {
    await request.put(`/api/admin/users/${id}`, editUser.value)
    await fetchUsers()
    cancelEdit()
  } catch (e) {
    alert('修改失败: ' + e)
  }
}

const deleteUser = async (id) => {
  if (!confirm('确定要删除该用户吗？')) return
  try {
    await request.delete(`/api/admin/users/${id}`)
    await fetchUsers()
  } catch (e) {
    alert('删除失败: ' + e)
  }
}

onMounted(fetchUsers)
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
}
.user-table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  background: rgba(255,255,255,0.08);
}
.user-table th, .user-table td {
  border: 1px solid #00d5ff33;
  padding: 8px 12px;
  text-align: left;
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
</style>
