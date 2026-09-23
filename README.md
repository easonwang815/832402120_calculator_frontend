# 832402120_calculator_frontend

EE308 第一次作业「前后端分离计算器系统」的**前端**。

提供计算器用户界面（按钮 + 键盘输入）、表达式输入、结果展示、历史记录展示与删除、错误信息提示。**前端不包含任何计算逻辑**——所有计算请求发送给后端完成，前端只展示后端返回的结果。

---

## 1. 技术栈

| 层 | 技术 |
|---|---|
| 结构 | HTML5 |
| 样式 | CSS3（原生，无框架） |
| 逻辑 | 原生 JavaScript（fetch API） |
| 构建 | 无（纯静态页面，无需打包） |

## 2. 整体框架

```
index.html（页面结构）
├── css/style.css   样式：计算器面板、按钮、历史列表
└── js/
    ├── api.js      计算 / 历史 / 进制转换 API 封装
    └── app.js      计算器、历史搜索分页、进制转换交互

        │  HTTP + JSON（fetch）
        ▼
后端 API (默认 http://localhost:8080/api)
```

**数据流**

```
用户点击按钮 / 键盘输入
  → app.js 组装表达式（界面显示 × ÷，发送时转 * /）
  → api.js POST /api/calculate
  → 后端计算并保存历史，返回结果
  → app.js 展示结果，并重新拉取 GET /api/history 刷新历史列表
```

**职责边界**：前端只负责交互与展示；表达式解析、计算、历史持久化全部由后端完成。停掉后端服务后，前端仍可输入，但无法获得任何新的计算结果。

## 3. 功能

- 基础四则运算与复合表达式输入（支持括号、小数、一元正负号）
- 科学计算：次方、开方、`sin` / `cos` / `tan`（角度制）
- 结果显示、错误信息展示（无效表达式 / 除零 / 无法连接后端）
- 计算历史列表、表达式/结果搜索、每页 5 条分页
- 删除单条历史 / 清空全部历史
- 2 / 8 / 10 / 16 进制整数互转
- 键盘快捷键（加分项）：数字与运算符直接输入、`Enter` 计算、`Backspace` 退格、`Esc` 清空

## 4. 运行环境

- 现代浏览器（Chrome / Edge / Safari 等）
- 可选：Python 3（用于本地静态托管）

## 5. 安装与启动

本项目是纯静态页面，**无需安装任何依赖**。两种方式：

**方式一：本地静态服务器（推荐）**

```bash
cd 832402120_calculator_frontend
python3 -m http.server 8000
```

浏览器访问：`http://localhost:8000`

> 使用前请确保**后端服务已启动**（见后端仓库 README「安装与启动」）。建议使用静态服务器启动；`file://` 方式会受到浏览器跨域策略限制。

## 6. 与后端连接

前端通过 HTTP API 与后端通信。页面会按以下顺序确定 API 地址：

1. `index.html` 中 `<meta name="api-base">` 配置的地址；
2. 本地访问时默认使用 `http://localhost:8080/api`；
3. 公网同域部署时默认使用 `/api`。

前后端分别部署在不同域名时，将 `index.html` 中的 `api-base` 改为完整后端地址，并在后端设置环境变量 `CORS_ALLOWED_ORIGINS` 为前端域名。

## 7. 项目结构

```
832402120_calculator_frontend/
├── index.html          计算器界面 + 历史面板
├── css/
│   └── style.css       全部样式
├── js/
│   ├── api.js          后端 API 请求封装
│   └── app.js          页面交互逻辑
├── README.md
└── codestyle.md
```

## 8. 代码规范

JavaScript / CSS 遵循 [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)，详见同仓库 `codestyle.md`。
