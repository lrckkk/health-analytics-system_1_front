<template>
  <div class="login-container">
    <div class="tech-background">
      <div class="bg-grid"></div>
      <div class="bg-particles"></div>
      <div class="bg-light-effect"></div>
    </div>

    <el-card class="login-card futuristic-card">
      <div class="login-header">
        <h2 class="futuristic-title">健康大数据应用创新研发中心</h2>
        <p class="futuristic-subtitle">请登录系统以访问数据分析平台</p>
      </div>

      <el-form :model="form" label-width="100px" class="login-form">
        <!-- 用户名输入框 -->
        <el-form-item label="用户名" class="futuristic-form-item">
          <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              class="futuristic-input"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 密码输入框 -->
        <el-form-item label="密码" class="futuristic-form-item">
          <el-input
              type="password"
              v-model="form.password"
              placeholder="请输入密码"
              show-password
              class="futuristic-input"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 角色选择框 -->
        <el-form-item label="角色" class="futuristic-form-item">
          <div class="role-selector">
            <div
                v-for="role in roleOptions"
                :key="role.value"
                class="role-option"
                :class="{ 'active': form.role === role.value }"
                @click="form.role = role.value"
            >
              <div class="role-icon">
                <el-icon>
                  <component :is="roleIcons[role.value]" />
                </el-icon>
              </div>
              <span class="role-label">{{ role.label }}</span>
              <div class="active-indicator"></div>
            </div>
          </div>
        </el-form-item>

        <!-- 验证码 -->
        <el-form-item label="验证码" class="futuristic-form-item">
          <div class="captcha-container">
            <el-input
                v-model="form.code"
                placeholder="请输入验证码"
                class="futuristic-input captcha-input"
            />
            <div class="captcha-image" @click="refreshCaptcha">
              <img :src="captchaImage" alt="验证码" />
              <div class="refresh-icon">
                <el-icon><Refresh /></el-icon>
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- 数字证书（可选）-->
        <el-form-item label="数字证书" class="futuristic-form-item">
          <el-input
              v-model="form.cert"
              placeholder="输入数字证书"
              class="futuristic-input"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item class="futuristic-form-item">
          <el-button
              type="primary"
              @click="handleLogin"
              :loading="loading"
              class="futuristic-button"
          >
            登录
            <template #loading>
              <span class="loading-text">验证中...</span>
              <div class="button-loading-effect"></div>
            </template>
          </el-button>
        </el-form-item>
      </el-form>

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
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Refresh, User, Lock, Key, Avatar, UserFilled, Setting, View, Connection } from '@element-plus/icons-vue';
import axios from 'axios';

// 角色图标映射
const roleIcons = {
  admin: Setting,
  researcher: UserFilled,
  analyst: View,
  auditor: Avatar,
  user: User,          // 普通用户图标
  guest: Connection    // 游客图标
};

// 响应式数据
const form = ref({
  username: '',
  password: '',
  role: '',
  code: '',
  cert: ''  // 数字证书
});

const roleOptions = ref([
  { label: '管理员', value: 'admin' },
  { label: '研究员', value: 'researcher' },
  { label: '分析师', value: 'analyst' },
  { label: '审核员', value: 'auditor' },
  { label: '普通用户', value: 'user' },  // 新增普通用户
  { label: '游客', value: 'guest' }     // 新增游客
]);

const loading = ref(false);
const router = useRouter();
const captchaImage = ref('');
const captchaToken = ref('');

// 生成验证码
const generateCaptcha = async () => {
  try {
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    captchaToken.value = randomCode;

    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');

    // 绘制背景
    ctx.fillStyle = '#0a1a4a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格背景
    ctx.strokeStyle = 'rgba(100, 220, 255, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // 绘制干扰线
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(100, 220, 255, ${Math.random() * 0.3 + 0.2})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // 绘制验证码文字
    for (let i = 0; i < randomCode.length; i++) {
      ctx.fillStyle = `rgba(100, 220, 255, ${Math.random() * 0.5 + 0.5})`;
      ctx.font = 'bold 24px Arial';
      ctx.fillText(randomCode[i], 25 * i + 10, 30);
    }

    captchaImage.value = canvas.toDataURL('image/png');

  } catch (error) {
    console.error('生成验证码失败:', error);
    ElMessage.error('验证码生成失败');
  }
};

// 刷新验证码
const refreshCaptcha = () => {
  generateCaptcha();
};

// 登录处理逻辑
const handleLogin = async () => {
  try {
    loading.value = true;

    if (!form.value.username || !form.value.password || !form.value.role) {
      ElMessage.error('所有字段都必须填写');
      loading.value = false;
      return;
    }

    if (form.value.code.toUpperCase() !== captchaToken.value) {
      ElMessage.error('验证码错误');
      loading.value = false;
      refreshCaptcha();
      return;
    }

    if (form.value.cert && form.value.cert !== 'valid-cert') {
      ElMessage.error('数字证书无效');
      loading.value = false;
      return;
    }

    const response = await axios.post('localhost:8080/api/login', form.value);

    if (response.data.success) {
      ElMessage.success('登录成功');
      await router.push({name: 'Home'});
    } else {
      ElMessage.error('登录失败，用户名或密码错误');
    }
  } catch (error) {
    ElMessage.error('网络错误，请重试');
  } finally {
    loading.value = false;
  }
};

