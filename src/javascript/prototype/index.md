# 原型与原型链

## 核心三角关系

```
构造函数 (Constructor)
    │
    │ .prototype
    ▼
原型对象 (Prototype) ◄─── 实例.__proto__
    │
    │ .constructor
    ▼
构造函数 (Constructor)
```

```js
function Person(name) { this.name = name }
const p = new Person('Alice')

p.__proto__ === Person.prototype        // true
Person.prototype.constructor === Person // true
p.constructor === Person                // true（沿原型链找到的）
```

## 原型链

当访问对象属性时，沿原型链逐级向上查找：

```
实例 p
  │ __proto__
  ▼
Person.prototype
  │ __proto__
  ▼
Object.prototype
  │ __proto__
  ▼
null（原型链终点）
```

## new 操作符做了什么

```js
function myNew(Constructor, ...args) {
  // 1. 创建空对象，原型指向构造函数的 prototype
  const obj = Object.create(Constructor.prototype)
  // 2. 执行构造函数，this 绑定到新对象
  const result = Constructor.apply(obj, args)
  // 3. 如果构造函数返回对象，则使用该对象；否则返回新创建的对象
  return result instanceof Object ? result : obj
}
```

## instanceof 原理

沿着左侧对象的原型链查找，是否存在右侧构造函数的 prototype：

```js
function myInstanceof(obj, Constructor) {
  let proto = Object.getPrototypeOf(obj)
  while (proto !== null) {
    if (proto === Constructor.prototype) return true
    proto = Object.getPrototypeOf(proto)
  }
  return false
}
```

## 继承方式演进

### 1. 原型链继承
```js
Child.prototype = new Parent()
```
问题：引用类型属性被所有实例共享

### 2. 构造函数继承
```js
function Child() { Parent.call(this) }
```
问题：无法继承原型上的方法

### 3. 组合继承
```js
function Child() { Parent.call(this) }
Child.prototype = new Parent() // Parent 构造函数被调用两次
Child.prototype.constructor = Child
```

### 4. 寄生组合继承（最优方案）
```js
function Child() { Parent.call(this) }
Child.prototype = Object.create(Parent.prototype)
Child.prototype.constructor = Child
```
只调用一次 Parent 构造函数，原型链正确

### 5. ES6 class（语法糖，本质是寄生组合继承）
```js
class Child extends Parent {
  constructor() { super() }
}
```

## 易混淆点

- `__proto__` 是非标准属性（但所有浏览器都支持），推荐用 `Object.getPrototypeOf()`
- `Object.create(null)` 创建的对象没有原型，不继承任何属性和方法
- `Function.__proto__ === Function.prototype`（Function 是自己的实例）
- `Object.__proto__ === Function.prototype`（Object 也是函数）

## 面试题复盘：new vs Object.create

### 题目

```js
function Person(name) {
  this.name = name
}

Person.prototype.sayHello = function() {
  return `Hello, I'm ${this.name}`
}

const p1 = new Person('Alice')
const p2 = Object.create(Person.prototype)
p2.name = 'Bob'

console.log(p1.sayHello())                      // ?
console.log(p2.sayHello())                      // ?
console.log(p1.constructor === Person)         // ?
console.log(p2.constructor === Person)         // ?
console.log(p1 instanceof Person)              // ?
console.log(p2 instanceof Person)              // ?
console.log(Object.getPrototypeOf(p1) === Person.prototype)  // ?
console.log(Object.getPrototypeOf(p2) === Person.prototype)  // ?
console.log(p1.hasOwnProperty('name'))         // ?
console.log(p2.hasOwnProperty('name'))         // ?
```

### 输出

```
"Hello, I'm Alice"
"Hello, I'm Bob"
true
true   ← 易错：很多人以为是 false
true
true
true
true
true
true  ← 易错：很多人以为是 false
```

### 核心要点

**`new` vs `Object.create()`**

```js
// new 做了什么：
const p1 = Object.create(Person.prototype)
Person.call(p1, 'Alice')

// Object.create() 只做了：
const p2 = Object.create(Person.prototype)
// 不会调用构造函数，this.name 不会自动设置
```

**`p2.constructor === Person` 为什么是 true？**

```
p2 自身没有 constructor 属性
  ↓
沿原型链查找 p2.__proto__ === Person.prototype
  ↓
Person.prototype.constructor === Person（默认由构造函数创建时设置）
  ↓
p2.constructor 沿原型链找到 Person
```

**`p2.hasOwnProperty('name')` 为什么是 true？**

```js
p2.name = 'Bob'  // 直接赋值创建 own property
```

`hasOwnProperty` 判断的是**属性是否直接存在于对象自身**，与属性是如何设置的无关：
- 构造函数设置的 `this.name` → own property ✓
- 直接赋值 `obj.name` → own property ✓
- 原型上的属性 → own property ✗

**记忆口诀**：`Object.create()` 只指定原型，不执行构造函数。`constructor` 和 `hasOwnProperty` 都按原型链和自身属性规则查找，与对象创建方式无关。
