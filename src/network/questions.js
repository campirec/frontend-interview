/**
 * 网络与浏览器经典题目
 */

// ============================================
// 题目 1：从输入 URL 到页面展示的完整过程
// ============================================
const urlToPage = `
1. URL 解析
   - 解析协议、域名、端口、路径
   - 检查 HSTS 列表，HTTP 自动升级 HTTPS

2. DNS 解析
   - 浏览器缓存 → 系统缓存 → hosts 文件 → 路由器缓存
   → 本地 DNS 服务器 → 根域名服务器 → 顶级域名服务器 → 权威域名服务器
   - DNS 优化：预解析 <link rel="dns-prefetch" href="//cdn.example.com">

3. TCP 连接（三次握手）
   - SYN → SYN+ACK → ACK
   - HTTPS 还需要 TLS 握手

4. 发送 HTTP 请求
   - 请求行 + 请求头 + 请求体
   - Cookie、Authorization 等认证信息

5. 服务端处理并返回响应
   - 状态码 + 响应头 + 响应体
   - 可能经过负载均衡、CDN、缓存层

6. 浏览器解析渲染
   - 解析 HTML → DOM Tree
   - 解析 CSS → CSSOM
   - 合并 → Render Tree
   - Layout → Paint → Composite

7. TCP 断开（四次挥手）
   - FIN → ACK → FIN → ACK
   - keep-alive 可复用连接
`

// ============================================
// 题目 2：手写 AJAX / Fetch 封装
// ============================================

// XMLHttpRequest 版本
function ajax({ method = 'GET', url, data, headers =  }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)

    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value)
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`))
      }
    }

    xhr.onerror = () => reject(new Error('Network Error'))
    xhr.timeout = 10000
    xhr.ontimeout = () => reject(new Error('Timeout'))

    xhr.send(data ? JSON.stringify(data) : null)
  })
}

// Fetch 封装（带拦截器、超时、重试）
function createFetchClient(baseURL = '', defaultOptions = {}) {
  const interceptors = {
    request: [],
    response: [],
  }

  async function request(url, options = {}) {
    let config = {
      ...defaultOptions,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...defaultOptions.headers,
        ...options.headers,
      },
    }

    // 请求拦截器
    for (const fn of interceptors.request) {
      config = await fn(config)
    }

    const fullURL = url.startsWith('http') ? url : `${baseURL}${url}`

    // 超时控制
    const controller = new AbortController()
    const timeout = config.timeout || 10000
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      let response = await fetch(fullURL, {
        ...config,
        signal: controller.signal,
        body: config.body ? JSON.stringify(config.body) : undefined,
      })

      clearTimeout(timer)

      // 响应拦截器
      for (const fn of interceptors.response) {
        response = await fn(response)
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return response.json()
    } catch (err) {
      clearTimeout(timer)
      if (err.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw err
    }
  }

  return { request, interceptors }
}

// ============================================
// 题目 3：手写请求并发控制
// ============================================
class RequestScheduler {
  constructor(maxConcurrent = 5) {
    this.max = maxConcurrent
    this.running = 0
    this.queue = []
  }

  add(requestFn) {
    return new Promise((resolve, reject) => {
      const task = () => {
        this.running++
        requestFn()
          .then(resolve, reject)
          .finally(() => {
            this.running--
            this.next()
          })
      }

      if (this.running < this.max) {
        task()
      } else {
        this.queue.push(task)
      }
    })
  }

  next() {
    if (this.queue.length > 0 && this.running < this.max) {
      const task = this.queue.shift()
      task()
    }
  }
}

// 使用
// const scheduler = new RequestScheduler(3)
// urls.forEach(url => scheduler.add(() => fetch(url)))

// ============================================
// 题目 4：HTTP 状态码
// ============================================
const statusCodes = {
  // 2xx 成功
  200: 'OK — 请求成功',
  201: 'Created — 资源创建成功',
  204: 'No Content — 成功但无返回内容',

  // 3xx 重定向
  301: 'Moved Permanently — 永久重定向（会缓存）',
  302: 'Found — 临时重定向（可能改变方法为 GET）',
  304: 'Not Modified — 协商缓存命中',
  307: 'Temporary Redirect — 临时重定向（保持方法不变）',
  308: 'Permanent Redirect — 永久重定向（保持方法不变）',

  // 4xx 客户端错误
  400: 'Bad Request — 请求参数错误',
  401: 'Unauthorized — 未认证（需要登录）',
  403: 'Forbidden — 无权限',
  404: 'Not Found — 资源不存在',
  405: 'Method Not Allowed — 请求方法不允许',
  409: 'Conflict — 资源冲突',
  429: 'Too Many Requests — 请求频率限制',

  // 5xx 服务端错误
  500: 'Internal Server Error — 服务器内部错误',
  502: 'Bad Gateway — 网关错误',
  503: 'Service Unavailable — 服务不可用',
  504: 'Gateway Timeout — 网关超时',
}

// ============================================
// 题目 5：浏览器存储对比
// ============================================
const storageComparison = {
  Cookie: {
    大小: '4KB',
    生命周期: '可设置过期时间，默认会话级',
    通信: '每次请求自动携带',
    API: 'document.cookie（不友好）',
    场景: '认证 token、会话标识',
    安全: 'HttpOnly 防 XSS，Secure 仅 HTTPS，SameSite 防 CSRF',
  },
  localStorage: {
    大小: '5-10MB',
    生命周期: '永久，除非手动清除',
    通信: '不自动携带',
    API: 'getItem/setItem/removeItem',
    场景: '持久化配置、缓存数据',
  },
  sessionStorage: {
    大小: '5-10MB',
    生命周期: '标签页关闭时清除',
    通信: '不自动携带',
    API: '同 localStorage',
    场景: '表单暂存、页面间临时数据',
  },
  IndexedDB: {
    大小: '无硬性限制（通常 > 250MB）',
    生命周期: '永久',
    通信: '不自动携带',
    API: '异步 API，支持事务、索引',
    场景: '大量结构化数据、离线应用',
  },
}

// ============================================
// 题目 6：手写 JSONP
// ============================================
function jsonp(url, params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`

    const query = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')

    const src = `${url}?callback=${callbackName}${query ? '&' + query : ''}`

    const script = document.createElement('script')
    script.src = src

    // 注册全局回调
    window[callbackName] = (data) => {
      resolve(data)
      cleanup()
    }

    script.onerror = () => {
      reject(new Error('JSONP request failed'))
      cleanup()
    }

    function cleanup() {
      delete window[callbackName]
      document.head.removeChild(script)
    }

    document.head.appendChild(script)
  })
}

