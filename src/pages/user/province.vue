<template>
  <div class="page-container">
    <router-view></router-view>
    <div>{{selectedRegion}}
    </div>
    <button @click="goToTargetPage">跳转页面</button>
    <!-- 其他内容 -->
    <div class="bottom-align" >
      <ChinaMap @region-clicked="handleRegionClick"/>
    </div>
  </div>

</template>

<script>
import ChinaMap from '../../components/map.vue'
import {ref} from "vue";
import router from "@/pages/user/router.js";


export default {
  components: { ChinaMap },
  setup(){
    const selectedRegion = ref(null)
    const handleRegionClick = (regionName) => {

      selectedRegion.value = regionName

      // 这里可以做其他操作，比如更新其他组件的数据
    }
    const goToTargetPage = () => {
      router.push({ name: 'Home' }) // 跳转到路由名为 'Home'
    }
    return {
      handleRegionClick,
      selectedRegion,
      goToTargetPage,
    }
  },
  methods:{

  }
}
</script>

<style>
.page-container {
  min-height: 100vh; /* 让容器占满整个视口 */
  display: flex;
  flex-direction: column;
}

/* 让包裹ChinaMap的div推到底部 */
.bottom-align {
  margin: 0 auto; /* 上下为0，左右自动 */
  margin-top: auto; /* 保持底部对齐 */
  display: flex;
  justify-content: center;
  width: 70%;

  /* 科技感边框 */
  padding: 1px;
  border-radius: 1px;
  border: 2px solid transparent;
  background-image:
      linear-gradient(45deg, #00ffff, #ff00ff, #00ffff),
      linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  background-repeat: no-repeat;
  background-color: rgba(15, 32, 39, 0.8);

  /* 发光效果 */
  box-shadow:
      0 0 10px #00ffff,
      0 0 20px #ff00ff,
      inset 0 0 3px rgba(0,255,255,0.5);

}
</style>
