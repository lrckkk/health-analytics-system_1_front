<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import { SwitchButton } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = () => {
  ElMessageBox.confirm(
      '<span class="cyber-message-text">确定要退出登录吗？</span>',
      '退出登录', // 这里直接使用纯文本
      {
        confirmButtonText: '确认退出',
        cancelButtonText: '取消指令',
        type: 'warning',
        customClass: 'cyber-message-box',
        confirmButtonClass: 'cyber-confirm-button',
        cancelButtonClass: 'cyber-cancel-button',
        titleClass: 'cyber-title',
        messageClass: 'cyber-message-content',
        dangerouslyUseHTMLString: true, // 允许使用HTML
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            setTimeout(() => {
              done();
              localStorage.removeItem('jwt_token');
              localStorage.removeItem('user_info');
              localStorage.removeItem('userRole');
              localStorage.removeItem('userName');
              localStorage.removeItem('token');
              router.push('/login');
            }, 1500);
          } else {
            done();
          }
        }
      }
  );
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
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.exit-button:hover {
  transform: translateY(-3px) scale(1.2);
  filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.7));
}

.icon {
  font-size: 26px;
  color: #00f0ff;
  user-select: none;
  transition: all 0.4s ease;
  filter: drop-shadow(0 0 4px rgba(0, 240, 255, 0.5));
}

.exit-button:hover .icon {
  color: #7d5fff;
  animation: pulseGlow 1.5s infinite alternate;
}

@keyframes pulseGlow {
  0% {
    filter: drop-shadow(0 0 4px rgba(0, 240, 255, 0.5));
  }
  100% {
    filter: drop-shadow(0 0 12px rgba(125, 95, 255, 0.8));
  }
}
</style>

<style global>
/* 全局弹窗样式 - 确保覆盖element-plus默认样式 */
.el-message-box.cyber-message-box {
  background: linear-gradient(135deg, rgba(10, 25, 47, 0.98) 0%, rgba(22, 32, 72, 0.98) 100%) !important;
  border: 1px solid rgba(0, 240, 255, 0.3) !important;
  border-top: 1px solid rgba(0, 240, 255, 0.6) !important;
  border-radius: 8px !important;
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.3), 0 0 60px rgba(125, 95, 255, 0.2) !important;
  backdrop-filter: blur(12px) !important;
  color: #e0f7ff !important;
  padding: 0 !important;
  width: 420px !important;
  max-width: 90vw !important;
  overflow: hidden;
  transform: perspective(500px) rotateX(5deg);
  animation: boxEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.el-message-box.cyber-message-box::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.8), rgba(125, 95, 255, 0.8), transparent);
  animation: scanline 3s linear infinite;
  z-index: 1;
}

/* 修改标题样式部分 */
.el-message-box.cyber-message-box .el-message-box__header .el-message-box__title {
  color: #00f0ff !important;
  font-size: 22px !important;
  font-weight: 600 !important;
  text-shadow: 0 0 12px rgba(0, 240, 255, 0.6) !important;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}
/* 添加标题前后的装饰符号 */
.el-message-box.cyber-message-box .el-message-box__header .el-message-box__title::before,
.el-message-box.cyber-message-box .el-message-box__header .el-message-box__title::after {
  content: "//";
  color: rgba(0, 240, 255, 0.6);
  margin: 0 8px;
}


.el-message-box.cyber-message-box .cyber-title {
  color: #00f0ff !important;
  font-size: 22px !important;
  font-weight: 600 !important;
  text-shadow: 0 0 12px rgba(0, 240, 255, 0.6) !important;
  margin: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
  position: relative;
}

/* 自定义标题文本样式 */
.cyber-title-text {
  color: #00f0ff;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.7);
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
  position: relative;
}

.cyber-title-text::before,
.cyber-title-text::after {
  content: "//";
  color: rgba(0, 240, 255, 0.6);
  margin: 0 8px;
}

