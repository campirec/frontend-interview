# TypeScript 深入

## 基础类型系统

### 原始类型
```ts
const str: string = 'hello'
const num: number = 42
const bool: boolean = true
const n: null = null
const u: undefined = undefined
const sym: symbol = Symbol()
const big: bigint = 42n
```

### 特殊类型
```ts
// any — 放弃类型检查
// unknown — 类型安全的 any，使用前必须收窄
// never — 不可能存在的值（函数永远不返回、穷尽检查）
// void — 函数无返回值

function assertNever(x: never): never {
  throw new Error(`Unexpected: ${x}`)
}
```

## 泛型

### 基础
```ts
function identity<T>(value: T): T {
  return value
}

// 泛型约束
function getLength<T extends { length: number }>(value: T): number {
  return value.length
}

// 泛型默认值
interface Response<T = unknown> {
  data: T
  code: number
}
```

### 泛型工具类型实现原理

```ts
// Partial — 所有属性变可选
type MyPartial<T> = {
  [K in keyof T]?: T[K]
}

// Required — 所有属性变必选
type MyRequired<T> = {
  [K in keyof T]-?: T[K]
}

// Readonly
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K]
}

// Pick
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P]
}

// Omit
type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P]
}

// Record
type MyRecord<K extends keyof any, V> = {
  [P in K]: V
}

// Exclude — 从联合类型中排除
type MyExclude<T, U> = T extends U ? never : T

// Extract — 从联合类型中提取
type MyExtract<T, U> = T extends U ? T : never

// ReturnType
type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never

// Parameters
type MyParameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never
```

## 条件类型与 infer

```ts
// 条件类型
type IsString<T> = T extends string ? true : false

// 分布式条件类型 — 联合类型会自动分发
type ToArray<T> = T extends any ? T[] : never
type Result = ToArray<string | number> // string[] | number[]

// 阻止分发：用 [] 包裹
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never
type Result2 = ToArrayNonDist<string | number> // (string | number)[]

// infer — 在条件类型中推断
type UnpackPromise<T> = T extends Promise<infer U> ? U : T
type A = UnpackPromise<Promise<string>> // string

// 递归解包
type DeepUnpackPromise<T> = T extends Promise<infer U>
  ? DeepUnpackPromise<U>
  : T
type B = DeepUnpackPromise<Promise<Promise<number>>> // number

// infer 在元组中的应用
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never
```

## 模板字面量类型

```ts
type EventName<T extends string> = `on${Capitalize<T>}`
type ClickEvent = EventName<'click'> // 'onClick'

// 内置字符串工具类型
type A = Uppercase<'hello'>    // 'HELLO'
type B = Lowercase<'HELLO'>    // 'hello'
type C = Capitalize<'hello'>   // 'Hello'
type D = Uncapitalize<'Hello'> // 'hello'

// 实际应用：从对象类型生成 getter 类型
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

interface Person { name: string; age: number }
type PersonGetters = Getters<Person>
// { getName: () => string; getAge: () => number }
```

## 类型收窄

```ts
// typeof 收窄
function process(value: string | number) {
  if (typeof value === 'string') {
    value.toUpperCase() // string
  }
}

// instanceof 收窄
function handle(err: Error | string) {
  if (err instanceof Error) {
    err.message // Error
  }
}

// in 收窄
interface Fish { swim(): void }
interface Bird { fly(): void }
function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    animal.swim() // Fish
  }
}

// 自定义类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

// 可辨识联合（Discriminated Union）
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rect'; width: number; height: number }

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2
    case 'rect': return shape.width * shape.height
  }
}
```

## 声明文件与模块

```ts
// .d.ts 声明文件 — 为 JS 库提供类型信息
declare module 'some-lib' {
  export function doSomething(value: string): number
}

// 扩展已有类型
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    title?: string
  }
}

// 全局类型扩展
declare global {
  interface Window {
    __APP_VERSION__: string
  }
}
```
