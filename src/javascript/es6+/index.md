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

### Class 私有字段 `#`

```js
class Counter {
  #count = 0  // 真正的私有，外部无法访问

  increment() { this.#count++ }
  get value() { return this.#count }
}

const c = new Counter()
c.increment()
c.value    // 1
c.#count   // SyntaxError — 语法层面禁止访问
```

- `#` 前缀是语言级私有，不同于 Symbol / WeakMap 的约定式私有
- 私有字段不参与原型继承，只存在于定义它的类实例上
- 也支持私有方法和私有静态字段：`#method()` / `static #field`

### structuredClone — 原生深拷贝

```js
const original = {
  date: new Date(),
  regex: /abc/gi,
  map: new Map([['a', 1]]),
  set: new Set([1, 2, 3]),
  nested: { arr: [1, [2, 3]] },
}

const clone = structuredClone(original)
clone.nested.arr[1].push(4)
original.nested.arr[1] // [2, 3] — 不受影响
```

| | JSON.parse(JSON.stringify()) | structuredClone |
|---|---|---|
| Date | 变成字符串 | 保持 Date 对象 |
| RegExp | 丢失 | 保持 |
| Map / Set | 丢失 | 保持 |
| undefined | 丢失 | 保持 |
| 循环引用 | 报错 | 支持 |
| 函数 | 丢失 | 报错（不可克隆） |
| DOM 节点 | 报错 | 报错 |

### Top-level await

```js
// 在 ESM 模块顶层直接使用 await（无需包裹 async 函数）
const config = await fetch('/config.json').then(r => r.json())
export default config
```

- 仅在 ES Module 中可用（`"type": "module"` 或 `.mjs`）
- 会阻塞当前模块及依赖它的模块的执行，不影响无关模块
- 适合模块初始化时的异步操作（加载配置、数据库连接等）

### 其他新特性速览

- **模板字面量标签函数**：`tag\`hello ${name}\`` — 自定义字符串处理
- **Promise.withResolvers()**（ES2024）：`const { promise, resolve, reject } = Promise.withResolvers()`
- **Object.groupBy / Map.groupBy**（ES2024）：分组操作
- **Decorator**（Stage 3 → ES2024）：类和方法的装饰器
- **using 声明**（ES2024）：`using file = openFile()` — 自动资源管理（Symbol.dispose）

## 面试答题复盘：ESM 模块

### 1) `import` 是活绑定（live binding），不是值拷贝

```js
// a.js
export let count = 0
export function inc() { count++ }

// b.js
import { count, inc } from './a.js'
console.log(count) // 0
inc()
console.log(count) // 1
```

- ESM 在同一运行时里按模块实例复用（可理解为单例模块实例）
- 导入方读到的是导出绑定的实时值（live binding）

### 2) 导入绑定只读；对象属性可变

- `count++`（对 `import { count }`）会报错：不能给导入绑定重新赋值
- `state.count++`（`state` 是导入对象）可以：改的是对象内部属性
- `state = { count: 999 }` 不可以：这是重绑导入变量本身

### 3) 循环依赖的关键是“首次读取时机”

- `import` 语句主要建立绑定关系，本身通常不触发值读取
- 真正危险的是在初始化阶段读取到对方尚未初始化的绑定（TDZ）
- 这时会抛 `ReferenceError`（典型信息：`Cannot access 'x' before initialization`）
- 若把读取放进函数体并在后续时机调用，可能避免 TDZ 报错

### 4) `import * as mod`（命名空间对象）是只读视图

```js
import * as mod from './a.js'
mod.inc()      // 可以
mod.count++    // TypeError
```

- `mod.inc()` 可以：修改发生在导出模块内部
- `mod.count++` 不行：导入方尝试写命名空间导出成员

### 5) 命名空间解构是“快照值”，不是活绑定

```js
import * as mod from './a.js'
const { count } = mod
mod.inc()
console.log(count, mod.count) // 0 1
```

- `const { count } = mod` 在解构时取当前值
- 后续 `mod.count` 变化不会回写本地变量 `count`

### 6) `default` 导出的两种写法语义不同

```js
let count = 0
export { count }
export default count
count++
```

- `export default count`：导出当时表达式值（这里是 `0`）
- `export { count }`：命名导出是活绑定（后续变成 `1`）

```js
let count = 0
export { count as default }
export { count }
count++
```

- `export { count as default }`：`default` 也是对 `count` 的活绑定
- 因此默认导出和命名导出都会看到更新后的值

### 一句话速记

- **先区分“绑定可写性”与“对象可变性”**
- **先区分“建立导入关系”与“首次读取时机”**
- **先区分“活绑定”与“解构快照”**

### 30 秒口述版（面试速答）

ESM 的核心是“导入是活绑定，但导入绑定只读”。所以 `import { count }` 后，导出模块里改了 `count`，导入方读到会更新；但导入方不能直接 `count++`。如果导入的是对象，改 `state.count` 可以，因为改的是对象内部，不是重绑导入变量。循环依赖时要看“首次读取时机”，如果在对方还没初始化时读取，会落入 TDZ 抛 `ReferenceError`。另外 `import * as mod` 得到的是命名空间只读视图，`mod.inc()` 可以但 `mod.count++` 不行；`const { count } = mod` 是解构快照，不会跟随更新。

### 90 秒展开版（追问应对）

可以先给结论：ESM 有三个高频考点，分别是 live binding、循环依赖读取时机、default 导出语义差异。  
第一，`import` 拿到的是导出绑定的实时视图，不是值拷贝，所以导出模块内部修改后导入方能看到新值；但导入绑定本身是只读，导入方不能直接 `count++`。  
第二，循环依赖不是“必报错”，关键看是否在初始化阶段“过早读取”。`import` 主要建立绑定关系，真正触发问题的是表达式读取；一旦读取到对方还在 TDZ 的绑定，会抛 `ReferenceError`。  
第三，`default` 写法要分开看：`export default count` 是导出当时表达式值；`export { count as default }` 则是把 `default` 也做成活绑定，这两个在后续变量变化时结果不同。

```js
// 循环依赖：会报错（过早读取）
// a.js
import { b } from './b.js'
export const a = 1
console.log('a sees b =', b)

// b.js
import { a } from './a.js'
export const b = a + 1 // 这里读取 a，若 a 未初始化会触发 TDZ
```

```js
// default 导出差异
let count = 0
export { count }
export default count     // 值快照（此刻为 0）
count++
// 导入后通常是：default = 0, named count = 1
```

### 面试官连续追问 5 问（标准一句话答法）

1. **问：ESM 的 `import` 到底是值拷贝还是引用？**  
   答：都不是传统意义拷贝或对象引用，准确说法是“对导出绑定的 live binding 读取视图”。

2. **问：为什么 `import { count }` 后不能 `count++`？**  
   答：因为导入绑定在导入方是只读的，`++` 属于写操作，会触发错误。

3. **问：为什么 `state.count++` 又可以？**  
   答：它改的是对象内部属性，不是给 `state` 这个导入绑定重新赋值。

4. **问：循环依赖什么时候会报错？**  
   答：当模块初始化阶段首次读取到对方仍在 TDZ 的绑定时会抛 `ReferenceError`。

5. **问：`export default count` 和 `export { count as default }` 区别？**  
   答：前者导出当时表达式值，后者导出的是 `count` 的活绑定。
