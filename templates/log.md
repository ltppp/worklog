---
name: worklog:log
description: "写日报。当用户想记录今天的工作、写日报、汇报今日进展、下班前记录工作内容时使用。自动拉取 git 提交并让用户补充说明，写入日记文件。"
---

# worklog:log — 写日报

智能汇总今日工作，写入日记。

## 配置

```
VAULT_PATH = "{{VAULT_PATH}}"
```

## 流程

当此技能被调用时：

### 1. 获取今日 git 提交

在当前目录执行：
```bash
git log --since="midnight" --oneline --no-merges
```

如果不在 git 目录或执行失败，跳过此步。

### 2. 展示提交列表，询问补充

如果有提交，展示：
```
今天 git 提交（N 条）：
- {commit_hash} {commit_message}

今天主要做了什么？（补充说明、遇到的坑、学到的东西）
```

### 3. 写入日记

- 文件路径：`VAULT_PATH/日记/YYYY-MM-DD.md`
- 如果不存在，用模板创建
- 追加到 `## 工作记录` 部分：
  - 时段推断：12点前写"上午"，否则写"下午"
  - 内容：git 提交要点 + 用户补充

### 4. 报告结果

```
已写入 日记/YYYY-MM-DD.md
```

## 日记模板

```markdown
# YYYY-MM-DD

## 今天要做的
- [ ]

## 工作记录

## 笔记

## 明天继续
```