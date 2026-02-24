/**
 * Vue 框架经典题目
 */

// ============================================
// 题目 1：手写简易响应式系统（Vue3 核心原理）
// ============================================
function miniReactiveSystem() {
  // 当前正在执行的 effect
  let activeEffect = null
  const effectStack = []

  // 依赖收集容器
  const targetMap = new WeakMap()

  function track(target, key) {
    if (!activeEffect) return
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      depsMap = new Map()
      targetMap.set(target, depsMap)
    }
    let deps = depsMap.get(key)
    if (!deps) {
      deps = new Set()
      depsMap.set(key, deps)
    }
    deps.add(activeEffect)
  }

  function trigger(target, key) {
    const depsMap = targetMap.get(target)
    if (!depsMap) return
    const deps = depsMap.get(key)
    if (!deps) return
    // 创建新 Set 避免无限循环
    const effectsToRun = new Set(deps)
    effectsToRun.forEach(fn => fn())
  }

  function reactive(obj) {
    return new Proxy(obj, {
      get(target, key, receiver) {
        track(target, key)
        const result = Reflect.get(target, key, receiver)
        if (typeof result === 'object' && result !== null) {
          return reactive(result) // 惰性深层代理
        }
        return result
      },
      set(target, key, value, receiver) {
        const oldValue = target[key]
        const result = Reflect.set(target, key, value, receiver)
        if (oldValue !== value) {
          trigger(target, key)
        }
        return result
      },
    })
  }

  function effect(fn) {
    const effectFn = () => {
      activeEffect = effectFn
      effectStack.push(effectFn)
      const result = fn()
      effectStack.pop()
      activeEffect = effectStack[effectStack.length - 1]
      return result
    }
    effectFn()
    return effectFn
  }

  function ref(value) {
    const wrapper = {
      get value() {
        track(wrapper, 'value')
        return value
      },
      set value(newValue) {
        if (newValue !== value) {
          value = newValue
          trigger(wrapper, 'value')
        }
      },
    }
    return wrapper
  }

  function computed(getter) {
    let cachedValue
    let dirty = true

    const effectFn = effect(() => {
      cachedValue = getter()
      dirty = false
    })

    return {
      get value() {
        if (dirty) effectFn()
        return cachedValue
      },
    }
  }

  // 测试
  const state = reactive({ count: 0, name: 'Vue' })

  effect(() => {
    console.log(`count is: ${state.count}`)
  })

  state.count++ // 自动打印: count is: 1
  state.count++ // 自动打印: count is: 2

  const count = ref(0)
  effect(() => {
    console.log(`ref count: ${count.value}`)
  })
  count.value = 10 // 自动打印: ref count: 10

  return { reactive, effect, ref, computed }
}

// ============================================
// 题目 2：手写简易虚拟 DOM Diff
// ============================================
function miniDiff() {
  // 创建 VNode
  function h(type, props, children) {
    return {
      type,
      props: props || {},
      children: children || [],
      key: props?.key ?? null,
    }
  }

  // 渲染 VNode 为真实 DOM
  function render(vnode) {
    if (typeof vnode === 'string') {
      return document.createTextNode(vnode)
    }

    const el = document.createElement(vnode.type)

    // 设置属性
    for (const [key, value] of Object.entries(vnode.props)) {
      if (key === 'key') continue
      if (key.startsWith('on')) {
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        el.setAttribute(key, value)
      }
    }

    // 渲染子节点
    for (const child of vnode.children) {
      el.appendChild(render(child))
    }

    vnode.el = el
    return el
  }

  // 简化版 Diff — 同层比较
  function patch(oldVNode, newVNode, container) {
    // 类型不同，直接替换
    if (oldVNode.type !== newVNode.type) {
      container.replaceChild(render(newVNode), oldVNode.el)
      return
    }

    const el = (newVNode.el = oldVNode.el)

    // 更新属性
    const oldProps = oldVNode.props
    const newProps = newVNode.props
    for (const key of Object.keys(newProps)) {
      if (key !== 'key' && newProps[key] !== oldProps[key]) {
        el.setAttribute(key, newProps[key])
      }
    }
    for (const key of Object.keys(oldProps)) {
      if (key !== 'key' && !(key in newProps)) {
        el.removeAttribute(key)
      }
    }

    // Diff children（简化版，基于 key）
    patchChildren(oldVNode.children, newVNode.children, el)
  }

  function patchChildren(oldChildren, newChildren, container) {
    // 简化：仅处理文本和数组
    if (typeof newChildren[0] === 'string') {
      container.textContent = newChildren[0]
      return
    }

    const oldKeyMap = new Map()
    oldChildren.forEach((child, i) => {
      if (child.key != null) oldKeyMap.set(child.key, i)
    })

    newChildren.forEach((newChild, i) => {
      const oldIndex = oldKeyMap.get(newChild.key)
      if (oldIndex !== undefined) {
        patch(oldChildren[oldIndex], newChild, container)
      } else {
        container.appendChild(render(newChild))
      }
    })
  }

  return { h, render, patch }
}

