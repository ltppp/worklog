# worklog-cli

> npm 包: [@tianpeng1995/worklog-cli](https://www.npmjs.com/package/@tianpeng1995/worklog-cli)

[![npm version](https://img.shields.io/npm/v/@tianpeng1995/worklog-cli.svg)](https://www.npmjs.com/package/@tianpeng1995/worklog-cli)
[![npm downloads](https://img.shields.io/npm/dm/@tianpeng1995/worklog-cli.svg)](https://www.npmjs.com/package/@tianpeng1995/worklog-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

极简的个人工作管理知识库 CLI，与 Claude Code 深度集成。

**只需记住一件事：打开今天的文件，写。**

## ✨ 特性

- **极简设计** — 没有复杂的标签系统，没有 Johnny Decimal 编号，只有四个目录
- **Claude Code 集成** — 自动安装技能，用自然语言写日报、整理笔记
- **自动 Git 记录** — `/worklog:log` 自动拉取今日提交，告别手动写日报
- **渐进式归档** — 日记是临时池，周末整理到资源，形成个人知识库
- **Obsidian 友好** — 兼容 Obsidian Markdown，支持 Canvas 架构图

## 📦 安装

```bash
npm install -g @tianpeng1995/worklog-cli
```

## 🚀 快速开始

```bash
# 初始化知识库
worklog init ~/projects/my-worklog

# 或在当前目录初始化
cd ~/projects/my-worklog
worklog init
```

初始化会自动：
- 创建目录结构（日记/、项目/、资源/、画布/）
- 安装技能到 Claude Code
- 创建今日日记

## 📁 目录结构

```
my-worklog/
├── 日记/           ← 每天一个文件，临时记录
├── 项目/           ← 项目文档，技术细节、决策记录
├── 资源/           ← 可复用知识点、参考文档
├── 画布/           ← Canvas 架构图，可视化结构
└── CLAUDE.md       ← 知识库指引
```

## 🔁 工作流

| 时间 | 动作 |
|------|------|
| 上班 | 打开今天的日记，写任务、记进展 |
| 下班 | `/worklog:log` 写日报，自动拉取 git 提交 |
| 随时 | `/worklog:note xxx` 快速记笔记 |
| 周末 | `/worklog:summarize` 整理笔记到资源 |

## 📝 命令详解

### `/worklog:log` — 写日报

下班前运行，自动拉取今日 git 提交，让你补充说明，写入日记。

### `/worklog:project` — 同步项目文档

在项目目录运行，分析代码库，更新项目文档或生成架构画布。

### `/worklog:note` — 快速笔记

随时记一个想法或知识点，追加到今天的日记。
用法：`/worklog:note 今天学到了一个新技巧`

### `/worklog:summarize` — 整理本周笔记

周末运行，从日记中提取笔记，交互选择后整理到资源文件夹。

## 🔄 更新

```bash
# 在知识库目录运行
worklog update
```

## 🔧 手动安装（无需 npm）

```bash
git clone https://github.com/ltppp/worklog.git
cd worklog
npm link
```

## ❓ FAQ

### 为什么没有 Johnny Decimal 编号系统？

简化。大多数人不需要复杂的编号系统，日期 + 项目名已经足够定位。

### 可以用其他编辑器吗？

可以。目录结构兼容 Obsidian，但你可以用任何 Markdown 编辑器（VS Code、Typora 等）。

### 日记会一直堆积吗？

不会。周末运行 `/worklog:summarize`，将有价值的笔记整理到资源文件夹，日记只保留工作记录。

### 必须用 Claude Code 吗？

不必须。CLI 工具独立可用，但 Claude Code 技能让写日报、整理笔记更高效。

## 📄 许可证

[MIT](LICENSE)