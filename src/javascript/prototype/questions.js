/**
 * 原型与原型链经典题目
 */

// ============================================
// 题目 1：原型链关系判断
// ============================================
function question1() {
  console.log('--- Question 1 ---')

  function Foo() {}
  const f = new Foo()

  // 实例与构造函数
  console.log(f.__proto__ === Foo.prototype) // true
  console.log(Foo.prototype.constructor === Foo) // true

  // 原型链向上
  console.log(Foo.prototype.__proto__ === Object.prototype) // true
  console.log(Object.prototype.__proto__ === null) // true

  // Function 和 Object 的关系（经典绕脑题）
  console.log(Function.__proto__ === Function.prototype) // true — Function 是自己的实例
  console.log(Object.__proto__ === Function.prototype) // true — Object 是函数
  console.log(Function.prototype.__proto__ === Object.prototype) // true — Function.prototype 是对象
}

// ============================================
// 题目 2：手写 new
// ============================================
function question2() {
  console.log('--- Question 2 ---')

  function myNew(Constructor, ...args) {
    const obj = Object.create(Constructor.prototype)
    const result = Constructor.apply(obj, args)
    return result instanceof Object ? result : obj
  }

  function Person(name, age) {
    this.name = name
    this.age = age
  }
  Person.prototype.sayHi = function () {
    return `Hi, I'm ${this.name}`
  }

  const p = myNew(Person, 'Alice', 25)
  console.log(p.name) // 'Alice'
  console.log(p.sayHi()) // "Hi, I'm Alice"
  console.log(p instanceof Person) // true

  // 构造函数返回对象的情况
  function Weird() {
    this.a = 1
    return { b: 2 } // 返回了一个对象
  }
  const w = myNew(Weird)
  console.log(w.a) // undefined — 被返回的对象覆盖了
  console.log(w.b) // 2
}

// ============================================
// 题目 3：手写 instanceof
// ============================================
function question3() {
  console.log('--- Question 3 ---')

  function myInstanceof(obj, Constructor) {
    if (obj === null || typeof obj !== 'object') return false
    let proto = Object.getPrototypeOf(obj)
    while (proto !== null) {
      if (proto === Constructor.prototype) return true
      proto = Object.getPrototypeOf(proto)
    }
    return false
  }

  console.log(myInstanceof([], Array)) // true
  console.log(myInstanceof([], Object)) // true — 原型链上有 Object.prototype
  console.log(myInstanceof({}, Array)) // false
  console.log(myInstanceof(null, Object)) // false
}

// ============================================
// 题目 4：继承方式对比
// ============================================
function question4() {
  console.log('--- Question 4 ---')

  // 寄生组合继承（ES5 最优方案）
  function Animal(name) {
    this.name = name
    this.colors = ['black']
  }
  Animal.prototype.getName = function () {
    return this.name
  }

  function Dog(name, breed) {
    Animal.call(this, name) // 继承实例属性
    this.breed = breed
  }
  Dog.prototype = Object.create(Animal.prototype) // 继承原型方法
  Dog.prototype.constructor = Dog // 修复 constructor 指向

  Dog.prototype.getBreed = function () {
    return this.breed
  }

  const d1 = new Dog('Buddy', 'Golden')
  const d2 = new Dog('Max', 'Husky')

  d1.colors.push('white')
  console.log(d1.colors) // ['black', 'white']
  console.log(d2.colors) // ['black'] — 引用类型不共享，各自独立
  console.log(d1.getName()) // 'Buddy'
  console.log(d1 instanceof Dog) // true
  console.log(d1 instanceof Animal) // true
}

// ============================================
// 题目 5：属性查找与遮蔽
// ============================================
function question5() {
  console.log('--- Question 5 ---')

  function Parent() {}
  Parent.prototype.x = 1

  const child = new Parent()

  console.log(child.x) // 1 — 沿原型链找到
  console.log(child.hasOwnProperty('x')) // false — 不是自身属性

  child.x = 2 // 在实例上创建同名属性（属性遮蔽）
  console.log(child.x) // 2 — 自身属性优先
  console.log(child.hasOwnProperty('x')) // true
  console.log(child.__proto__.x) // 1 — 原型上的值没变

  delete child.x // 删除自身属性
  console.log(child.x) // 1 — 又能访问到原型上的了
}

// ============================================
// 题目 6：Object.create 的妙用
// ============================================
function question6() {
  console.log('--- Question 6 ---')

  // Object.create(null) — 纯净字典对象
  const dict = Object.create(null)
  dict.key = 'value'
  console.log(dict.toString) // undefined — 没有原型链上的方法
  console.log('key' in dict) // true
  // 适合做 Map 的替代品，不会被原型属性干扰

  // Object.create 指定原型
  const proto = {
    greet() {
      return `Hello, ${this.name}`
    },
  }
  const obj = Object.create(proto)
  obj.name = 'World'
  console.log(obj.greet()) // 'Hello, World'
  console.log(Object.getPrototypeOf(obj) === proto) // true
}

// question1()
// question2()
// question3()
// question4()
// question5()
// question6()

export { question1, question2, question3, question4, question5, question6 }
