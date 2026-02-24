# 作用域与闭包

## 作用域类型

### 1. 全局作用域
最外层定义的变量，任何地方都能访问。

### 2. 函数作用域
`var` 声明的变量以函数为边界，函数内部可访问，外部不可访问。

### 3. 块级作用域（ES6+）
`let`/`const` 声明的变量以 `{}` 为边界。

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0) // 3 3 3
}

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0) // 0 1 2
}
// let 在每次循环迭代中创建新的绑定

// ❌ const 不能用于普通 for 循环
// for (const i = 0; i < 3; i++) {} // TypeError: Assignment to constant variable
// 原因：i++ 是赋值操作，const 不允许重新赋值

// ✅ const 可以用于 for...of / for...in
for (const item of [0, 1, 2]) { console.log(item) } // 0 1 2
// 原因：每轮迭代是从迭代器取出新值绑定到全新的变量，不存在修改操作
// for 循环的 i++ 是"修改旧变量"，for...of 是"创建新变量"
```

## 作用域链

当访问一个变量时，引擎沿着作用域链从内向外查找：

```
当前作用域 → 外层函数作用域 → ... → 全局作用域
```

作用域链在**函数定义时**确定（词法作用域/静态作用域），而非调用时。

## 闭包

### 定义
函数能够访问其词法作用域中的变量，即使函数在其词法作用域之外执行。

### 本质
闭包 = 函数 + 其引用的外部词法环境

```js
function createCounter() {
  let count = 0 // 被闭包捕获，不会被 GC 回收
  return {
    increment: () => ++count,
    getCount: () => count,
  }
}

const counter = createCounter()
counter.increment() // 1
counter.increment() // 2
counter.getCount()  // 2
// count 变量被闭包持有，生命周期与 counter 对象绑定
```

### 闭包的常见用途

1. **数据私有化** — 模拟私有变量
2. **函数工厂** — 生成定制化函数
3. **柯里化/偏函数** — 固定部分参数
4. **模块模式** — ES Module 之前的模块化方案

### 闭包与内存

闭包会持有对外部变量的引用，可能导致内存无法释放。
现代引擎（V8）会做优化：只保留闭包实际引用的变量，未引用的会被 GC。

## 变量提升（Hoisting）

```js
console.log(a) // undefined（var 声明提升，赋值不提升）
console.log(b) // ReferenceError（let 存在暂时性死区 TDZ）
console.log(c) // ReferenceError（const 同样有 TDZ）

var a = 1
let b = 2
const c = 3
```

- `var`：声明提升到函数顶部，初始化为 `undefined`
- `let`/`const`：声明提升到块顶部，但在声明语句之前处于 TDZ，访问会报错
- 函数声明：整体提升（声明 + 赋值都提升）
- 函数表达式：按 `var`/`let`/`const` 规则提升
