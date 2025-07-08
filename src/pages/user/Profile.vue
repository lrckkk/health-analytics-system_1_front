<template>
  <div class="profile-container">
    <div class="tech-background">
      <div class="bg-grid"></div>
      <div class="bg-particles"></div>
      <div class="bg-light-effect"></div>
    </div>

    <el-card class="profile-card futuristic-card">
      <div class="profile-header">
        <h2 class="futuristic-title">个人中心</h2>
        <p class="futuristic-subtitle">管理您的账户信息和设置</p>
      </div>

      <div class="profile-content">
        <!-- 个人信息展示 -->
        <div class="info-section" :class="{ active: !isEditing }">
          <div class="info-item">
            <span class="info-label">用户名:</span>
            <span class="info-value">{{ userInfo.username }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">角色:</span>
            <span class="info-value">{{ roleMap[userInfo.role] }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">电子邮箱:</span>
            <span class="info-value">{{ userInfo.email || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">手机号:</span>
            <span class="info-value">{{ userInfo.phone || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">地址:</span>
            <span class="info-value">{{ userInfo.address || '未设置' }}</span>
          </div>

          <div class="action-buttons aligned-buttons">
            <el-button
                type="primary"
                @click="startEditing"
                class="futuristic-button"
            >
              编辑信息
            </el-button>
            <el-button
                type="info"
                @click="showChangePasswordDialog = true"
                class="futuristic-button register-button"
            >
              修改密码
            </el-button>
          </div>
        </div>

        <!-- 信息编辑表单 -->
        <div class="edit-form" :class="{ active: isEditing }">
          <!-- 用户名 - 不可编辑 -->
          <div class="info-item">
            <span class="info-label">用户名:</span>
            <span class="info-value">{{ editForm.username }}</span>
          </div>

          <!-- 角色 - 不可编辑 -->
          <div class="info-item">
            <span class="info-label">角色:</span>
            <span class="info-value">{{ roleMap[editForm.role] }}</span>
          </div>

          <!-- 电子邮箱 - 可编辑 -->
          <div class="info-item">
            <span class="info-label">电子邮箱:</span>
            <el-input
                v-model="editForm.email"
                placeholder="请输入电子邮箱"
                class="inline-input"
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </div>

          <!-- 手机号 - 可编辑 -->
          <div class="info-item">
            <span class="info-label">手机号:</span>
            <el-input
                v-model="editForm.phone"
                placeholder="请输入手机号"
                class="futuristic-input inline-input"
            >
              <template #prefix>
                <el-icon><Iphone /></el-icon>
              </template>
            </el-input>
          </div>

          <!-- 地址 - 可编辑 -->
          <div class="info-item">
            <span class="info-label">地址:</span>
            <el-input
                v-model="editForm.address"
                placeholder="请输入地址"
                class="futuristic-input inline-input"
            >
              <template #prefix>
                <el-icon><Location /></el-icon>
              </template>
            </el-input>
          </div>

          <!-- 对齐的按钮组 -->
          <div class="action-buttons aligned-buttons">
            <el-button
                type="primary"
                @click="saveProfile"
                :loading="loading"
                class="futuristic-button save-button"
            >
              保存更改
              <template #loading>
                <span class="loading-text">保存中...</span>
                <div class="button-loading-effect"></div>
              </template>
            </el-button>
            <el-button
                type="info"
                @click="cancelEditing"
                class="futuristic-button register-button cancel-button"
            >
              取消
            </el-button>
          </div>
        </div>
      </div>

      <!-- 权限展示区域 -->
      <div class="permissions-section" v-if="permissions.length > 0">
        <h3 class="section-title">您的权限</h3>
        <div class="permissions-grid">
          <div
              class="permission-item"
              v-for="(permission, index) in permissions"
              :key="index"
          >
            <div class="permission-icon">
              <el-icon><Key /></el-icon>
            </div>
            <span class="permission-text">{{ permission }}</span>
          </div>
        </div>
      </div>

      <!-- 修改信息确认对话框 -->
      <el-dialog
          v-model="showSaveConfirmDialog"
          title="确认修改"
          width="400px"
          class="tech-dialog confirm-dialog"
          :modal="true"
          :append-to-body="true"
          :show-close="false"
          :close-on-click-modal="false"
      >
        <div class="dialog-tech-container dark-dialog-border">
          <div class="dialog-tech-bg">
            <div class="dialog-grid"></div>
            <div class="dialog-particles"></div>
            <div class="dialog-light-effect"></div>
          </div>
          <div class="dialog-tech-content">
            <div class="confirm-icon-wrapper">
              <el-icon class="confirm-icon"><Warning /></el-icon>
              <div class="icon-glow"></div>
            </div>
            <p class="confirm-message">确定要保存这些修改吗？</p>
          </div>
        </div>
        <template #footer>
          <div class="dialog-tech-footer">
            <el-button
                type="primary"
                @click="showSaveConfirmDialog = false"
                class="tech-button primary"
            >
              取消修改
            </el-button>
            <el-button
                type="primary"
                @click="confirmSaveProfile"
                class="tech-button primary"
            >
              确定保存
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 修改密码对话框 -->
      <el-dialog
          v-model="showChangePasswordDialog"
          title="修改密码"
          width="420px"
          class="tech-dialog password-dialog"
          :modal="true"
          :append-to-body="true"
          :show-close="false"
          :close-on-click-modal="false"
      >
        <div class="dialog-tech-container dark-dialog-border">
          <div class="dialog-tech-bg">
            <div class="dialog-grid"></div>
            <div class="dialog-particles"></div>
            <div class="dialog-light-effect"></div>
          </div>
          <div class="dialog-tech-content">
            <el-form
                :model="passwordForm"
                label-width="80px"
                :rules="passwordRules"
                ref="passwordFormRef"
                class="tech-form"
            >
              <el-form-item label="原密码" prop="oldPassword">
                <el-input
                    type="password"
                    v-model="passwordForm.oldPassword"
                    placeholder="请输入原密码"
                    show-password
                    class="tech-input"
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="新密码" prop="newPassword">
                <el-input
                    type="password"
                    v-model="passwordForm.newPassword"
                    placeholder="请输入新密码"
                    show-password
                    class="tech-input"
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                    type="password"
                    v-model="passwordForm.confirmPassword"
                    placeholder="请再次输入新密码"
                    show-password
                    class="tech-input"
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <template #footer>
          <div class="dialog-tech-footer">
            <el-button
                type="primary"
                @click="showChangePasswordDialog = false"
                class="tech-button primary"
            >
              取消
            </el-button>
            <el-button
                type="primary"
                @click="confirmChangePassword"
                :loading="passwordLoading"
                class="tech-button primary"
            >
              确认修改
            </el-button>
          </div>
        </template>
      </el-dialog>
      <!-- 科技感装饰元素 -->
      <div class="tech-decoration">
        <div class="decoration-line line-1"></div>
        <div class="decoration-line line-2"></div>
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-dots"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Lock, Message, Iphone, Location, Key, Warning } from '@element-plus/icons-vue';
import request from '@/utils/request';

// 新增状态控制
const showSaveConfirmDialog = ref(false);
const pendingSave = ref(false);

// 角色映射
const roleMap = {
  ADMIN: '管理员',
  RESEARCHER: '研究员',
  ANALYST: '分析师',
  AUDITOR: '审核员',
  USER: '普通用户',
  GUEST: '游客'
};

// 用户信息
const userInfo = ref({
  username: '',
  role: '',
  email: '',
  phone: '',
  address: ''
});

// 编辑表单
const editForm = ref({
  username: '',
  email: '',
  phone: '',
  address: ''
});

// 密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 密码验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/,
      message: '密码需包含大小写字母和数字，长度6-20位',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 权限列表
const permissions = ref([]);

// 状态控制
const isEditing = ref(false);
const loading = ref(false);
const showChangePasswordDialog = ref(false);
const passwordLoading = ref(false);
const passwordFormRef = ref(null);

// 获取用户信息
const fetchUserProfile = async () => {
  try {
    loading.value = true;
    const response = await request.get('/api/user/profile');

    if (response.code === 200) {
      userInfo.value = response.data;
      editForm.value = { ...response.data };
    } else {
      ElMessage.error(response.message || '获取用户信息失败');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 获取用户权限
const fetchUserPermissions = async () => {
  try {
    const response = await request.get('/api/user/permissions');

    if (response.code === 200) {
      permissions.value = response.data;
    }
  } catch (error) {
    console.error('获取权限列表失败:', error);
  }
};

const startEditing = async () => {
  isEditing.value = true;
  // 强制重绘以确保动画触发
  await nextTick();
};

const cancelEditing = async () => {
  isEditing.value = false;
  editForm.value = {...userInfo.value};
  await nextTick();
};

// 修改保存个人信息方法
const saveProfile = () => {
  showSaveConfirmDialog.value = true;
  pendingSave.value = true;
};

const confirmSaveProfile = async () => {
  showSaveConfirmDialog.value = false;
  if (!pendingSave.value) return;

  try {
    loading.value = true;
    const response = await request.put('/api/user/profile', editForm.value);

    if (response.code === 200) {
      ElMessage.success('个人信息更新成功');
      userInfo.value = response.data;
      isEditing.value = false;
    } else {
      ElMessage.error(response.message || '更新失败');
    }
  } catch (error) {
    console.error('更新个人信息失败:', error);
    ElMessage.error('更新失败，请重试');
  } finally {
    loading.value = false;
    pendingSave.value = false;
  }
};

// 修改密码确认方法
const confirmChangePassword = async () => {
  try {
    await passwordFormRef.value.validate();

    passwordLoading.value = true;
    const response = await request.put('/api/user/password', {
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    });

    if (response.code === 200) {
      ElMessage.success('密码修改成功，请重新登录');
      showChangePasswordDialog.value = false;
      passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
    } else {
      ElMessage.error(response.message || '密码修改失败');
    }
  } catch (error) {
    if (error !== 'validate') {
      console.error('修改密码失败:', error);
      ElMessage.error(error.message || '密码修改失败');
    }
  } finally {
    passwordLoading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchUserProfile();
  // fetchUserPermissions();
});
</script>
<style  lang="scss">
$tech-bg: #0a1220;
$tech-card-bg: rgba(22, 32, 72, 0.9);
$tech-primary: #00f0ff;
$tech-secondary: #7d5fff;
$tech-text: #e0f7ff;
$tech-light: #ffffff;
$tech-border: rgba(0, 240, 255, 0.4);
$tech-highlight: rgba(0, 240, 255, 0.2);
$tech-dialog-border: rgba(16, 26, 60, 0.9);
/* global-styles.scss */
.tech-dialog.el-dialog {
  background: $tech-card-bg;
  border-radius: 12px;
  border: 1px solid $tech-border;
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.4), 0 0 60px rgba(125, 95, 255, 0.3);
}

.tech-dialog .el-dialog__header {
  border-bottom: 1px solid $tech-border;
  padding: 15px 20px;
  margin: 0;
  background: rgba(16, 26, 60, 0.7);
}

.tech-dialog .el-dialog__title {
  color: $tech-primary;
  font-size: 18px;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}
</style>
<style scoped lang="scss">
/* 科技风样式变量 */
$tech-bg: #0a1220;
$tech-card-bg: rgba(22, 32, 72, 0.9);
$tech-primary: #00f0ff;
$tech-secondary: #7d5fff;
$tech-text: #e0f7ff;
$tech-light: #ffffff;
$tech-border: rgba(0, 240, 255, 0.4);
$tech-highlight: rgba(0, 240, 255, 0.2);
$tech-dialog-border: rgba(16, 26, 60, 0.9);

.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: $tech-bg;
  position: relative;
  overflow: hidden;
  padding: 40px 0;
}

.tech-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;

  .bg-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
        linear-gradient(rgba(100, 220, 255, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(100, 220, 255, 0.1) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: gridMove 20s linear infinite;
  }

  .bg-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
        radial-gradient(circle at 20% 30%, rgba(0, 240, 255, 0.15) 0%, transparent 30%),
        radial-gradient(circle at 80% 70%, rgba(125, 95, 255, 0.15) 0%, transparent 30%);
    animation: pulse 8s ease-in-out infinite alternate;
  }

  .bg-light-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(0, 240, 255, 0.03) 0%, transparent 100%);
    animation: lightSweep 16s linear infinite;
  }
}

.futuristic-card {
  width: 800px;
  padding: 40px;
  background: $tech-card-bg;
  border-radius: 16px;
  box-shadow:
      0 0 40px rgba(0, 240, 255, 0.4),
      0 0 80px rgba(125, 95, 255, 0.3);
  border: 1px solid $tech-border;
  position: relative;
  z-index: 2;
  backdrop-filter: blur(12px);
  overflow: hidden;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px) rotateX(1deg) rotateY(1deg);
  }
}

/* 对话框科技风格样式 */
.dark-dialog-border {
  position: relative;
  border: 2px solid $tech-dialog-border;
  box-shadow:
      inset 0 0 15px rgba(0, 240, 255, 0.2),
      0 0 30px rgba(0, 240, 255, 0.3);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid rgba(0, 100, 150, 0.4);
    border-radius: 12px;
    pointer-events: none;
    z-index: 3;
  }
}

.tech-dialog {
  :deep(.el-dialog) {
    background: $tech-card-bg;
    border-radius: 12px;
    border: 1px solid $tech-border;
    box-shadow:
        0 0 30px rgba(0, 240, 255, 0.4),
        0 0 60px rgba(125, 95, 255, 0.3);
  }

  :deep(.el-dialog__header) {
    border-bottom: 1px solid $tech-border;
    padding: 15px 20px;
    margin: 0;
    background: rgba(16, 26, 60, 0.7);

    .el-dialog__title {
      color: $tech-primary;
      font-size: 18px;
      text-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
    }
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog__footer) {
    padding: 0;
  }
}

.dialog-tech-container {
  position: relative;
  width: 100%;
  min-height: 150px;
  background: $tech-card-bg;
  border-radius: 10px;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.dialog-tech-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
  background: rgba(10, 18, 32, 0.98);

  .dialog-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
        linear-gradient(rgba(100, 220, 255, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(100, 220, 255, 0.08) 1px, transparent 1px);
    background-size: 30px 30px;
    animation: gridMove 20s linear infinite;
  }

  .dialog-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
        radial-gradient(circle at 20% 30%, rgba(0, 240, 255, 0.1) 0%, transparent 30%),
        radial-gradient(circle at 80% 70%, rgba(125, 95, 255, 0.1) 0%, transparent 30%);
    animation: pulse 8s ease-in-out infinite alternate;
  }

  .dialog-light-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, transparent 100%);
    animation: lightSweep 12s linear infinite;
  }
}

