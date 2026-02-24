# CSS 进阶

## 盒模型

```css
/* 标准盒模型：width = content */
box-sizing: content-box;

/* IE 盒模型：width = content + padding + border */
box-sizing: border-box; /* 推荐全局使用 */
```

## BFC（块级格式化上下文）

### 触发条件
- `overflow` 不为 `visible`（常用 `overflow: hidden`）
- `display: flow-root`（最语义化的方式）
- `display: inline-block / flex / grid / table-cell`
- `float` 不为 `none`
- `position: absolute / fixed`
- `contain: layout / content / paint`

### BFC 的作用
1. **清除浮动** — BFC 会包含内部浮动元素的高度
2. **阻止 margin 合并** — 不同 BFC 之间的 margin 不会合并
3. **阻止被浮动元素覆盖** — BFC 不会与浮动元素重叠

## 层叠上下文（Stacking Context）

### 创建条件
- `z-index` 不为 `auto` 的定位元素
- `opacity` < 1
- `transform` / `filter` / `backdrop-filter` 不为 `none`
- `will-change` 指定了上述属性
- `isolation: isolate`

### 层叠顺序（从低到高）
```
背景/边框 → 负 z-index → 块级元素 → 浮动 → 行内元素 → z-index:0/auto → 正 z-index
```

## 包含块（Containing Block）

- `position: static/relative` → 最近的块级祖先的 content box
- `position: absolute` → 最近的非 static 定位祖先的 padding box
- `position: fixed` → viewport（但 transform/filter 祖先会改变这一行为）
- 百分比宽高、padding、margin 都相对于包含块计算

## Flex 布局

```css
.container {
  display: flex;
  flex-direction: row;        /* 主轴方向 */
  justify-content: center;    /* 主轴对齐 */
  align-items: center;        /* 交叉轴对齐 */
  flex-wrap: wrap;             /* 换行 */
  gap: 16px;                  /* 间距 */
}

.item {
  flex: 1 1 0%;               /* flex-grow flex-shrink flex-basis */
  /* flex: 1 等价于 flex: 1 1 0% */
  /* flex: auto 等价于 flex: 1 1 auto */
  /* flex: none 等价于 flex: 0 0 auto */
}
```

### flex-shrink 计算
当空间不足时，收缩量 = 项目 flex-shrink × flex-basis 的加权比例

## Grid 布局

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);          /* 三等分 */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* 响应式 */
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  gap: 16px;
}

.item {
  grid-column: 1 / 3;         /* 跨列 */
  grid-row: span 2;           /* 跨行 */
  grid-area: header;          /* 命名区域 */
}
```

## 响应式方案

### 媒体查询
```css
/* 移动优先 */
@media (min-width: 768px) { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }
```

### Container Queries（容器查询）
```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card { flex-direction: row; }
}
```

### 适配方案
- **rem + 根字体大小** — 通过 JS 动态设置 html font-size
- **vw/vh** — 视口单位，配合 `clamp()` 使用
- **clamp()** — `font-size: clamp(14px, 2vw, 18px)` 响应式字体

## CSS 新特性

### :has() — 父选择器
```css
/* 包含图片的卡片 */
.card:has(img) { padding: 0; }

/* 后面有 p 的 h2 */
h2:has(+ p) { margin-bottom: 0; }
```

### Subgrid
```css
.child {
  display: grid;
  grid-template-columns: subgrid; /* 继承父 grid 的列轨道 */
}
```

### @layer（级联层）
```css
@layer base, components, utilities;

@layer base {
  a { color: blue; }
}
@layer utilities {
  .text-red { color: red; } /* 优先级高于 base 层 */
}
```

### Nesting（原生嵌套）
```css
.card {
  background: white;
  & .title {
    font-size: 1.5rem;
  }
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
}
```

### View Transitions API
```css
::view-transition-old(root) {
  animation: fade-out 0.3s;
}
::view-transition-new(root) {
  animation: fade-in 0.3s;
}
```
