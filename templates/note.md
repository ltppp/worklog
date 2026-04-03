# worklog:note — 快速笔记

快速记录一个想法或知识点，追加到今天的日记。

<!-- Obsidian 格式参考：~/.claude/skills/obsidian-markdown -->

## 配置

```
VAULT_PATH = "{{VAULT_PATH}}"
```

## 用法

```
/worklog:note MongoDB 连接池默认最大连接数是 100
/worklog:note Go context 传递要用 context.WithValue
```

## 流程

---

### 步骤 1：解析参数

命令后的所有内容作为笔记内容。

---

### 步骤 2：定位日记文件

**文件：** `VAULT_PATH/日记/YYYY-MM-DD.md`

**如果不存在，创建完整 Obsidian 格式：**

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

> [!note]- 笔记

> [!warning] 明天继续
```

---

### 步骤 3：读取日记格式

先读取日记文件，判断格式风格：

**情况 A：使用 callouts 格式**
```markdown
> [!note]- 笔记
> - 已有笔记条目
```

**情况 B：使用传统格式**
```markdown
## 笔记
- 已有笔记条目
```

---

### 步骤 4：追加笔记

**如果是 callouts 格式：**

找到 `> [!note]- 笔记` 或 `> [!note]+ 笔记` 块，在内容末尾追加：

```markdown
> - {笔记内容}
```

**如果是传统格式：**

追加到 `## 笔记` 部分：
```markdown
- {笔记内容}
```

**注意：**
- 保持与已有格式一致
- callouts 格式下，每行以 `> ` 开头
- 笔记内容是未整理的原始记录，暂时不加 wikilinks
- 周末用 `/worklog:summarize` 整理后再添加链接

---

### 步骤 5：报告结果

```
已追加到 日记/YYYY-MM-DD.md

笔记：
- MongoDB 连接池默认最大连接数是 100
```

---

## 设计理念

- 所有笔记先记到日记，周末用 `/worklog:summarize` 整理
- 保持单一入口，不纠结"这个值不值得单独存"
- 可以是任何内容：技术知识点、想法、待查资料
- 笔记 callout 默认折叠 `-`，不影响主视图
- 整理后变为 `[[资源名]]` 链接，形成知识网络