// 组件挂载时生成验证码
onMounted(() => {
  generateCaptcha();
});
</script>

<style scoped lang="scss">
$tech-bg: #0a1220;
$tech-card-bg: rgba(22, 32, 72, 0.9);
$tech-primary: #00f0ff;
$tech-secondary: #7d5fff;
$tech-text: #e0f7ff;
$tech-light: #ffffff;
$tech-border: rgba(0, 240, 255, 0.4);
$tech-highlight: rgba(0, 240, 255, 0.2);

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: $tech-bg;
  position: relative;
  overflow: hidden;
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
  width: 540px;
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

.login-header {
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
  color: rgba($tech-text, 0.9);
  font-size: 16px;
  margin: 0;
  animation: fadeInOut 3s ease-in-out infinite;
}

.login-form {
  margin-top: 20px;
}

.futuristic-form-item {
  margin-bottom: 28px;

  :deep(.el-form-item__label) {
    color: $tech-primary;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.5px;
    padding-bottom: 8px;
    text-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
  }
}

.futuristic-input {
  :deep(.el-input__wrapper) {
    background: rgba(16, 26, 60, 0.7) !important;
    border: 1px solid $tech-border !important;
    box-shadow: 0 0 12px rgba(0, 240, 255, 0.3) !important;
    border-radius: 10px;
    transition: all 0.3s ease;

    &:hover {
      border-color: $tech-primary !important;
      box-shadow: 0 0 18px rgba(0, 240, 255, 0.4) !important;
      transform: translateY(-2px);
    }

    &.is-focus {
      border-color: $tech-primary !important;
      box-shadow: 0 0 25px rgba(0, 240, 255, 0.5) !important;
    }
  }

  :deep(.el-input__inner) {
    color: $tech-light !important;
    font-size: 15px;
    padding: 12px 0;

    &::placeholder {
      color: rgba($tech-text, 0.7) !important;
    }
  }

  :deep(.el-input__prefix) {
    color: $tech-primary;
    margin-right: 12px;
    font-size: 18px;
    text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
  }
}

/* 角色选择器 */
.role-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 从2列改为3列 */
  gap: 12px;
  width: 100%;
}

.role-option {
  background: rgba(16, 26, 60, 0.7);
  border: 2px solid $tech-border;
  border-radius: 10px;
  padding: 15px 10px; /* 调整左右内边距 */
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 120px; /* 增加最小宽度 */
  height: 60px; /* 固定高度 */


  &:hover {
    background: $tech-highlight;
    border-color: $tech-primary;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 240, 255, 0.3);

    .role-icon {
      margin-right: 5px; /* 移除右边距 */
      margin-bottom: 8px; /* 添加底部边距 */
    }
  }

  &.active {
    background: $tech-highlight;
    border-color: $tech-primary;
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);

    .role-icon {
      background: rgba(0, 240, 255, 0.3);
      color: $tech-primary;
      transform: scale(1.1);
    }

    .active-indicator {
      opacity: 1;
      transform: scale(1);
    }
  }
}
.role-icon {
  width: 32px; /* 稍微缩小图标 */
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 240, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px; /* 调整右边距 */
  color: $tech-text;
  transition: all 0.3s ease;
  flex-shrink: 0; /* 防止图标被压缩 */

  .el-icon {
    font-size: 16px; /* 缩小图标大小 */
  }
}
.role-label {
  color: $tech-text;
  font-size: 14px; /* 稍微减小字体大小 */
  font-weight: 500;
  white-space: nowrap; /* 防止文字换行 */
  overflow: hidden;
  text-overflow: ellipsis; /* 文字过长显示省略号 */
  flex: 1;
  min-width: 0; /* 允许文本截断 */
}


.active-indicator {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  background: $tech-primary;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s ease;
  box-shadow: 0 0 10px $tech-primary;
}

.captcha-container {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  position: relative;
  width: 130px;
  height: 44px;
  cursor: pointer;
  border: 1px solid $tech-border;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    border-color: $tech-primary;
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
    transform: translateY(-3px);

    .refresh-icon {
      background: rgba(0, 240, 255, 0.4);
    }
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.refresh-icon {
  position: absolute;
  right: 5px;
  bottom: 5px;
  background: rgba($tech-bg, 0.7);
  padding: 4px;
  border-radius: 4px;
  color: $tech-primary;
  font-size: 14px;
  transition: all 0.3s;

  &:hover {
    transform: rotate(180deg);
  }
}

.futuristic-button {
  width: 100%;
  background: linear-gradient(90deg, $tech-primary 0%, $tech-secondary 100%);
  border: none;
  color: $tech-bg;
  font-weight: 600;
  height: 48px;
  border-radius: 10px;
  margin-top: 15px;
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

/* 科技感装饰元素 */
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
</style>