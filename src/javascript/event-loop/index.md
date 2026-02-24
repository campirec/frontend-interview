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
│   I/O、UI rendering       │
│   requestAnimationFrame   │
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
