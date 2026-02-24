# 网络与浏览器

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
