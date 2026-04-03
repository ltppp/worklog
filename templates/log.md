# worklog:log — 写日报

智能汇总今日工作，写入日记，自动链接到项目文档。

<!-- Obsidian 格式参考：~/.claude/skills/obsidian-markdown -->

## 配置

```
VAULT_PATH = "{{VAULT_PATH}}"
```

## 流程

---

### 步骤 1：获取今日 git 提交

在当前目录执行：
```bash
git log --since="midnight" --oneline --no-merges
```

如果不在 git 目录或执行失败，跳到步骤 2。

---

### 步骤 2：选择要记录的提交

**使用 AskUserQuestion 工具，多选模式：**

```json
{
  "questions": [{
    "header": "选择提交",
    "multiSelect": true,
    "question": "选择要写入日报的 git 提交：",
    "options": [
      {"label": "abc1234 实现用户登录功能", "description": ""},
      {"label": "def5678 修复登录验证 bug", "description": ""},
      ...
    ]
  }]
}
```

- 默认全选
- 用户可取消不需要的提交

如果没有 git 提交或用户全部取消，继续步骤 3。

---

### 步骤 3：填写其他工作

**使用 AskUserQuestion 工具，输入框模式：**

```
还有什么工作没被 git 记录？
提示：多个任务用逗号分隔，例如：
参加需求评审会议，帮助新人搭建环境，Code Review

> [用户输入]
```

AI 收到用户输入后，按逗号分隔拆分为独立条目。

---

### 步骤 4：识别项目并生成链接

**关键：为工作内容添加双向链接**

1. 从当前 git 目录名推断项目名
2. 检查 `VAULT_PATH/项目/` 是否存在该项目的 `.md` 文件
3. 如果不存在，自动创建空项目文档
4. 工作内容后添加标准 wikilinks `[[项目名]]`

**示例：**
```markdown
- 实现用户登录功能 [[api-golang]]
- 修复登录验证 bug [[api-golang]]
- 参加周会
- Code Review 2个PR
```

**注意：**
- git 提取 commit message 的核心内容（去掉 hash，保留描述）
- 其他工作（会议、Code Review 等）不添加链接
- 项目名取目录名或用户确认

---

### 步骤 5：读取或创建日记

**文件路径：** `VAULT_PATH/日记/YYYY-MM-DD.md`

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

**如果已存在：**
- 先读取文件，了解已有格式风格
- 保持与已有 frontmatter 和 callouts 结构一致
- 如果日记没有使用 callouts 格式，保持原格式不变

---

### 步骤 6：追加到工作记录

**追加到 `> [!tip]+ 工作记录` callout 内：**

找到 `> [!tip]+ 工作记录` 或 `> [!tip] 工作记录` 块，在内容末尾追加：

```markdown
> - 实现用户登录功能 [[api-golang]]
> - 修复登录验证 bug [[api-golang]]
> - 参加周会
```

**注意：**
- 每行以 `> ` 开头，保持 callout 格式
- 如果日记没有使用 callouts，追加到 `## 工作记录` 部分

---

### 步骤 7：报告结果

```
已写入 日记/YYYY-MM-DD.md

今日工作：
- 实现用户登录功能 [[api-golang]]
- 修复登录验证 bug [[api-golang]]
- 参加周会
- Code Review 2个PR
```

---

## 项目文档模板（自动创建时使用）

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
> - （待补充）

> [!info] 关键文件
> | 文件 | 作用 |
> |------|------|
> | （待补充） | |

> [!example] 架构
> 画布：![[{项目名}架构.canvas]]

> [!note]+ 笔记
```

---

## 设计理念

- 日记使用 callouts 分区，在 Obsidian reading view 视觉清晰
- 工作记录默认展开 `+`，方便查看
- 标准 wikilinks `[[项目名]]` 自动形成双向链接
- 项目文档底部自动显示反向链接（相关日记）