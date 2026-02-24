# this 指向

## 核心规则

this 的值在**调用时**确定（箭头函数除外），取决于调用方式：

| 调用方式 | this 指向 | 示例 |
|---------|----------|------|
| 默认绑定 | `globalThis`（严格模式下 `undefined`） | `fn()` |
| 隐式绑定 | 调用对象 | `obj.fn()` |
| 显式绑定 | 指定对象 | `fn.call(obj)` |
| new 绑定 | 新创建的实例 | `new Fn()` |
| 箭头函数 | 定义时外层的 this（词法绑定） | `() => {}` |

## 优先级

```
new 绑定 > 显式绑定(call/apply/bind) > 隐式绑定(obj.fn) > 默认绑定(fn)
```

## 隐式绑定丢失

```js
const obj = {
  name: 'Alice',
  greet() { console.log(this.name) }
}

obj.greet()          // 'Alice' — 隐式绑定

const fn = obj.greet
fn()                 // undefined — 赋值后丢失了 obj 上下文，变成默认绑定

setTimeout(obj.greet, 0) // undefined — 回调函数同样丢失上下文

// 修复：bind 或箭头函数
setTimeout(obj.greet.bind(obj), 0) // 'Alice'
setTimeout(() => obj.greet(), 0)   // 'Alice'
```

## call / apply / bind

```js
fn.call(thisArg, arg1, arg2)     // 立即调用，逐个传参
fn.apply(thisArg, [arg1, arg2])  // 立即调用，数组传参
fn.bind(thisArg, arg1)           // 返回新函数，不立即调用
```

- `call/apply` 对箭头函数无效（无法改变箭头函数的 this）
- `bind` 返回的函数再次 `bind` 无效（只有第一次 bind 生效）
- `call/apply` 传入 `null` 或 `undefined`，非严格模式下 this 指向 `globalThis`

## 箭头函数的 this

箭头函数没有自己的 this，继承定义时外层作用域的 this：

```js
const obj = {
  name: 'Alice',
  // 普通方法中的箭头函数
  greet() {
    const inner = () => {
      console.log(this.name) // 'Alice' — 继承 greet 的 this
    }
    inner()
  },
  // 箭头函数作为方法（避免这样做）
  bad: () => {
    console.log(this.name) // undefined — 继承的是模块/全局的 this
  }
}
```

## 特殊场景

- **DOM 事件处理器**：`this` 指向绑定事件的元素（箭头函数除外）
- **class 中的方法**：默认不绑定，传递后会丢失（常用箭头函数属性或 bind 解决）
- **链式调用**：方法返回 `this` 实现链式调用

## 严格模式与 ESM 的影响

ESM 模块（`"type": "module"`）默认运行在严格模式下，默认绑定的 `this` 是 `undefined` 而非 `globalThis`：

```js
// CommonJS 或非严格模式
function foo() { console.log(this) }
foo() // globalThis (window / global)

// ESM 或严格模式
function foo() { console.log(this) }
foo() // undefined — 独立调用时 this 不再指向全局对象

// 实际影响：
const obj = {
  name: 'Alice',
  greet() {
    return function() { return this.name }
  }
}
const fn = obj.greet()
fn() // 非严格模式：undefined（window.name 不存在）
     // 严格模式/ESM：TypeError（Cannot read properties of undefined）
```

面试中提到严格模式对 `this` 的影响会加分。
