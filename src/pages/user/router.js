import { createRouter, createWebHistory } from 'vue-router'
import Show from '../home/show.vue'
import LoginPage from '/src/components/Login.vue';
import Province from "@/pages/user/Province.vue";
import RegisterPage from "@/components/Register.vue";
import Card from "@/pages/card/CardContainer.vue";
import Scroll from "./scroll.vue"

import ManagementPage from "@/pages/management/ManagementPage.vue";

import Text from "../../components/test4.vue"
import Profile from './Profile.vue';
import Analyseforins from "@/components/Analyseforins.vue";
import Analyseforcost from "@/components/Analyseforcost.vue";
import Analyseforper from "@/components/Analyseforper.vue";
import Annalyseforbed from "@/components/Annalyseforbed.vue";
import Annalyseforser from "@/components/Annalyseforser.vue";
import Analyseforpop from "@/components/Analyseforpop.vue";



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

        component: Scroll,
        meta: { requiresAuth: true } // 必须加这一行
    },
    {
        path: '/manage',
        name: 'ManagementPage',
        component: ManagementPage,
        meta: { requiresAuth: true } // 必须加这一行
    },


    {
        name:'Text',
        path: '/text',
        component: Text,
        meta: { requiresAuth: true } // 必须加这一行
    },
    {
        name: 'Profile',
        path: '/profile',
        component: Profile,
        meta: { requiresAuth: true }
    },
    {
        name: 'Analyseforins',
        path: '/analyseforins',
        component: Analyseforins
    },
    {
        name: 'Analyseforcost',
        path: '/analyseforcost',
        component: Analyseforcost,
    },
    {
        name: 'Analyseforser',
        path: '/analyseforser',
        component: Annalyseforser
    },
    {
        name: 'Analyseforper',
        path: '/analyseforper',
        component: Analyseforper
    },
    {
        name: 'AnalyseforPop',
        path: '/analyseforpop',
        component: Analyseforpop
    },
    {
        name: 'Annalyseforbed',
        path: '/annalyseforbed',
        component: Annalyseforbed
    }


]

// 创建路由器实例
const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    console.log('[路由守卫] to:', to.name, 'from:', from.name);

    // 更严格的token验证
    const token = localStorage.getItem('jwt_token');
    const hasValidToken = token && token !== 'null' && token !== 'undefined' && token.length > 30;
    console.log('Token有效性:', hasValidToken, 'Token长度:', token?.length);

    // 1. 已登录时访问登录/注册页 → 跳首页
    if ((to.name === 'Login' || to.name === 'Register') && hasValidToken) {
        console.log('已登录禁止访问认证页，当前token:', token);
        return next({ name: 'province' });
    }

    // 2. 未登录访问需要认证的页面 → 跳登录页
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!hasValidToken) {
            console.log('未登录禁止访问受保护路由');
            return next({
                name: 'Login',
                query: { redirect: to.fullPath }
            });
        }

        // 额外检查令牌是否有效（可选）
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();
            if (isExpired) {
                console.log('令牌已过期');
                localStorage.removeItem('jwt_token');
                return next({
                    name: 'Login',
                    query: { redirect: to.fullPath, expired: '1' }
                });
            }
        } catch (e) {
            console.log('令牌解析失败:', e);
            localStorage.removeItem('jwt_token');
            return next({ name: 'Login' });
        }
    }

    // 3. 其他情况放行
    next();
});



// 解决方案1：添加默认导出
export default router

// 或者解决方案2：使用命名导出
// export { router }