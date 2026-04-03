# worklog:project — 同步项目文档

检测当前项目，分析代码库，更新项目文档。

<!-- Obsidian 格式参考：~/.claude/skills/obsidian-markdown -->

## 配置

```
VAULT_PATH = "{{VAULT_PATH}}"
```

## 流程

---

### 阶段 1：项目检测

1. 扫描 `VAULT_PATH/项目/` 中所有 `.md` 文件
2. 匹配 cwd 路径与文件的 `**Location:` 字段
3. 或匹配目录名与项目文件名
4. 未找到则进入"创建模式"

---

### 阶段 2：代码库分析

- 技术栈：读取 `go.mod`、`package.json`、`requirements.txt` 等
- 目录结构：扫描 1-2 层
- git 历史：`git log --oneline -10`
- 关键文件：识别入口点、主要模块

---

### 阶段 3：操作菜单

**使用 AskUserQuestion 工具呈现选项，让用户点击选择：**

**已存在项目文件时：**
```json
{
  "questions": [{
    "header": "操作",
    "multiSelect": false,
    "options": [
      {"label": "更新描述与技术栈", "description": "刷新项目信息"},
      {"label": "更新关键文件表格", "description": "刷新文件列表"},
      {"label": "创建架构画布", "description": "生成 .canvas 文件"},
      {"label": "完整同步", "description": "执行全部操作"}
    ],
    "question": "请选择要执行的操作？"
  }]
}
```

**不存在项目文件时：**
```json
{
  "questions": [{
    "header": "操作",
    "multiSelect": false,
    "options": [
      {"label": "创建项目文档", "description": "生成 {项目名}.md"},
      {"label": "创建文档 + 架构画布", "description": "同时创建 .md 和 .canvas"}
    ],
    "question": "项目文件夹为空，请选择操作？"
  }]
}
```

---

### 阶段 4：读取或创建项目文档

**如果不存在，创建完整 Obsidian 格式：**

```markdown
---
title: {项目名}
date: YYYY-MM-DD
tags:
  - project
aliases:
  - {别名1}
  - {别名2}
---

# {项目名}

一句话描述。

**Location:** `/{绝对路径}`

> [!abstract] 技术栈
> - {语言} {版本}
> - {框架}
> - {数据库}

> [!info] 关键文件
> | 文件 | 作用 |
> |------|------|
> | `main.go` | 入口 |
> | `service/` | 业务逻辑 |

> [!example] 架构
> 画布：![[{项目名}架构.canvas]]

> [!note]+ 笔记
> - 重要决策、踩坑记录
```

**如果已存在：**
- 先读取文件，了解已有格式风格
- 保持与已有 frontmatter 和 callouts 结构一致
- 如果项目文档没有使用 callouts 格式，保持原格式不变

---

### 阶段 5：更新内容

**更新技术栈 callout：**

找到 `> [!abstract] 技术栈` 块，更新内容：

```markdown
> [!abstract] 技术栈
> - Go 1.20
> - MongoDB 6.0
> - gRPC
> - Docker
```

**更新关键文件表格：**

找到 `> [!info] 关键文件` 块，更新表格：

```markdown
> [!info] 关键文件
> | 文件 | 作用 |
> |------|------|
> | `main.go` | 服务入口 |
> | `service/auth.go` | 认证逻辑 |
> | `db/mongo.go` | 数据库连接 |
```

**注意：**
- callout 内表格每行以 `> ` 开头
- 保持格式一致

---

### 阶段 6：创建架构画布（可选）

如果用户选择创建画布：

1. 创建 `VAULT_PATH/画布/{项目名}架构.canvas`
2. 画布内容包含项目模块和关系
3. 在项目文档中使用 embed：`![[{项目名}架构.canvas]]`

---

### 阶段 7：报告结果

```
## 同步完成

**项目：** {名称}
**文件：** 项目/{项目名}.md

**生成的文档：**
- 技术栈：{语言}、{框架}
- 关键文件：{N} 个

查看反向链接：在项目文档底部可见相关日记
```

---

## 项目文档完整模板

```markdown
---
title: {项目名}
date: YYYY-MM-DD
tags:
  - project
aliases:
  - {别名1}
---

# {项目名}

一句话描述。

**Location:** `/{绝对路径}`

> [!abstract] 技术栈
> - {语言} {版本}
> - {框架}
> - {数据库}

> [!info] 关键文件
> | 文件 | 作用 |
> |------|------|
> | `入口文件` | 说明 |
> | `模块目录` | 说明 |

> [!example] 架构
> 画布：![[{项目名}架构.canvas]]

> [!note]+ 笔记
> - 重要决策、踩坑记录
```

---

## 设计理念

- 项目文档使用 callouts 分区，视觉清晰
- aliases 支持多种名称搜索（如"后端"、"API"）
- embed 画布 `![[canvas]]` 在文档内直接展示架构
- 笔记 callout 默认展开 `+`，方便记录
- **不生成"开发记录"部分** — 由日记的双向链接自动展示
- 项目文档保持简洁，聚焦项目本身