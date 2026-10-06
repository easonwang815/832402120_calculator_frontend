# 832402120_calculator_frontend

EE308 第一次作业「前后端分离计算器系统」的**前端**。

提供计算器用户界面（按钮 + 键盘输入）、表达式输入、结果展示、历史记录展示与删除、错误信息提示。**前端不包含任何计算逻辑**——所有计算请求发送给后端完成，前端只展示后端返回的结果。

## 快速打开

- **在线完整演示**：[http://47.98.182.108/](http://47.98.182.108/)，无需安装软件，直接用浏览器打开。
- [前端仓库](https://github.com/easonwang815/832402120_calculator_frontend) · [后端仓库](https://github.com/easonwang815/832402120_calculator_backend)。私有仓库需要获得访问权限后才能克隆。
- 当前部署在阿里云杭州轻量应用服务器，免费试用到 **2026-11-06 23:59:59**；不是永久免费，评审期间需保持服务可用。
- 当前使用 HTTP、访客共享计算历史，请勿输入敏感信息。此前的 GitHub Pages 页面仅托管静态前端，**不要将其作为完整功能演示入口**。

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

本项目是纯静态页面，**无需 npm 安装或构建**。本地运行时需要同时启动后端和前端，两个终端都保持运行。

### 5.1 下载两个仓库

在同一个父目录执行（已经下载的可跳过）：

```bash
git clone https://github.com/easonwang815/832402120_calculator_backend.git
git clone https://github.com/easonwang815/832402120_calculator_frontend.git
```

### 5.2 终端一：启动后端

先安装 JDK 17 和 Maven 3.9，并确认 `java -version`、`mvn -version` 可用。在上述父目录执行：

```bash
cd 832402120_calculator_backend
mvn spring-boot:run
```

后端默认监听 `http://localhost:8080`，使用 H2 文件数据库，不需要安装 MySQL。详细配置见[后端运行说明](https://github.com/easonwang815/832402120_calculator_backend#readme)。

### 5.3 终端二：启动前端

先安装 Python 3。在上述父目录打开另一个终端，执行：

```bash
cd 832402120_calculator_frontend
python3 -m http.server 8000
```

浏览器打开：[http://localhost:8000/](http://localhost:8000/)。输入 `1+2`，点击 `=` 或按 `Enter`，应显示 `3` 并在历史列表中新增记录。

在两个终端分别按 `Ctrl+C` 可以停止本地服务。历史保存在后端目录的 `data/` 中，停止服务或刷新网页不会清空历史；不要删除该目录。

> 不要直接双击 `index.html` 使用 `file://` 打开；请使用上面的 HTTP 静态服务器。Windows 可将 `python3` 替换为 `py -3`。

## 6. 与后端连接

前端通过 HTTP API 与后端通信。页面会按以下顺序确定 API 地址：

1. `index.html` 中 `<meta name="api-base">` 配置的地址；
2. 本地访问时默认使用 `http://localhost:8080/api`；
3. 公网同域部署时默认使用 `/api`。

前后端分别部署在不同域名时，将 `index.html` 中的 `api-base` 改为完整后端地址，并在后端设置环境变量 `CORS_ALLOWED_ORIGINS` 为前端域名。

例如后端地址为 `https://api.example.com` 时，应包含 `/api`：

```html
<meta name="api-base" content="https://api.example.com/api">
```

HTTPS 前端不能直接请求 HTTP 后端。当前阿里云部署采用同域方案：Nginx 提供前端，并将 `/api/` 转发给后端，`api-base` 保持空值即可。

### 常见问题

- **历史加载失败或无法计算**：确认后端终端没有退出，并用浏览器访问 `http://localhost:8080/api/history` 检查接口。
- **页面打不开**：确认前端终端正在运行，访问的是 `http://localhost:8000/`，而不是后端的 8080 端口。
- **8000 端口被占用**：关闭占用该端口的旧静态服务器再启动。若改用其他前端端口，也需要修改后端允许的 CORS 来源。
- **在线演示打不开**：检查阿里云试用是否到期、实例和后台服务是否运行；服务器运维方法见后端 README。

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
