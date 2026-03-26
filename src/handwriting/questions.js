/**
 * 手写实现合集
 */

// ============================================
// 1. 防抖（debounce）
// ============================================
function debounce(fn, delay, immediate = false) {
  let timer = null

  const debounced = function (...args) {
    if (timer) clearTimeout(timer)

    if (immediate && !timer) {
      fn.apply(this, args)
    }

    timer = setTimeout(() => {
      if (!immediate) fn.apply(this, args)
      timer = null
    }, delay)
  }

  debounced.cancel = () => {
    clearTimeout(timer)
    timer = null
  }

  return debounced
}

// ============================================
// 2. 节流（throttle）
// ============================================
function throttle(fn, interval) {
  let lastTime = 0

  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

// 带首尾调用控制的节流
function throttleAdvanced(fn, interval, { leading = true, trailing = true } = {}) {
  let lastTime = 0
  let timer = null

  return function (...args) {
    const now = Date.now()

    if (!leading && lastTime === 0) {
      lastTime = now
    }

    const remaining = interval - (now - lastTime)

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      lastTime = now
      fn.apply(this, args)
    } else if (trailing && !timer) {
      timer = setTimeout(() => {
        lastTime = leading ? Date.now() : 0
        timer = null
        fn.apply(this, args)
      }, remaining)
    }
  }
}

// ============================================
// 3. 深拷贝（完整版，见 type-system/questions.js）
// ============================================
function deepClone(value, map = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value
  if (map.has(value)) return map.get(value)

  if (value instanceof Date) return new Date(value)
  if (value instanceof RegExp) return new RegExp(value.source, value.flags)
  if (value instanceof Map) {
    const result = new Map()
    map.set(value, result)
    value.forEach((v, k) => result.set(deepClone(k, map), deepClone(v, map)))
    return result
  }
  if (value instanceof Set) {
    const result = new Set()
    map.set(value, result)
    value.forEach(v => result.add(deepClone(v, map)))
    return result
  }

  const result = Array.isArray(value) ? [] : {}
  map.set(value, result)

  for (const key of [...Object.keys(value), ...Object.getOwnPropertySymbols(value)]) {
    result[key] = deepClone(value[key], map)
  }
  return result
}

// ============================================
// 4. EventEmitter（发布订阅）
// ============================================
class EventEmitter {
  constructor() {
    this.events = new Map()
  }

  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event).push(handler)
    return this
  }

  once(event, handler) {
    const wrapper = (...args) => {
      handler.apply(this, args)
      this.off(event, wrapper)
    }
    wrapper._original = handler
    return this.on(event, wrapper)
  }

  emit(event, ...args) {
    const handlers = this.events.get(event)
    if (!handlers) return false
    handlers.forEach(fn => fn.apply(this, args))
    return true
  }

  off(event, handler) {
    if (!handler) {
      this.events.delete(event)
      return this
    }
    const handlers = this.events.get(event)
    if (handlers) {
      this.events.set(
        event,
        handlers.filter(fn => fn !== handler && fn._original !== handler),
      )
    }
    return this
  }
}

// ============================================
// 5. 数组扁平化
// ============================================
function flatten(arr, depth = Infinity) {
  if (depth <= 0) return arr.slice()
  return arr.reduce((acc, item) => {
    return acc.concat(Array.isArray(item) ? flatten(item, depth - 1) : item)
  }, [])
}

// 迭代版本
function flattenIterative(arr) {
  const stack = [...arr]
  const result = []
  while (stack.length) {
    const item = stack.pop()
    if (Array.isArray(item)) {
      stack.push(...item)
    } else {
      result.unshift(item)
    }
  }
  return result
}

// ============================================
// 5b. 数组去重（uniqueArray）
// ============================================
// 基础版：基于 Set
function uniqueArray(arr) {
  return [...new Set(arr)]
}

