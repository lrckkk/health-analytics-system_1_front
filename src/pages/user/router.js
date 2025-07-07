import { createRouter, createWebHistory } from 'vue-router'
import Show from '../home/show.vue'
import LoginPage from '/src/components/Login.vue';
import Province from "@/pages/user/Province.vue";
import RegisterPage from "@/components/Register.vue";
import Card from "@/pages/card/CardContainer.vue";
import Scroll from "./scroll.vue"

import ManagementPage from "@/pages/management/ManagementPage.vue";

import Text from "../../components/test.vue"



// 您的路由定义
const routes = [
    // 您的路由配置
    {
        path: '/',
        redirect: '/province',
        meta: { requiresAuth: true } // 必须加这一行，否则守卫不会拦截
    },
    {
        name: 'Home',
        path: '/home',
        component: Show,
        meta: { requiresAuth: true } // 必须加这一行
    },
    {
        path: '/province',
        name: 'province',
        component: Province,
        meta: { requiresAuth: true } // 必须加这一行
    },
    {
        name: 'Login',
        path: '/login',
        component: LoginPage,

    },
    {
        name: 'Register',
        path: '/register',
        component: RegisterPage,

    },
    {
        name: 'Card',
        path: '/card',
        component: Card,
        meta: { requiresAuth: true } // 必须加这一行
    },
    {
        name:'Scroll',
        path: '/scroll',

        component: Scroll
    },
    {
        path: '/manage',
        name: 'ManagementPage',
        component: ManagementPage
    },

        component: Scroll,
        meta: { requiresAuth: true } // 必须加这一行
    },
    {
        name:'Text',
        path: '/text',
        component: Text
    }


]

// 创建路由器实例
const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    console.log('[路由守卫] to:', to.name, 'from:', from.name)

    // 严格判断token
    const token = localStorage.getItem('jwt_token')
    const hasValidToken = token && token !== 'null' && token !== 'undefined'
    console.log('Token有效性:', hasValidToken)

    // 调试路由匹配信息
    console.log('路由匹配链:', to.matched.map(r => r.path))
    console.log('requiresAuth状态:', to.matched.map(r => r.meta.requiresAuth))

    // 1. 已登录时访问登录/注册页 → 跳首页
    if ((to.name === 'Login' || to.name === 'Register') && hasValidToken) {
        console.log('已登录禁止访问认证页')
        return next({ name: 'province' })
    }

    // 2. 未登录访问需要认证的页面 → 跳登录页
    if (to.matched.some(record => record.meta.requiresAuth) && !hasValidToken) {
        console.log('未登录禁止访问受保护路由')
        return next({
            name: 'Login',
            query: { redirect: to.fullPath } // 保存目标路径用于登录后跳转
        })
    }

    // 3. 其他情况放行
    next()
})



// 解决方案1：添加默认导出
export default router

// 或者解决方案2：使用命名导出
// export { router }