// ============================================
// 题目 7：WebSocket 基础使用
// ============================================
function createWebSocket(url) {
  let ws = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5
  const listeners = new Map()

  function connect() {
    ws = new WebSocket(url)

    ws.onopen = () => {
      console.log('WebSocket connected')
      reconnectAttempts = 0
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const handlers = listeners.get(data.type) || []
      handlers.forEach(fn => fn(data.payload))
    }

    ws.onclose = () => {
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000) // 指数退避
        setTimeout(connect, delay)
        reconnectAttempts++
      }
    }

    ws.onerror = (err) => {
      console.error('WebSocket error:', err)
    }
  }

  function send(type, payload) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }))
    }
  }

  function on(type, handler) {
    if (!listeners.has(type)) listeners.set(type, [])
    listeners.get(type).push(handler)
  }

  function close() {
    reconnectAttempts = maxReconnectAttempts // 阻止重连
    ws?.close()
  }

  connect()
  return { send, on, close }
}

// ============================================
// 题目 8：JWT 解码实现
// ============================================

/**
 * 解码 JWT Token（仅解码，不验证签名）
 * 注意：生产环境必须在服务端验证签名，前端解码仅用于读取信息
 */
function decodeJWT(token) {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format')
  }

  // Base64Url → Base64 → 解码
  function base64UrlDecode(str) {
    // Base64Url 用 - 替换 +，用 _ 替换 /，去掉 = 填充
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    // 补齐 = 填充
    const padding = base64.length % 4
    if (padding) {
      base64 += '='.repeat(4 - padding)
    }
    return JSON.parse(atob(base64))
  }

  const header = base64UrlDecode(parts[0])
  const payload = base64UrlDecode(parts[1])

  // 检查过期时间
  const isExpired = payload.exp ? Date.now() / 1000 > payload.exp : false

  return {
    header,      // { alg, typ }
    payload,     // { sub, name, iat, exp, ... }
    isExpired,
    expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
  }
}

