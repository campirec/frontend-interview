# Session: 前端网络知识

## Learner Profile
- Level: beginner（有前端项目经验，网络基础薄弱）
- Language: zh
- Started: 2026-03-28

## Concept Map
| # | Concept | Prerequisites | Status | Score | Last Reviewed | Review Interval |
|---|---------|---------------|--------|-------|---------------|-----------------|
| 1 | 网络分层模型 | - | mastered | 85% | 2026-03-28 | 1d |
| 2 | TCP 连接机制 | 1 | mastered | 80% | 2026-03-29 | 1d |
| 3 | DNS 域名解析 | 1 | in-progress | 0% | - | - |
| 4 | HTTP 请求与响应 | 1 | not-started | - | - | - |
| 5 | HTTP 协议演进 | 4 | not-started | - | - | - |
| 6 | HTTPS 与 TLS | 4 | not-started | - | - | - |
| 7 | 浏览器缓存策略 | 4, 5 | not-started | - | - | - |
| 8 | URL 到页面的完整旅程 | 1-7 | not-started | - | - | - |
| 9 | 同源策略与跨域 | 4 | not-started | - | - | - |
| 10 | Cookie 与认证 | 4, 6 | not-started | - | - | - |
| 11 | 浏览器渲染流水线 | 8 | not-started | - | - | - |
| 12 | 前端网络性能优化 | 全部 | not-started | - | - | - |

## Misconceptions
| # | Concept | Misconception | Root Cause | Status | Counter-Example Used |
|---|---------|---------------|------------|--------|---------------------|
| 1 | TCP 连接机制 | 三次握手只需要两步，因为"我发你回"就双向通了 | 忽略了第二步后服务器不知道客户端能否接收 | resolved | "第二步之后，对方知道你收到了吗？" |

## Session Log
- [2026-03-28] Diagnosed level: beginner（有前端项目经验）
- [2026-03-28] 学习路线图已建立，共 12 个概念
- [2026-03-28] 概念 1 网络分层模型：mastered（85%）
- [2026-03-29] 概念 2 TCP 连接机制：mastered（80%）— 理解三次握手必要性、四次挥手半关闭、能应用到 fetch pending 场景。实践任务中轻微遗漏第三次握手的必要性，经提醒后已理解
