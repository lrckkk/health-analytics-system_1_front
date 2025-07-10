<template>
  <div class="container">
    <!-- 返回按钮 -->
    <div class="back-button" @click="navigateBack">
      <div class="back-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="back-text">返回</div>
      <div class="button-effects">
        <div class="effect-circle"></div>
        <div class="effect-particles"></div>
      </div>
    </div>

    <!-- 使用 Collapse 子组件 -->
    <div class="collapse-container">
      <Collapse title="人口分析" :initial-open="false">
        <Analyseforpop></Analyseforpop>
      </Collapse>

      <Collapse title="病床分析" :initial-open="false">
        <Annalyseforbed></Annalyseforbed>
      </Collapse>

      <Collapse title="医疗机构分析" :initial-open="false">
        <Analyseforins></Analyseforins>
      </Collapse>

      <Collapse title="医疗花费分析" :initial-open="false">
        <Analyseforcost></Analyseforcost>
      </Collapse>

      <Collapse title="医疗人员分析" :initial-open="false">
        <Analyseforper></Analyseforper>
      </Collapse>

      <Collapse title="健康服务分析" :initial-open="false">
        <Annalyseforser></Annalyseforser>
      </Collapse>

      <Collapse title="综合医疗分析" :initialOpen="true">
        <test></test>
      </Collapse>
    </div>

    <div class="decision-button-container">
      <button class="decision-button" @click="trybu">
        <span class="button-text">综合决策分析</span>
        <span class="button-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 14L12 21L5 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 10L12 3L5 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <div class="button-hover-effect"></div>
        <div class="button-pulse"></div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import Collapse from './Collapse.vue'; // 导入子组件
import Analyseforcost from "@/components/Analyseforcost.vue";
import Analyseforins from "@/components/Analyseforins.vue";
import Analyseforper from "@/components/Analyseforper.vue";
import Analyseforpop from "@/components/Analyseforpop.vue";
import Annalyseforbed from "@/components/Annalyseforbed.vue";
import Annalyseforser from "@/components/Annalyseforser.vue";
import test from "@/components/test.vue";
import router from "@/pages/user/router.js";
import { useAnalysisDataStore } from '@/stores/AnalysisData.js';
import { useRegionStore } from '@/stores/RegionData.js';
import { useDecisionStore } from '@/stores/useDecisionStore';

const analysisStore = useAnalysisDataStore();
const decisionStore = useDecisionStore();
const regionStore = useRegionStore();

const navigateBack = () => {
  router.push('/province');
};

const trybu = async() => {
  const currentRegionId = regionStore.getRegionId;
  try {
    await decisionStore.fetchInitialData(currentRegionId);
    console.log("[test4.vue] 决策模拟器数据预加载完毕。");
    router.push({
      name: 'Decideforp'
    });
  } catch (error) {
    console.error("[test4.vue] 预加载决策模拟器数据失败：", error);
    alert("无法进入决策模拟器，数据加载出现问题。");
  }
};

watch(
    () => [analysisStore.growthRates, analysisStore.rankInfos],
    () => {
      analysisStore.updateFullAnalysisMatrix();
    },
    { deep: true, immediate: true }
);
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #0a192f 0%, #000a1a 100%);
  color: #e0f2f7;
  font-family: 'Inter', sans-serif, 'Microsoft YaHei', 'PingFang SC';
  position: relative;
  display: flex;
  flex-direction: column;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  padding: 8px 15px 8px 10px;
  background: rgba(3, 4, 94, 0.5);
  border: 1px solid rgba(74, 207, 255, 0.3);
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  z-index: 10;
  box-shadow: 0 0 10px rgba(74, 207, 255, 0.1);
}

.back-button:hover {
  background: rgba(3, 4, 94, 0.8);
  border-color: rgba(74, 207, 255, 0.6);
  box-shadow: 0 0 20px rgba(74, 207, 255, 0.3);
  transform: translateY(-2px);
}

.back-button:hover .back-icon {
  transform: translateX(-3px);
}

.back-button:hover .back-text {
  text-shadow: 0 0 8px rgba(0, 224, 255, 0.7);
}

.back-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  color: #00e0ff;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon svg {
  width: 100%;
  height: 100%;
}

.back-text {
  color: #00e0ff;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.button-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  border-radius: 30px;
}

.effect-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: rgba(0, 224, 255, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.6s ease-out;
}

.back-button:hover .effect-circle {
  transform: translate(-50%, -50%) scale(15);
  opacity: 0;
}

.effect-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle, rgba(0, 224, 255, 0.8) 1px, transparent 1px);
  background-size: 10px 10px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.back-button:hover .effect-particles {
  opacity: 0.3;
  animation: particlesMove 2s linear infinite;
}

@keyframes particlesMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 20px 20px;
  }
}

.collapse-container {
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.decision-button-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 30px;
  padding: 20px;
  position: relative;
}

.decision-button {
  position: relative;
  padding: 16px 40px;
  background: linear-gradient(90deg, rgba(0, 224, 255, 0.8) 0%, rgba(125, 95, 255, 0.8) 100%);
  border: none;
  border-radius: 50px;
  color: #0a192f;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 224, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 240px;
  z-index: 1;
}

.decision-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 30px rgba(0, 224, 255, 0.7);
}

.decision-button:hover .button-icon {
  transform: translateY(5px);
}

.decision-button:hover .button-hover-effect {
  opacity: 1;
  animation: shine 1.5s infinite;
}

.button-text {
  position: relative;
  z-index: 2;
  margin-right: 12px;
  letter-spacing: 1px;
}

.button-icon {
  width: 22px;
  height: 22px;
  color: #0a192f;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.button-icon svg {
  width: 100%;
  height: 100%;
}

.button-hover-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  opacity: 0;
  transition: all 0.3s;
  z-index: 1;
}

.button-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50px;
  border: 2px solid rgba(0, 224, 255, 0.5);
  animation: pulse 2s infinite;
  opacity: 0;
  z-index: 0;
}

.decision-button:hover .button-pulse {
  opacity: 1;
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  70% {
    transform: scale(1.1);
    opacity: 0.2;
  }
  100% {
    transform: scale(0.95);
    opacity: 0;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .collapse-container {
    margin-top: 80px;
  }

  .decision-button {
    padding: 14px 30px;
    font-size: 16px;
    min-width: 200px;
  }

  .back-button {
    top: 15px;
    left: 15px;
  }
}
</style>