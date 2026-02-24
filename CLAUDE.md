# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

前端知识体系梳理与面试题集。纯内容项目，无构建流程、无依赖。

## 项目结构

每个模块统一为 `index.md`（知识点）+ `questions.js/ts`（代码题目与实现）。

- `src/javascript/` — JS 核心（7 个子模块：event-loop、scope-closure、prototype、this、async、es6+、type-system）
- `src/typescript/` — TS 类型体操（questions.ts）
- `src/css/` — CSS 布局与进阶
- `src/vue/` — Vue3 生态（响应式、Diff、Router、Pinia、Nuxt）
- `src/engineering/` — 工程化（Vite、模块化、构建优化、Monorepo）
- `src/network/` — 网络与浏览器（HTTP、缓存、渲染流水线、跨域）
- `src/handwriting/` — 高频手写实现合集
- `src/security/` — 前端安全（XSS、CSRF、CSP）

## 技术约定

- ESM 模块（`"type": "module"`）
- 包管理器：pnpm
- 内容语言：简体中文
- questions.js 中的题目函数默认注释，取消注释后可直接 `node` 运行验证
