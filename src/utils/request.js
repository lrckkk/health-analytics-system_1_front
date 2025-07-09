import axios from "axios"
import qs from "qs"

const request = axios.create({
    baseURL: '/dpi', // 与代理标识一致，触发代理转发
    timeout: 200000
})

// 请求拦截器
request.interceptors.request.use(
    // (config) => {
    //     //由发送方决定转换形式
    //     // if (config.method?.toLowerCase() === 'post') {
    //     //     config.data = qs.stringify(config.data)
    //     //     config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    //     // }
    //     // 自动带上token
    //     // const token = localStorage.getItem('jwt_token')
    //     // if (token) {
    //     //     config.headers.Authorization = `Bearer ${token}`
    //     // }
    //
    //
    //     return config
    // },

    // (error) => Promise.reject(error)
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token && token !== 'null' && token !== 'undefined') {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('请求携带token:', token.substring(0, 10) + '...'); // 打印部分token用于调试
        }
        return config;
    },
    (error) => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        // 检查特定错误码（如401未授权）
        if (response.data?.code === 401) {
            localStorage.removeItem('jwt_token');
            // 可以在这里跳转到登录页或显示错误消息
        }
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('jwt_token');
            // 可以在这里跳转到登录页
            window.location.href = '/login?expired=1';
        }
        const message = error.response?.data?.message || '请求失败';
        return Promise.reject(message);
    }
)

export default request