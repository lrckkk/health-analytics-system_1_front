<template>
  <div class="my-page">
    <div class="message-section">
      <MessageScroller :messages="myMessages" :scrollInterval="4.5" :scrollDuration="0.8" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MessageScroller from '@/components/news.vue'; // 根据你的实际路径调整

const myMessages = ref([
  "最新通知：<a href='https://www.bilibili.com/' target='_blank'>关于系统升级的公告</a>",
  "紧急提醒：<a href='https://example.com/alert/2' target='_blank'>账户安全更新</a>，请及时处理！",
  "活动预告：<a href='https://example.com/event/3' target='_blank'>夏季促销活动即将开始</a>",
  "平台公告：服务条款已更新，<a href='https://example.com/terms' target='_blank'>点击查看详情</a>。",
  "重要通知：<a href='https://example.com/maintain' target='_blank'>系统维护通知</a>，请注意！",
    ])
onMounted(() => {});
</script>