.dialog-tech-content {
  position: relative;
  z-index: 2;
  padding: 20px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
  color: $tech-text;
}

.password-dialog {
  .tech-form {
    width: 100%;
    padding: 0 10px;

    :deep(.el-form-item) {
      margin-bottom: 18px !important;
    }

    :deep(.el-input) {
      width: 100%;
    }
  }
}

.dialog-tech-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 16px;
  background: linear-gradient(90deg,
      rgba(16, 26, 60, 0.98),
      rgba(0, 240, 255, 0.2));
  border-top: 1px solid $tech-border;
  position: relative;
  z-index: 3;
  margin: 0;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.confirm-icon-wrapper {
  text-align: center;
  margin-bottom: 20px;
  position: relative;

  .confirm-icon {
    font-size: 48px;
    color: $tech-primary;
    position: relative;
    z-index: 2;
    animation: iconPulse 2s ease-in-out infinite;
  }

  .icon-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(0, 240, 255, 0.2);
    box-shadow: 0 0 30px rgba(0, 240, 255, 0.6);
    animation: glowPulse 2s ease-in-out infinite alternate;
  }
}

.confirm-message {
  text-align: center;
  color: $tech-text;
  font-size: 16px;
  margin: 0;
  line-height: 1.6;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}

.tech-form,
.tech-input,
.tech-button {
  :deep(*) {
    margin: 0;
    padding: 0;
    border: none;
    outline: none;
    box-shadow: none;
    background: transparent;
  }
}

