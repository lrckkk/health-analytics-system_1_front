<template>
  <div>
    <CardSwitcher
        :components="componentsList"
        :swipeThreshold="80"
        :rotationFactor="0.2"
        :stackDepthFactor="0.05"
        :stackOffsetFactor="15"
    />
  </div>
</template>

<script setup>
import CardSwitcher from './CardSwitcher.vue'; // 确保路径正确

// 导入你的子组件，可以根据需要创建更多
import MyComponentA from './MyComponentA.vue';
import MyComponentB from './MyComponentB.vue';
import MyComponentC from './MyComponentC.vue';
import MyComponentD from './MyComponentD.vue';


// 定义要传入 CardSwitcher 的组件数组
const props = defineProps({
  componentsList: {
    type: Array,
    required: false, // 可以设置为 false，如果希望在没有传入时使用默认值
    default: () => [ // 提供一个默认值，以防外部没有传入
      MyComponentA,
      MyComponentB,
      MyComponentC,
      MyComponentD,
    ],
  },
});

</script>

<style>
#app-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 30px;
  background-color: #f4f7f6;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}
h1 {
  color: #34495e;
  margin-bottom: 30px;
}
</style>