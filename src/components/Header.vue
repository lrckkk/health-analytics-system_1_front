<!--<template>-->
<!--  <div id="china-map" style="width: 100%; height: 100%;"></div>-->
<!--</template>-->

<!--<script>-->
<!--import { onMounted } from 'vue'-->
<!--import L from 'leaflet'-->
<!--import 'leaflet/dist/leaflet.css'-->

<!--export default {-->
<!--  name: 'ChinaMap',-->
<!--  setup() {-->
<!--    onMounted(() => {-->
<!--      // 初始化地图-->
<!--      const map = L.map('china-map', {-->
<!--        zoomControl: true,-->
<!--        attributionControl: false-->
<!--      }).setView([35, 105], 4);-->

<!--      // 添加缩放控件-->
<!--      L.control.zoom({-->
<!--        position: 'topright'-->
<!--      }).addTo(map);-->

<!--      // 添加比例尺-->
<!--      L.control.scale({-->
<!--        position: 'bottomright',-->
<!--        imperial: false-->
<!--      }).addTo(map);-->

<!--      // 加载GeoJSON数据-->
<!--      fetch('/new-china.geojson')-->
<!--          .then(res => res.json())-->
<!--          .then(geojson => {-->
<!--            // 只绘制边界线，不填充颜色-->
<!--            L.geoJSON(geojson, {-->
<!--              style: {-->
<!--                color: '#aaa',-->
<!--                weight: 1,-->
<!--                fillColor: 'transparent',-->
<!--                fillOpacity: 0-->
<!--              },-->
<!--              onEachFeature: (feature, layer) => {-->
<!--                const name = feature.properties.name || '未命名地区';-->

<!--                // 鼠标悬停效果-->
<!--                layer.on('mouseover', () => {-->
<!--                  layer.setStyle({ weight: 2 });-->
<!--                  layer.bindTooltip(name, {-->
<!--                    direction: 'top',-->
<!--                    permanent: false,-->
<!--                    className: 'map-tooltip'-->
<!--                  }).openTooltip();-->
<!--                });-->

<!--                layer.on('mouseout', () => {-->
<!--                  layer.setStyle({ weight: 1 });-->
<!--                  layer.closeTooltip();-->
<!--                });-->
<!--              }-->
<!--            }).addTo(map);-->

<!--            // 创建散点图-->
<!--            createScatterPoints(map);-->
<!--          })-->
<!--          .catch(error => {-->
<!--            console.error('加载GeoJSON失败:', error);-->
<!--          });-->

<!--      // 创建散点图-->
<!--      function createScatterPoints(map) {-->
<!--        // 主要城市数据-->
<!--        const cities = [-->
<!--          { name: '北京', lat: 39.9042, lng: 116.4074, value: 90 },-->
<!--          { name: '上海', lat: 31.2304, lng: 121.4737, value: 85 },-->
<!--          { name: '广州', lat: 23.1291, lng: 113.2644, value: 80 },-->
<!--          { name: '深圳', lat: 22.5431, lng: 114.0579, value: 80 },-->
<!--          { name: '成都', lat: 30.5728, lng: 104.0665, value: 75 },-->
<!--          { name: '武汉', lat: 30.5931, lng: 114.3055, value: 70 },-->
<!--          { name: '西安', lat: 34.3416, lng: 108.9398, value: 70 },-->
<!--          { name: '杭州', lat: 30.2741, lng: 120.1551, value: 75 },-->
<!--          { name: '南京', lat: 32.0603, lng: 118.7969, value: 70 },-->
<!--          { name: '重庆', lat: 29.5630, lng: 106.5516, value: 75 },-->
<!--          { name: '天津', lat: 39.0842, lng: 117.2010, value: 70 },-->
<!--          { name: '苏州', lat: 31.2989, lng: 120.5853, value: 75 },-->
<!--          { name: '郑州', lat: 34.7466, lng: 113.6253, value: 65 },-->
<!--          { name: '长沙', lat: 28.2282, lng: 112.9388, value: 65 },-->
<!--          { name: '沈阳', lat: 41.8057, lng: 123.4315, value: 60 },-->
<!--          { name: '青岛', lat: 36.0671, lng: 120.3826, value: 65 },-->
<!--          { name: '合肥', lat: 31.8206, lng: 117.2272, value: 60 },-->
<!--          { name: '福州', lat: 26.0745, lng: 119.2965, value: 60 },-->
<!--          { name: '厦门', lat: 24.4798, lng: 118.0894, value: 65 },-->
<!--          { name: '哈尔滨', lat: 45.8038, lng: 126.5350, value: 55 }-->
<!--        ];-->

<!--        // 创建散点-->
<!--        cities.forEach(city => {-->
<!--          // 根据值大小计算圆点半径-->
<!--          const radius = 3 + (city.value / 20);-->

<!--          // 创建圆点标记-->
<!--          const marker = L.circleMarker([city.lat, city.lng], {-->
<!--            radius: radius,-->
<!--            fillColor: '#1890ff',-->
<!--            color: '#fff',-->
<!--            weight: 1,-->
<!--            fillOpacity: 0.8-->
<!--          }).addTo(map);-->

<!--          // 添加鼠标悬停效果-->
<!--          marker.on('mouseover', () => {-->
<!--            marker.setStyle({-->
<!--              fillColor: '#ff4d4f',-->
<!--              weight: 2-->
<!--            });-->
<!--          });-->

<!--          marker.on('mouseout', () => {-->
<!--            marker.setStyle({-->
<!--              fillColor: '#1890ff',-->
<!--              weight: 1-->
<!--            });-->
<!--          });-->

<!--          // 添加点击事件-->
<!--          marker.on('click', () => {-->
<!--            L.popup()-->
<!--                .setLatLng([city.lat, city.lng])-->
<!--                .setContent(`-->
<!--                <div class="map-popup">-->
<!--                  <h3>${city.name}</h3>-->
<!--                  <p>指标值: ${city.value}</p>-->
<!--                </div>-->
<!--              `)-->
<!--                .openOn(map);-->
<!--          });-->

<!--          // 添加城市名称标签-->
<!--          L.marker([city.lat - 0.7, city.lng], {-->
<!--            icon: L.divIcon({-->
<!--              className: 'city-label',-->
<!--              html: `<div>${city.name}</div>`,-->
<!--              iconSize: [60, 20]-->
<!--            }),-->
<!--            zIndexOffset: -1000-->
<!--          }).addTo(map);-->
<!--        });-->
<!--      }-->
<!--    });-->
<!--  }-->
<!--}-->
<!--</script>-->