// ============================================
// 题目 3：Vue3 组合式函数（Composables）模式
// ============================================
const composableExamples = `
// useFetch — 通用数据请求
function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  async function execute() {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(unref(url))
      data.value = await response.json()
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // 如果 url 是 ref，监听变化自动重新请求
  if (isRef(url)) {
    watchEffect(execute)
  } else {
    execute()
  }

  return { data, error, loading, execute }
}

// useEventListener — 自动清理事件监听
function useEventListener(target, event, handler, options) {
  onMounted(() => {
    const el = unref(target)
    el.addEventListener(event, handler, options)
  })
  onUnmounted(() => {
    const el = unref(target)
    el.removeEventListener(event, handler, options)
  })
}

// useDebounce — 防抖 ref
function useDebounce(value, delay = 300) {
  const debounced = ref(value.value)
  let timer

  watch(value, (newVal) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = newVal
    }, delay)
  })

  return debounced
}

// useVModel — 简化 v-model 组件封装
function useVModel(props, name = 'modelValue', emit) {
  return computed({
    get: () => props[name],
    set: (value) => emit(\`update:\${name}\`, value),
  })
}
`

// ============================================
// 题目 4：Vue 常见面试问答
// ============================================
const vueQA = {
  'nextTick 原理': `
    nextTick 将回调推入微任务队列，在 DOM 更新后执行。
    Vue 的响应式更新是异步的 — 同一个 tick 内的多次数据变更会被合并为一次 DOM 更新。
    nextTick 内部优先使用 Promise.then，降级到 MutationObserver → setImmediate → setTimeout。
  `,

  'v-if vs v-show': `
    v-if: 条件为 false 时不渲染 DOM（惰性），切换开销大
    v-show: 始终渲染 DOM，通过 display:none 切换，初始渲染开销大
    频繁切换用 v-show，条件很少变化用 v-if
  `,

  'watch vs watchEffect': `
    watch: 显式指定监听源，可以获取新旧值，惰性执行（默认不立即执行）
    watchEffect: 自动收集依赖，立即执行，无法获取旧值
    watchEffect 适合副作用同步，watch 适合需要对比新旧值的场景
  `,

  'keep-alive 原理': `
    缓存组件实例而非销毁，使用 LRU 缓存策略。
    被缓存的组件不会触发 mounted/unmounted，而是触发 activated/deactivated。
    通过 include/exclude/max 控制缓存范围和数量。
  `,

  'Vue3 vs Vue2 主要变化': `
    1. Composition API（组合式 API）
    2. Proxy 替代 Object.defineProperty
    3. Fragment（多根节点）、Teleport、Suspense
    4. 编译器优化（静态提升、PatchFlags、Block Tree）
    5. Tree-shaking 友好（按需引入 API）
    6. TypeScript 重写，更好的类型支持
  `,
}

// ============================================
// 题目 5：手写 Vue Router 核心逻辑
// ============================================
function miniRouter() {
  class Router {
    constructor(routes) {
      this.routes = routes
      this.currentPath = window.location.hash.slice(1) || '/'
      this.listeners = new Set()

      window.addEventListener('hashchange', () => {
        this.currentPath = window.location.hash.slice(1) || '/'
        this.listeners.forEach(fn => fn(this.currentPath))
      })
    }

    push(path) {
      window.location.hash = path
    }

    getCurrentRoute() {
      return this.routes.find(r => r.path === this.currentPath) || null
    }

    onRouteChange(fn) {
      this.listeners.add(fn)
      return () => this.listeners.delete(fn)
    }
  }

  // History 模式核心
  class HistoryRouter {
    constructor(routes) {
      this.routes = routes
      this.currentPath = window.location.pathname

      window.addEventListener('popstate', () => {
        this.currentPath = window.location.pathname
        this.notify()
      })
    }

    push(path) {
      window.history.pushState(null, '', path)
      this.currentPath = path
      this.notify()
    }

    notify() {
      // 触发视图更新
    }
  }

  return { Router, HistoryRouter }
}

export {
  miniReactiveSystem,
  miniDiff,
  composableExamples,
  vueQA,
  miniRouter,
}
