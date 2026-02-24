/**
 * TypeScript 类型体操经典题目
 * 本文件用 .ts 注释形式展示，实际运行需要 TypeScript 环境
 */

// ============================================
// 题目 1：实现 DeepReadonly
// ============================================
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K]
}

// 测试
interface Config {
  db: { host: string; port: number }
  debug: boolean
}
type ReadonlyConfig = DeepReadonly<Config>
// { readonly db: { readonly host: string; readonly port: number }; readonly debug: boolean }

// ============================================
// 题目 2：实现 DeepPartial
// ============================================
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepPartial<T[K]>
    : T[K]
}

// ============================================
// 题目 3：实现 TupleToUnion
// ============================================
type TupleToUnion<T extends any[]> = T[number]

type Colors = ['red', 'green', 'blue']
type Color = TupleToUnion<Colors> // 'red' | 'green' | 'blue'

// ============================================
// 题目 4：实现 Flatten（递归展平数组类型）
// ============================================
type Flatten<T extends any[]> = T extends [infer First, ...infer Rest]
  ? First extends any[]
    ? [...Flatten<First>, ...Flatten<Rest>]
    : [First, ...Flatten<Rest>]
  : T

type Nested = [1, [2, [3, 4]], 5]
type Flat = Flatten<Nested> // [1, 2, 3, 4, 5]

// ============================================
// 题目 5：实现 PickByType（按值类型筛选属性）
// ============================================
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

interface Mixed {
  name: string
  age: number
  active: boolean
  email: string
}
type StringProps = PickByType<Mixed, string>
// { name: string; email: string }

// ============================================
// 题目 6：实现 CamelCase（下划线转驼峰）
// ============================================
type CamelCase<S extends string> =
  S extends `${infer Left}_${infer Right}`
    ? `${Lowercase<Left>}${Capitalize<CamelCase<Right>>}`
    : Lowercase<S>

type A = CamelCase<'hello_world'>       // 'helloWorld'
type B = CamelCase<'foo_bar_baz'>       // 'fooBarBaz'
type C = CamelCase<'SOME_CONSTANT'>     // 'someConstant'

// ============================================
// 题目 7：实现 IsEqual（精确类型相等判断）
// ============================================
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2)
    ? true
    : false

type T1 = IsEqual<string, string>     // true
type T2 = IsEqual<string, number>     // false
type T3 = IsEqual<{ a: 1 }, { a: 1 }> // true
type T4 = IsEqual<any, unknown>       // false

// ============================================
// 题目 8：实现类型安全的 EventEmitter
// ============================================
type EventMap = {
  click: { x: number; y: number }
  change: { value: string }
  close: void
}

class TypedEventEmitter<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Set<Function>>()

  on<K extends keyof Events>(
    event: K,
    handler: Events[K] extends void ? () => void : (payload: Events[K]) => void,
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
  }

  emit<K extends keyof Events>(
    ...args: Events[K] extends void ? [event: K] : [event: K, payload: Events[K]]
  ): void {
    const handlers = this.listeners.get(args[0])
    handlers?.forEach(fn => fn(args[1]))
  }

  off<K extends keyof Events>(
    event: K,
    handler: Function,
  ): void {
    this.listeners.get(event)?.delete(handler)
  }
}

// 使用
const emitter = new TypedEventEmitter<EventMap>()
emitter.on('click', ({ x, y }) => console.log(x, y))  // 类型安全
emitter.on('close', () => console.log('closed'))
emitter.emit('click', { x: 1, y: 2 })
emitter.emit('close')
// emitter.emit('click', { value: '' }) // TS Error — 类型不匹配

// ============================================
// 题目 9：实现 PathKeys（获取对象所有嵌套路径）
// ============================================
type PathKeys<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? PathKeys<T[K], `${Prefix}${K}.`> | `${Prefix}${K}`
        : `${Prefix}${K}`
    }[keyof T & string]
  : never

interface Nested {
  a: {
    b: {
      c: number
    }
    d: string
  }
  e: boolean
}
type Paths = PathKeys<Nested>
// 'a' | 'a.b' | 'a.b.c' | 'a.d' | 'e'

// ============================================
// 题目 10：可辨识联合 + 穷尽检查
// ============================================
type ApiResponse =
  | { status: 'success'; data: unknown }
  | { status: 'error'; message: string }
  | { status: 'loading' }

function handleResponse(response: ApiResponse): string {
  switch (response.status) {
    case 'success':
      return JSON.stringify(response.data)
    case 'error':
      return response.message
    case 'loading':
      return 'Loading...'
    default:
      // 穷尽检查：如果新增了 status 类型但没处理，这里会报错
      const _exhaustive: never = response
      return _exhaustive
  }
}

export {
  type DeepReadonly,
  type DeepPartial,
  type TupleToUnion,
  type Flatten,
  type PickByType,
  type CamelCase,
  type IsEqual,
  TypedEventEmitter,
  type PathKeys,
  handleResponse,
}
