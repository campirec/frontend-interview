/**
 * CSS 经典布局与面试题
 * 以 HTML + CSS 代码片段形式展示
 */

// ============================================
// 题目 1：水平垂直居中（5 种方式）
// ============================================
const centeringMethods = `
/* 方式 1：Flex（推荐） */
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 方式 2：Grid */
.parent {
  display: grid;
  place-items: center;
}

/* 方式 3：absolute + transform */
.parent { position: relative; }
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 方式 4：absolute + margin auto */
.parent { position: relative; }
.child {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 200px;  /* 需要固定宽高 */
  height: 200px;
}

/* 方式 5：Grid + margin auto */
.parent { display: grid; }
.child { margin: auto; }
`

// ============================================
// 题目 2：两栏布局（左固定右自适应）
// ============================================
const twoColumnLayout = `
/* 方式 1：Flex */
.container {
  display: flex;
}
.left {
  width: 200px;
  flex-shrink: 0; /* 防止被压缩 */
}
.right {
  flex: 1;
}

/* 方式 2：Grid */
.container {
  display: grid;
  grid-template-columns: 200px 1fr;
}

/* 方式 3：float + BFC */
.left {
  float: left;
  width: 200px;
}
.right {
  overflow: hidden; /* 创建 BFC，不与浮动元素重叠 */
}
`

// ============================================
// 题目 3：三栏布局（圣杯/双飞翼）
// ============================================
const threeColumnLayout = `
/* 现代方案：Grid（推荐） */
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  gap: 16px;
}

/* 现代方案：Flex */
.container {
  display: flex;
}
.left, .right {
  width: 200px;
  flex-shrink: 0;
}
.center {
  flex: 1;
}

/* 经典圣杯布局 — 面试考点 */
.container {
  padding: 0 200px;
}
.center {
  float: left;
  width: 100%;
}
.left {
  float: left;
  width: 200px;
  margin-left: -100%;
  position: relative;
  left: -200px;
}
.right {
  float: left;
  width: 200px;
  margin-left: -200px;
  position: relative;
  right: -200px;
}
`

// ============================================
// 题目 4：BFC 应用
// ============================================
const bfcExamples = `
/* 问题 1：margin 塌陷 — 父子元素 margin 合并 */
.parent {
  overflow: hidden; /* 创建 BFC，阻止 margin 穿透 */
}
.child {
  margin-top: 20px; /* 不会穿透到父元素外 */
}

/* 问题 2：清除浮动 */
.container {
  display: flow-root; /* 最语义化的 BFC 触发方式 */
}
.float-child {
  float: left;
  /* 父容器会包含浮动子元素的高度 */
}

/* 问题 3：阻止文字环绕浮动元素 */
.float { float: left; width: 100px; }
.text {
  overflow: hidden; /* BFC 不与浮动元素重叠 */
}
`

// ============================================
// 题目 5：1px 边框问题（移动端）
// ============================================
const onePixelBorder = `
/* 方案 1：transform scale（推荐） */
.border-1px {
  position: relative;
}
.border-1px::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid #ccc;
  border-radius: inherit;
  pointer-events: none;
  transform-origin: 0 0;
}
@media (-webkit-min-device-pixel-ratio: 2) {
  .border-1px::after {
    transform: scale(0.5);
    width: 200%;
    height: 200%;
  }
}

/* 方案 2：使用 0.5px（iOS 8+ 支持） */
.border-half {
  border: 0.5px solid #ccc;
}
`

// ============================================
// 题目 6：CSS 实现三角形
// ============================================
const cssTriangle = `
/* 方式 1：border */
.triangle {
  width: 0;
  height: 0;
  border: 50px solid transparent;
  border-bottom-color: red;
}

/* 方式 2：clip-path（更灵活） */
.triangle {
  width: 100px;
  height: 100px;
  background: red;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}
`

// ============================================
// 题目 7：文本溢出省略
// ============================================
const textEllipsis = `
/* 单行省略 */
.single-line {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 多行省略 */
.multi-line {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
`

// ============================================
// 题目 8：Flex 计算题
// ============================================
const flexCalculation = `
/*
  容器宽度 600px，三个子元素：
  A: flex: 1 1 200px
  B: flex: 2 1 100px
  C: flex: 1 1 100px

  总 basis = 200 + 100 + 100 = 400px
  剩余空间 = 600 - 400 = 200px
  总 grow = 1 + 2 + 1 = 4

  A 宽度 = 200 + (200 × 1/4) = 250px
  B 宽度 = 100 + (200 × 2/4) = 200px
  C 宽度 = 100 + (200 × 1/4) = 150px
*/

/*
  空间不足时的 shrink 计算：
  容器宽度 300px，两个子元素：
  A: flex: 0 1 200px
  B: flex: 0 2 200px

  溢出 = 200 + 200 - 300 = 100px
  加权总值 = 1×200 + 2×200 = 600
  A 收缩 = 100 × (1×200/600) = 33.3px → A = 166.7px
  B 收缩 = 100 × (2×200/600) = 66.7px → B = 133.3px
*/
`

export {
  centeringMethods,
  twoColumnLayout,
  threeColumnLayout,
  bfcExamples,
  onePixelBorder,
  cssTriangle,
  textEllipsis,
  flexCalculation,
}
