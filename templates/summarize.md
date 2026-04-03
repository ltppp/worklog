# worklog:summarize — 整理本周笔记到资源

从日记中提取笔记，整理到资源文件夹，建立双向链接。

<!-- Obsidian 格式参考：~/.claude/skills/obsidian-markdown -->

## 配置

```
VAULT_PATH = "{{VAULT_PATH}}"
```

## 用法

```
/worklog:summarize           # 整理本周
/worklog:summarize last-week # 整理上周
```

## 流程

---

### 步骤 1：确定时间范围

- 本周：本周一到今天
- last-week：上周一到上周日

---

### 步骤 2：扫描日记文件

读取 `VAULT_PATH/日记/` 中符合时间范围的 `.md` 文件。

---

### 步骤 3：提取笔记候选

**从 callouts 格式提取：**

找到 `> [!note]- 笔记` 或 `> [!note]+ 笔记` 块，提取内容：

```markdown
> - MongoDB 连接池默认最大连接数是 100
> - Go context 传递要用 context.WithValue
```

**从传统格式提取：**

找到 `## 笔记` 部分，提取内容：

```markdown
- MongoDB 连接池默认最大连接数是 100
- Go context 传递要用 context.WithValue
```

**跳过已整理的笔记：**
- `[[资源名]]` — 已有链接，已整理
- `→ [[资源名]]` — 旧格式链接，视为已整理
- `(已整理)` — 手动标记已整理

---

### 步骤 4：分析主题并归类

AI 分析每条笔记，归类到合适的资源：
- 技术知识点 → `资源/{技术名}.md`
- 最佳实践 → `资源/{主题}最佳实践.md`
- 问题解决方案 → `资源/{主题}.md`

---

### 步骤 5：交互确认

**使用 AskUserQuestion 工具，多选模式：**

```json
{
  "questions": [{
    "header": "笔记整理",
    "multiSelect": true,
    "question": "本周笔记（N 条未整理），选择要整理的：",
    "options": [
      {"label": "MongoDB 连接池默认最大连接数是 100", "description": "建议归类到 [[MongoDB]]"},
      {"label": "Go context 传递要用 context.WithValue", "description": "建议归类到 [[Go并发模式]]"}
    ]
  }]
}
```

用户可取消不需要整理的笔记。

---

### 步骤 6：读取或创建资源文档

**文件路径：** `VAULT_PATH/资源/{主题}.md`

**如果不存在，创建完整 Obsidian 格式：**

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
> - 核心知识点 2

> [!example]+ 代码示例
> ```
> // 可选代码示例
> ```

> [!tip] 最佳实践
> - 实践建议 1
> - 实践建议 2

> [!quote] 参考
> - [链接标题](url)
```

**如果已存在：**
- 先读取文件，了解已有格式风格
- 保持与已有 frontmatter 和 callouts 结构一致
- 如果资源文档没有使用 callouts 格式，保持原格式不变

---

### 步骤 7：追加要点到资源

**追加到 `> [!abstract] 核心要点` callout：**

```markdown
> [!abstract] 核心要点
> - 已有要点 1
> - 已有要点 2
> - MongoDB 连接池默认最大连接数是 100
```

**注意：**
- 每行以 `> ` 开头，保持 callout 格式
- 如果资源没有使用 callouts，追加到合适的列表部分

---

### 步骤 8：标记日记中的链接

**更新日记中的笔记 callout：**

将原始笔记改为链接形式：

```markdown
> [!note]- 笔记
> - MongoDB 连接池默认最大连接数是 100 [[MongoDB]]
> - Go context 传递要用 context.WithValue [[Go并发模式]]
```

**注意：**
- 使用标准 wikilinks `[[资源名]]`
- 保持 callout 格式（每行 `> ` 开头）
- 如果日记没有使用 callouts，使用传统格式：`- 笔记内容 [[资源名]]`

---

### 步骤 9：报告结果

```
整理完成：
- 更新 资源/MongoDB.md（2 条）
- 创建 资源/Go并发模式.md（1 条）
- 标记 3 条已链接
```

---

## 资源文档完整模板

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
> - 核心知识点 2

> [!example]+ 代码示例
> ```
> // 可选代码示例
> ```

> [!tip] 最佳实践
> - 实践建议 1
> - 实践建议 2

> [!quote] 参考
> - [链接标题](url)
```

---

## 链接规则

| 标记 | 含义 |
|------|------|
| `[[资源名]]` | 已整理到该资源，标准 Obsidian wikilink |
| `→ [[资源名]]` | 旧格式，视为已整理 |
| 无标记 | 未整理，下次仍会出现 |

---

## 设计理念

- 笔记先记在日记，周末整理到资源
- 建立双向链接：日记 → 资源
- 资源文档保持原子化，一个主题一个文件
- 使用 callouts 分区：要点、代码、实践、参考
- Obsidian 自动在资源底部显示反向链接（相关日记）