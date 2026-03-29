# 网络与浏览器

## TCP/IP 五层网络模型

互联网通信的基础架构分为五层，每层负责不同的职责，数据从应用层逐层封装到底层发送，接收端逐层解封。

```
┌──────────────────────────────────────────────────────┐
│  应用层 (Application)                                  │
│  HTTP / HTTPS / DNS / WebSocket / FTP / SMTP          │
│  职责：为应用程序提供网络服务接口                         │
├──────────────────────────────────────────────────────┤
│  传输层 (Transport)                                    │
│  TCP（可靠传输）/ UDP（快速传输）                        │
│  职责：端到端通信、流量控制、拥塞控制                     │
├──────────────────────────────────────────────────────┤
│  网络层 (Network)                                      │
│  IP / ICMP / ARP                                       │
│  职责：路由寻址、分组转发（IP 地址）                      │
├──────────────────────────────────────────────────────┤
│  数据链路层 (Data Link)                                │
│  Ethernet / WiFi / PPP                                 │
│  职责：相邻节点间的帧传输（MAC 地址）                     │
├──────────────────────────────────────────────────────┤
│  物理层 (Physical)                                     │
│  光纤 / 网线 / 无线电波                                 │
│  职责：比特流的物理传输                                  │
└──────────────────────────────────────────────────────┘
```

### 数据封装过程

```
应用数据
  → [应用层] 添加 HTTP 请求头/响应头
  → [传输层] 添加 TCP 头（源端口、目的端口、序列号、校验和）
  → [网络层] 添加 IP 头（源 IP、目的 IP、TTL）
  → [数据链路层] 添加以太网帧头（源 MAC、目的 MAC）
  → [物理层] 转为电信号/光信号传输
```

### TCP vs UDP

| 特性 | TCP | UDP |
|------|-----|-----|
| 连接 | 三次握手建立连接 | 无连接 |
| 可靠性 | 可靠（重传、确认、排序） | 不可靠（尽最大努力交付） |
| 速度 | 较慢（需握手、拥塞控制） | 快速（无额外开销） |
| 适用场景 | 网页、API、文件传输 | 视频直播、DNS 查询、游戏 |

### TCP 三次握手

```
Client                          Server
  │── SYN（seq=x）────────────→│  "我想建立连接"
  │←── SYN+ACK（seq=y,ack=x+1）│  "收到，我也准备好了"
  │── ACK（ack=y+1）──────────→│  "确认，开始传输"
  │    可靠传输开始              │
```

### TCP 四次挥手

```
Client                          Server
  │── FIN─────────────────────→│  "我没有数据要发了"
  │←── ACK────────────────────│  "收到"
  │←── FIN────────────────────│  "我也没有数据要发了"
  │── ACK─────────────────────→│  "收到，关闭连接"
  │    等待 2MSL 后彻底关闭      │
```

### 与 OSI 七层模型对应关系

```
OSI 七层              TCP/IP 五层         对应协议
─────────────────────────────────────────────
应用层 ─┐
表示层 ─┼→ 应用层          HTTP/HTTPS/DNS/WebSocket
会话层 ─┘
传输层    → 传输层          TCP/UDP
网络层    → 网络层          IP/ICMP
数据链路层 → 数据链路层      Ethernet/WiFi
物理层    → 物理层          光纤/网线
```

## DNS 域名系统

### DNS 解析流程

```
浏览器输入 www.example.com
  → 浏览器 DNS 缓存（chrome://net-internals/#dns）
  → 操作系统 DNS 缓存
  → hosts 文件
  → 本地 DNS 服务器（递归查询）
    → 根域名服务器（.）
    → 顶级域名服务器（.com）
    → 权威域名服务器（example.com）
    → 返回 IP 地址
```

### DNS 记录类型

| 类型 | 作用 | 示例 |
|------|------|------|
| A | 域名 → IPv4 地址 | `example.com → 93.184.216.34` |
| AAAA | 域名 → IPv6 地址 | `example.com → 2606:2800:220:1:...` |
| CNAME | 域名别名 | `www.example.com → example.com` |
| MX | 邮件服务器 | `example.com → mail.example.com` |
| TXT | 文本记录（SPF、验证） | `v=spf1 include:_spf.google.com` |
| NS | 域名服务器 | `example.com → ns1.example.com` |

### 递归查询 vs 迭代查询