// 使用示例
// const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
// console.log(decodeJWT(token))

// ============================================
// 题目 9：大文件分片上传
// ============================================

/**
 * 大文件分片上传类
 * 支持：分片上传、断点续传、进度回调、并发控制
 */
class FileUploader {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 5 * 1024 * 1024  // 默认 5MB 一片
    this.maxConcurrent = options.maxConcurrent || 3
    this.uploadUrl = options.uploadUrl || '/upload'
    this.mergeUrl = options.mergeUrl || '/merge'
    this.checkUrl = options.checkUrl || '/check'
    this.onProgress = options.onProgress || (() => {})
  }

  /**
   * 计算文件 hash（简单版本，用文件名+大小+最后修改时间模拟）
   * 生产环境应使用 spark-md5 或 hash-wasm 计算文件内容 hash
   */
  getFileHash(file) {
    return `${file.name}-${file.size}-${file.lastModified}`
  }

  /**
   * 创建文件分片
   */
  createFileChunks(file) {
    const chunks = []
    let cur = 0
    let index = 0
    while (cur < file.size) {
      const chunk = file.slice(cur, cur + this.chunkSize)
      chunks.push({ chunk, index, size: chunk.size })
      cur += this.chunkSize
      index++
    }
    return chunks
  }

  /**
   * 检查已上传的分片（断点续传）
   */
  async checkUploaded(fileHash) {
    try {
      const res = await fetch(`${this.checkUrl}?hash=${fileHash}`)
      const data = await res.json()
      return data.uploadedChunks || []  // 返回已上传的分片索引数组
    } catch {
      return []  // 检查失败，从头开始上传
    }
  }

  /**
   * 上传单个分片
   */
  uploadChunk({ chunk, index }, fileHash) {
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('hash', fileHash)
    formData.append('index', index)

    return fetch(this.uploadUrl, {
      method: 'POST',
      body: formData,
    }).then(res => res.json())
  }

  /**
   * 并发上传控制
   */
  async uploadChunks(chunks, fileHash, uploadedChunks) {
    // 过滤已上传的分片
    const pendingChunks = chunks.filter(
      c => !uploadedChunks.includes(c.index)
    )

    let completed = uploadedChunks.length
    const total = chunks.length

    // 并发控制
    const executing = new Set()

    for (const chunkInfo of pendingChunks) {
      const promise = this.uploadChunk(chunkInfo, fileHash)
        .then(() => {
          completed++
          this.onProgress(completed, total, (completed / total * 100).toFixed(1))
        })

      executing.add(promise)
      promise.finally(() => executing.delete(promise))

      if (executing.size >= this.maxConcurrent) {
        await Promise.race(executing)
      }
    }

    await Promise.all(executing)
  }

  /**
   * 通知服务端合并分片
   */
  async mergeChunks(fileHash, fileName, totalChunks) {
    return fetch(this.mergeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: fileHash, name: fileName, total: totalChunks }),
    }).then(res => res.json())
  }

  /**
   * 完整上传流程
   */
  async upload(file) {
    // 1. 计算文件标识
    const fileHash = this.getFileHash(file)

    // 2. 创建分片
    const chunks = this.createFileChunks(file)

    // 3. 检查已上传分片（断点续传）
    const uploadedChunks = await this.checkUploaded(fileHash)

    // 4. 上传剩余分片
    await this.uploadChunks(chunks, fileHash, uploadedChunks)

    // 5. 通知合并
    const result = await this.mergeChunks(fileHash, file.name, chunks.length)

    return result
  }
}

// 使用示例
// const uploader = new FileUploader({
//   uploadUrl: '/api/upload/chunk',
//   mergeUrl: '/api/upload/merge',
//   checkUrl: '/api/upload/check',
//   chunkSize: 2 * 1024 * 1024,  // 2MB 一片
//   maxConcurrent: 3,
//   onProgress: (done, total, percent) => {
//     console.log(`上传进度：${done}/${total} (${percent}%)`)
//   },
// })
// uploader.upload(fileInput.files[0]).then(res => console.log('上传完成', res))

export {
  urlToPage,
  ajax,
  createFetchClient,
  RequestScheduler,
  statusCodes,
  storageComparison,
  jsonp,
  createWebSocket,
  decodeJWT,
  FileUploader,
}
