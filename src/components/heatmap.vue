<template>
  <div id="map-container" style="width: 100%; height: 600px;"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import * as echarts from 'echarts'

onMounted(async () => {
  // 确保 DOM 元素存在
  const dom = document.getElementById('map-container')
  if (!dom) {
    console.error('Map container not found')
    return
  }
  const myChart = echarts.init(dom)

  try {
    // 1. 加载 GeoJSON 文件（确保此文件放在项目的 public 文件夹下）
    //    生产环境中请确保路径正确
    const geoJson = await fetch('/new-china.geojson').then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok.')
      }
      return res.json()
    })

    // 2. 注册自定义地图
    echarts.registerMap('china_custom', geoJson)

    // 3. 配置地图和系列
    const option = {
      geo: {
        map: 'china_custom', // 使用已注册的自定义地图
        roam: true, // 开启鼠标缩放和漫游
        label: {
          show: false // 不显示省份标签
        },
        itemStyle: {
          borderColor: '#111',
          borderWidth: 1,
          areaColor: '#eee'
        },
        emphasis: { // 高亮状态下的样式
          itemStyle: {
            areaColor: '#ddd'
          },
          label: {
            show: true,
            color: '#000'
          }
        }
      },
      series: [

      ]
    }

    myChart.setOption(option)

    // 监听窗口大小变化，自适应调整图表尺寸
    window.addEventListener('resize', () => {
      myChart.resize()
    })

  } catch (error) {
    console.error('Failed to load or render the map:', error)
  }
})
</script>