```
递归查询（客户端 → 本地 DNS）：
  客户端问本地 DNS "www.example.com 的 IP 是什么？"
  本地 DNS 负责一路查到底，最终返回结果

迭代查询（本地 DNS → 各级服务器）：
  本地 DNS 问根服务器 → "去找 .com 服务器"
  本地 DNS 问 .com 服务器 → "去找 example.com 服务器"
  本地 DNS 问权威服务器 → 得到 IP
```

### DNS 优化

```html
<!-- DNS 预解析：提前解析域名 -->
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- 预建立连接（DNS + TCP + TLS） -->
<link rel="preconnect" href="https://cdn.example.com">

<!-- 预加载资源（优先级高） -->
<link rel="preload" href="/critical.js" as="script">

<!-- 预获取资源（优先级低，空闲时加载） -->
<link rel="prefetch" href="/next-page.js" as="script">
```

### DNS 负载均衡

DNS 可以为同一个域名返回多个 IP 地址，客户端通常选择第一个。DNS 服务器通过轮转顺序实现简单的负载均衡，CDN 还可基于 GEO DNS 返回距离用户最近节点的 IP。

## HTTP 协议演进

### HTTP/1.1
- **持久连接** — 默认 `Connection: keep-alive`，复用 TCP 连接
- **管线化** — 可以连续发送请求，但响应必须按序返回（队头阻塞）
- **问题**：队头阻塞、头部冗余（每次都发完整 header）、并发受限（浏览器同域 6 个连接）

### HTTP/2
- **多路复用** — 一个 TCP 连接上并行传输多个请求/响应（帧 + 流）
- **头部压缩** — HPACK 算法，静态表 + 动态表 + 哈夫曼编码
- **服务端推送** — 主动推送资源（实际使用较少）
- **二进制分帧** — 数据以二进制帧传输，不再是文本协议
- **问题**：TCP 层队头阻塞（丢包时整个连接阻塞）

### HTTP/3
- **QUIC 协议** — 基于 UDP，内置 TLS 1.3
- **解决 TCP 队头阻塞** — 流级别的独立传输，一个流丢包不影响其他流
- **0-RTT 连接** — 首次 1-RTT，后续 0-RTT 建立连接
- **连接迁移** — 基于 Connection ID，网络切换不断连

## HTTPS

### TLS 握手（1.2）
```
Client                          Server
  │── ClientHello ──────────────→│  支持的加密套件、随机数
  │←── ServerHello ──────────────│  选择的加密套件、随机数、证书
  │── 验证证书 + 预主密钥 ───────→│  用服务端公钥加密
  │←── Finished ─────────────────│
  │    对称加密通信开始            │
```

### TLS 1.3 改进
- 握手从 2-RTT 减少到 1-RTT
- 移除不安全的加密算法
- 支持 0-RTT（有重放攻击风险）

## 浏览器缓存

### 缓存策略

```
请求 → 强缓存命中？
         │
    ┌────┴────┐
    是        否
    │         │
  直接使用    协商缓存 → 服务端判断是否变化
  (200)       │
         ┌────┴────┐
         未变化     已变化
         │         │
       304        200 + 新资源
```

### 强缓存
```
Cache-Control: max-age=31536000    # 缓存 1 年（优先级高）
Cache-Control: no-cache            # 每次都协商
Cache-Control: no-store            # 不缓存
Cache-Control: private             # 仅浏览器缓存
Cache-Control: public              # CDN 也可缓存
Expires: Thu, 01 Jan 2026 00:00:00 GMT  # 过期时间（优先级低）
```

### 协商缓存
```
# 基于修改时间
Last-Modified / If-Modified-Since
# 精度到秒，文件内容不变但修改时间变了会失效

# 基于内容 hash（优先级高）
ETag / If-None-Match
# 精确到内容级别，但计算有开销
```

### 实际缓存策略
```
HTML        → Cache-Control: no-cache（每次协商）
JS/CSS/图片  → Cache-Control: max-age=31536000 + 文件名 hash
API 响应     → Cache-Control: no-store 或短时间缓存
```

## 浏览器渲染流水线

```
HTML → DOM Tree
                ↘
                  Render Tree → Layout → Paint → Composite
                ↗
CSS  → CSSOM
```

### 详细流程
1. **解析 HTML** → 构建 DOM Tree
2. **解析 CSS** → 构建 CSSOM
3. **合并** → Render Tree（不包含 `display: none` 的节点）
4. **Layout（回流/重排）** → 计算每个节点的几何信息（位置、大小）
5. **Paint（重绘）** → 将节点绘制为像素
6. **Composite（合成）** → GPU 合成各层，输出到屏幕

