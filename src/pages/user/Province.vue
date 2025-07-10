<template>
  <div class="page-container">
    <div class="top-bar">
      <div class="top-left">
        <Timer />
        <Role />
        <div class="profile-icon" @click="navigateToProfile">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="none" stroke="#00e0ff" stroke-width="2"/>
            <path d="M20.5901 22C20.5901 18.13 16.7402 15 12.0002 15C7.26015 15 3.41016 18.13 3.41016 22" fill="none" stroke="#00e0ff" stroke-width="2"/>
          </svg>
        </div>
      </div>
      <div class="top-center">
        <Title />
      </div>
      <div class="top-right">
        <Settings />
        <Exit />
        <el-button
            class="my-image-button futuristic-button"
            @click="navigateToMyRoute"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="button-icon">
            <path d="M12 3L12 21" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/>
            <path d="M21 12L3 12" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/>
            <path d="M18 6L6 18" stroke="#7d5fff" stroke-width="2" stroke-linecap="round"/>
            <path d="M18 18L6 6" stroke="#7d5fff" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </el-button>
      </div>
    </div>

    <!-- ChinaMap 容器 -->
    <div class="bottom-align" v-if="!mapDataStore.isLoading && !mapDataStore.error">
      <ChinaMap
          @region-clicked="handleRegionClick"
          :provinceData="mapDataStore.provinceData"
          :scatterData="mapDataStore.scatterData"
          :pieSeriesData="mapDataStore.pieSeriesData"
      />
    </div>

    <div class="card-display-area">
      <card :componentsList="myCustomComponents1"></card>
    </div>
    <TechEdgeButton position="right1" target-route="/analyseforins"/>

    <div class="card-display-area2">
      <card :componentsList="myCustomComponents2" ></card>
    </div>
    <TechEdgeButton position="right2"  target-route="/annalyseforbed"/>

    <div class="card-display-area3">
      <card :componentsList="myCustomComponents3" ></card>
    </div>
    <TechEdgeButton position="right3"  target-route="/analyseforcost"/>

    <div class="card-display-area4">
      <card :componentsList="myCustomComponents4"></card>
    </div>
    <TechEdgeButton position="left1"  target-route="/analyseforper"/>

    <div class="card-display-area5">
      <card :componentsList="myCustomComponents5"></card>
    </div>
    <TechEdgeButton position="left2"  target-route="/analyseforpop"/>

    <div class="card-display-area6">
      <card :componentsList="myCustomComponents6"></card>
    </div>
    <TechEdgeButton position="left3"  target-route="/analyseforser"/>
    <div class="scroll-display-area">
      <scroll></scroll>
    </div>
    <InteractiveButtonContainer
        :buttonsRow1="myCustomButtonsRow1"
        :buttonsRow2="myCustomButtonsRow2"
        @button-clicked="handleChildButtonClick"
    />
    <div v-if="mapDataStore.isLoading" class="loading-overlay tech-loading">
      <div class="loading-spinner"></div>
      <p>数据加载中，请稍候...</p>
    </div>
    <div v-if="mapDataStore.error" class="error-message tech-error">
      <p>加载数据失败：{{ mapDataStore.error }}</p>
      <el-button type="primary" size="small" @click="mapDataStore.fetchMapData()">重试</el-button>
    </div>
  </div>
</template>

