import { createApp } from 'vue'
import router from './router.js' // 确保路径正确
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia';
import 'element-plus/dist/index.css'
import App from './App.vue' // 根组件
const pinia = createPinia();

const app = createApp(App)

// 使用插件
app.use(ElementPlus)
app.use(pinia);
app.use(router)


// 挂载到 #app
app.mount('#app')