:deep(.el-input__wrapper) {
  background: rgba(0, 0, 0, 0.3) !important;
  box-shadow: none !important;

  &:hover, &.is-focus {
    box-shadow: 0 0 0 1px $tech-primary !important;
  }
}

.tech-form {
  width: 100%;
  margin: 0;
  padding: 0;

  :deep(.el-form-item) {
    margin-bottom: 20px;
    padding: 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(.el-form-item__content) {
    line-height: 1;
  }
}

.tech-button {
  border: none !important;
  outline: none !important;

  &:focus {
    box-shadow: none !important;
  }
}

.tech-button {
  border: none;
  height: 36px;
  padding: 0 24px;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &.primary {
    background: linear-gradient(90deg, $tech-primary, $tech-secondary);
    color: $tech-bg;
    font-weight: 600;
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.5);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 25px rgba(0, 240, 255, 0.7);
    }

    &:active {
      transform: translateY(0);
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: all 0.6s ease;
    }

    &:hover::after {
      transform: translateX(100%);
    }
  }

  &.secondary {
    background: rgba(125, 95, 255, 0.2);
    color: $tech-primary;
    border: 1px solid $tech-secondary;
    font-weight: 600;

    &:hover {
      background: rgba(125, 95, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 0 15px rgba(125, 95, 255, 0.4);
    }
  }
}