<script>
import ChinaMap from '../../components/Map.vue';
import Timer from '../../components/Timer.vue';
import Title from '../../components/Title.vue';
import { ref, onMounted } from 'vue';
import { useMapDataStore } from '@/stores/TotalData.js';
import {useRegionStore} from '@/stores/RegionData.js';
import {ElMessage} from "element-plus";
import card from '../card/CardContainer.vue';
import InteractiveButtonContainer from '@/components/ButtonContainer.vue';
import scroll from './scroll.vue';
import Settings from "@/components/Settings.vue";
import Role from '../../components/Role.vue';
import Exit from '../../components/Exit.vue';
import MyComponentA from '../card/MyComponentA.vue';
import MyComponentB from '../card/MyComponentB.vue';
import MyComponentC from '../card/MyComponentC.vue';
import MyComponentD from '../card/MyComponentD.vue';
import ServiceforML from "@/pages/card/ServiceforML.vue";
import PopulationLine from "@/pages/card/PopulationLine.vue";
import RankforPop from "@/pages/card/RankforPop.vue";
import RankforCos from "@/pages/card/RankforCos.vue";
import Rankforbed from "@/pages/card/Rankforbed.vue";
import request from "@/utils/request.js";
import TechEdgeButton from '../card/TechEdgeButton.vue';
import router from "@/pages/user/router.js";
import SLforbedavg from "@/pages/card/SLforbedavg.vue";
import SLforcostavg from "@/pages/card/SLforcostavg.vue";
import SLforinoavg from "@/pages/card/SLforinoavg.vue";
import SLforInsavg from "@/pages/card/SLforInsavg.vue";
import SLforoutavg from "@/pages/card/SLforoutavg.vue";
import SLforperavg from "@/pages/card/SLforperavg.vue";

export default {
  components: {
    Settings,
    Timer,
    Title,
    ChinaMap,
    card,
    scroll,
    TechEdgeButton,
    Role,
    Exit,
    InteractiveButtonContainer,
  },
  setup() {
    const myCustomComponents1 = ref([
      MyComponentA,
      SLforInsavg,
    ]);

    const newsData = ref([])
    const mapDataStore = useMapDataStore();
    const regionStore = useRegionStore();

    const handleRegionClick = (regionName) => {
      regionStore.setSelectedRegion(regionName)
      if (regionStore.selectedRegionId !== 0) {
        ElMessage({
          message: `你点击了：${regionStore.getDisplayRegion} (ID: ${regionStore.getRegionId})`,
          type: 'info',
          duration: 2000,
          customClass: 'tech-message'
        });
      } else {
        ElMessage({
          message: `取消选择：${regionName} (当前全国视图, ID: ${regionStore.getRegionId})`,
          type: 'info',
          duration: 2000,
          customClass: 'tech-message'
        });
      }
    };

    const navigateToMyRoute = () => {
      router.push({
        name: 'Text'
      });
    };

    const navigateToProfile = () => {
      router.push({
        name: 'Profile'
      });
    };

    const handleChildButtonClick = (event) => {
      console.log(`按钮点击事件：行 ID ${event.id}`);
      mapDataStore.fetchsatterdata(event.id);
    };

    const myCustomButtonsRow1 = ref([
      { id: 'populationData', label: '人口' },
      { id: 'institutionData', label: '医疗机构' },
      { id: 'personnelData', label: '医疗人员' },
      { id: 'bedData', label: '床位总数' },
      { id: 'outpatientVisitsData', label: '就诊人数' },
      { id:'totalCostData',label:'医疗费用'},
    ]);

    const myCustomButtonsRow2 = ref([
      { id: 'wea', label: '天气' },
      { id: 'male', label: '性别' },
      { id: 'pop', label: '人口组成' },
      { id: 'per', label: '医疗人员' },
    ]);

    const myCustomComponents2 = ref([
      MyComponentB,
      Rankforbed,
      SLforbedavg,
    ]);
    const myCustomComponents3 = ref([
      MyComponentC,
      RankforCos,
      SLforcostavg,
    ]);
    const myCustomComponents4 = ref([
      MyComponentD,
      SLforperavg,
    ]);
    const myCustomComponents5 = ref([
      PopulationLine,
      RankforPop,
    ]);
    const myCustomComponents6 = ref([
      ServiceforML,
      SLforinoavg,
      SLforoutavg
    ]);

    onMounted(() => {
      mapDataStore.fetchcountryData()
      if (mapDataStore.provinceData.length === 0 && !mapDataStore.isLoading) {
        mapDataStore.fetchMapData();
      }
    });

    return {
      handleRegionClick,
      handleChildButtonClick,
      mapDataStore,
      navigateToMyRoute,
      navigateToProfile,
      myCustomButtonsRow1,
      myCustomButtonsRow2,
      myCustomComponents1: myCustomComponents1,
      myCustomComponents2: myCustomComponents2,
      myCustomComponents3: myCustomComponents3,
      myCustomComponents4: myCustomComponents4,
      myCustomComponents5: myCustomComponents5,
      myCustomComponents6: myCustomComponents6,
    };
  },
};
</script>

