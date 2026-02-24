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
