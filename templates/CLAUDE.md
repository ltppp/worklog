# worklog 知识库指引

这是一个极简的个人工作管理知识库，基于 Obsidian 双向链接构建知识网络。

**核心原则：打开今天的文件，写。**

<!-- Obsidian 格式参考：~/.claude/skills/obsidian-markdown -->

## 目录结构

```
日记/     ← 每天一个文件，所有内容先记这里
项目/     ← 项目文档，技术细节、决策记录
资源/     ← 可复用的知识点、参考文档
画布/     ← Canvas 文件，可视化架构图
```

## 知识网络

worklog 利用 Obsidian 双向链接，让笔记自然形成网络：

- **日记 → 项目**：工作记录链接到项目文档
- **日记 → 资源**：笔记链接到知识点文档
- **反向链接**：项目和资源底部自动显示相关日记

## 工作流

1. **上班** → 打开今天的日记，写任务、记进展
2. **下班** → `/worklog:log` 写日报，自动链接项目
3. **随时** → `/worklog:note` 快速记笔记
4. **周末** → `/worklog:summarize` 整理笔记到资源

## 命令

| 命令 | 功能 |
|------|------|
| `/worklog:log` | 写日报，自动链接到项目 |
| `/worklog:project` | 同步项目文档 |
| `/worklog:note` | 快速笔记 |
| `/worklog:summarize` | 整理笔记到资源 |

## 文件命名

- 日记：`YYYY-MM-DD.md`
- 项目：`{项目名}.md`
- 资源：`{主题}.md`
- 画布：`{项目名}架构.canvas`

## 日记模板

使用 frontmatter + callouts 分区，在 Obsidian reading view 视觉清晰：

```markdown
---
title: YYYY-MM-DD
date: YYYY-MM-DD
tags:
  - diary
aliases:
  - 今天
---

# YYYY-MM-DD

> [!todo] 今天要做的
> - [ ]

> [!tip]+ 工作记录
> - {工作内容} [[{项目名}]]

> [!note]- 笔记
> - {知识点} [[{资源名}]]

> [!warning] 明天继续
> - ...
```

**callout 类型说明：**
- `[!todo]` — 任务列表，蓝色样式
- `[!tip]+` — 工作记录，默认展开
- `[!note]-` — 笔记，默认折叠不影响主视图
- `[!warning]` — 待办事项，黄色提示感

## 项目文档模板

深度分析代码生成完整文档，包含 API 接口、数据模型、开发指引：

```markdown
---
title: {项目名}
date: YYYY-MM-DD
tags:
  - project
aliases:
  - {别名}
---

# {项目名}

{一句话描述}

**核心功能：**
- 功能 1
- 功能 2

## 基本信息

| 属性 | 值 |
|------|-----|
| **Location** | `/{绝对路径}` |
| **语言** | {语言} {版本} |
| **框架** | {框架} |
| **数据库** | {数据库} |

> [!abstract] 技术栈
> - {语言} {版本}
> - {框架}
> - {数据库}

> [!info] 目录结构
> ```
> {项目名}/
> ├── cmd/                # 入口
> ├── internal/
> │   ├── handler/        # HTTP 处理器
> │   ├── service/        # 业务逻辑
> │   └── model/          # 数据模型
> └── go.mod
> ```

> [!example] API 接口
> | 方法 | 路径 | 说明 | Handler |
> |------|------|------|---------|
> | GET | `/api/users` | 获取用户列表 | `GetUsers` |
> | POST | `/api/users` | 创建用户 | `CreateUser` |

> [!note] 数据模型
> **User** — 用户模型
> | 字段 | 类型 | 说明 |
> |------|------|------|
> | id | uint | 主键 |
> | username | string | 用户名 |

> [!tip] 关键文件
> | 文件 | 作用 |
> |------|------|
> | `cmd/server/main.go` | 服务入口 |
> | `internal/handler/` | 接口处理 |

> [!success] 开发指引
> **本地启动：**
> ```bash
> go run cmd/server/main.go
> ```
>
> **运行测试：**
> ```bash
> go test ./...
> ```

> [!example] 架构
> 画布：![[{项目名}架构.canvas]]

> [!note]+ 笔记
> - 重要决策、踩坑记录
```

**关键改进：**
- **目录结构** — 可视化项目组织
- **API 接口** — 从代码提取路由列表
- **数据模型** — 核心实体字段说明
- **开发指引** — 启动、测试、部署命令
- **架构画布** — 根据项目类型自动生成

## 资源文档模板

使用分层 tags 和多种 callouts 区分内容类型：

```markdown
---
title: {主题}
date: YYYY-MM-DD
tags:
  - {分类}
aliases:
  - {别名}
---

# {主题}

一句话描述。

> [!abstract] 核心要点
> - 核心知识点 1

> [!example]+ 代码示例
> ```
> // 可选代码示例
> ```

> [!tip] 最佳实践
> - 实践建议

> [!quote] 参考
> - [链接标题](url)
```

**callout 类型说明：**
- `[!abstract]` — 核心要点，灰色摘要样式
- `[!example]+` — 代码示例，默认展开
- `[!tip]` — 最佳实践，绿色提示
- `[!quote]` — 参考链接，引用样式

## Wikilinks 格式

使用标准 Obsidian wikilinks：

```markdown
[[项目名]]              链接到项目文档
[[资源名]]              链接到资源文档
[[日记名#heading]]      链接到日记的特定部分
![[画布.canvas]]       嵌入画布文件
```

**注意：**
- 不要使用 `→ [[项目名]]` 非标准语法
- 使用 `![[...]]` embed 嵌入而非普通链接时，内容直接在文档内展示