<style>
.my-image-button.futuristic-button {
  padding: 0;
  border: none !important;
  background: transparent !important;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  overflow: visible;
  box-shadow: none !important;
}
.my-image-button.futuristic-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  border: 1px solid rgba(0, 240, 255, 0.3);
  transition: all 0.4s ease;
  z-index: 1;
}

.my-image-button.futuristic-button:hover::before {
  border-color: rgba(0, 240, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.5);
  transform: scale(1.1);
}

.my-image-button.futuristic-button::after {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: rgba(125, 95, 255, 0.5);
  border-bottom-color: rgba(125, 95, 255, 0.5);
  animation: rotateBorder 3s linear infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.my-image-button.futuristic-button:hover::after {
  opacity: 1;
}

.button-icon {
  width: 22px;
  height: 22px;
  transition: all 0.4s ease;
  filter: drop-shadow(0 0 4px rgba(0, 240, 255, 0.5));
  position: relative;
  z-index: 2;
}

.my-image-button.futuristic-button:hover .button-icon {
  transform: rotate(90deg);
  filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.8));
  animation: pulseGlow 1.5s infinite alternate;
}

@keyframes rotateBorder {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulseGlow {
  0% {
    filter: drop-shadow(0 0 4px rgba(0, 240, 255, 0.5));
  }
  100% {
    filter: drop-shadow(0 0 12px rgba(125, 95, 255, 0.8));
  }
}
body {
  margin: 0 !important;
  padding: 0;
  font-family: 'Inter', sans-serif, 'Microsoft YaHei', 'PingFang SC';
  background: linear-gradient(135deg, #0a192f 0%, #000a1a 100%);
  color: #e0f2f7;
  min-height: 100vh;
  overflow-x: hidden;
}

.page-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.top-bar {
  position: relative;
  width: 100%;
  height: 80px;
}

.top-left {
  position: absolute;
  top: 10px;
  left: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 15px;
}

.profile-icon {
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 150, 255, 0.1);
  border-radius: 50%;
  border: 1px solid rgba(74, 207, 255, 0.3);
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.2);
  animation: pulse 3s infinite;
}

.profile-icon:hover {
  background: rgba(0, 150, 255, 0.2);
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(74, 207, 255, 0.4);
}

.profile-icon svg {
  width: 24px;
  height: 24px;
}

@keyframes pulse {
  0% { box-shadow: 0 0 5px rgba(74, 207, 255, 0.4); }
  50% { box-shadow: 0 0 15px rgba(74, 207, 255, 0.8); }
  100% { box-shadow: 0 0 5px rgba(74, 207, 255, 0.4); }
}

.top-center {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.top-right {
  position: absolute;
  top: 10px;
  right: 20px;
  z-index: 10;
}

.bottom-align {
  position: fixed;
  top: 7%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  width: 38%;
  height: 52%;
  padding: 1px;
  border-radius: 1px;
  border: 2px solid transparent;
  background-origin: border-box;
  background-clip: padding-box, border-box;
  overflow: hidden;
}

.card-display-area {
  position: fixed;
  top: 7%;
  left: 1%;
  width: 20%;
  height: 20%;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(3, 4, 94, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);
  border: 3px solid rgba(74, 207, 255, 0.2);
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.4), 0 0 20px rgba(74, 207, 255, 0.2), inset 0 0 10px rgba(74, 207, 255, 0.3);
  border-radius: 8px;
}

