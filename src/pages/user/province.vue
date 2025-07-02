<template>
  <div class="page-container">
    <router-view></router-view>
    <div>{{selectedRegion}}</div>
    <button @click="goToTargetPage">跳转页面</button>
    <div class="bottom-align">
      <ChinaMap
          @region-clicked="handleRegionClick"
          :provinceData="mapProvinceData"
          :scatterData="mapScatterData"
          :pieSeriesData="mapPieSeriesData"
      />
    </div>
  </div>
</template>

<script>
import ChinaMap from '../../components/map.vue';
import { ref } from 'vue';
import router from "@/pages/user/router.js";
// import heatmap from '../../components/heatmap.vue'; // 如果你不需要 heatmap，可以注释掉

export default {
  components: { ChinaMap /* , heatmap */ },
  setup() {
    const selectedRegion = ref(null);

    // 定义要传递给子组件的数据
    const mapProvinceData = ref([
      { name: '广东', value: 126 }, { name: '河南', value: 94 }, { name: '山东', value: 101 },
      { name: '江苏', value: 85 }, { name: '四川', value: 83 }, { name: '河北', value: 75 },
      { name: '湖南', value: 66 }, { name: '安徽', value: 63 }, { name: '浙江', value: 65 },
      { name: '湖北', value: 59 }, { name: '广西', value: 49 }, { name: '江西', value: 45 },
      { name: '云南', value: 48 }, { name: '陕西', value: 39 }, { name: '辽宁', value: 43 },
      { name: '吉林', value: 27 }, { name: '山西', value: 37 }, { name: '新疆', value: 25.8 },
      { name: '甘肃', value: 26 }, { name: '海南', value: 10 }, { name: '宁夏', value: 6 },
      { name: '青海', value: 6 }, { name: '西藏', value: 3.5 }, { name: '北京', value: 21.9 },
      { name: '上海', value: 24.9 }, { name: '天津', value: 13 }, { name: '香港', value: 7.5 },
      { name: '澳门', value: 0.7 }, { name: '台湾', value: 0 }, { name: '黑龙江', value: 18 },
      { name: '内蒙古', value: 23.96 },
    ]);

    const mapScatterData = ref([
      { name: '北京', value: [116.4074, 39.9042, 90] }, { name: '上海', value: [121.4737, 31.2304, 85] },
      { name: '广州', value: [113.2644, 23.1291, 80] }, { name: '成都', value: [104.0665, 30.5728, 75] },
      { name: '武汉', value: [114.3055, 30.5931, 70] }, { name: '西安', value: [108.9398, 34.3416, 70] },
      { name: '杭州', value: [120.1551, 30.2741, 75] }, { name: '南京', value: [118.7969, 32.0603, 70] },
      // ...其他散点数据
    ]);

    // 饼图数据也需要在父组件中准备
    const piePositions = {
      '广东': [113.2644, 23.1291], '北京': [116.4074, 39.9042], '上海': [121.4737, 31.2304],
      '江苏': [118.7969, 32.0603], '浙江': [120.1551, 30.2741], '四川': [104.0665, 30.5728],
      // ...其他坐标数据
    };

    const provincePieData = {
      '广东': [{ name: '工业', value: 60, color: '#FF6B6B' }, { name: '农业', value: 30, color: '#4ECDC4' }, { name: '服务业', value: 36, color: '#FFD166' }],
      '北京': [{ name: '工业', value: 20, color: '#FF6B6B' }, { name: '农业', value: 5, color: '#4ECDC4' }, { name: '服务业', value: 75, color: '#FFD166' }],
      '上海': [{ name: '工业', value: 45, color: '#FF6B6B' }, { name: '农业', value: 5, color: '#4ECDC4' }, { name: '服务业', value: 50, color: '#FFD166' }],
      '江苏': [{ name: '工业', value: 55, color: '#FF6B6B' }, { name: '农业', value: 20, color: '#4ECDC4' }, { name: '服务业', value: 35, color: '#FFD166' }],
      '浙江': [{ name: '工业', value: 48, color: '#FF6B6B' }, { name: '农业', value: 15, color: '#4ECDC4' }, { name: '服务业', value: 37, color: '#FFD166' }],
      '四川': [{ name: '工业', value: 40, color: '#FF6B6B' }, { name: '农业', value: 30, color: '#4ECDC4' }, { name: '服务业', value: 30, color: '#FFD166' }]
    };

    const mapPieSeriesData = ref(Object.keys(provincePieData).map(provinceName => ({
      name: provinceName,
      value: piePositions[provinceName],
      pieData: provincePieData[provinceName]
    })));

    const handleRegionClick = (regionName) => {
      selectedRegion.value = regionName;
      // 这里可以做其他操作，比如更新其他组件的数据
    };

    const goToTargetPage = () => {
      router.push({ name: 'Home' }); // 跳转到路由名为 'Home'
    };

    return {
      handleRegionClick,
      selectedRegion,
      goToTargetPage,
      mapProvinceData, // 暴露给模板
      mapScatterData,    // 暴露给模板
      mapPieSeriesData,  // 暴露给模板
    };
  },
  methods: {
    // 你的其他方法
  }
};
</script>

<style>
.page-container {
  min-height: 90vh; /* 让容器占满整个视口 */
  display: flex;
  flex-direction: column;
}
.bottom-align {
  position: fixed;       /* 固定在页面 */
  top: 10%;              /* 距离顶部10% */
  left: 50%;             /* 水平居中 */
  transform: translateX(-50%); /* 通过偏移实现完全居中 */
  display: flex;
  justify-content: center;
  width: 40%;
  height: 40%;
  padding: 1px;
  border-radius: 1px;
  border: 2px solid transparent;
  background-origin: border-box;
  background-clip: padding-box, border-box;
}
</style>