/* 消息内容区域 */
.el-message-box.cyber-message-box .el-message-box__content {
  padding: 20px !important;
  background: rgba(0, 15, 30, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 自定义消息文本样式 */
.cyber-message-text {
  color:  rgba(0, 240, 255, 0.6) !important;
  font-size: 16px !important;
  text-align: center !important;
  line-height: 1.6;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.4);
  margin: 0 !important;
  padding: 10px 20px;
  background: rgba(0, 240, 255, 0.1);
  border-radius: 6px;
  border-left: 2px solid rgba(0, 240, 255, 0.5);
  border-right: 2px solid rgba(0, 240, 255, 0.5);
  position: relative;
}

.cyber-message-text::before,
.cyber-message-text::after {
  content: "";
  position: absolute;
  top: 0;
  width: 20px;
  height: 2px;
  background: rgba(0, 240, 255, 0.6);
}

.cyber-message-text::before {
  left: 0;
}

.cyber-message-text::after {
  right: 0;
}

.el-message-box.cyber-message-box .el-message-box__status {
  color: #00f0ff !important;
  font-size: 32px !important;
  margin-right: 15px !important;
  text-shadow: 0 0 15px rgba(0, 240, 255, 0.8);
  margin-bottom: 10px;
}

.el-message-box.cyber-message-box .el-message-box__btns {
  display: flex !important;
  justify-content: center !important;
  gap: 20px !important;
  padding: 20px !important;
  background: rgba(0, 10, 20, 0.4) !important;
  border-top: 1px solid rgba(0, 240, 255, 0.1) !important;
}

/* 按钮样式保持不变 */
.el-message-box.cyber-message-box .cyber-confirm-button {
  background: linear-gradient(90deg, rgba(0, 240, 255, 0.2) 0%, rgba(0, 240, 255, 0.4) 100%) !important;
  border: 1px solid rgba(0, 240, 255, 0.6) !important;
  color: #00f0ff !important;
  font-weight: 500 !important;
  border-radius: 6px !important;
  padding: 10px 25px !important;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
  position: relative;
  overflow: hidden;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 14px !important;
}

.el-message-box.cyber-message-box .cyber-confirm-button:hover {
  background: linear-gradient(90deg, rgba(0, 240, 255, 0.3) 0%, rgba(0, 240, 255, 0.5) 100%) !important;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.5), 0 0 30px rgba(0, 240, 255, 0.2) !important;
  transform: translateY(-3px) !important;
}

.el-message-box.cyber-message-box .cyber-confirm-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.4), transparent);
  transition: all 0.6s ease;
}

.el-message-box.cyber-message-box .cyber-confirm-button:hover::before {
  left: 100%;
}

.el-message-box.cyber-message-box .cyber-cancel-button {
  background: rgba(16, 26, 60, 0.3) !important;
  border: 1px solid rgba(125, 95, 255, 0.6) !important;
  color: #7d5fff !important;
  font-weight: 500 !important;
  border-radius: 6px !important;
  padding: 10px 25px !important;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 14px !important;
  position: relative;
}

.el-message-box.cyber-message-box .cyber-cancel-button:hover {
  background: rgba(125, 95, 255, 0.2) !important;
  box-shadow: 0 0 15px rgba(125, 95, 255, 0.4), 0 0 30px rgba(125, 95, 255, 0.1) !important;
  transform: translateY(-3px) !important;
  color: #b388ff !important;
}

.el-message-box.cyber-message-box .cyber-cancel-button::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: #7d5fff;
  transition: width 0.4s ease;
}

.el-message-box.cyber-message-box .cyber-cancel-button:hover::after {
  width: 100%;
}

.el-message-box.cyber-message-box .el-message-box__headerbtn {
  color: rgba(0, 240, 255, 0.7) !important;
  transition: all 0.3s ease !important;
  top: 15px !important;
  right: 15px !important;
}

.el-message-box.cyber-message-box .el-message-box__headerbtn:hover {
  color: #7d5fff !important;
  transform: rotate(90deg) scale(1.2);
}

.el-message-box.cyber-message-box .el-message-box__headerbtn .el-message-box__close {
  font-size: 20px !important;
}

/* 按钮加载状态 */
.el-message-box.cyber-message-box .el-button.is-loading .el-icon {
  animation: dataFlow 1.5s linear infinite;
}

@keyframes boxEntrance {
  0% {
    opacity: 0;
    transform: perspective(500px) rotateX(30deg) translateY(50px);
  }
  100% {
    opacity: 1;
    transform: perspective(500px) rotateX(5deg) translateY(0);
  }
}

@keyframes scanline {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes dataFlow {
  0% {
    transform: translateX(-20px) rotate(0deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(20px) rotate(360deg);
    opacity: 0;
  }
}
</style>