---
name: worklog:note
description: "快速笔记。当用户想快速记一个想法、知识点、技术笔记、临时备忘时使用。追加到今天的日记，无需纠结存哪里。用法：/worklog:note {内容}"
---

# worklog:note — 快速笔记

快速记录一个想法或知识点，追加到今天的日记。

## 配置

```
VAULT_PATH = "/Users/liutianpeng/projects/worklog"
```

## 用法

```
/worklog:note MongoDB 连接池默认最大连接数是 100
/worklog:note Go context 传递要用 context.WithValue
```

## 流程

### 1. 解析参数

命令后的所有内容作为笔记内容。

### 2. 定位日记文件

- 文件：`VAULT_PATH/日记/YYYY-MM-DD.md`
- 不存在则用模板创建

### 3. 追加到笔记部分

在 `## 笔记` 部分追加：
```markdown
- {笔记内容}
```

### 4. 报告结果

```
已追加到 日记/YYYY-MM-DD.md
```

## 设计理念

- 所有笔记先记到日记，周末用 `/worklog:summarize` 整理
- 保持单一入口，不纠结"这个值不值得单独存"
- 可以是任何内容：技术知识点、想法、待查资料