import axios from "axios"
import qs from "qs"

const request = axios.create({
    baseURL: '/api', // 与代理标识一致，触发代理转发
    timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        //由发送方决定转换形式
        // if (config.method?.toLowerCase() === 'post') {
        //     config.data = qs.stringify(config.data)
        //     config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        // }
        // 自动带上token
        // const token = localStorage.getItem('jwt_token')
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`
        // }
        return config
    },

    (error) => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || '请求失败'
        return Promise.reject(message)
    }
)

export default request