.tech-input {
  :deep(.el-input__wrapper) {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid $tech-border;
    box-shadow: none;
    border-radius: 6px;
    height: 40px;
    transition: all 0.3s;

    &:hover, &.is-focus {
      border-color: $tech-primary;
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
    }
  }

  :deep(.el-input__inner) {
    color: $tech-text;
    font-size: 14px;
  }

  :deep(.el-input__prefix) {
    color: $tech-primary;
    margin-right: 8px;
  }
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.futuristic-title {
  color: $tech-primary;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 10px;
  text-shadow: 0 0 12px rgba(0, 240, 255, 0.6);
  animation: textGlow 2s ease-in-out infinite alternate;
}

.futuristic-subtitle {
  color: $tech-primary;
  font-size: 16px;
  margin: 0;
  animation: fadeInOut 3s ease-in-out infinite;
}

.profile-content {
  margin: 30px 0;
}

.profile-content {
  position: relative;

  > div {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;

    &.active {
      position: relative;
      opacity: 1;
      pointer-events: all;
    }
  }
}

.info-section, .edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  margin-bottom: 20px;
  background: rgba(16, 26, 60, 0.7);
  border-radius: 10px;
  border: 1px solid $tech-border;
  transition: all 0.3s ease;
  min-height: 56px;

  &:hover {
    background: $tech-highlight;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 240, 255, 0.3);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  color: $tech-primary;
  font-weight: 500;
  min-width: 80px;
  margin-right: 20px;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}

