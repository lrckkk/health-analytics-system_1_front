<script setup>
import { Setting } from '@element-plus/icons-vue'
import { ref } from 'vue'

const emit = defineEmits(['select'])

const activeKey = ref('import')

const handleMenuSelect = (key) => {
  activeKey.value = key
  emit('select', key) // 通知父组件切换
}
</script>

<template>
  <nav class="sidebar">
    <div class="sidebar-title">
      <el-icon class="header-icon"><Setting /></el-icon>
      <span class="title-text">管理设置</span>
    </div>

    <el-menu
        class="menu"
        :default-openeds="['data']"
        :default-active="activeKey"
        @select="handleMenuSelect"
        background-color="transparent"
        text-color="#ffffff"
        active-text-color="#00d5ff"
    >
      <el-sub-menu index="data">
        <template #title>数据管理</template>
        <el-menu-item index="import">数据导入</el-menu-item>
        <el-menu-item index="export">数据查看与导出</el-menu-item>
        <el-menu-item index="tags">数据分类与标签</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="users">
        <template #title>人员管理</template>
        <el-menu-item index="users">信息管理</el-menu-item>
        <el-menu-item index="panel">数据面板管理</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="logs">
        <template #title>日志管理</template>
        <el-menu-item index="board">日志看板</el-menu-item>
        <el-menu-item index="details">日志详情</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </nav>
</template>

<style scoped>
.sidebar {
  width: 240px;
  padding: 30px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-right: 1px solid rgba(0, 213, 255, 0.2);
  box-sizing: border-box;
  user-select: none;
}
.sidebar-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 30px;
  user-select: none;
}
.title-text {
  margin-left: 8px;
}
.menu {
  border-right: none;
  background-color: transparent;
  font-size: 16px;
  user-select: none;
}
.header-icon {
  font-size: 24px;
  color: #00d5ff;
}
::v-deep(.el-menu-item:hover),
::v-deep(.el-sub-menu__title:hover) {
  background-color: rgba(0, 213, 255, 0.1);
}
</style>