<!--<style>-->
<!--@import 'leaflet/dist/leaflet.css';-->

<!--#china-map {-->
<!--  background: #f8f9fa; /* 浅灰色背景 */-->
<!--  border-radius: 8px;-->
<!--  overflow: hidden;-->
<!--}-->

<!--/* 弹窗样式 */-->
<!--.map-popup {-->
<!--  font-family: Arial, sans-serif;-->
<!--  text-align: center;-->
<!--}-->
<!--.map-popup h3 {-->
<!--  margin: 0 0 5px 0;-->
<!--  color: #1890ff;-->
<!--  font-size: 16px;-->
<!--}-->
<!--.map-popup p {-->
<!--  margin: 0;-->
<!--  font-size: 14px;-->
<!--  color: #666;-->
<!--}-->

<!--/* 工具提示样式 */-->
<!--.map-tooltip {-->
<!--  background: rgba(255, 255, 255, 0.9);-->
<!--  border: 1px solid #ddd;-->
<!--  border-radius: 3px;-->
<!--  padding: 2px 8px;-->
<!--  font-size: 12px;-->
<!--  color: #333;-->
<!--}-->

<!--/* 城市标签样式 */-->
<!--.city-label div {-->
<!--  font-size: 11px;-->
<!--  color: #666;-->
<!--  text-align: center;-->
<!--  background: rgba(255, 255, 255, 0.7);-->
<!--  padding: 1px 4px;-->
<!--  border-radius: 3px;-->
<!--  white-space: nowrap;-->
<!--}-->
<!--</style>-->