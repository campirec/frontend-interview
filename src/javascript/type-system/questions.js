/**
 * 类型系统经典题目
 */

// ============================================
// 题目 1：通用类型判断
// ============================================
function question1() {
  console.log('--- Question 1 ---')

  function getType(value) {
    if (value === null) return 'null'
    if (typeof value !== 'object') return typeof value
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
  }

  console.log(getType(42))            // 'number'
  console.log(getType('hello'))       // 'string'
  console.log(getType(true))          // 'boolean'
  console.log(getType(undefined))     // 'undefined'
  console.log(getType(null))          // 'null'
  console.log(getType(Symbol()))      // 'symbol'
  console.log(getType(42n))           // 'bigint'
  console.log(getType({}))            // 'object'
  console.log(getType([]))            // 'array'
  console.log(getType(/regex/))       // 'regexp'
  console.log(getType(new Date()))    // 'date'
  console.log(getType(new Map()))     // 'map'
  console.log(getType(new Set()))     // 'set'
  console.log(getType(() => {}))      // 'function'
  console.log(getType(new Error()))   // 'error'
}

// ============================================
// 题目 2：隐式转换输出题
// ============================================
function question2() {
  console.log('--- Question 2 ---')

  // + 运算符
  console.log(1 + '2')         // '12' — 字符串拼接
  console.log(1 + 2 + '3')    // '33' — 先算 1+2=3，再 '3'+'3'
  console.log('1' + 2 + 3)    // '123' — 从左到右，一旦遇到字符串就拼接
  console.log(+true)           // 1
  console.log(+'')             // 0
  console.log(+null)           // 0
  console.log(+undefined)      // NaN
  console.log(+{})             // NaN

  // == 比较
  console.log([] == ![])       // true → [] == false → 0 == 0
  console.log('' == false)     // true → 0 == 0
  console.log(null == 0)       // false — null 只和 undefined 宽松相等
  console.log(null == undefined) // true

  // 对象转原始值
  console.log([] + [])         // '' — 两边 toString 都是 ''
  console.log([] + {})         // '[object Object]'
  console.log(+[])             // 0 — [].toString() = '' → Number('') = 0
  console.log(+[1])            // 1
  console.log(+[1, 2])         // NaN
}

// ============================================
// 题目 3：== 的完整转换规则
// ============================================
function question3() {
  console.log('--- Question 3 ---')

  // 规则：
  // 1. null == undefined → true（且它们不等于其他任何值）
  // 2. 有 NaN → false
  // 3. Boolean 先转 Number
  // 4. String vs Number → String 转 Number
  // 5. Object vs 原始值 → Object 调用 ToPrimitive

  // 经典：[] == false 的转换过程
  // [] == false
  // → [] == 0          (Boolean 转 Number)
  // → '' == 0          ([] ToPrimitive → '')
  // → 0 == 0           (String 转 Number)
  // → true

  // 经典：[] == ![] 的转换过程
  // [] == ![]
  // → [] == false       (![] 先求值，[] 是 truthy，所以 ![] = false)
  // → 后续同上 → true

  // 验证
  console.log([] == false)  // true
  console.log([] == ![])    // true
  console.log('' == 0)      // true
  console.log('0' == false) // true → '0' == 0 → 0 == 0
  console.log(' ' == false) // true → ' ' == 0 → 0 == 0
}

// ============================================
// 题目 4：Object.is 与 === 的区别
// ============================================
function question4() {
  console.log('--- Question 4 ---')

  // 手写 Object.is
  function objectIs(a, b) {
    if (a === b) {
      // 处理 +0 !== -0 的情况
      // 1/+0 = Infinity, 1/-0 = -Infinity
      return a !== 0 || 1 / a === 1 / b
    }
    // 处理 NaN === NaN 的情况
    // NaN 是唯一不等于自身的值
    return a !== a && b !== b
  }

  console.log(objectIs(NaN, NaN))   // true（=== 为 false）
  console.log(objectIs(+0, -0))     // false（=== 为 true）
  console.log(objectIs(1, 1))       // true
  console.log(objectIs(null, null)) // true
}

// ============================================
// 题目 5：深拷贝（处理各种类型）
// ============================================
function question5() {
  console.log('--- Question 5 ---')

  function deepClone(value, map = new WeakMap()) {
    // 原始类型直接返回
    if (value === null || typeof value !== 'object') return value

    // 处理循环引用
    if (map.has(value)) return map.get(value)

    // 处理特殊对象
    if (value instanceof Date) return new Date(value)
    if (value instanceof RegExp) return new RegExp(value.source, value.flags)
    if (value instanceof Map) {
      const result = new Map()
      map.set(value, result)
      value.forEach((v, k) => result.set(deepClone(k, map), deepClone(v, map)))
      return result
    }
    if (value instanceof Set) {
      const result = new Set()
      map.set(value, result)
      value.forEach(v => result.add(deepClone(v, map)))
      return result
    }

    // 处理数组和普通对象
    const result = Array.isArray(value) ? [] : {}
    map.set(value, result)

    // 拷贝 Symbol 属性和普通属性
    const keys = [...Object.keys(value), ...Object.getOwnPropertySymbols(value)]
    for (const key of keys) {
      result[key] = deepClone(value[key], map)
    }

    return result
  }

  // 测试
  const sym = Symbol('test')
  const original = {
    num: 1,
    str: 'hello',
    bool: true,
    nil: null,
    undef: undefined,
    arr: [1, [2, 3]],
    date: new Date('2024-01-01'),
    regex: /test/gi,
    map: new Map([['a', 1]]),
    set: new Set([1, 2, 3]),
    [sym]: 'symbol value',
    nested: { deep: { value: 42 } },
  }
  // 循环引用
  original.self = original

  const cloned = deepClone(original)

  console.log(cloned.nested.deep.value) // 42
  console.log(cloned.nested !== original.nested) // true — 深拷贝
  console.log(cloned.self === cloned) // true — 循环引用正确处理
  console.log(cloned.date instanceof Date) // true
  console.log(cloned.date !== original.date) // true
  console.log(cloned[sym]) // 'symbol value'

  // 也可以用 structuredClone（原生 API，不支持 Symbol 属性和函数）
  // const cloned2 = structuredClone(original)
}

// ============================================
// 题目 6：类型转换面试题合集
// ============================================
function question6() {
  console.log('--- Question 6 ---')

  // 经典：如何让 a == 1 && a == 2 && a == 3 为 true
  // 方式 1：自定义 valueOf
  const a1 = {
    value: 1,
    valueOf() {
      return this.value++
    },
  }
  console.log(a1 == 1 && a1 == 2 && a1 == 3) // true

  // 方式 2：自定义 Symbol.toPrimitive
  const a2 = {
    value: 1,
    [Symbol.toPrimitive]() {
      return this.value++
    },
  }
  console.log(a2 == 1 && a2 == 2 && a2 == 3) // true

  // 方式 3：数组 + toString 劫持
  const a3 = [1, 2, 3]
  a3.toString = a3.shift
  console.log(a3 == 1 && a3 == 2 && a3 == 3) // true

  // 经典：{} + [] vs [] + {}
  // {} + [] → 0（{} 被解析为空代码块，+[] = 0）— 仅在语句位置
  // [] + {} → '[object Object]'
  console.log([] + {}) // '[object Object]'
  console.log({} + []) // '[object Object]'（在表达式位置，{} 是对象字面量）
}

// question1()
// question2()
// question3()
// question4()
// question5()
// question6()

export { question1, question2, question3, question4, question5, question6 }
