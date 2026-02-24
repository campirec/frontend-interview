# 前端工程化

## 模块化演进

### CJS（CommonJS）
```js
// 同步加载，运行时确定依赖，值的拷贝
const fs = require('fs')
module.exports = { foo: 'bar' }
```

### ESM（ES Modules）
```js
// 静态分析，编译时确定依赖，值的引用（live binding）
import fs from 'fs'
export const foo = 'bar'
export default function()
```

### 关键区别

| | CJS | ESM |
|---|---|---|
| 加载方式 | 同步 | 异步 |
| 依赖确定 | 运行时 | 编译时（静态分析） |
| 值传递 | 拷贝 | 引用（live binding） |
| this | 当前模块 | undefined |
| Tree Shaking | 不支持 | 支持 |
| 循环依赖 | 返回已执行部分 | 变量存在但未初始化（TDZ） |

## Vite 原理

### 开发模式
```
浏览器请求 .vue/.ts 文件
    │
    ▼
Vite Dev Server 拦截请求
    │
    ▼
按需编译（esbuild 转译 TS/JSX）
    │
    ▼
返回 ESM 格式代码（浏览器原生 import）
```

- **无需打包** — 利用浏览器原生 ESM，按需编译
- **依赖预构建** — 用 esbuild 将 CJS 依赖转为 ESM，合并小模块减少请求
- **HMR** — 基于 ESM 的精确热更新，只更新变化的模块

### 生产构建
- 使用 Rollup（Vite 5+ 可选 Rolldown）打包
- 原因：浏览器原生 ESM 在生产环境有性能问题（大量请求、无法 Tree Shaking）

### 为什么 Vite 比 Webpack 快
1. 开发时不打包，按需编译
2. 用 esbuild（Go 编写）做预构建和转译，比 JS 工具快 10-100x
3. HMR 不受项目规模影响（只更新变化的模块链）

## 构建优化

### Tree Shaking
- 基于 ESM 静态分析，移除未使用的导出
- 要求：ESM 格式 + 无副作用（`sideEffects: false`）
- `/*#__PURE__*/` 标记纯函数调用，帮助 Tree Shaking

### Code Splitting
```js
// 动态导入 — 自动分割为独立 chunk
const module = await import('./heavy-module.js')

// Vue 路由懒加载
const routes = [
  { path: '/about', component: () => import('./About.vue') }
]

// Vite 手动分包
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router', 'pinia'],
      }
    }
  }
}
```

### 其他优化手段
- **资源压缩** — Gzip/Brotli（vite-plugin-compression）
- **图片优化** — WebP/AVIF、响应式图片、懒加载
- **CSS 优化** — PurgeCSS 移除未使用样式、CSS Modules 避免冲突
- **预加载** — `<link rel="prefetch">` 预获取、`<link rel="preload">` 预加载关键资源
- **CDN** — 静态资源上 CDN，配合长缓存

## Monorepo

### pnpm workspace
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```json
// packages/shared/package.json
{ "name": "@myorg/shared", "version": "1.0.0" }

// apps/web/package.json
{
  "dependencies": {
    "@myorg/shared": "workspace:*"
  }
}
```

### Turborepo
```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],  // 先构建依赖包
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

- **任务编排** — `dependsOn` 声明任务依赖关系
- **增量构建** — 基于文件 hash 缓存，只重建变化的包
- **远程缓存** — CI 共享构建缓存
- **并行执行** — 无依赖的任务自动并行

### pnpm 优势
- **硬链接 + 符号链接** — 全局 store 去重，节省磁盘空间
- **严格依赖** — 非扁平 node_modules，防止幽灵依赖
- **速度快** — 安装速度通常优于 npm/yarn
