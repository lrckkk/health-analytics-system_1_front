<template>
  <div id="china-map" style="width: 100%; height: 450%; background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);"></div>
</template>

<script>
import { onMounted } from 'vue'
import * as echarts from 'echarts'


export default {
  name: 'ChinaMap',
  emits: ['region-clicked'], // 声明自定义事件
  setup(props, { emit }) {
    onMounted(async () => {
      const response = await fetch('public/new-china.geojson') // 确保路径正确
      const chinaGeoJson = await response.json()

      const chartDom = document.getElementById('china-map')
      const myChart = echarts.init(chartDom, null, { renderer: 'canvas' }) // 使用canvas渲染，效果更细腻

      // 注册地图
      echarts.registerMap('china', chinaGeoJson)

      // 设置图表
      myChart.setOption({
        backgroundColor: 'transparent', // 背景透明，背景在外部容器控制
        tooltip: {
          trigger: 'item',
          formatter: '{b}',
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderRadius: 8,
          padding: [10, 15],
          textStyle: {
            color: '#fff',
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        visualMap: {
          show: false,
          min: 0,
          max: 100,
          inRange: {
            color: ['#00f0ff', '#00aaff', '#005577']
          }
        },
        series: [
          {
            type: 'map',
            map: 'china',
            roam: true,
            // 调整地图比例
            zoom:1.2,
            emphasis: {
              label: {
                show: true,
                color: '#fff',
                fontSize: 14,
                fontWeight: 'bold'
              },
              itemStyle: {
                areaColor: 'rgba(255,255,255,0.2)',
                borderColor: '#00f',
                borderWidth: 2,
                shadowColor: 'rgba(0, 255, 255, 0.5)',
                shadowBlur: 10
              }
            },
            itemStyle: {
              areaColor: 'linear-gradient(180deg, #0f2027, #203a43)', // 渐变色
              borderColor: '#000',
              borderWidth: 1,
              shadowColor: 'rgba(0, 255, 255, 0.3)',
              shadowBlur: 8
            },
            label: {
              show: true,
              color: '#000',
              fontSize: 12,
              fontWeight: 'bold'
            }
          }
        ]
      })
      myChart.on('click', function(params) {
        if (params.componentType === 'series') {
          const regionName = params.name

          // 触发自定义事件，将区域名传递出去
          emit('region-clicked', regionName)
        }
      })

      window.addEventListener('resize', () => {
        myChart.resize()
      })
    })
  }
}
</script>
