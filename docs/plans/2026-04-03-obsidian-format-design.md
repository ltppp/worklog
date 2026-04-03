# Obsidian 格式改进设计

## 背景

当前 worklog 技能直接用 Write/Edit 工具操作 `.md` 文件，未考虑 Obsidian 特性：
- 没有 frontmatter（title、tags、aliases）
- wikilinks 格式不规范
- 不使用 callouts，视觉区分不明显
- 不支持 embeds、折叠等 Obsidian 特性

## 设计目标

使用 obsidian-markdown 技能规范，改进所有模板和技能指令，确保：
- 正确的 frontmatter 结构
- 标准 wikilinks 格式
- callouts 分区，视觉清晰
- 充分利用 Obsidian reading view 渲染特性

## 模板改进

### 1. 日记模板

```markdown
---
title: 2026-04-03
date: 2026-04-03
tags:
  - diary
aliases:
  - 今天
---

# 2026-04-03

> [!todo] 今天要做的
> - [ ] 完成登录功能
> - [ ] 参加周会

> [!tip]+ 工作记录
> - 实现用户登录 → [[api-golang]]
> - 修复验证 bug → [[api-golang]]
> - 参加周会

> [!note]- 笔记
> - MongoDB 连接池默认 100 → [[MongoDB]]

> [!warning] 明天继续
> - 完成支付模块测试
```

**关键设计：**
- frontmatter：title、date、tags、aliases
- callouts 类型：`todo`（任务）、`tip`（工作）、`note`（笔记）、`warning`（待办）
- 折叠状态：`+` 展开、`-` 折叠
- 笔记默认折叠，不影响主视图

### 2. 项目文档模板

```markdown
---
title: api-golang
date: 2026-04-03
tags:
  - project
aliases:
  - API服务
  - Golang后端
---

# api-golang

用户认证和数据处理的后端 API 服务。

**Location:** `/Users/liutianpeng/projects/api-golang`

> [!abstract] 技术栈
> - Go 1.20
> - MongoDB 6.0
> - gRPC
> - Docker

> [!info] 关键文件
> | 文件 | 作用 |
> |------|------|
> | `main.go` | 服务入口 |
> | `service/auth.go` | 认证逻辑 |
> | `db/mongo.go` | 数据库连接 |

> [!example] 架构
> 画布：![[api-golang架构.canvas]]

> [!note]+ 笔记
> - 重要决策、踩坑记录
> - 可从日记反向链接查看开发历程
```

**关键设计：**
- aliases 支持多种名称搜索
- embed 画布 `![[canvas]]` 在文档内直接展示
- 反向链接自动显示，无需手动维护

### 3. 资源文档模板

```markdown
---
title: MongoDB
date: 2026-04-03
tags:
  - database
  - mongodb
aliases:
  - Mongo
---

# MongoDB

文档型 NoSQL 数据库，支持灵活的数据模型和高性能查询。

> [!abstract] 核心要点
> - 连接池默认最大连接数是 100
> - 索引建议覆盖高频查询字段
> - 嵌套文档 vs 引用：小数据嵌套，大数据引用

> [!example]+ 代码示例
> ```javascript
> // 连接池配置
> const client = new MongoClient(uri, {
>   maxPoolSize: 100,
>   minPoolSize: 10
> });
> ```

> [!tip] 最佳实践
> - 生产环境启用认证
> - 使用连接池避免频繁创建连接
> - 监控 slow queries 优化索引

> [!quote] 参考
> - [官方文档](https://www.mongodb.com/docs/)
> - [[Go并发模式]] — 相关资源
```

**关键设计：**
- 分层标签如 `database/mongodb`
- callouts 区分要点、代码、实践、参考
- wikilinks 关联相关资源

## 技能指令改进

### `/worklog:log` — 写日报

写入日记时：
- 先读取日记文件，了解已有格式风格
- 不存在时，创建完整 frontmatter + callouts 结构
- 追加内容时保持与已有格式一致
- 使用标准 wikilinks `[[项目名]]`

### `/worklog:note` — 快速笔记

追加笔记到日记：
- 找到 `> [!note]- 笔记` callout 块
- 在 callout 内容末尾追加新条目
- 保持折叠状态一致

### `/worklog:project` — 同步项目文档

创建项目文档时：
- 使用完整项目模板格式
- 包含 frontmatter（title、date、tags、aliases）
- 四个 callout 区块
- embed 架构画布 `![[项目名架构.canvas]]`

### `/worklog:summarize` — 整理笔记

整理到资源时：
- 创建或更新资源文档
- 使用资源模板格式
- 在日记中用标准 wikilinks 标记

## 实施方式

硬编码格式在模板中，不运行时动态查询 obsidian-markdown 技能。

理由：
- worklog 格式固定，不需要每次动态获取
- 执行效率高
- obsidian-markdown 价值在设计阶段，非运行时

模板中加备注引用技能：
```markdown
<!-- Obsidian 格式参考：~/.claude/skills/obsidian-markdown -->
```

## 验收标准

- 所有日记文档有正确 frontmatter
- callouts 在 Obsidian reading view 正确渲染
- wikilinks 可点击跳转
- 反向链接面板自动显示相关文档
- embeds 在文档内直接展示画布

## 文件改动清单

| 文件 | 改动 |
|------|------|
| `templates/log.md` | 更新指令，要求使用 Obsidian 格式 |
| `templates/note.md` | 更新指令，追加到 callout 内 |
| `templates/project.md` | 更新指令，使用项目模板格式 |
| `templates/summarize.md` | 更新指令，使用资源模板格式 |
| `templates/CLAUDE.md` | 更新日记/项目/资源模板示例 |
| `bin/worklog.js` | 更新 init 创建日记时的模板 |

## 时间

- 设计完成：2026-04-03
- 作者：brainstorming skill