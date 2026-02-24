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
// 13. 请求重试
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
  compose,
  pipe,
  isEqual,
  LRUCache,
  render,
  addBigNumbers,
  flattenObject,
  unflattenObject,
  singleton,
  retry,
  createCachedFetch,
}
