/**
 * 前端安全经典题目
 */

// ============================================
// 题目 1：XSS 防御 — HTML 转义
// ============================================
function escapeHTML(str) {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return str.replace(/[&<>"']/g, char => escapeMap[char])
}

// 测试
console.log(escapeHTML('<script>alert("xss")</script>'))
// &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;

// 反转义
function unescapeHTML(str) {
  const unescapeMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  }
  return str.replace(/&(amp|lt|gt|quot|#39);/g, match => unescapeMap[match])
}

// ============================================
// 题目 2：XSS 防御 — 富文本白名单过滤
// ============================================
function sanitizeHTML(html) {
  // 白名单标签和属性
  const allowedTags = new Set(['p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'img'])
  const allowedAttrs = {
    a: new Set(['href', 'title']),
    img: new Set(['src', 'alt', 'width', 'height']),
  }

  // 使用 DOMParser 解析（浏览器环境）
  // 这里用正则简化演示
  return html
    // 移除 script/style 标签及内容
    .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
    // 移除事件属性
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // 移除 javascript: 协议
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
}

// 实际项目推荐使用 DOMPurify 库
// import DOMPurify from 'dompurify'
// const clean = DOMPurify.sanitize(dirty)

// ============================================
// 题目 3：CSRF Token 实现思路
// ============================================
const csrfProtection = `
// 服务端：生成并下发 CSRF Token
// 1. 用户登录后，服务端生成随机 token 存入 session
// 2. 将 token 写入 Cookie（非 HttpOnly，前端需要读取）
//    Set-Cookie: csrf_token=random_string; SameSite=Lax

// 前端：请求时携带 token
// 方式 1：从 Cookie 读取，放入请求头
function getCsrfToken() {
  const match = document.cookie.match(/csrf_token=([^;]+)/)
  return match ? match[1] : ''
}

// Axios 拦截器自动添加
axios.interceptors.request.use(config => {
  config.headers['X-CSRF-Token'] = getCsrfToken()
  return config
})

// 方式 2：服务端渲染时嵌入 meta 标签
// <meta name="csrf-token" content="random_string">
// const token = document.querySelector('meta[name="csrf-token"]').content

// 服务端：验证 token
// 对比请求头中的 token 与 session 中的 token 是否一致
`

// ============================================
// 题目 4：安全的密码处理
// ============================================
async function hashPassword(password) {
  // 前端不应该做密码哈希（应该在服务端）
  // 但可以做传输前的处理

  // 使用 Web Crypto API 做 SHA-256（仅用于演示）
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// 生成安全的随机 token
function generateToken(length = 32) {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

// ============================================
// 题目 5：防止原型污染
// ============================================
function safeJsonParse(json) {
  return JSON.parse(json, (key, value) => {
    // 阻止 __proto__ 和 constructor 污染
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined
    }
    return value
  })
}

// 安全的对象合并（防止原型污染）
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    // 跳过危险的 key
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue
    }

    if (
      typeof source[key] === 'object'
      && source[key] !== null
      && typeof target[key] === 'object'
      && target[key] !== null
    ) {
      safeMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}

// 测试原型污染防御
const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}')
const obj = {}
safeMerge(obj, malicious)
console.log(obj.isAdmin) // undefined — 成功防御

// ============================================
// 题目 6：常见安全场景问答
// ============================================
const securityQA = {
  '如何防止 XSS': `
    1. 输出转义 — 对用户输入在输出时进行 HTML 转义
    2. CSP — 限制脚本来源，禁止内联脚本
    3. HttpOnly Cookie — 防止 JS 读取敏感 Cookie
    4. 使用框架自带的转义（Vue {{ }}、React JSX 自动转义）
    5. 富文本使用白名单过滤（DOMPurify）
    6. 避免 innerHTML、v-html、dangerouslySetInnerHTML
  `,

  '如何防止 CSRF': `
    1. SameSite Cookie（Lax 或 Strict）
    2. CSRF Token（服务端生成，前端请求时携带）
    3. 验证 Origin/Referer 请求头
    4. 关键操作二次验证
  `,

  '前端如何存储敏感信息': `
    1. Token 存 HttpOnly Cookie（JS 无法读取）
    2. 不在 localStorage 存敏感数据（XSS 可读取）
    3. 内存中的敏感数据用完即清
    4. 密钥、密码永远不存前端
  `,

  'HTTPS 能防止什么': `
    能防止：数据窃听、数据篡改、中间人攻击
    不能防止：XSS、CSRF、SQL 注入、DDoS
    HTTPS 保护的是传输层，不保护应用层逻辑
  `,
}

export {
  escapeHTML,
  unescapeHTML,
  sanitizeHTML,
  csrfProtection,
  hashPassword,
  generateToken,
  safeJsonParse,
  safeMerge,
  securityQA,
}
