# worklog-cli

> npm 包: [@tianpeng1995/worklog-cli](https://www.npmjs.com/package/@tianpeng1995/worklog-cli)

[![npm version](https://img.shields.io/npm/v/@tianpeng1995/worklog-cli.svg)](https://www.npmjs.com/package/@tianpeng1995/worklog-cli)
[![npm downloads](https://img.shields.io/npm/dm/@tianpeng1995/worklog-cli.svg)](https://www.npmjs.com/package/@tianpeng1995/worklog-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

极简的个人工作管理知识库 CLI，基于 Obsidian 双向链接构建知识网络。

**只需记住一件事：打开今天的文件，写。**

## ✨ 特性

- **Obsidian 原生** — 基于双向链接，日记 → 项目 → 资源形成知识网络
- **多工具支持** — 支持 Claude Code、Codex、Cursor，初始化时可选择
- **自动 Git 记录** — `/worklog:log` 自动拉取今日提交，自动链接项目
- **渐进式归档** — 日记是临时池，周末整理到资源，形成个人知识库
- **Canvas 支持** — 支持可视化架构图画布

## 📦 安装

```bash
npm install -g @tianpeng1995/worklog-cli
```

**推荐使用 Obsidian 打开知识库目录。**

## 🚀 快速开始

```bash
# 初始化知识库
worklog init ~/projects/my-worklog

# 用 Obsidian 打开
obsidian ~/projects/my-worklog
```

初始化会自动：
- 创建目录结构（日记/、项目/、资源/、画布/）
- 交互选择要安装的 AI 工具（Claude Code、Codex、Cursor）
- 安装对应工具的技能文件
- 创建今日日记

## 📁 目录结构

```
my-worklog/
├── 日记/           ← 每天一个文件，链接到项目和资源
├── 项目/           ← 项目文档，反向链接自动显示相关日记
├── 资源/           ← 可复用知识点，反向链接自动显示来源
├── 画布/           ← Canvas 架构图
└── CLAUDE.md       ← 知识库指引
```

## 🔗 知识网络

worklog 利用 Obsidian 双向链接，让笔记自然形成网络：

```
日记                    项目                    资源
─────────────────       ─────────────────       ─────────────────
2026-04-03              api-golang              MongoDB
  工作记录:               技术栈:                  要点:
  - 登录功能 → [[api-golang]]  - Go              - 连接池配置...
  - 学到... → [[MongoDB]]      - gRPC            - 索引优化...
                              ↓
                         反向链接:
                         - 2026-04-03
                         - 2026-04-02
```

**单向链接，自动反向：**
- 在日记中写 `[[api-golang]]`
- api-golang 文档底部自动显示"反向链接：2026-04-03"

## 🔁 工作流

| 时间 | 动作 |
|------|------|
| 上班 | 打开今天的日记，写任务、记进展 |
| 下班 | `/worklog:log` 写日报，自动链接到项目 |
| 随时 | `/worklog:note xxx` 快速记笔记 |
| 周末 | `/worklog:summarize` 整理笔记到资源 |

## 📝 命令详解

### `/worklog:log` — 写日报

下班前运行：
1. 多选 git 提交
2. 输入其他工作
3. 自动识别项目，添加双向链接

```markdown
## 工作记录
- 实现登录功能 → [[api-golang]]
- 修复支付 bug → [[octopus]]
- 参加周会
```

### `/worklog:project` — 同步项目文档

在项目目录运行，分析代码库，生成项目文档。

项目文档不包含"开发记录"——由反向链接自动展示。

### `/worklog:note` — 快速笔记

随时记一个想法或知识点，追加到今天的日记。

### `/worklog:summarize` — 整理本周笔记

周末运行，从日记中提取笔记，整理到资源，建立双向链接。

## 🔄 更新

```bash
worklog update
```

## ❓ FAQ

### 为什么推荐 Obsidian？

worklog 利用 Obsidian 的双向链接特性：
- 日记中的 `[[项目名]]` 自动链接到项目文档
- 项目文档底部自动显示相关日记（反向链接）
- 形成自然的知识网络，无需手动维护

### 可以用其他编辑器吗？

可以，但会失去双向链接的便利性。VS Code、Typora 只能看到纯文本。

### 支持哪些 AI 工具？

- **Claude Code** — 技能安装到 `~/.claude/commands/worklog/`
- **Codex** — 技能安装到 `~/.codex/prompts/`
- **Cursor** — 技能安装到 `<知识库>/.cursor/commands/`

## 📄 许可证

[MIT](LICENSE)