.info-value {
  color: $tech-primary;
  flex: 1;
}

.inline-input {
  flex: 1;
  color: $tech-primary;
  :deep(.el-input__wrapper) {
    height: auto;
    min-height: 24px;
    line-height: 1.5;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 4px 0;

    &:hover, &.is-focus {
      background: rgba(0, 240, 255, 0.1) !important;
    }
  }

  :deep(.el-input__inner) {
    color:  $tech-primary !important;
    padding: 0;
    line-height: 1.5;
  }

  :deep(.el-input__prefix) {
    display: none;
  }
}

.action-buttons {
  margin-top: 30px;
  min-height: 60px;
  &.aligned-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;

    .save-button, .cancel-button {
      width: 100%;
    }
  }
}

.edit-form, .info-section {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.futuristic-button {
  width: 100%;
  background: linear-gradient(90deg, $tech-primary 0%, $tech-secondary 100%);
  border: none;
  color: $tech-bg;
  font-weight: 600;
  height: 48px;
  border-radius: 10px;
  transition: all 0.3s;
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.5);
  font-size: 16px;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 0 35px rgba(0, 240, 255, 0.7);

    &::after {
      transform: translateX(100%);
    }
  }

  &:active {
    transform: translateY(0);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.6s ease;
  }

  .loading-text {
    color: $tech-bg;
    font-weight: 600;
    position: relative;
    z-index: 1;
  }

  .button-loading-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: loadingShine 1.5s infinite;
  }
}

