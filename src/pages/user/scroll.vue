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
  '【系统通知】患者数据更新成功，新增病例300例。',
  '【疫情播报】X省新增确诊病例1例，请做好防护。',
  '【设备告警】血液分析仪#007提示耗材即将用尽，请及时更换。',
  '【医疗资讯】AI辅助诊断技术在某医院成功应用，诊断准确率提升20%。',
  '【排班提醒】医生张三今日晚班，请提前做好准备。',
  '【重要公告】关于调整医疗服务收费标准的通知，详情请查阅内部系统。这是一条很长很长很长所以无法提供准确的腾讯股票价格预测。'
    ])
onMounted(() => {});
</script>