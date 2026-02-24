# 前端安全

## XSS（跨站脚本攻击）

### 类型

**存储型 XSS**
- 恶意脚本存入数据库（如评论、用户名）
- 其他用户访问页面时执行
- 危害最大

**反射型 XSS**
- 恶意脚本在 URL 参数中
- 服务端将参数直接拼入 HTML 返回
- 需要诱导用户点击链接

**DOM 型 XSS**
- 前端 JS 直接将不可信数据插入 DOM
- 不经过服务端
- 如 `innerHTML = location.hash`

### 防御

```js
// 1. 输出转义（最基本）
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]))
}

// 2. 避免危险 API
// ❌ innerHTML、document.write、v-html
// ✅ textContent、{{ }} 模板插值（自动转义）

// 3. CSP（Content Security Policy）
// Content-Security-Policy: default-src 'self'; script-src 'self' cdn.example.com

// 4. Cookie 设置 HttpOnly（JS 无法读取）
// Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict
```

## CSRF（跨站请求伪造）

### 攻击原理
```
用户登录 A 站（Cookie 已存储）
    │
    ▼
用户访问恶意 B 站
    │
    ▼
B 站页面自动向 A 站发请求（浏览器自动携带 A 站 Cookie）
    │
    ▼
A 站服务器认为是合法请求
```

### 防御

```
1. SameSite Cookie（推荐）
   Set-Cookie: token=xxx; SameSite=Strict  — 完全禁止跨站携带
   Set-Cookie: token=xxx; SameSite=Lax     — 允许顶级导航 GET 携带（默认值）

2. CSRF Token
   服务端生成随机 token → 嵌入表单/请求头 → 服务端验证
   攻击者无法获取 token（同源策略限制）

3. 验证 Origin / Referer
   服务端检查请求来源是否合法

4. 关键操作二次验证
   短信验证码、密码确认
```

## CSP（内容安全策略）

```
# HTTP 响应头
Content-Security-Policy:
  default-src 'self';                    # 默认只允许同源
  script-src 'self' 'nonce-abc123';      # 脚本需要 nonce 匹配
  style-src 'self' 'unsafe-inline';      # 允许内联样式
  img-src 'self' data: https:;           # 图片来源
  connect-src 'self' api.example.com;    # AJAX/WebSocket 来源
  frame-ancestors 'none';                # 禁止被 iframe 嵌入（防点击劫持）

# 仅报告模式（不阻止，只上报）
Content-Security-Policy-Report-Only: ...; report-uri /csp-report
```

## 其他安全问题

### 点击劫持（Clickjacking）
```
# 防御：禁止页面被 iframe 嵌入
X-Frame-Options: DENY
# 或用 CSP
Content-Security-Policy: frame-ancestors 'none'
```

### 中间人攻击（MITM）
```
# 防御：强制 HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 供应链攻击
- 锁定依赖版本（lock 文件）
- 使用 `npm audit` / `pnpm audit` 检查漏洞
- Subresource Integrity（SRI）校验 CDN 资源

```html
<script src="https://cdn.example.com/lib.js"
  integrity="sha384-xxxxx"
  crossorigin="anonymous">
</script>
```

### 敏感信息泄露
- 前端不存储密钥、密码
- `.env` 文件不提交到仓库
- 生产环境关闭 Source Map
- API 响应不返回多余字段

## 安全响应头清单

```
X-Content-Type-Options: nosniff          # 禁止 MIME 类型嗅探
X-Frame-Options: DENY                    # 禁止 iframe 嵌入
X-XSS-Protection: 0                      # 禁用浏览器 XSS 过滤（已废弃，用 CSP 替代）
Referrer-Policy: strict-origin-when-cross-origin  # 控制 Referer 信息
Permissions-Policy: camera=(), microphone=()      # 禁用敏感 API
```