### 回流（Reflow）vs 重绘（Repaint）

| | 回流 | 重绘 |
|---|---|---|
| 触发 | 几何属性变化（宽高、位置、display） | 外观变化（颜色、背景、阴影） |
| 开销 | 高（重新计算布局） | 中 |
| 关系 | 回流必然触发重绘 | 重绘不一定回流 |

### 触发回流的操作
- 增删 DOM、改变元素尺寸/位置
- 读取布局属性：`offsetTop`、`scrollTop`、`clientWidth`、`getComputedStyle()`
- 窗口 resize

### 优化
- 批量修改 DOM（DocumentFragment、`display: none` 后操作）
- 读写分离（避免交替读写布局属性）
- 使用 `transform`/`opacity` 做动画（只触发合成，不回流不重绘）
- `will-change` 提升为合成层

## Core Web Vitals

| 指标 | 含义 | 良好标准 |
|------|------|---------|
| LCP（Largest Contentful Paint） | 最大内容绘制时间 | ≤ 2.5s |
| INP（Interaction to Next Paint） | 交互到下一次绘制 | ≤ 200ms |
| CLS（Cumulative Layout Shift） | 累积布局偏移 | ≤ 0.1 |

### 优化方向
- **LCP** — 优化关键资源加载（preload、CDN、图片优化、SSR）
- **INP** — 减少主线程阻塞（代码分割、Web Worker、长任务拆分）
- **CLS** — 预留空间（图片设置宽高、骨架屏、字体 `font-display: swap`）

## 跨域

### 同源策略
协议 + 域名 + 端口 三者完全相同才是同源。

### 解决方案

**CORS（推荐）**
```
# 简单请求：直接发送，服务端返回
Access-Control-Allow-Origin: https://example.com

# 预检请求（非简单请求先发 OPTIONS）
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400  # 预检缓存时间
```

**其他方案**
- **代理** — 开发环境 Vite proxy，生产环境 Nginx 反向代理
- **JSONP** — 仅支持 GET，利用 `<script>` 标签不受同源限制
- **WebSocket** — 不受同源策略限制
- **postMessage** — 跨窗口通信

## JWT 令牌认证

### JWT 结构

JWT（JSON Web Token）由三部分组成，用 `.` 分隔：

```
xxxxx.yyyyy.zzzzz
 │     │     │
 │     │     └── Signature（签名）
 │     └──────── Payload（载荷）
 └────────────── Header（头部）
```

### Header（头部）

```json
{
  "alg": "HS256",    // 签名算法：HS256（对称）/ RS256（非对称）
  "typ": "JWT"
}
// Base64Url 编码后作为第一部分
```

### Payload（载荷）

```json
{
  "sub": "1234567890",   // 主题（用户 ID）
  "name": "John Doe",
  "iat": 1516239022,     // 签发时间 (Issued At)
  "exp": 1516242622      // 过期时间 (Expiration)
}
// Base64Url 编码后作为第二部分
// ⚠️ 默认不加密，不要存放敏感信息！
```

### Signature（签名）

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret    // 服务端密钥，不能泄露
)
```

### 认证流程

```
1. 用户登录（账号密码）
2. 服务端验证 → 生成 JWT → 返回给前端
3. 前端存储 JWT（localStorage / Cookie）
4. 后续请求携带 Authorization: Bearer <token>
5. 服务端验证签名 + 检查过期 → 返回数据
```

### JWT vs Session vs Cookie

| 特性 | JWT | Session + Cookie |
|------|-----|-----------------|
| 存储位置 | 客户端 | 服务端 |
| 扩展性 | 无状态，天然支持分布式 | 需要共享 Session（Redis） |
| 安全性 | 无法主动失效（除非黑名单） | 服务端可随时销毁 |
| 跨域 | 天然支持 | 需要额外配置 CORS |
| 适用场景 | API 认证、微服务、移动端 | 传统 Web 应用、SSO |

### 安全实践

```
1. 存储选择
   - localStorage：易受 XSS 攻击窃取
   - HttpOnly Cookie：XSS 无法读取，但需防御 CSRF
   - 推荐：HttpOnly + Secure + SameSite Cookie

2. 过期策略
   - Access Token：短过期（15-30 分钟）
   - Refresh Token：长过期（7-30 天），用于续签