.card-display-area2 {
  position: fixed;
  top: 30%;
  left: 1%;
  width: 20%;
  height: 20%;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(3, 4, 94, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);
  border: 3px solid rgba(74, 207, 255, 0.2);
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.4), 0 0 20px rgba(74, 207, 255, 0.2), inset 0 0 10px rgba(74, 207, 255, 0.3);
  border-radius: 8px;
}

.card-display-area3 {
  position: fixed;
  top: 53%;
  left: 1%;
  width: 20%;
  height: 20%;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(3, 4, 94, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);
  border: 3px solid rgba(74, 207, 255, 0.2);
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.4), 0 0 20px rgba(74, 207, 255, 0.2), inset 0 0 10px rgba(74, 207, 255, 0.3);
  border-radius: 8px;
}

.Dataget-display-area {
  position: fixed;
  top: 70%;
  left: 1%;
  width: 30%;
  height: 30%;
}

.card-display-area4 {
  position: fixed;
  top: 7%;
  left: 77%;
  width: 20%;
  height: 20%;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(3, 4, 94, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);
  border: 3px solid rgba(74, 207, 255, 0.2);
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.4), 0 0 20px rgba(74, 207, 255, 0.2), inset 0 0 10px rgba(74, 207, 255, 0.3);
  border-radius: 8px;
}

.card-display-area5 {
  position: fixed;
  top: 30%;
  left: 77%;
  width: 20%;
  height: 20%;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(3, 4, 94, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);
  border: 3px solid rgba(74, 207, 255, 0.2);
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.4), 0 0 20px rgba(74, 207, 255, 0.2), inset 0 0 10px rgba(74, 207, 255, 0.3);
  border-radius: 8px;
}

.card-display-area6 {
  position: fixed;
  top: 53%;
  left: 77%;
  width: 20%;
  height: 20%;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(3, 4, 94, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);
  border: 3px solid rgba(74, 207, 255, 0.2);
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.4), 0 0 20px rgba(74, 207, 255, 0.2), inset 0 0 10px rgba(74, 207, 255, 0.3);
  border-radius: 8px;
}

.scroll-display-area {
  position: absolute;
  left: 31%;
  top: 70%;
  width: 40%;
}

.loading-overlay, .error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 20px 30px;
  border-radius: 10px;
  font-size: 1.2em;
  z-index: 1000;
  text-align: center;
}

.error-message {
  background-color: rgba(255, 0, 0, 0.7);
}

.selected-region-display {
  margin-top: 550px;
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 150, 255, 0.5);
  border-radius: 5px;
  color: #00e0ff;
  font-size: 1.1em;
  font-weight: 500;
  text-shadow: 0 0 5px rgba(0, 180, 255, 0.5);
  align-self: center;
  z-index: 5;
}

.page-header{
  height: 7%;
}

.loading-overlay.tech-loading, .error-message.tech-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.9);
  color: #00e0ff;
  font-size: 1.5em;
  z-index: 2000;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.loading-spinner {
  border: 6px solid rgba(0, 150, 255, 0.3);
  border-top: 6px solid #00e0ff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message.tech-error {
  background-color: rgba(139, 0, 0, 0.85);
  border: 1px solid rgba(255, 0, 0, 0.7);
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
  color: #ffcccc;
}

.error-message.tech-error .el-button {
  margin-top: 15px;
  background-color: #007bff;
  border-color: #007bff;
  color: white;
  transition: background-color 0.3s ease;
}

.error-message.tech-error .el-button:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.el-message.tech-message {
  background-color: rgba(26, 42, 58, 0.9);
  border: 1px solid rgba(0, 150, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 150, 255, 0.3);
  color: #e0f2f7;
}

.el-message.tech-message .el-message__content {
  color: inherit;
}

.el-message.tech-message.el-message--info {
  background-color: rgba(26, 42, 58, 0.9);
}

.el-message.tech-message.el-message--success {
  background-color: rgba(26, 42, 58, 0.9);
}


</style>