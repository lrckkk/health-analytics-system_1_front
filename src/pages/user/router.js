import { createRouter, createWebHistory } from 'vue-router'
import Show from '../home/show.vue'
import LoginPage from '/src/components/Login.vue';
import Province from "@/pages/user/Province.vue";
import Card from "@/pages/card/CardContainer.vue";
import Scroll from "./scroll.vue"


// 您的路由定义
const routes = [
    // 您的路由配置
    {
        path: '/',
        redirect: '/province',
    },
    {
        name: 'Home',
        path: '/home',
        component: Show
    },
    {
        path: '/province',
        name: 'province',
        component: Province
    },
    {
        name: 'Login',
        path: '/login',
        component: LoginPage
    },
    {
        name: 'Card',
        path: '/card',
        component: Card
    },
    {
        name:'Scroll',
        path: '/scroll',
        component: Scroll
    }


]

// 创建路由器实例
const router = createRouter({
    history: createWebHistory(),
    routes
})

// 解决方案1：添加默认导出
export default router

// 或者解决方案2：使用命名导出
// export { router }