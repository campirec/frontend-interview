/**
 * 前端工程化经典题目
 */

// ============================================
// 题目 1：ESM vs CJS 循环依赖行为差异
// ============================================

// --- CJS 循环依赖 ---
// a.js
// const b = require('./b')
// console.log('a: b.done =', b.done) // a: b.done = true
// module.exports.done = true

// b.js
// const a = require('./a')
// console.log('b: a.done =', a.done) // b: a.done = false（a 还没执行完，返回已执行部分）
// module.exports.done = true

// 执行 node a.js → b: a.done = false → a: b.done = true
// CJS 返回已执行部分的拷贝

// --- ESM 循环依赖 ---
// a.mjs
// import { done as bDone } from './b.mjs'
// console.log('a: b.done =', bDone) // a: b.done = true
// export let done = true

// b.mjs
// import { done as aDone } from './a.mjs'
// console.log('b: a.done =', aDone) // ReferenceError! a.done 在 TDZ 中
// export let done = true

// ESM 是 live binding，但变量在声明前处于 TDZ

// ============================================
// 题目 2：手写简易打包器（理解 Webpack 原理）
// ============================================
function miniBundler() {
  // 模拟模块系统
  const modules = {
    './entry.js': function (require, module, exports) {
      const { greeting } = require('./greeting.js')
      const { name } = require('./name.js')
      exports.default = `${greeting}, ${name}!`
    },
    './greeting.js': function (require, module, exports) {
      exports.greeting = 'Hello'
    },
    './name.js': function (require, module, exports) {
      exports.name = 'World'
    },
  }

  // 模拟 Webpack runtime
  function __webpack_require__(moduleId) {
    // 模块缓存
    if (cache[moduleId]) {
      return cache[moduleId].exports
    }

    const module = (cache[moduleId] = { exports: {} })
    modules[moduleId](
      __webpack_require__, // require
      module, // module
      module.exports, // exports
    )
    return module.exports
  }

  const cache = {}

  // 执行入口模块
  const result = __webpack_require__('./entry.js')
  console.log(result.default) // 'Hello, World!'

  return result
}

// ============================================
// 题目 3：手写 Vite 插件
// ============================================
const vitePluginExample = `
// Vite 插件本质是 Rollup 插件 + Vite 特有钩子
function myVitePlugin() {
  return {
    name: 'my-plugin',

    // Vite 特有：配置阶段
    config(config, { mode }) {
      // 修改 Vite 配置
      return { define: { __MODE__: JSON.stringify(mode) } }
    },

    // Vite 特有：开发服务器
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/health') {
          res.end(JSON.stringify({ status: 'ok' }))
          return
        }
        next()
      })
    },

    // Rollup 钩子：解析模块 ID
    resolveId(source) {
      if (source === 'virtual:my-module') {
        return source // 返回非 null 表示接管该模块
      }
    },

    // Rollup 钩子：加载模块内容
    load(id) {
      if (id === 'virtual:my-module') {
        return 'export const msg = "from virtual module"'
      }
    },

    // Rollup 钩子：转换代码
    transform(code, id) {
      if (id.endsWith('.md')) {
        // 将 markdown 转为 JS 模块
        return {
          code: \`export default \${JSON.stringify(code)}\`,
          map: null,
        }
      }
    },

    // Vite 特有：HMR
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.custom')) {
        server.ws.send({ type: 'full-reload' })
        return [] // 阻止默认 HMR
      }
    },
  }
}
`

// ============================================
// 题目 4：Tree Shaking 原理与陷阱
// ============================================
const treeshakingExamples = `
// ✅ 可以 Tree Shake — 纯函数导出
export function add(a, b) { return a + b }
export function multiply(a, b) { return a * b }
// 只 import { add } 时，multiply 会被移除

// ❌ 无法 Tree Shake — 有副作用
export const result = sideEffect() // 模块加载时执行了函数
export class MyClass {
  // class 可能有副作用（装饰器、静态属性初始化）
}

// ❌ 无法 Tree Shake — CJS 格式
const { add } = require('./math') // 运行时才知道用了什么

// 配置 sideEffects 帮助 Tree Shaking
// package.json
{
  "sideEffects": false,  // 声明所有模块无副作用
  // 或指定有副作用的文件
  "sideEffects": ["*.css", "./src/polyfills.js"]
}

// /*#__PURE__*/ 标记
const instance = /*#__PURE__*/ createApp() // 告诉打包器这个调用无副作用
`

// ============================================
// 题目 5：性能优化 Checklist
// ============================================
const performanceChecklist = {
  '构建优化': [
    'Code Splitting — 路由懒加载、动态导入',
    'Tree Shaking — ESM + sideEffects: false',
    '压缩 — Terser/esbuild 压缩 JS，cssnano 压缩 CSS',
    '图片 — WebP/AVIF 格式，响应式图片，SVG sprite',
    '依赖分析 — rollup-plugin-visualizer 分析包体积',
    '分包策略 — 第三方库单独 chunk，长缓存',
  ],
  '网络优化': [
    'Gzip/Brotli 压缩',
    'HTTP/2 多路复用',
    'CDN 加速静态资源',
    '资源预加载 — preload 关键资源，prefetch 下一页资源',
    'Service Worker 离线缓存',
  ],
  '运行时优化': [
    '虚拟滚动 — 大列表只渲染可见区域',
    '防抖节流 — 高频事件处理',
    'Web Worker — CPU 密集任务移到后台线程',
    'requestAnimationFrame — 动画优化',
    'IntersectionObserver — 懒加载',
  ],
  'Vue 特定优化': [
    'v-once — 静态内容只渲染一次',
    'v-memo — 条件性跳过更新',
    'shallowRef/shallowReactive — 大对象避免深层响应',
    'keep-alive — 缓存组件实例',
    '异步组件 — defineAsyncComponent',
  ],
}

// ============================================
// 题目 6：手写简易 HMR
// ============================================
function miniHMR() {
  // 模拟 HMR 客户端
  class HMRClient {
    constructor() {
      this.moduleMap = new Map()
      this.acceptCallbacks = new Map()
    }

    // 注册模块
    register(id, factory) {
      this.moduleMap.set(id, factory)
    }

    // 模块声明接受热更新
    accept(id, callback) {
      this.acceptCallbacks.set(id, callback)
    }

    // 服务端推送更新
    handleUpdate(id, newFactory) {
      this.moduleMap.set(id, newFactory)

      if (this.acceptCallbacks.has(id)) {
        // 模块自身接受更新
        const newModule = {}
        newFactory(newModule)
        this.acceptCallbacks.get(id)(newModule)
        console.log(`[HMR] Module ${id} hot updated`)
      } else {
        // 向上冒泡，找到能接受更新的父模块
        console.log(`[HMR] Module ${id} cannot self-accept, full reload`)
      }
    }
  }

  const hmr = new HMRClient()

  // 模拟模块注册
  hmr.register('./counter.js', (module) => {
    module.count = 0
    module.increment = () => ++module.count
  })

  // 模拟接受热更新
  hmr.accept('./counter.js', (newModule) => {
    console.log('Counter module updated:', newModule)
  })

  // 模拟文件变化
  hmr.handleUpdate('./counter.js', (module) => {
    module.count = 0
    module.increment = () => (module.count += 2) // 改了逻辑
  })

  return hmr
}

export {
  miniBundler,
  vitePluginExample,
  treeshakingExamples,
  performanceChecklist,
  miniHMR,
}
