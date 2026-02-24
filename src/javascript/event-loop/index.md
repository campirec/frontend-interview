# Event Loop 事件循环

## 核心概念

JavaScript 是单线程语言，但通过 Event Loop 实现了非阻塞的异步执行模型。

## 执行模型

```
┌──────────────────────────┐
│       Call Stack          │  ← 同步代码在这里执行
│       (调用栈)             │
└──────────┬───────────────┘
           │ 栈空时检查队列
           ▼
┌──────────────────────────┐
│   Microtask Queue         │  ← 优先级高，每次栈空都会清空
│   (微任务队列)             │
│   Promise.then/catch      │
│   MutationObserver        │
│   queueMicrotask()        │
└──────────┬───────────────┘
           │ 微任务清空后
           ▼
┌──────────────────────────┐
│   Macrotask Queue         │  ← 每次只取一个执行
│   (宏任务队列)             │
│   setTimeout/setInterval  │
│   I/O、postMessage        │
│   MessageChannel          │
└──────────────────────────┘
```

## 执行顺序

1. 执行同步代码（当前宏任务）
2. 调用栈清空后，清空所有微任务（包括微任务中产生的新微任务）
3. 浏览器可能执行渲染（requestAnimationFrame 在渲染前执行）
4. 取下一个宏任务，回到步骤 1

## 关键点

- **微任务在当前宏任务结束后立即执行**，不会等待下一个宏任务
- **微任务队列会被完全清空**，包括执行过程中新加入的微任务
- **requestAnimationFrame** 不属于宏任务也不属于微任务，它在渲染前执行
- **Node.js 的 Event Loop** 与浏览器不同，有 6 个阶段（timers → pending → idle → poll → check → close）

## 面试题复盘：事件循环基础（第 1 题）

### 一轮 Event Loop 的常见顺序（浏览器）

1. 执行当前宏任务中的同步代码（Call Stack）
2. 调用栈清空后，清空当前所有微任务（Microtask Queue）
3. 进入渲染机会，`requestAnimationFrame` 在绘制前执行
4. 浏览器完成绘制后，进入下一轮事件循环并取下一个宏任务

### 典型微任务来源

- `Promise.then/catch/finally`
- `queueMicrotask`
- `MutationObserver`

补充：它们都属于微任务，执行顺序按入队先后（FIFO），不存在“Promise 微任务比 queueMicrotask 更高优先级”。

### 微任务递归风险

- 在微任务回调里持续创建新微任务，会导致微任务队列长时间不为空
- 后果是宏任务（如 `setTimeout`、I/O 回调）和渲染机会被延后，出现卡顿或“饿死”现象

### 如何避免微任务饿死事件循环

- 不在微任务里做无限递归调度
- 重任务采用分批处理，定期切回宏任务（如 `setTimeout(fn, 0)`）
- 给任务处理流程设置退出条件或取消机制，避免无上限调度

## 面试题复盘：setTimeout 与 requestAnimationFrame

### 代码输出顺序

```js
console.log('A')

setTimeout(() => console.log('B'), 0)

Promise.resolve().then(() => {
  console.log('C')
  setTimeout(() => console.log('D'), 0)
})

queueMicrotask(() => console.log('E'))

console.log('F')
```

输出：`A F C E B D`

原因：

1. 同步代码先执行，输出 `A F`
2. 当前宏任务结束后，按入队顺序清空微任务，输出 `C E`
3. 再执行宏任务队列中的 `setTimeout`，`B` 先入队于 `D`，输出 `B D`

### setTimeout(0) vs requestAnimationFrame

- `setTimeout(fn, 0)`：进入宏任务队列，最早在下一轮事件循环执行
- `requestAnimationFrame(fn)`：不属于宏任务/微任务；在浏览器下一次绘制前执行
- 浏览器常见顺序：当前宏任务 -> 清空微任务 -> `requestAnimationFrame` 回调 -> 绘制 -> 下一个宏任务

### 掉帧时 rAF 的表现

- `requestAnimationFrame` 会跟随刷新节奏降频，不保证固定 16.7ms
- 主线程忙或页面隐藏时，回调会被延后，甚至暂停或强限频
- 动画应基于 `timestamp` 计算增量（delta time），不要假设固定帧间隔

### 微任务递归的风险与规避

- 风险：在微任务里不断创建微任务，会导致宏任务和渲染长期得不到执行（事件循环饥饿）
- 规避：分批处理任务，并定期切回宏任务（如 `setTimeout`）让出主线程

## await 的微任务陷阱

`await` 后面跟的值类型不同，产生的微任务数量不同：

```js
async function bar1() { return 3 }           // 返回普通值
async function bar2() { return Promise.resolve(3) } // 返回 Promise

async function foo1() {
  const r = await bar1() // await 拿到普通值，包装一次，1 个微任务
  console.log(r)
}

async function foo2() {
  const r = await bar2() // await 拿到 Promise，需要额外 .then() 解包，2 个微任务
  console.log(r)
}
```

**规则：await 后面如果是 thenable 对象，会多一次微任务来解包。** 这会影响与其他微任务的执行顺序。

```js
// 示例：await 普通值 vs Promise 值的顺序差异
async function test() {
  const r = await bar()  // bar 返回普通值 → console.log(r) 先于 C
                         // bar 返回 Promise  → C 先于 console.log(r)
  console.log(r)
}
test()
Promise.resolve().then(() => console.log('C'))
```
