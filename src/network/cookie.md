
  # Cookie 完全指南

  ## 1. Cookie 是什么

  Cookie 是浏览器存储机制之一，通过 `Set-Cookie` 响应头由服务端写入，之后每次请求自动携带在请求头中，解决了 HTTP 无状态的问题。

  ---

  ## 2. 工作原理

  ### 收发机制

  ```
  // 服务端 → 浏览器（响应头）
  Set-Cookie: userId=123

  // 浏览器 → 服务端（请求头）
  Cookie: userId=123
  ```

  - 多个 Cookie 用**多行** `Set-Cookie` 设置，不能用逗号合并（逗号可能出现在值中，产生歧义）
  - `Set-Cookie`（单数），不是 `Set-Cookies`

  ---

  ## 3. 核心属性

  ### Domain — 域名作用域

  ```
  Set-Cookie: token=abc; Domain=example.com
  ```

  - 匹配 `example.com` 本身及所有子域名（`shop.example.com`、`api.example.com`）
  - 不匹配 `other.com`，也不匹配 `evil-example.com`（字符串包含但非子域名）

  ### Path — 路径作用域

  ```
  Set-Cookie: adminToken=xyz; Path=/admin
  ```

  - 只有请求路径匹配 `/admin/*` 时才携带该 Cookie

  ### Expires / Max-Age — 生命周期

  ```
  Set-Cookie: token=abc; Max-Age=604800
  Set-Cookie: token=abc; Expires=Wed, 01 Jan 2026 00:00:00 GMT
  ```

  | 属性 | 说明 |
  |------|------|
  | `Max-Age` | 还有多少秒过期（整数），**优先级高于 Expires** |
  | `Expires` | 具体过期时间点，依赖客户端本地时间，可能不准确 |

  - 两者都不设置 → **Session Cookie**，关闭浏览器后自动清除

  ---

  ## 4. 安全属性

  ### HttpOnly — 防 XSS

  ```
  Set-Cookie: sessionId=abc; HttpOnly
  ```

  - 禁止 JavaScript 通过 `document.cookie` 读取
  - 防御 XSS 攻击窃取 Cookie

  ### Secure — 防明文传输

  ```
  Set-Cookie: sessionId=abc; Secure
  ```

  - 只在 HTTPS 连接下传输
  - 防御中间人攻击截获 Cookie

  ### SameSite — 防 CSRF

  ```
  Set-Cookie: sessionId=abc; SameSite=Strict
  ```

  | 值 | 行为 |
  |----|------|
  | `Strict` | 所有跨站请求都不携带 Cookie |
  | `Lax` | 跨站顶层导航 GET（点链接跳转）携带，跨站 POST/AJAX/子资源不携带（**默认值**） |
  | `None` | 所有跨站请求都携带，**必须同时设置 Secure** |

  > `SameSite=None` 不设置 `Secure`，浏览器会回退到 `Lax`。

  ### 最安全的登录 Cookie 配置

  ```
  Set-Cookie: sessionId=xxx; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
  ```

  ---

  ## 5. 跨站 vs 跨域

  | | 判断依据 | 严格程度 |
  |--|---------|---------|
  | **跨域（Cross-Origin）** | 协议 + 域名 + 端口，任一不同即跨域 | 严格 |
  | **跨站（Cross-Site）** | 只看 eTLD+1，子域名之间算同站 | 宽松 |

  ### 示例

  | URL 对比 | 同站/跨站 | 同域/跨域 |
  |---------|---------|---------|
  | `https://a.example.com` vs `https://b.example.com` | 同站 | 跨域 |
  | `https://example.com` vs `http://example.com` | 同站 | 跨域 |
  | `https://example.com` vs `https://example.org` | 跨站 | 跨域 |

  > 跨域不一定跨站，但跨站一定跨域。

  ### eTLD（有效顶级域名）

  浏览器维护 [Public Suffix List](https://publicsuffix.org/)，特殊域名如 `github.io`、`com.cn` 整体视为顶级域名：

  - `foo.github.io` vs `bar.github.io` → **跨站**
  - `shop.example.com` vs `api.example.com` → **同站**

  ---

  ## 6. Cookie 与 Session

  ### 为什么不直接把用户信息存进 Cookie？

  | 问题 | 说明 |
  |------|------|
  | 安全风险 | 用户信息明文存储，泄露后直接暴露隐私 |
  | 大小限制 | Cookie 上限 4KB，用户信息可能超出 |
  | 无法主动失效 | 服务端无法让存在客户端的信息强制过期 |

  ### Session 工作流程

  ```
  1. 用户提交账号密码
  2. 服务器校验通过 → 生成随机 sessionId → 存储 sessionId:用户信息 映射
  3. 响应头：Set-Cookie: sessionId=abc123; HttpOnly; Secure
  4. 后续请求自动携带 Cookie: sessionId=abc123
  5. 服务器查找 sessionId 对应的用户信息 → 完成身份验证
  ```

  ### 强制下线

  只需在服务端删除 sessionId 对应的数据，浏览器持有的 Cookie 立即失效。

  ---

  ## 7. Cookie vs localStorage vs sessionStorage

  | 维度 | Cookie | localStorage | sessionStorage |
  |------|--------|--------------|----------------|
  | 自动随请求发送 | ✅ | ❌ | ❌ |
  | 大小限制 | 4KB | ~5MB | ~5MB |
  | 生命周期 | 可配置 / Session | 永久（手动清除） | 标签页关闭即清除 |
  | 可被 JS 读取 | 默认可以（HttpOnly 除外） | ✅ | ✅ |
  | 服务端可读 | ✅ | ❌ | ❌ |

  ### 选型建议

  | 场景 | 推荐方案 | 理由 |
  |------|---------|------|
  | 登录 sessionId | Cookie | 自动发送，服务端可控 |
  | 用户主题偏好 | localStorage | 持久化，无需发送服务端 |
  | 表单临时草稿 | sessionStorage | 关闭标签页自动清除 |
  | 购物车（需服务端读取） | Cookie | 只有 Cookie 能自动发送到服务端 |

  ---

  ## 8. 跨站请求携带 Cookie（三方配合）

  当可信网站 A.com 需要向 B.com 发跨站请求并携带 Cookie 时：

  ### B.com 设置 Cookie
  ```
  Set-Cookie: token=xxx; SameSite=None; Secure
  ```

  ### B.com 响应头（CORS）
  ```
  Access-Control-Allow-Origin: https://a.com
  Access-Control-Allow-Credentials: true
  ```

  > `Access-Control-Allow-Origin` 不能用 `*`，必须指定具体域名。

  ### A.com 前端请求
  ```js
  fetch('https://b.com/api', {
    credentials: 'include'  // 跨站也携带 Cookie
  })
  ```

  ### credentials 的三个值

  | 值 | 含义 |
  |----|------|
  | `omit` | 任何情况都不携带凭证 |
  | `same-origin` | 只有同域请求携带凭证（**默认值**） |
  | `include` | 所有请求都携带凭证，包括跨站 |

  > 默认值 `same-origin` 体现了**最小权限原则**，防止 CSRF 攻击。

  ---

  ## 9. 安全攻击速查

  | 攻击类型 | 原理 | 防御手段 |
  |---------|------|---------|
  | XSS | 恶意脚本通过 `document.cookie` 读取 Cookie | `HttpOnly` |
  | 中间人 | 明文 HTTP 传输中截获 Cookie | `Secure` |
  | CSRF | 跨站请求自动携带 Cookie 冒充用户操作 | `SameSite=Lax/Strict` |

  ---

  ## 10. 面试回答模板

  > **Cookie 是浏览器存储机制之一，通过 `Set-Cookie` 响应头由服务端写入，之后每次请求自动携带在请求头中，解决了 HTTP 无状态的问题。**
  >
  > 涉及隐私信息的 Cookie 需要注意：设置 `HttpOnly` 防止客户端脚本读取（防 XSS）；设置 `Secure` 确保只在 HTTPS 下传输（防中间人）；至少设置 `SameSite=Lax` 防止跨站请求伪造（防 CSRF）。
