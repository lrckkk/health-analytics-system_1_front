<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import { SwitchButton } from '@element-plus/icons-vue'; // 新增
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '退出确认',
    {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 清除本地登录信息
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    // 跳转到登录页
    router.push('/login');
  });
};
</script>

<template>
  <el-button @click="handleLogout" class="exit-button" link>
    <el-icon class="icon"><SwitchButton /></el-icon>
  </el-button>
</template>

<style scoped>
.exit-button {
  padding: 8px;
  border: none;
  background: transparent;
  color: #ff4d4f;
}
.icon {
  font-size: 26px;
  color: #ff4d4f;
  user-select: none;
}
</style>
