# Vue 框架深入

## 响应式原理（Vue3）

### 核心：Proxy + Effect

```
reactive(obj)
    │
    ▼
new Proxy(obj, {
  get → track(target, key)   → 收集依赖（当前 activeEffect）
  set → trigger(target, key) → 触发更新（执行所有相关 effect）
})
```

### 依赖收集数据结构
```
targetMap: WeakMap<target, Map<key, Set<effect>>>

WeakMap {
  target → Map {
    key → Set [effect1, effect2, ...]
  }
}
```

### ref vs reactive
- `ref` — 包装原始值，通过 `.value` 访问，内部用 `get/set` 拦截
- `reactive` — 代理对象，直接访问属性
- `ref` 传入对象时，内部调用 `reactive`
- 模板中 `ref` 自动解包，不需要 `.value`

### 响应式注意事项
```js
// 解构会丢失响应性
const { count } = reactive({ count: 0 }) // ❌ count 不是响应式的
const { count } = toRefs(reactive({ count: 0 })) // ✅ count 是 Ref

// reactive 不能替换整个对象
let state = reactive({ a: 1 })
state = reactive({ a: 2 }) // ❌ 旧引用的响应性丢失
state.a = 2 // ✅ 正确方式
```

## 虚拟 DOM 与 Diff 算法

### 虚拟 DOM（VNode）
```js
// 本质是 JS 对象描述 DOM 结构
{
  type: 'div',
  props: { class: 'container', onClick: handler },
  children: [
    { type: 'span', props: null, children: 'hello' }
  ],
  key: null,
  shapeFlag: 17, // 位运算标记节点类型
}
```

### Vue3 Diff 算法（快速 Diff）
1. **预处理**：从头部和尾部开始，跳过相同的前缀和后缀节点
2. **新增/删除**：如果旧序列或新序列已遍历完，直接新增或删除
3. **乱序部分**：
   - 建立新序列的 key → index 映射
   - 遍历旧序列，找到可复用节点
   - 用**最长递增子序列（LIS）**最小化 DOM 移动操作

### 为什么需要 key
- 没有 key → 就地复用策略（可能导致状态错乱）
- 有 key → 基于 key 匹配节点，正确复用和移动
- 不要用 index 作为 key（列表增删时 index 会变化）

## 编译器优化

### 静态提升（hoistStatic）
```html
<div>
  <span>静态文本</span>  <!-- 提升到渲染函数外，只创建一次 -->
  <span>{{ dynamic }}</span>
</div>
```

### PatchFlags（补丁标记）
```js
// 编译器标记动态内容类型，运行时只对比标记的部分
TEXT = 1        // 动态文本
CLASS = 2       // 动态 class
STYLE = 4       // 动态 style
PROPS = 8       // 动态属性
FULL_PROPS = 16 // 有动态 key 的属性
```

### Block Tree
- 将模板按动态节点分块
- 更新时只遍历动态节点，跳过静态内容
- 配合 PatchFlags，实现靶向更新

## 组件生命周期

```
setup()                    ← 组合式 API 入口
  │
onBeforeMount()            ← DOM 挂载前
  │
onMounted()                ← DOM 挂载后（可访问 DOM）
  │
onBeforeUpdate()           ← 响应式数据变化，DOM 更新前
  │
onUpdated()                ← DOM 更新后
  │
onBeforeUnmount()          ← 组件卸载前
  │
onUnmounted()              ← 组件卸载后（清理副作用）

onActivated()              ← keep-alive 激活
onDeactivated()            ← keep-alive 停用
onErrorCaptured()          ← 捕获后代组件错误
```

## 组件通信

| 方式 | 场景 | 方向 |
|------|------|------|
| `props / emits` | 父子 | 父 → 子 / 子 → 父 |
| `v-model` | 父子 | 双向 |
| `provide / inject` | 跨层级 | 祖先 → 后代 |
| `Pinia` | 全局 | 任意 |
| `expose / ref` | 父子 | 父访问子方法 |
| `attrs / slots` | 父子 | 透传 |
| `EventBus (mitt)` | 任意 | 任意（不推荐） |

## Vue Router

### 导航守卫执行顺序
```
beforeRouteLeave（离开的组件）
  → beforeEach（全局）
  → beforeEnter（路由配置）
  → beforeRouteEnter（进入的组件）
  → beforeResolve（全局）
  → afterEach（全局）
```

### 路由模式
- `createWebHistory` — History API，需要服务端配置 fallback
- `createWebHashHistory` — Hash 模式，兼容性好
- `createMemoryHistory` — SSR 使用

## Pinia

```js
// 推荐 Setup Store 写法
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  function increment() { count.value++ }
  return { count, double, increment }
})
```

### vs Vuex
- 去掉了 mutations（actions 直接修改 state）
- 完整的 TypeScript 支持
- 去掉了 modules 嵌套（每个 store 独立）
- 更轻量，支持组合式 API

## Nuxt SSR/SSG

### 渲染模式
- **SSR**：服务端渲染，每次请求生成 HTML
- **SSG**：构建时生成静态 HTML
- **ISR**：增量静态再生成（`routeRules` 配置 `swr`/`isr`）
- **SPA**：纯客户端渲染
- **Hybrid**：按路由配置不同渲染模式

### SSR 注意事项
- `onMounted` 只在客户端执行
- 避免在 setup 顶层访问 `window`/`document`
- 使用 `useAsyncData`/`useFetch` 获取数据（自动处理 SSR 数据传递）
- 注意 hydration mismatch（服务端和客户端渲染结果不一致）
