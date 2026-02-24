/**
 * 作用域与闭包经典题目
 */

// ============================================
// 题目 1：经典闭包 - 循环中的 var
// ============================================
function question1() {
  console.log('--- Question 1 ---')

  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log('var:', i), 0)
  }
  // 输出：var: 3, var: 3, var: 3
  // var 没有块级作用域，循环结束后 i = 3，三个回调共享同一个 i

  // 修复方案 1：let
  for (let j = 0; j < 3; j++) {
    setTimeout(() => console.log('let:', j), 0)
  }
  // 输出：let: 0, let: 1, let: 2

  // 修复方案 2：IIFE 创建独立作用域
  for (var k = 0; k < 3; k++) {
    ;((k) => {
      setTimeout(() => console.log('iife:', k), 0)
    })(k)
  }
  // 输出：iife: 0, iife: 1, iife: 2
}

// ============================================
// 题目 2：闭包 - 数据私有化
// ============================================
function question2() {
  console.log('--- Question 2 ---')

  function createPerson(name) {
    // name 被闭包捕获，外部无法直接访问
    return {
      getName() {
        return name
      },
      setName(newName) {
        // 可以在这里加验证逻辑
        if (typeof newName !== 'string' || newName.length === 0) {
          throw new Error('Invalid name')
        }
        name = newName
      },
    }
  }

  const person = createPerson('Alice')
  console.log(person.getName()) // 'Alice'
  console.log(person.name) // undefined — 无法直接访问
  person.setName('Bob')
  console.log(person.getName()) // 'Bob'
}

// ============================================
// 题目 3：闭包 - 函数工厂与柯里化
// ============================================
function question3() {
  console.log('--- Question 3 ---')

  // 函数工厂
  function multiply(x) {
    return function (y) {
      return x * y
    }
  }

  const double = multiply(2)
  const triple = multiply(3)
  console.log(double(5)) // 10
  console.log(triple(5)) // 15

  // 通用柯里化
  function curry(fn) {
    return function curried(...args) {
      if (args.length >= fn.length) {
        return fn.apply(this, args)
      }
      return function (...moreArgs) {
        return curried.apply(this, [...args, ...moreArgs])
      }
    }
  }

  const add = (a, b, c) => a + b + c
  const curriedAdd = curry(add)
  console.log(curriedAdd(1)(2)(3)) // 6
  console.log(curriedAdd(1, 2)(3)) // 6
  console.log(curriedAdd(1)(2, 3)) // 6
}

// ============================================
// 题目 4：变量提升陷阱
// ============================================
function question4() {
  console.log('--- Question 4 ---')

  // 函数声明 vs 函数表达式
  console.log(typeof foo) // 'function' — 函数声明整体提升
  console.log(typeof bar) // 'undefined' — var 提升但值为 undefined

  function foo() {
    return 'foo'
  }
  var bar = function () {
    return 'bar'
  }

  // 同名变量和函数
  console.log(a) // ƒ a() {} — 函数声明优先级高于 var
  var a = 1
  function a() {}
  console.log(a) // 1 — 赋值覆盖了函数
}

// ============================================
// 题目 5：作用域链 - 词法作用域 vs 动态作用域
// ============================================
function question5() {
  console.log('--- Question 5 ---')

  const value = 'global'

  function foo() {
    console.log(value) // 'global' — 词法作用域，定义时确定
  }

  function bar() {
    const value = 'local'
    foo() // foo 的作用域链在定义时就确定了，不受调用位置影响
  }

  bar()
}

// ============================================
// 题目 6：闭包经典面试题
// ============================================
function question6() {
  console.log('--- Question 6 ---')

  function fun(n, o) {
    console.log(o)
    return {
      fun(m) {
        return fun(m, n)
      },
    }
  }

  var a = fun(0)    // undefined（第一次调用，o 没传）
  a.fun(1)          // 0（n=1, o=0，这里的 n 是外层闭包捕获的 0）
  a.fun(2)          // 0（同上，a 始终引用 fun(0) 返回的对象）
  a.fun(3)          // 0

  var b = fun(0).fun(1).fun(2).fun(3)
  // undefined → 0 → 1 → 2（链式调用，每次 n 都更新）

  var c = fun(0)    // undefined
  var c1 = c.fun(1) // 0
  var c2 = c1.fun(2) // 1
  var c3 = c2.fun(3) // 2
}

// question1()
// question2()
// question3()
// question4()
// question5()
// question6()

export { question1, question2, question3, question4, question5, question6 }
