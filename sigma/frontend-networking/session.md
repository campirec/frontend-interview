# Session: 前端网络知识

## Learner Profile
- Level: beginner → intermediate
- Language: zh
- Started: 2026-03-28
- Completed: 2026-03-31

## Concept Map
| # | Concept | Prerequisites | Status | Score | Last Reviewed | Review Interval |
|---|---------|---------------|--------|-------|---------------|-----------------|
| 1 | 网络分层模型 | - | mastered | 85% | 2026-03-28 | 1d |
| 2 | TCP 连接机制 | 1 | mastered | 80% | 2026-03-29 | 1d |
| 3 | DNS 域名解析 | 1 | mastered | 82% | 2026-03-29 | 1d |
| 4 | HTTP 请求与响应 | 1 | mastered | 82% | 2026-03-29 | 1d |
| 5 | HTTP 协议演进 | 4 | mastered | 78% | 2026-03-31 | 1d |
| 6 | HTTPS 与 TLS | 4 | mastered | 82% | 2026-03-31 | 1d |
| 7 | 浏览器缓存策略 | 4, 5 | mastered | 85% | 2026-03-31 | 1d |
| 8 | URL 到页面的完整旅程 | 1-7 | mastered | 80% | 2026-03-31 | 1d |
| 9 | 同源策略与跨域 | 4 | mastered | 85% | 2026-03-31 | 1d |
| 10 | Cookie 与认证 | 4, 6 | mastered | 82% | 2026-03-31 | 1d |
| 11 | 浏览器渲染流水线 | 8 | mastered | 82% | 2026-03-31 | 1d |
| 12 | 前端网络性能优化 | 全部 | mastered | 85% | 2026-03-31 | 1d |

## Misconceptions
| # | Concept | Misconception | Root Cause | Status | Counter-Example Used |
|---|---------|---------------|------------|--------|---------------------|
| 1 | TCP 连接机制 | 三次握手只需要两步 | 忽略了第二步后服务器不知道客户端能否接收 | resolved | "第二步之后，对方知道你收到了吗？" |
| 2 | DNS 域名解析 | dns-prefetch 会阻塞浏览器渲染 | 误解 hint 类型标签的优先级 | resolved | 对比 <script> 阻塞 vs dns-prefetch 异步提示 |
| 3 | HTTP 请求与响应 | 401 是"没权限" | 混淆 401（未认证）和 403（禁止访问） | resolved | "你是谁" vs "你不配"的区分 |

## Session Log
- [2026-03-28] Diagnosed level: beginner（有前端项目经验）
- [2026-03-28] 学习路线图已建立，共 12 个概念
- [2026-03-28] 概念 1 网络分层模型：mastered（85%）
- [2026-03-29] 概念 2 TCP 连接机制：mastered（80%）
- [2026-03-29] 概念 3 DNS 域名解析：mastered（82%）
- [2026-03-29] 概念 4 HTTP 请求与响应：mastered（82%）
- [2026-03-31] 概念 5 HTTP 协议演进：mastered（78%）
- [2026-03-31] 概念 6 HTTPS 与 TLS：mastered（82%）
- [2026-03-31] 概念 7 浏览器缓存策略：mastered（85%）
- [2026-03-31] 概念 8 URL 到页面的完整旅程：mastered（80%）
- [2026-03-31] 概念 9 同源策略与跨域：mastered（85%）
- [2026-03-31] 概念 10 Cookie 与认证：mastered（82%）
- [2026-03-31] 概念 11 浏览器渲染流水线：mastered（82%）
- [2026-03-31] 概念 12 前端网络性能优化：mastered（85%）
- [2026-03-31] 🎉 全部 12 个概念已掌握！
