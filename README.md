# smart_house_renting_system

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
# 项目目录结构
```plaintext
src/
├── assets/                     # 公共静态资源
├── components/                 # 公共组件
├── src/
│   ├── pages/                  # 每个页面的 Vue 应用主目录
│   │   ├── home/
│   │   │   ├── main.ts         # home 页面入口
│   │   │   ├── App.vue         # home 页面根组件
│   │   │   ├── router.ts       # home 页面路由
│   │   │   └── components/     # home 页面组件
│   │   ├── admin/
│   │   │   ├── main.ts
│   │   │   ├── App.vue
│   │   │   ├── router.ts
│   │   │   └── components/
│   │   └── user/
│   │       ├── main.ts
│   │       ├── App.vue
│   │       ├── router.ts
│   │       └── components/
│   ├── stores/                 # 全局 Pinia store（可共享）
│   │   └── user.ts
│   ├── styles/                 # 全局样式
│   │   └── global.css
│   └── utils/                  # 工具函数
│       └── http.ts
├── index.html                  # 入口 HTML 文件
├── user.html                   # 用户页面入口 HTML 文件
├── vite.config.ts              # Vite 配置
├── tsconfig.json
└── package.json
```