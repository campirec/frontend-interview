/**
 * ES6+ 核心特性经典题目
 */

// ============================================
// 题目 1：手写简易响应式（Proxy + Reflect）
// ============================================
function question1() {
  console.log('--- Question 1 ---')

  function reactive(target) {
    return new Proxy(target, {
      get(target, key, receiver) {
        const result = Reflect.get(target, key, receiver)
        console.log(`get ${key}:`, result)
        // 深层代理：访问时才递归（惰性）
        if (typeof result === 'object' && result !== null) {
          return reactive(result)
        }
        return result
      },
      set(target, key, value, receiver) {
        const oldValue = target[key]
        const result = Reflect.set(target, key, value, receiver)
        if (oldValue !== value) {
          console.log(`set ${key}: ${oldValue} → ${value}`)
        }
        return result
      },
      deleteProperty(target, key) {
        console.log(`delete ${key}`)
        return Reflect.deleteProperty(target, key)
      },
    })
  }

  const state = reactive({ count: 0, nested: { a: 1 } })
  state.count // get count: 0
  state.count = 1 // set count: 0 → 1
  state.nested.a = 2 // get nested → get a → set a: 1 → 2
  state.newProp = 'hello' // set newProp: undefined → hello（Proxy 能监听新增属性）
}

// ============================================
// 题目 2：Symbol 的实际应用
// ============================================
function question2() {
  console.log('--- Question 2 ---')

  // 用 Symbol 实现私有属性
  const _balance = Symbol('balance')

  class BankAccount {
    constructor(initial) {
      this[_balance] = initial
    }

    deposit(amount) {
      this[_balance] += amount
    }

    get balance() {
      return this[_balance]
    }
  }

  const account = new BankAccount(100)
  account.deposit(50)
  console.log(account.balance) // 150
  console.log(Object.keys(account)) // [] — Symbol 属性不会被枚举
  console.log(Object.getOwnPropertySymbols(account)) // [Symbol(balance)]

  // 自定义 Symbol.toPrimitive
  class Money {
    constructor(amount, currency) {
      this.amount = amount
      this.currency = currency
    }

    [Symbol.toPrimitive](hint) {
      if (hint === 'number') return this.amount
      if (hint === 'string') return `${this.amount} ${this.currency}`
      return this.amount // default
    }
  }

  const price = new Money(99.9, 'CNY')
  console.log(+price) // 99.9
  console.log(`${price}`) // '99.9 CNY'
  console.log(price + 1) // 100.9
}

// ============================================
// 题目 3：自定义可迭代对象
// ============================================
function question3() {
  console.log('--- Question 3 ---')

  // 实现一个无限斐波那契迭代器
  function fibonacci() {
    let [a, b] = [0, 1]
    return {
      [Symbol.iterator]() {
        return this
      },
      next() {
        ;[a, b] = [b, a + b]
        return { value: a, done: false }
      },
    }
  }

  // 取前 10 个
  const first10 = []
  for (const n of fibonacci()) {
    if (first10.length >= 10) break
    first10.push(n)
  }
  console.log(first10) // [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]

  // 实现 range 函数
  function range(start, end, step = 1) {
    return {
      [Symbol.iterator]() {
        let current = start
        return {
          next() {
            if (current < end) {
              const value = current
              current += step
              return { value, done: false }
            }
            return { done: true }
          },
        }
      },
    }
  }

  console.log([...range(0, 10, 2)]) // [0, 2, 4, 6, 8]
}

// ============================================
// 题目 4：WeakMap 实际应用
// ============================================
function question4() {
  console.log('--- Question 4 ---')

  // 应用 1：缓存计算结果（对象被 GC 后缓存自动清除）
  const cache = new WeakMap()

  function heavyCompute(obj) {
    if (cache.has(obj)) {
      console.log('cache hit')
      return cache.get(obj)
    }
    const result = { ...obj, computed: true }
    cache.set(obj, result)
    console.log('cache miss')
    return result
  }

  const data = { id: 1 }
  heavyCompute(data) // cache miss
  heavyCompute(data) // cache hit

  // 应用 2：真正的私有属性
  const privateData = new WeakMap()

  class User {
    constructor(name, password) {
      privateData.set(this, { password })
      this.name = name
    }

    checkPassword(input) {
      return privateData.get(this).password === input
    }
  }

  const user = new User('Alice', 'secret')
  console.log(user.name) // 'Alice'
  console.log(user.password) // undefined — 真正不可访问
  console.log(user.checkPassword('secret')) // true
}

// ============================================
// 题目 5：解构的高级用法
// ============================================
function question5() {
  console.log('--- Question 5 ---')

  // 交换变量
  let a = 1, b = 2
  ;[a, b] = [b, a]
  console.log(a, b) // 2 1

  // 函数参数解构 + 默认值
  function createUser({
    name = 'Anonymous',
    role = 'user',
    permissions = [],
  } = {}) {
    return { name, role, permissions }
  }

  console.log(createUser()) // { name: 'Anonymous', role: 'user', permissions: [] }
  console.log(createUser({ name: 'Admin', role: 'admin' }))

  // 嵌套解构 + 重命名
  const response = {
    data: {
      users: [
        { id: 1, profile: { name: 'Alice', avatar: 'a.png' } },
      ],
    },
  }

  const {
    data: {
      users: [{ profile: { name: userName, avatar } }],
    },
  } = response

  console.log(userName, avatar) // 'Alice' 'a.png'

  // 迭代器解构
  const [first, , third] = 'abcde'
  console.log(first, third) // 'a' 'c'

  const [head, ...tail] = [1, 2, 3, 4]
  console.log(head, tail) // 1 [2, 3, 4]
}

// question1()
// question2()
// question3()
// question4()
// question5()

export { question1, question2, question3, question4, question5 }
