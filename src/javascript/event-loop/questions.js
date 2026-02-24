/**
 * Event Loop 经典题目
 * 运行每道题前先自己分析输出顺序，再执行验证
 */

// ============================================
// 题目 1：基础 - 同步 vs 微任务 vs 宏任务
// ============================================
function question1() {
  console.log('--- Question 1 ---')

  console.log('1')

  setTimeout(() => {
    console.log('2')
  }, 0)

  Promise.resolve().then(() => {
    console.log('3')
  })

  console.log('4')
}
// 输出：1 4 3 2
// 解析：同步代码先执行(1, 4) → 微任务(3) → 宏任务(2)

// ============================================
// 题目 2：微任务嵌套 - 微任务中产生新微任务
// ============================================
function question2() {
  console.log('--- Question 2 ---')

  setTimeout(() => console.log('A'), 0)

  Promise.resolve()
    .then(() => {
      console.log('B')
      Promise.resolve().then(() => {
        console.log('C')
      })
    })
    .then(() => {
      console.log('D')
    })

  console.log('E')
}
// 输出：E B C D A
// 解析：
// 同步：E
// 微任务第一轮：B → 产生新微任务 C，同时 .then(D) 也入队
// 微任务第二轮：C → D（C 先入队所以先执行）
// 宏任务：A

// ============================================
// 题目 3：async/await 的本质是 Promise
// ============================================
async function question3() {
  console.log('--- Question 3 ---')

  async function async1() {
    console.log('async1 start')
    await async2()
    // await 后面的代码相当于 .then() 回调，是微任务
    console.log('async1 end')
  }

  async function async2() {
    console.log('async2')
  }

  console.log('script start')

  setTimeout(() => {
    console.log('setTimeout')
  }, 0)

  async1()

  new Promise((resolve) => {
    // Promise 构造函数中的代码是同步执行的
    console.log('promise1')
    resolve()
  }).then(() => {
    console.log('promise2')
  })

  console.log('script end')
}
// 输出：script start → async1 start → async2 → promise1 → script end → async1 end → promise2 → setTimeout
// 解析：
// 同步：script start → async1 start → async2 → promise1 → script end
// 微任务：async1 end → promise2
// 宏任务：setTimeout

// ============================================
// 题目 4：setTimeout 嵌套与延迟
// ============================================
function question4() {
  console.log('--- Question 4 ---')

  setTimeout(() => {
    console.log('timeout1')
    Promise.resolve().then(() => {
      console.log('promise1')
    })
  }, 0)

  setTimeout(() => {
    console.log('timeout2')
    Promise.resolve().then(() => {
      console.log('promise2')
    })
  }, 0)
}
// 输出：timeout1 → promise1 → timeout2 → promise2
// 解析：每个宏任务执行完后，都会先清空微任务队列，再执行下一个宏任务
// 这道题证明了：微任务在两个宏任务之间执行

// ============================================
// 题目 5：综合 - Promise 构造函数 + resolve 时机
// ============================================
function question5() {
  console.log('--- Question 5 ---')

  const promise = new Promise((resolve, reject) => {
    console.log(1)
    setTimeout(() => {
      console.log(2)
      resolve('done')
      console.log(3)
    }, 0)
    console.log(4)
  })

  promise.then((val) => {
    console.log(val)
  })

  console.log(5)
}
// 输出：1 4 5 2 3 done
// 解析：
// 同步：1 → 4 → 5（Promise 构造函数同步执行，setTimeout 回调入宏任务队列）
// 宏任务：2 → 3（resolve 后 .then 回调入微任务队列，但 resolve 后面的同步代码继续执行）
// 微任务：done

// ============================================
// 运行所有题目
// ============================================
async function runAll() {
  question1()
  await delay(100)
  question2()
  await delay(100)
  await question3()
  await delay(100)
  question4()
  await delay(100)
  question5()
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 逐题运行，取消注释你想测试的题目：
// question1()
// question2()
// question3()
// question4()
// question5()
// runAll()

export { question1, question2, question3, question4, question5, runAll }
