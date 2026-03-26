# 类型系统深入

## 数据类型

### 原始类型（7 种）
`string`、`number`、`boolean`、`undefined`、`null`、`symbol`、`bigint`

### 引用类型
`Object`（包括 Array、Function、Date、RegExp、Map、Set 等）

### 存储区别
- 原始类型 → 栈内存（值本身）
- 引用类型 → 堆内存（栈中存引用地址）

## 类型判断

### typeof
```js
typeof 'str'        // 'string'
typeof 42           // 'number'
typeof true         // 'boolean'
typeof undefined    // 'undefined'
typeof Symbol()     // 'symbol'
typeof 42n          // 'bigint'
typeof null         // 'object'  ← 历史 bug
typeof {}           // 'object'
typeof []           // 'object'  ← 无法区分数组
typeof function(){} // 'function'
```

### instanceof
沿原型链查找，只能判断引用类型。

### Object.prototype.toString.call() — 最准确
```js
Object.prototype.toString.call(null)      // '[object Null]'
Object.prototype.toString.call([])        // '[object Array]'
Object.prototype.toString.call(/regex/)   // '[object RegExp]'
Object.prototype.toString.call(new Map()) // '[object Map]'
```

### 通用类型判断函数
```js
function getType(value) {
  if (value === null) return 'null'
  if (typeof value !== 'object') return typeof value
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}
```

## 隐式类型转换

### 转换规则

#### ToPrimitive(input, hint)
对象转原始值时调用，hint 为 'number'、'string' 或 'default'：
1. 如果有 `[Symbol.toPrimitive]`，直接调用
2. hint 为 'string'：先 `toString()`，再 `valueOf()`
3. hint 为 'number'/'default'：先 `valueOf()`，再 `toString()`

#### 常见转换
```js
// 转 Number
Number('')        // 0
Number(' ')       // 0
Number(null)      // 0
Number(undefined) // NaN
Number(false)     // 0
Number(true)      // 1
Number([])        // 0    → [].toString() = '' → Number('') = 0
Number([1])       // 1    → [1].toString() = '1'
Number([1,2])     // NaN  → [1,2].toString() = '1,2'
Number({})        // NaN

// 转 String
String(null)      // 'null'
String(undefined) // 'undefined'
String(true)      // 'true'
String([1,2])     // '1,2'
String({})        // '[object Object]'
```

### 经典陷阱

```js
// == 的隐式转换
[] == ![]     // true  → [] == false → 0 == 0
[] == false   // true  → 0 == 0
'' == false   // true  → 0 == 0
null == undefined // true（特殊规则）
null == 0     // false（null 只和 undefined 宽松相等）
NaN == NaN    // false（NaN 不等于任何值）

// + 运算符
1 + '2'       // '12'（有字符串则拼接）
1 + true      // 2（转数字）
'1' + true    // '1true'（有字符串则拼接）
[] + []        // ''（两边 ToPrimitive 都是 ''）
[] + {}        // '[object Object]'
{} + []        // 0（{} 被解析为空代码块，+[] = 0）
```

### 数组与对象的隐式转换详解

这是面试中最容易翻车的部分，需要掌握每一步的推导链路。

#### 前置知识：数组的 ToPrimitive

```
[].valueOf()  → []（返回自身，不是原始值，继续）
[].toString() → ''

[1].valueOf()    → [1]
[1].toString()   → '1'

[1,2].valueOf()  → [1,2]
[1,2].toString() → '1,2'
```

#### `[] == ![]` → true

```
第 1 步：![] → false（[] 是对象，是 truthy，取反得 false）
第 2 步：[] == false
第 3 步：== 规则 — 布尔值先转数字 → [] == 0
第 4 步：== 规则 — 对象和数字比较，对象先 ToPrimitive
         [].valueOf() → []（不是原始值）
         [].toString() → ''
         '' == 0
第 5 步：字符串和数字比较，字符串转数字 → 0 == 0
结果：true
```

#### `[] == false` → true

```
第 1 步：布尔值先转数字 → [] == 0
第 2 步：对象 ToPrimitive → '' == 0
第 3 步：字符串转数字 → 0 == 0
结果：true
```