// 进阶版：支持对象数组去重，通过 keyFn 指定唯一键
function uniqueArrayBy(arr, keyFn) {
  const seen = new Set()
  return arr.filter(item => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// 测试
// uniqueArray([1, 2, 2, 3, 3, 3]) // [1, 2, 3]
// uniqueArrayBy(
//   [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 1, name: 'c' }],
//   item => item.id
// ) // [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]

// ============================================
// 5c. 类数组转数组（toArray）
// ============================================
function toArray(arrayLike) {
  // 方式一：Array.from
  // return Array.from(arrayLike)

  // 方式二：展开运算符（要求 arrayLike 可迭代）
  // return [...arrayLike]

  // 方式三：slice.call（最经典，兼容性最好）
  return Array.prototype.slice.call(arrayLike)
}

// 三种方式演示
function toArrayDemo() {
  function test() {
    console.log('Array.from:', Array.from(arguments))
    console.log('spread:', [...arguments])
    console.log('slice.call:', Array.prototype.slice.call(arguments))
  }
  test(1, 2, 3)
}

// 测试
// toArrayDemo()
// Array.from:  [1, 2, 3]
// spread:      [1, 2, 3]
// slice.call:  [1, 2, 3]

// ============================================
// 6. 组合函数（compose / pipe）
// ============================================
function compose(...fns) {
  if (fns.length === 0) return (v) => v
  if (fns.length === 1) return fns[0]
  return fns.reduce((a, b) => (...args) => a(b(...args)))
}

function pipe(...fns) {
  return compose(...fns.reverse())
}

// ============================================
// 6b. 柯里化（curry）
// ============================================
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    return function (...moreArgs) {
      return curried.apply(this, args.concat(moreArgs))
    }
  }
}

// 测试
// const add = (a, b, c) => a + b + c
// const curriedAdd = curry(add)
// curriedAdd(1)(2)(3)    // 6
// curriedAdd(1, 2)(3)    // 6
// curriedAdd(1)(2, 3)    // 6
// curriedAdd(1, 2, 3)    // 6

// ============================================
// 6c. 偏函数（partial）
// ============================================
function partial(fn, ...presetArgs) {
  return function (...laterArgs) {
    const args = []
    let laterIdx = 0
    for (let i = 0; i < presetArgs.length; i++) {
      // 遇到占位符则用后续参数填充
      args.push(presetArgs[i] === partial.placeholder ? laterArgs[laterIdx++] : presetArgs[i])
    }
    // 拼接剩余参数
    while (laterIdx < laterArgs.length) {
      args.push(laterArgs[laterIdx++])
    }
    return fn.apply(this, args)
  }
}
partial.placeholder = Symbol('partial.placeholder')

// 测试
// const _ = partial.placeholder
// const add = (a, b, c) => a + b + c
// const add10 = partial(add, 10)
// add10(20, 30) // 60
// const addMiddle = partial(add, 1, _, 3)
// addMiddle(2) // 6

// ============================================
// 7. 深度比较（isEqual）
// ============================================
function isEqual(a, b) {
  if (a === b) return true
  if (a === null || b === null) return false
  if (typeof a !== typeof b) return false

  if (typeof a !== 'object') {
    // 处理 NaN
    if (Number.isNaN(a) && Number.isNaN(b)) return true
    return false
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false

  return keysA.every(key => isEqual(a[key], b[key]))
}

// ============================================
// 8. LRU 缓存
// ============================================
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map() // Map 保持插入顺序
  }

  get(key) {
    if (!this.cache.has(key)) return -1
    const value = this.cache.get(key)
    // 移到最新位置
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的（Map 的第一个元素）
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
    this.cache.set(key, value)
  }
}

// ============================================
// 8b. 虚拟 DOM 转真实 DOM（renderVNode）
// ============================================
// 输入 vnode: { tag, props, children }
// children 可以是字符串（文本节点）或 vnode 数组
function renderVNode(vnode) {
  if (typeof vnode === 'string') {
    return document.createTextNode(vnode)
  }

  const { tag, props = {}, children = [] } = vnode
  const el = document.createElement(tag)

  // 设置属性
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('on') && typeof value === 'function') {
      // 事件绑定：onClick → click
      el.addEventListener(key.slice(2).toLowerCase(), value)
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value)
    } else if (key === 'className') {
      el.setAttribute('class', value)
    } else {
      el.setAttribute(key, value)
    }
  }

  // 递归处理子节点
  const childArray = Array.isArray(children) ? children : [children]
  childArray.forEach(child => {
    el.appendChild(renderVNode(child))
  })

  return el
}

// 测试（需要 DOM 环境，如浏览器或 jsdom）
// const vnode = {
//   tag: 'div',
//   props: { id: 'app', className: 'container' },
//   children: [
//     { tag: 'h1', props: { style: { color: 'red' } }, children: ['Hello'] },
//     { tag: 'p', props: {}, children: ['World'] },
//   ],
// }
// const dom = renderVNode(vnode)
// → <div id="app" class="container"><h1 style="color:red">Hello</h1><p>World</p></div>

// ============================================
// 9. 模板字符串解析
// ============================================
function render(template, data) {
  return template.replace(/\{\{(\s*[\w.]+\s*)\}\}/g, (match, key) => {
    const keys = key.trim().split('.')
    let value = data
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) return match
    }
    return String(value)
  })
}

