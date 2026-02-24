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
