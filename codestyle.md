# Code Style / 代码规范

## 规范来源

本文档基于 **Google JavaScript Style Guide**（https://google.github.io/styleguide/jsguide.html）与 **Google HTML/CSS Style Guide**（https://google.github.io/styleguide/htmlcssguide.html），并结合本项目实际情况制定项目级约定。

---

## 1. JavaScript 规范

### 命名

| 对象 | 规范 | 示例 |
|---|---|---|
| 变量 / 函数 | lowerCamelCase | `getHistory()`、`apiBase` |
| 常量 | UPPER_SNAKE_CASE 或 `const` 声明 | `API_BASE` |
| 类 / 构造函数 | UpperCamelCase | `Calculator` |

### 变量声明

- 一律使用 `const` / `let`，**禁止 `var`**
- 优先使用 `const`，仅在变量会被重新赋值时用 `let`

```js
const API_BASE = 'http://localhost:8080/api';
let expression = '';
```

### 格式

- 缩进使用 **4 个空格**
- 字符串使用单引号 `'...'`
- 语句以分号结尾
- 大括号采用 K&R 风格
- 函数体、`if / for` 必须使用大括号

### 函数与异步

- 函数保持短小、单一职责
- 异步操作统一使用 `async / await`，不嵌套回调
- 文件顶部启用严格模式：`'use strict';`
- 不使用全局变量污染作用域（本项目交互逻辑包在 IIFE 中）

### DOM 操作

- 通过 `document.getElementById` 获取元素后**缓存到变量**，避免重复查询
- 事件绑定使用 `addEventListener`，**禁止内联事件**（`onclick="..."`）
- 动态创建元素用 `document.createElement`，不用 `innerHTML` 拼接不可信内容

## 2. HTML 规范

- 使用语义化标签（`button`、`ul/li`、`header` 等）
- 嵌套元素保持缩进
- 属性值使用双引号
- `id` / `class` 命名使用 **kebab-case**：`history-list`、`delete-btn`

## 3. CSS 规范

- 类名使用 **kebab-case**
- 每条规则一个属性一行，以分号结尾
- 颜色使用十六进制（`#f1f5f9`），不使用魔法数字
- 样式按模块分组：基础样式 → 计算器 → 历史面板
- 不使用 `!important`（除非必要）

```css
.delete-btn {
    border: none;
    background: #fef2f2;
    color: #dc2626;
}
```

## 4. 检查方式

- 提交前在浏览器中完成一次完整操作验证（输入 → 计算 → 历史刷新 → 删除）
- 打开浏览器开发者工具 Console，确认无报错