// 测试
// render('Hello, {{ user.name }}! Age: {{ user.age }}', { user: { name: 'Alice', age: 25 } })
// → 'Hello, Alice! Age: 25'

// ============================================
// 10. 大数相加
// ============================================
function addBigNumbers(a, b) {
  const maxLen = Math.max(a.length, b.length)
  a = a.padStart(maxLen, '0')
  b = b.padStart(maxLen, '0')

  let carry = 0
  let result = ''

  for (let i = maxLen - 1; i >= 0; i--) {
    const sum = Number(a[i]) + Number(b[i]) + carry
    carry = Math.floor(sum / 10)
    result = (sum % 10) + result
  }

  if (carry) result = carry + result
  return result
}

// ============================================
// 11. 对象扁平化 / 反扁平化
// ============================================
function flattenObject(obj, prefix = '', result = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenObject(value, newKey, result)
    } else {
      result[newKey] = value
    }
  }
  return result
}

function unflattenObject(obj) {
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split('.')
    let current = result
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
  }
  return result
}

// ============================================
// 12. 单例模式
// ============================================
function singleton(ClassName) {
  let instance = null
  return new Proxy(ClassName, {
    construct(target, args) {
      if (!instance) {
        instance = Reflect.construct(target, args)
      }
      return instance
    },
  })
}

// ============================================
// 12b. 观察者模式（Observer / Subject）
// ============================================
// 与 EventEmitter（发布订阅）的区别：
// - 观察者模式：Subject 直接持有 Observer 引用，无事件名，notify 时通知所有观察者
// - 发布订阅：通过事件中心解耦，按事件名分发
class Subject {
  constructor() {
    this.observers = []
  }

  addObserver(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer)
    }
  }

  removeObserver(observer) {
    this.observers = this.observers.filter(obs => obs !== observer)
  }

  notify(data) {
    this.observers.forEach(obs => obs.update(data))
  }
}

class Observer {
  constructor(name) {
    this.name = name
  }

  update(data) {
    console.log(`${this.name} 收到通知:`, data)
  }
}

// 测试
// const subject = new Subject()
// const obs1 = new Observer('观察者1')
// const obs2 = new Observer('观察者2')
// subject.addObserver(obs1)
// subject.addObserver(obs2)
// subject.notify('hello') // 观察者1 收到通知: hello  /  观察者2 收到通知: hello
// subject.removeObserver(obs1)
// subject.notify('world') // 观察者2 收到通知: world

// ============================================
// 13a. 并发控制（asyncPool）
// ============================================
async function asyncPool(limit, tasks, iterFn) {
  const results = []
  const executing = new Set()

  for (const [index, task] of tasks.entries()) {
    const p = Promise.resolve().then(() => iterFn(task, index))
    results.push(p)
    executing.add(p)

    const clean = () => executing.delete(p)
    p.then(clean, clean)

    if (executing.size >= limit) {
      await Promise.race(executing)
    }
  }

  return Promise.all(results)
}

// 测试
// const delay = (ms) => new Promise(r => setTimeout(r, ms))
// asyncPool(2, [1, 2, 3, 4, 5], async (i) => {
//   console.log(`开始任务 ${i}`)
//   await delay(1000)
//   console.log(`完成任务 ${i}`)
//   return i * 10
// }).then(console.log) // [10, 20, 30, 40, 50]

// ============================================
// 13b. 请求重试
// ============================================
async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries) throw err
      await new Promise(r => setTimeout(r, delay * 2 ** i)) // 指数退避
    }
  }
}

// ============================================
// 14. 请求缓存（带过期时间）
// ============================================
function createCachedFetch(ttl = 60000) {
  const cache = new Map()

  return async function cachedFetch(url, options) {
    const key = `${url}:${JSON.stringify(options)}`
    const cached = cache.get(key)

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data
    }

    const response = await fetch(url, options)
    const data = await response.json()
    cache.set(key, { data, timestamp: Date.now() })
    return data
  }
}

export {
  debounce,
  throttle,
  throttleAdvanced,
  deepClone,
  EventEmitter,
  flatten,
  flattenIterative,
  uniqueArray,
  uniqueArrayBy,
  toArray,
  compose,
  pipe,
  curry,
  partial,
  isEqual,
  LRUCache,
  renderVNode,
  render,
  addBigNumbers,
  flattenObject,
  unflattenObject,
  singleton,
  Subject,
  Observer,
  asyncPool,
  retry,
  createCachedFetch,
}
