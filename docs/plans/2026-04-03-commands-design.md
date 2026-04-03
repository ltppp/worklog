# worklog 命令系统设计

日期：2026-04-03

## 概述

worklog 知识库的命令系统，采用子命令格式 `/worklog:{子命令}`，覆盖日常工作记录场景。

## 命令总览

```
/worklog:log       — 写日报（智能汇总：git 提交 + 人工补充）
/worklog:project   — 同步项目文档（检测项目、分析代码库、更新文档）
/worklog:note      — 快速笔记（追加到今天日记）
/worklog:summarize — 整理本周笔记到资源（交互选择 + 标记已整理）
```

## 配置位置

命令文件放在 `~/.claude/commands/worklog/` 目录：
- `~/.claude/commands/worklog/log.md`
- `~/.claude/commands/worklog/project.md`
- `~/.claude/commands/worklog/note.md`
- `~/.claude/commands/worklog/summarize.md`

---

## `/worklog:log` — 写日报

### 流程

1. **获取今日 git 提交**
   - 在当前目录执行 `git log --since="today" --oneline --author={当前用户}`
   - 如果不在 git 目录，跳过此步

2. **展示提交列表，询问补充**
   ```
   今天 git 提交（3 条）：
   - eb934afe feat: 修改广告费逻辑
   - aab7f8b3 fix: 上传接口返回码判断

   今天主要做了什么？（补充说明、遇到的坑、学到的东西）
   ```

3. **写入日记**
   - 文件：`VAULT_PATH/日记/YYYY-MM-DD.md`
   - 如果不存在，创建新日记（使用模板）
   - 追加到 `## 工作记录` 部分

4. **报告结果**

---

## `/worklog:project` — 同步项目文档

### 流程

1. **检测当前项目**
   - 扫描 `VAULT_PATH/项目/` 中所有 `.md` 文件
   - 匹配 cwd 路径与文件中的 `**Location:**` 字段
   - 或匹配目录名与项目文件名

2. **分析代码库**
   - 技术栈：读取 `go.mod`、`package.json`、`requirements.txt` 等
   - 目录结构：扫描 1-2 层
   - git 历史：`git log --oneline -10`

3. **展示操作菜单**

   **已存在项目文件：**
   - 更新描述与技术栈
   - 添加开发记录
   - 更新关键文件表格
   - 生成架构画布
   - 完整同步

   **不存在：**
   - 创建项目文档
   - 创建文档 + 画布

4. **执行并报告**

---

## `/worklog:note` — 快速笔记

### 用法
```
/worklog:note MongoDB 连接池默认最大连接数是 100
```

### 流程

1. **解析参数** — 命令后的所有内容作为笔记内容

2. **定位日记文件**
   - 文件：`VAULT_PATH/日记/YYYY-MM-DD.md`
   - 如果不存在，创建新日记

3. **追加到 `## 笔记` 部分**

4. **报告结果**

---

## `/worklog:summarize` — 整理本周笔记

### 用法
```
/worklog:summarize           # 默认整理本周
/worklog:summarize last-week # 整理上周
```

### 流程

1. **扫描日记文件**
   - 本周：从周一到今天
   - 上周：上周一到上周日

2. **提取笔记候选**
   - 从 `## 笔记` 部分提取
   - 过滤已整理：跳过带 `→ [[资源名]]` 或 `(已整理)` 标记的条目

3. **展示候选列表，交互选择**
   ```
   本周笔记候选（5 条未整理）：
   1. [✓] MongoDB 连接池默认最大连接数是 100
   2. [ ] Go context 传递技巧
   ...

   选择要整理到资源的条目：
   ```

4. **整理到资源**
   - 按主题分类，合并到对应资源文件
   - 或创建新资源文件

5. **标记已整理**
   ```markdown
   - MongoDB 连接池默认最大连接数是 100 → [[MongoDB]]
   ```

6. **报告结果**

### 标记规则

| 标记 | 含义 |
|------|------|
| `→ [[资源名]]` | 已整理到该资源文件 |
| `(已整理)` | 已整理但未指定具体资源 |
| 无标记 | 未整理，下次仍会出现在候选列表 |