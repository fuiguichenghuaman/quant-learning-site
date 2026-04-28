# 从零开始学量化交易

这是一个记录个人从零学习中国股市、Python、数据分析、策略回测和量化交易系统搭建过程的网站项目。

## 项目定位

本项目只用于学习记录、代码实验和技术交流，不构成任何投资建议。

网站定位是：

`一个普通人从零学习中国股市量化交易的公开实验室。`

## 当前功能

当前项目已经包含这些真实页面和内容模块：

- 首页
- 学习日志
- 代码实验
- 策略实验室
- 中国股市基础
- 每周复盘
- 关于我

项目里同时保留了学习用 Python 脚本和样例数据，方便把“代码实验”和“公开记录”放在同一个仓库里维护。

## 技术栈

根据当前项目真实情况，使用的是：

- Vite
- 纯 HTML
- 纯 CSS
- 原生 JavaScript
- JSON / Markdown 内容文件

当前项目不是 React、TypeScript 或 Tailwind CSS 项目。

## 项目结构

```text
.
├─ index.html
├─ pages/
├─ assets/
├─ content/
├─ tools/
├─ TestNumpyStock.py
├─ TestNumpyStock_explained.py
├─ LEARNING_PROGRESS.md
├─ demo.csv
├─ demo.csv.xlsx
├─ package.json
└─ vite.config.js
```

主要目录说明：

- `pages/`：网站子页面
- `assets/`：共享样式和脚本
- `content/`：学习日志、代码实验、策略模板、声明等内容文件
- `tools/prepare-site.mjs`：构建前同步公开内容到 `public/`
- `TestNumpyStock.py`：当前量化学习主脚本
- `TestNumpyStock_explained.py`：配套讲解脚本

## 本地运行方法

先进入项目目录，再安装依赖：

```powershell
npm install
```

启动本地开发环境：

```powershell
npm run dev
```

默认本地地址通常是：

```text
http://127.0.0.1:5173/
```

## 构建方法

```powershell
npm run build
```

当前构建产物目录是：

- `dist/`

## 预览方法

```powershell
npm run preview
```

## 如何更新网站内容

优先修改 `content/` 目录中的内容文件：

- `content/learning-log.json`：学习日志
- `content/code-experiments.json`：代码实验
- `content/strategy-lab.json`：策略实验室
- `content/weekly-review-template.md`：每周复盘模板
- `content/disclaimer.md`：风险声明

如果修改了 Python 学习脚本，建议保持这个节奏：

1. 先修改 `TestNumpyStock.py`
2. 确认脚本能运行
3. 再同步更新 `TestNumpyStock_explained.py`
4. 最后把这次学习内容补到 `content/learning-log.json`

## 部署建议

推荐使用 Vercel 直接导入 GitHub 仓库进行免费部署。

常见配置：

- Install Command：`npm install`
- Build Command：`npm run build`
- Output Directory：`dist`

以后只要把新代码 push 到 GitHub，Vercel 通常就会自动重新部署。

## 风险声明

本网站所有内容均为个人学习记录，不构成投资建议，不推荐任何股票买卖，不承诺任何收益。