3. 其他
   - 使用 HTTPS 传输
   - 不在 Payload 中存放敏感信息（Base64 可解码）
   - 服务端验证签名 + 检查 exp/nbf
```

## 文件上传与下载

### 文件上传

**基本表单上传（multipart/form-data）**

```html
<form enctype="multipart/form-data" method="POST" action="/upload">
  <input type="file" name="file" />
  <button>上传</button>
</form>
```

```js
// Fetch 上传
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('name', 'document.pdf')

fetch('/upload', {
  method: 'POST',
  body: formData,  // 不要手动设置 Content-Type，浏览器自动加 boundary
})
```

**大文件分片上传**

```
1. 前端分片
   file.slice(0, CHUNK_SIZE)       // 第 1 片
   file.slice(CHUNK_SIZE, 2*SIZE)  // 第 2 片
   ...

2. 计算文件 hash（用于标识同一文件）
   - 使用 spark-md5 对分片逐片计算
   - 或使用 Web Worker 避免阻塞主线程

3. 并发上传分片
   - 每个分片独立上传，支持并行
   - 携带 hash + 分片索引

4. 通知服务端合并
   - 全部分片上传完成后，请求 /merge 接口
   - 服务端按索引顺序合并为完整文件
```

**断点续传与秒传**

```
断点续传：
  1. 上传前先请求 /check 接口，传入文件 hash
  2. 服务端返回已上传的分片列表
  3. 前端跳过已上传的分片，只上传剩余部分

秒传：
  1. 上传前请求 /check 接口，传入文件 hash
  2. 服务端发现已有完整文件 → 直接返回成功
  3. 前端无需上传任何分片
```

### 文件下载

**方式一：`<a>` 标签 download 属性（同源 URL）**
```js
const link = document.createElement('a')
link.href = '/files/report.pdf'
link.download = 'report.pdf'
link.click()
```

**方式二：Blob 下载（适合前端生成内容）**
```js
const blob = new Blob(['Hello World'], { type: 'text/plain' })
const url = URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
link.download = 'hello.txt'
link.click()
URL.revokeObjectURL(url)  // 释放内存
```

**方式三：Fetch + Stream 下载（大文件/进度显示）**
```js
async function downloadWithProgress(url) {
  const response = await fetch(url)
  const contentLength = response.headers.get('Content-Length')
  const reader = response.body.getReader()

  let received = 0
  const chunks = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    console.log(`进度：${(received / contentLength * 100).toFixed(1)}%`)
  }

  const blob = new Blob(chunks)
  // 触发下载...
}
```

### Postman / Apifox 调试工具

API 调试工具用于模拟 HTTP 请求，前后端联调时必备：

```
核心功能：
  - 支持所有 HTTP 方法（GET/POST/PUT/DELETE...）
  - 设置请求头、请求体、Query 参数
  - 环境变量管理（开发/测试/生产环境切换）
  - 请求历史记录与集合管理
  - 自动生成代码片段（cURL、Fetch、Axios）
  - Mock Server（前后端并行开发）

Postman vs Apifox：
  - Postman：老牌工具，插件生态丰富，国际主流
  - Apifox：国产工具，集 API 设计 + 调试 + Mock + 文档于一体，中文友好
```

## 网络性能优化

### 资源加载优化

```
1. 压缩
   - Gzip / Brotli 压缩（服务端配置，通常压缩比 60-80%）
   - 图片压缩（WebP/AVIF 格式、响应式图片 srcset）

2. CDN（内容分发网络）
   - 静态资源部署到 CDN，用户就近访问
   - HTML 不走 CDN（避免缓存不一致）

3. 资源预加载
   - dns-prefetch：DNS 预解析
   - preconnect：预建立连接
   - preload：预加载关键资源
   - prefetch：空闲时预获取

4. 代码分割（Code Splitting）
   - 路由级别懒加载
   - 动态 import() 按需加载
   - Vite/Webpack 自动分割
```

### 传输优化

```
1. HTTP/2 多路复用 — 减少连接数
2. 合并请求 — 雪碧图、内联小资源
3. 懒加载 — 图片/组件进入视口再加载（Intersection Observer）
4. Service Worker — 离线缓存、请求拦截
```

### 渲染优化

```
1. CSS 放 <head>，JS 放 </body> 前（或 defer/async）
2. 避免布局抖动（读写分离）
3. 虚拟列表（大数据量列表渲染）
4. Web Worker 处理耗时计算
```
