/**
 * this 指向经典题目
 */

// ============================================
// 题目 1：隐式绑定与丢失
// ============================================
function question1() {
  console.log('--- Question 1 ---')

  const obj = {
    a: 1,
    foo() {
      console.log(this.a)
    },
  }

  obj.foo() // 1 — 隐式绑定

  const fn = obj.foo
  fn() // undefined — 隐式绑定丢失，默认绑定到 globalThis

  const obj2 = { a: 2, foo: obj.foo }
  obj2.foo() // 2 — 隐式绑定到 obj2（谁调用指向谁）
}

// ============================================
// 题目 2：显式绑定 call / apply / bind
// ============================================
function question2() {
  console.log('--- Question 2 ---')

  function greet(greeting, punctuation) {
    console.log(`${greeting}, ${this.name}${punctuation}`)
  }

  const person = { name: 'Alice' }

  greet.call(person, 'Hello', '!') // 'Hello, Alice!'
  greet.apply(person, ['Hi', '.']) // 'Hi, Alice.'

  const bound = greet.bind(person, 'Hey')
  bound('?') // 'Hey, Alice?'

  // bind 后再 bind 无效
  const bound2 = bound.bind({ name: 'Bob' }, 'Yo')
  bound2('~') // 'Hey, Alice?' — this 仍然是 person，第一次 bind 的参数 'Hey' 也保留
}

// ============================================
// 题目 3：箭头函数 this
// ============================================
function question3() {
  console.log('--- Question 3 ---')

  const obj = {
    name: 'Alice',
    foo() {
      // 普通函数，this = obj
      const bar = () => {
        // 箭头函数，继承 foo 的 this
        console.log(this.name)
      }
      bar() // 'Alice'
      bar.call({ name: 'Bob' }) // 'Alice' — call 对箭头函数无效
    },
    // 箭头函数作为方法（反模式）
    baz: () => {
      console.log(this) // globalThis/undefined — 外层是模块作用域
    },
  }

  obj.foo()
  obj.baz()
}

// ============================================
// 题目 4：手写 call / apply / bind
// ============================================
function question4() {
  console.log('--- Question 4 ---')

  // 手写 call
  Function.prototype.myCall = function (ctx, ...args) {
    ctx = ctx === null || ctx === undefined ? globalThis : Object(ctx)
    const key = Symbol('fn')
    ctx[key] = this
    const result = ctx[key](...args)
    delete ctx[key]
    return result
  }

  // 手写 apply
  Function.prototype.myApply = function (ctx, args = []) {
    ctx = ctx === null || ctx === undefined ? globalThis : Object(ctx)
    const key = Symbol('fn')
    ctx[key] = this
    const result = ctx[key](...args)
    delete ctx[key]
    return result
  }

  // 手写 bind
  Function.prototype.myBind = function (ctx, ...args) {
    const fn = this
    return function bound(...moreArgs) {
      // 支持 new 调用 bind 返回的函数
      if (new.target) {
        return new fn(...args, ...moreArgs)
      }
      return fn.apply(ctx, [...args, ...moreArgs])
    }
  }

  // 测试
  function sayName(prefix) {
    return `${prefix} ${this.name}`
  }

  const obj = { name: 'Alice' }
  console.log(sayName.myCall(obj, 'Hello')) // 'Hello Alice'
  console.log(sayName.myApply(obj, ['Hi'])) // 'Hi Alice'
  console.log(sayName.myBind(obj, 'Hey')()) // 'Hey Alice'
}

// ============================================
// 题目 5：综合 this 判断
// ============================================
function question5() {
  console.log('--- Question 5 ---')

  var name = 'global'

  const obj = {
    name: 'obj',
    fn1: function () {
      console.log(this.name)
    },
    fn2: () => {
      console.log(this.name)
    },
    fn3: function () {
      return function () {
        console.log(this.name)
      }
    },
    fn4: function () {
      return () => {
        console.log(this.name)
      }
    },
  }

  obj.fn1() // 'obj' — 隐式绑定
  obj.fn2() // undefined — 箭头函数，this 是外层模块作用域
  obj.fn3()() // undefined — 返回的普通函数独立调用，默认绑定
  obj.fn4()() // 'obj' — 返回的箭头函数继承 fn4 的 this

  const { fn1 } = obj
  fn1() // undefined — 解构后丢失隐式绑定
}

// ============================================
// 题目 6：class 中的 this
// ============================================
function question6() {
  console.log('--- Question 6 ---')

  class Counter {
    count = 0

    // 普通方法 — 传递后 this 丢失
    increment() {
      this.count++
    }

    // 箭头函数属性 — this 永远指向实例
    decrement = () => {
      this.count--
    }
  }

  const counter = new Counter()

  // 模拟传递给回调
  const inc = counter.increment
  try {
    inc() // TypeError: Cannot read property 'count' of undefined（严格模式）
  } catch (e) {
    console.log('increment 丢失 this')
  }

  const dec = counter.decrement
  dec() // 正常工作，箭头函数绑定了实例
  console.log(counter.count) // -1

  // 另一种修复方式：在构造函数中 bind
  class Counter2 {
    count = 0
    constructor() {
      this.increment = this.increment.bind(this)
    }
    increment() {
      this.count++
    }
  }
}

// question1()
// question2()
// question3()
// question4()
// question5()
// question6()

export { question1, question2, question3, question4, question5, question6 }
