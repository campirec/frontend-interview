/**
 * 异步编程经典题目
 */

// ============================================
// 题目 1：手写 Promise
// ============================================
class MyPromise {
  #state = 'pending'
  #value = undefined
  #handlers = []

  constructor(executor) {
    const resolve = (value) => {
      if (this.#state !== 'pending') return
      // 如果 resolve 的值是 thenable，递归解析
      if (value && typeof value.then === 'function') {
        value.then(resolve, reject)
        return
      }
      this.#state = 'fulfilled'
      this.#value = value
      this.#handlers.forEach(h => h.onFulfilled(value))
    }

    const reject = (reason) => {
      if (this.#state !== 'pending') return
      this.#state = 'rejected'
      this.#value = reason
      this.#handlers.forEach(h => h.onRejected(reason))
    }

    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handle = () => {
        // 用 queueMicrotask 模拟异步
        queueMicrotask(() => {
          try {
            if (this.#state === 'fulfilled') {
              const result = typeof onFulfilled === 'function'
                ? onFulfilled(this.#value)
                : this.#value
              resolve(result)
            }
            if (this.#state === 'rejected') {
              if (typeof onRejected === 'function') {
                resolve(onRejected(this.#value))
              } else {
                reject(this.#value)
              }
            }
          } catch (err) {
            reject(err)
          }
        })
      }

      if (this.#state === 'pending') {
        this.#handlers.push({
          onFulfilled: () => handle(),
          onRejected: () => handle(),
        })
      } else {
        handle()
      }
    })
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value),
      reason => MyPromise.resolve(callback()).then(() => { throw reason }),
    )
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value
    return new MyPromise(resolve => resolve(value))
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason))
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = []
      let count = 0
      const items = Array.from(promises)
      if (items.length === 0) return resolve([])

      items.forEach((p, i) => {
        MyPromise.resolve(p).then(
          (value) => {
            results[i] = value
            if (++count === items.length) resolve(results)
          },
          reject,
        )
      })
    })
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      for (const p of promises) {
        MyPromise.resolve(p).then(resolve, reject)
      }
    })
  }

  static allSettled(promises) {
    return new MyPromise((resolve) => {
      const results = []
      let count = 0
      const items = Array.from(promises)
      if (items.length === 0) return resolve([])

      items.forEach((p, i) => {
        MyPromise.resolve(p).then(
          (value) => {
            results[i] = { status: 'fulfilled', value }
            if (++count === items.length) resolve(results)
          },
          (reason) => {
            results[i] = { status: 'rejected', reason }
            if (++count === items.length) resolve(results)
          },
        )
      })
    })
  }

  static any(promises) {
    return new MyPromise((resolve, reject) => {
      const errors = []
      let count = 0
      const items = Array.from(promises)
      if (items.length === 0) {
        return reject(new AggregateError([], 'All promises were rejected'))
      }

      items.forEach((p, i) => {
        MyPromise.resolve(p).then(
          resolve,
          (reason) => {
            errors[i] = reason
            if (++count === items.length) {
              reject(new AggregateError(errors, 'All promises were rejected'))
            }
          },
        )
      })
    })
  }
}

// ============================================
// 题目 2：Promise 输出顺序
// ============================================
function question2() {
  console.log('--- Question 2 ---')

  const p = new Promise((resolve) => {
    console.log(1)
    resolve()
    console.log(2) // resolve 后同步代码继续执行
  })

  p.then(() => {
    console.log(3)
  })

  p.then(() => {
    console.log(4)
  })

  console.log(5)
}
// 输出：1 2 5 3 4
// 解析：构造函数同步执行(1, 2) → 同步代码(5) → 微任务(3, 4)

// ============================================
// 题目 3：Promise 链式调用的值传递
// ============================================
function question3() {
  console.log('--- Question 3 ---')

  Promise.resolve(1)
    .then((val) => {
      console.log(val) // 1
      return val + 1
    })
    .then((val) => {
      console.log(val) // 2
      // 没有 return，默认返回 undefined
    })
    .then((val) => {
      console.log(val) // undefined
      return Promise.resolve(3)
    })
    .then((val) => {
      console.log(val) // 3 — Promise.resolve(3) 被自动解包
    })
}

// ============================================
// 题目 4：async/await 错误处理
// ============================================
async function question4() {
  console.log('--- Question 4 ---')

  // Go 风格错误处理
  function to(promise) {
    return promise
      .then(data => [null, data])
      .catch(err => [err, null])
  }

  // 模拟 API
  function fetchUser(id) {
    if (id === 1) return Promise.resolve({ id: 1, name: 'Alice' })
    return Promise.reject(new Error('User not found'))
  }

  const [err1, user1] = await to(fetchUser(1))
  console.log(err1, user1) // null { id: 1, name: 'Alice' }

  const [err2, user2] = await to(fetchUser(999))
  console.log(err2?.message, user2) // 'User not found' null
}

// ============================================
// 题目 5：并发控制 - asyncPool
// ============================================
async function question5() {
  console.log('--- Question 5 ---')

  async function asyncPool(limit, items, fn) {
    const results = []
    const executing = new Set()

    for (const [index, item] of items.entries()) {
      const p = Promise.resolve().then(() => fn(item, index))
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

  // 模拟异步任务
  const delay = (ms, val) =>
    new Promise(resolve => setTimeout(() => {
      console.log(`Done: ${val}`)
      resolve(val)
    }, ms))

  const items = [1, 2, 3, 4, 5]
  const results = await asyncPool(2, items, (item) => delay(item * 100, item))
  console.log('All done:', results) // [1, 2, 3, 4, 5]
}

// ============================================
// 题目 6：实现带取消功能的 Promise
// ============================================
function question6() {
  console.log('--- Question 6 ---')

  // 方式 1：AbortController（推荐）
  function cancellableFetch(url, signal) {
    return fetch(url, { signal })
  }

  // 方式 2：手动实现可取消 Promise
  function cancellable(promise) {
    let isCancelled = false

    const wrappedPromise = new Promise((resolve, reject) => {
      promise.then(
        (val) => isCancelled ? reject(new Error('Cancelled')) : resolve(val),
        (err) => isCancelled ? reject(new Error('Cancelled')) : reject(err),
      )
    })

    return {
      promise: wrappedPromise,
      cancel() {
        isCancelled = true
      },
    }
  }

  // 方式 3：超时控制
  function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms),
    )
    return Promise.race([promise, timeout])
  }

  // 测试超时
  const slow = new Promise(resolve => setTimeout(() => resolve('done'), 5000))
  withTimeout(slow, 1000)
    .then(console.log)
    .catch(err => console.log(err.message)) // 'Timeout'
}

// question2()
// question3()
// question4()
// question5()
// question6()

export { MyPromise, question2, question3, question4, question5, question6 }
