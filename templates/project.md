# worklog:project — 同步项目文档

检测当前项目，分析代码库，更新项目文档。

## 配置

```
VAULT_PATH = "{{VAULT_PATH}}"
```

## 流程

---

### 阶段 1：项目检测

1. 扫描 `VAULT_PATH/项目/` 中所有 `.md` 文件
2. 匹配 cwd 路径与文件的 `**Location:**` 字段
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
      {"label": "添加开发记录", "description": "追加今日记录"},
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

### 阶段 4：执行并报告

```
## 同步完成

**项目：** {名称}
**文件：** {路径}

**执行的操作：**
- [x] {操作}
```