# 异步编程

## 演进历程

```
回调函数 → Promise → Generator + co → async/await
```

## Promise

### 三种状态
- `pending` → `fulfilled`（不可逆）
- `pending` → `rejected`（不可逆）

### 核心特性
- 状态一旦改变就不可逆
- `.then()` 返回新的 Promise（支持链式调用）
- 构造函数中的代码同步执行，`.then()` 回调是微任务
- `.then()` 的回调返回值会被 `Promise.resolve()` 包装

### 静态方法

```js
// 全部成功才成功，一个失败就失败
Promise.all([p1, p2, p3])

// 全部 settled（无论成功失败），返回每个结果
Promise.allSettled([p1, p2, p3])
// [{ status: 'fulfilled', value }, { status: 'rejected', reason }]

// 第一个 settled 的结果（无论成功失败）
Promise.race([p1, p2, p3])

// 第一个成功的，全部失败才失败（AggregateError）
Promise.any([p1, p2, p3])
```

### 对比

| 方法 | 短路条件 | 返回值 |
|------|---------|--------|
| `all` | 任一 reject | 全部 fulfilled 的值数组 |
| `allSettled` | 不短路 | 全部结果数组 |
| `race` | 任一 settled | 第一个 settled 的值 |
| `any` | 任一 fulfill | 第一个 fulfilled 的值 |

## async/await

### 本质
- `async` 函数返回 Promise
- `await` 相当于 `.then()`，后面的代码是微任务
- `await` 会暂停当前 async 函数的执行，让出线程

### 错误处理

```js
// 方式 1：try/catch
async function foo() {
  try {
    const res = await fetchData()
  } catch (err) {
    console.error(err)
  }
}

// 方式 2：.catch()
async function bar() {
  const res = await fetchData().catch(err => {
    console.error(err)
    return null // 提供降级值
  })
}

// 方式 3：包装函数（Go 风格）
function to(promise) {
  return promise
    .then(data => [null, data])
    .catch(err => [err, null])
}

async function baz() {
  const [err, data] = await to(fetchData())
  if (err) return console.error(err)
}
```

### 并发控制

```js
// 串行 — 一个接一个
for (const url of urls) {
  await fetch(url)
}

// 并行 — 同时发起
await Promise.all(urls.map(url => fetch(url)))

// 并发限制 — 控制同时进行的数量
async function asyncPool(limit, items, fn) {
  const results = []
  const executing = new Set()

  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item))
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
```

## Generator

```js
function* gen() {
  const a = yield 1
  const b = yield a + 2
  return b
}

const it = gen()
it.next()    // { value: 1, done: false }
it.next(10)  // { value: 12, done: false }  — a = 10
it.next(20)  // { value: 20, done: true }   — b = 20
```

- `yield` 暂停执行，`next()` 恢复执行
- `next(val)` 的参数作为上一个 `yield` 表达式的返回值
- Generator + Promise 是 async/await 的前身
