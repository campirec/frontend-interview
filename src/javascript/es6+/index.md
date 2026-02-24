# ES6+ 核心特性

## Proxy 与 Reflect

### Proxy — 对象操作的拦截层

```js
const handler = {
  get(target, key, receiver) {
    console.log(`读取 ${key}`)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    console.log(`设置 ${key} = ${value}`)
    return Reflect.set(target, key, value, receiver)
  },
  deleteProperty(target, key) {
    console.log(`删除 ${key}`)
    return Reflect.deleteProperty(target, key)
  },
  has(target, key) {
    // 拦截 in 操作符
    return Reflect.has(target, key)
  },
  ownKeys(target) {
    // 拦截 Object.keys / for...in
    return Reflect.ownKeys(target)
  }
}

const obj = new Proxy({}, handler)
```

### 为什么 Vue3 用 Proxy 替代 Object.defineProperty

| | Object.defineProperty | Proxy |
|---|---|---|
| 监听方式 | 逐个属性定义 | 整个对象代理 |
| 新增属性 | 无法监听（需 `$set`） | 自动监听 |
| 删除属性 | 无法监听（需 `$delete`） | 自动监听 |
| 数组变化 | 需要重写数组方法 | 自动监听 |
| 性能 | 初始化时递归遍历 | 惰性代理（访问时才递归） |

### Reflect — 与 Proxy 一一对应的操作方法

- 将 Object 上的语言内部方法移到 Reflect
- 返回布尔值而非抛错，更适合编程
- 配合 Proxy 使用，确保正确的 receiver 传递

## Symbol

```js
// 唯一标识符
const s1 = Symbol('desc')
const s2 = Symbol('desc')
s1 === s2 // false

// 全局注册表
const s3 = Symbol.for('shared')
const s4 = Symbol.for('shared')
s3 === s4 // true

// 内置 Symbol
Symbol.iterator    // 定义迭代行为
Symbol.toPrimitive // 定义类型转换
Symbol.hasInstance  // 定义 instanceof 行为
Symbol.toStringTag  // 定义 Object.prototype.toString 的标签
```

## Iterator 与 Iterable

### 迭代协议

```js
// 可迭代对象：实现 [Symbol.iterator]() 方法
// 迭代器：实现 next() 方法，返回 { value, done }

const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from
    const last = this.to
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { done: true }
      }
    }
  }
}

for (const n of range) console.log(n) // 1 2 3 4 5
console.log([...range]) // [1, 2, 3, 4, 5]
```

### 内置可迭代对象
Array、String、Map、Set、TypedArray、arguments、NodeList

## Map / Set / WeakMap / WeakSet

```
Map vs Object:
- 键可以是任意类型（Object 键只能是 string/symbol）
- 保持插入顺序
- 有 size 属性
- 可直接迭代

WeakMap / WeakSet:
- 键必须是对象（WeakMap）/ 值必须是对象（WeakSet）
- 弱引用，不阻止 GC 回收
- 不可迭代，没有 size
- 适合：缓存、私有数据、DOM 关联数据
```

## 解构与展开

```js
// 解构默认值 + 重命名
const { name: userName = 'Anonymous', age = 0 } = user

// 嵌套解构
const { address: { city } } = user

// 剩余参数
const { id, ...rest } = user

// 展开运算符是浅拷贝
const copy = { ...obj }
const merged = { ...defaults, ...overrides }
```

## Optional Chaining 与 Nullish Coalescing

```js
// ?. — 短路求值，遇到 null/undefined 返回 undefined
user?.address?.city
arr?.[0]
fn?.()

// ?? — 仅在 null/undefined 时使用默认值（不同于 || 对 0/'' 也生效）
const port = config.port ?? 3000
```

## 其他重要特性

- **模板字面量标签函数**：`tag\`hello ${name}\`` — 自定义字符串处理
- **Promise.withResolvers()**（ES2024）：`const { promise, resolve, reject } = Promise.withResolvers()`
- **Array.groupBy / Map.groupBy**（ES2024）：分组操作
- **Decorator**（Stage 3 → ES2024）：类和方法的装饰器
- **using 声明**（ES2024）：`using file = openFile()` — 自动资源管理
