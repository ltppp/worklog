# worklog:log — 写日报

智能汇总今日工作，写入日记。

## 配置

```
VAULT_PATH = "{{VAULT_PATH}}"
```

## 流程

当此技能被调用时：

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

显示提示信息后，让用户输入：

```
还有什么工作没被 git 记录？
提示：多个任务用逗号分隔，例如：
参加需求评审会议，帮助新人搭建环境，Code Review

> [用户输入]
```

AI 收到用户输入后，按逗号分隔拆分为独立条目。

---

### 步骤 4：生成日报内容

将选中提交 + 其他工作合并为简洁列表：

```markdown
## 工作记录
- {commit 消息 1}
- {commit 消息 2}
- {其他工作 1}
- {其他工作 2}
```

**注意：**
- git 提取 commit message 的核心内容（去掉 hash，保留描述）
- 其他工作按逗号分隔拆分
- 不分类，不按时段，保持简洁

---

### 步骤 5：写入日记

- 文件路径：`VAULT_PATH/日记/YYYY-MM-DD.md`
- 如果不存在，用模板创建
- 追加到 `## 工作记录` 部分

---

### 步骤 6：报告结果

```
已写入 日记/YYYY-MM-DD.md

今日工作：
- 实现用户登录功能
- 修复登录验证 bug
- 参加周会
- Code Review 2个PR
```

---

## 日记模板

```markdown
# YYYY-MM-DD

## 今天要做的
- [ ]

## 工作记录

## 笔记

## 明天继续
```

---

## 示例流程

**用户调用：** `/worklog:log`

**步骤 1：** 获取到 3 条 git 提交

**步骤 2：** 展示多选（默认全选）
```
选择要写入日报的 git 提交：
  ◉ abc1234 实现用户登录功能
  ◉ def5678 修复登录验证 bug
  ◉ ghi9012 更新 README
```

**步骤 3：** 用户输入其他工作
```
还有什么工作没被 git 记录？
> 参加周会，Code Review 2个PR
```

**步骤 4-5：** 生成并写入
```markdown
## 工作记录
- 实现用户登录功能
- 修复登录验证 bug
- 更新 README
- 参加周会
- Code Review 2个PR
```

**步骤 6：** 报告完成