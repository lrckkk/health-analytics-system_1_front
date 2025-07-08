import { createApp } from 'vue'
import router from './router.js' // 确保路径正确
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia';
import 'element-plus/dist/index.css'
import App from './App.vue' // 根组件
import '@/styles/element-override.scss'
import { ElMessage } from 'element-plus'
// 配置全局消息默认参数
ElMessage.install = (app) => {
    app.config.globalProperties.$message = function(options) {
        return ElMessage({
            customClass: 'tech-message',
            duration: 3000,
            offset: 40,
            ...options
        })
    }
}
const pinia = createPinia();

const app = createApp(App)

// 使用插件
app.use(ElementPlus)
app.use(pinia);
app.use(router)


// 挂载到 #app
app.mount('#app')