.register-button {
  background: linear-gradient(90deg, rgba(125, 95, 255, 0.8) 0%, rgba(0, 240, 255, 0.6) 100%) !important;
  color: $tech-bg ;
  box-shadow: 0 0 25px rgba(125, 95, 255, 0.5) !important;

  &:hover {
    box-shadow: 0 0 35px rgba(125, 95, 255, 0.7) !important;
    transform: translateY(-4px);
  }

  .button-hover-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    opacity: 0;
    transition: all 0.3s;
  }

  &:hover .button-hover-effect {
    opacity: 1;
    animation: loadingShine 1.5s infinite;
  }
}

.permissions-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid $tech-border;
}

.section-title {
  color: $tech-primary;
  font-size: 20px;
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.4);
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.permission-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background: rgba(16, 26, 60, 0.7);
  border-radius: 8px;
  border: 1px solid $tech-border;
  transition: all 0.3s ease;

  &:hover {
    background: $tech-highlight;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 240, 255, 0.3);
  }
}

.permission-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 240, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: $tech-primary;
}

.permission-text {
  color: $tech-text;
  font-size: 14px;
  flex: 1;
}

.tech-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: -1;
}

.decoration-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, $tech-primary, transparent);
  height: 1px;
  opacity: 0.4;

  &.line-1 {
    top: 20%;
    left: -50%;
    width: 200%;
    animation: slideLine 15s linear infinite;
  }

  &.line-2 {
    top: 70%;
    left: -50%;
    width: 200%;
    animation: slideLine 20s linear infinite reverse;
  }
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid $tech-primary;
  opacity: 0.3;
  animation: circlePulse 8s ease-in-out infinite;

  &.circle-1 {
    width: 200px;
    height: 200px;
    top: -50px;
    right: -50px;
    animation-delay: 0s;
  }

  &.circle-2 {
    width: 150px;
    height: 150px;
    bottom: -30px;
    left: -30px;
    animation-delay: 2s;
  }
}

.decoration-dots {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient($tech-primary 1px, transparent 1px);
  background-size: 10px 10px;
  opacity: 0.1;
  animation: dotsMove 30s linear infinite;
}

/* 动画效果 */
@keyframes slideLine {
  0% { transform: translateX(0); }
  100% { transform: translateX(50%); }
}

@keyframes circlePulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.5; }
}

@keyframes textGlow {
  0% { text-shadow: 0 0 12px rgba(0, 240, 255, 0.6); }
  100% { text-shadow: 0 0 20px rgba(0, 240, 255, 0.9); }
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

@keyframes pulse {
  0% { opacity: 0.8; }
  100% { opacity: 1; }
}

@keyframes lightSweep {
  0% { transform: translateX(-100%) translateY(-100%); }
  100% { transform: translateX(100%) translateY(100%); }
}

@keyframes gridMove {
  0% { background-position: 0 0; }
  100% { background-position: 40px 40px; }
}

@keyframes dotsMove {
  0% { background-position: 0 0; }
  100% { background-position: 100px 100px; }
}

@keyframes loadingShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes glowPulse {
  0% { opacity: 0.6; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1.1); }
}
</style>

