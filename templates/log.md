# worklog:log — 写日报

智能汇总今日工作，写入日记，自动链接到项目文档。

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
4. 工作内容后添加 `→ [[项目名]]`

**示例：**
```markdown
## 工作记录
- 实现用户登录功能 → [[api-golang]]
- 修复登录验证 bug → [[api-golang]]
- 参加周会
- Code Review 2个PR
```

**注意：**
- git 提取 commit message 的核心内容（去掉 hash，保留描述）
- 其他工作（会议、Code Review 等）不添加链接
- 项目名取目录名或用户确认

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
- 实现用户登录功能 → [[api-golang]]
- 修复登录验证 bug → [[api-golang]]
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

## 项目文档模板（自动创建时使用）

```markdown
# {项目名}

**Location:** `/{绝对路径}`

## 技术栈
- （待补充）

## 关键文件
| 文件 | 作用 |
|------|------|
| （待补充） | |

## 架构
> 画布：[[{项目名}架构]]

## 笔记
```