#### `!![] == true` → true

```
第 1 步：![] → false（[] 是 truthy）
第 2 步：!![] → true
第 3 步：true == true
结果：true（这里没有隐式转换，直接比较）
```

#### `[1] + [2]` → '12'

```
+ 运算符：两边都不是原始值，先 ToPrimitive（hint: default）
[1].valueOf() → [1]（不是原始值）→ [1].toString() → '1'
[2].valueOf() → [2]（不是原始值）→ [2].toString() → '2'
有一边是字符串 → 字符串拼接：'1' + '2' → '12'
```

#### `+[]` → 0 / `+[1]` → 1 / `+[1,2]` → NaN

```
一元 + 运算符：将操作数转为 Number

+[]    → Number([]) → Number('') → 0
+[1]   → Number([1]) → Number('1') → 1
+[1,2] → Number([1,2]) → Number('1,2') → NaN
```

#### `[] + {}` → '[object Object]'

```
+ 运算符，两边 ToPrimitive：
[].toString()  → ''
({}).toString() → '[object Object]'
字符串拼接：'' + '[object Object]' → '[object Object]'
```

#### `{} + []` → 0（语句上下文）或 '[object Object]'（表达式上下文）

```
语句上下文（直接在控制台输入）：
  {} 被解析为空代码块（不是对象字面量）
  变成 +[]
  +[] → Number('') → 0

表达式上下文（赋值、括号包裹）：
  ({}) + [] → '[object Object]' + '' → '[object Object]'

验证：
console.log({} + [])  // '[object Object]' — 这里 {} 在表达式位置
({} + [])             // '[object Object]'
```

> **记忆口诀**：`==` 比较对象时走 ToPrimitive（valueOf → toString），`+` 运算有字符串就拼接，`{}` 在行首是代码块不是对象。

### Symbol.toPrimitive 优先级

当对象定义了 `[Symbol.toPrimitive]` 方法时，它的优先级**最高**，完全覆盖 `valueOf` 和 `toString`。

#### 不同场景的 hint 类型

| 场景 | hint | 示例 |
|------|------|------|
| 一元 `+` / `-` | `'number'` | `+obj`, `-obj` |
| 模板字符串 | `'string'` | `` `${obj}` `` |
| `+` 运算符 | `'default'` | `obj + 1` |
| `==` 比较 | `'number'` | `obj == 1` |
| `===` 比较 | 不转换 | `obj === 1`（永远 false） |

#### 题目示例

```js
const obj = {
  valueOf: () => 100,
  toString: () => '200',
  [Symbol.toPrimitive]: (hint) => {
    if (hint === 'number') return 300
    if (hint === 'string') return '400'
    return 500  // hint === 'default'
  }
}

console.log(+obj)        // 300  ← hint: 'number'
console.log(`${obj}`)    // '400' ← hint: 'string'
console.log(obj + '')    // '500' ← hint: 'default' → 500 + '' = '500'
console.log(obj == 500)  // false ← hint: 'number' → 300 == 500
console.log(obj === 500) // false ← === 不转换类型
```

**易错点**：
1. `obj + ''` 的 hint 是 `'default'`（不是 'string'），返回 500 后再与空字符串拼接成 `'500'`
2. `===` 永远不做类型转换，对象和数字类型不同直接返回 `false`
3. `valueOf` 和 `toString` **不会被调用**，因为 `[Symbol.toPrimitive]` 优先级最高

**记忆口诀**：有 `Symbol.toPrimitive` 就走它，不同场景传不同 hint。`+` 运算符是 `'default'`，模板字符串是 `'string'`，一元运算符和 `==` 是 `'number'`。

## 相等性比较

| 比较 | 类型转换 | NaN | null/undefined |
|------|---------|-----|----------------|
| `==` | 会转换 | `NaN != NaN` | `null == undefined` |
| `===` | 不转换 | `NaN !== NaN` | `null !== undefined` |
| `Object.is()` | 不转换 | `Object.is(NaN, NaN) → true` | 同 `===` |

`Object.is()` 与 `===` 的区别：
```js
Object.is(NaN, NaN)   // true（=== 为 false）
Object.is(+0, -0)     // false（=== 为 true）
```
