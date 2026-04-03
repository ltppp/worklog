# worklog

极简的个人工作管理知识库。

**只需记住一件事：打开今天的文件，写。**

无需编号系统、无需插件、无需复杂分类。每天一个文件，所有内容先记这里，重要的再整理。

## 安装

### 方式一：作为 Skill Package 安装（推荐）

```bash
git clone https://github.com/你的用户名/worklog.git
cd worklog
```

然后将此目录配置为 Claude Code 的 skill：

1. 在 `~/.claude/settings.json` 中添加：
   ```json
   {
     "env": {
       "WORKLOG_VAULT_PATH": "/Users/你的用户名/projects/worklog"
     }
   }
   ```

2. 将 skills 目录链接到 Claude 命令目录：
   ```bash
   mkdir -p ~/.claude/commands
   ln -s $(pwd)/skills/* ~/.claude/commands/
   ```

### 方式二：手动复制

```bash
cp -r skills/* ~/.claude/commands/
```

然后编辑每个 `SKILL.md` 文件，修改 `VAULT_PATH`。

## 结构

```
日记/     ← 每天一个文件，所有内容先记这里
项目/     ← 项目文档，技术细节、决策记录
资源/     ← 可复用的知识点、参考文档
画布/     ← Canvas 文件，可视化架构图
```

## 工作流

1. **上班** → 打开今天的日记，写任务、记进展
2. **下班** → `/worklog:log` 写日报，整理到项目文档
3. **随时** → `/worklog:note` 快速记笔记
4. **周末** → `/worklog:summarize` 整理笔记到资源

## 命令

| 命令 | 功能 | 用法 |
|------|------|------|
| `/worklog:log` | 写日报 | 自动拉取 git 提交 + 人工补充 |
| `/worklog:project` | 同步项目 | 分析代码库，更新项目文档 |
| `/worklog:note` | 快速笔记 | `/worklog:note {内容}` |
| `/worklog:summarize` | 整理笔记 | 交互选择，标记已整理 |

### `/worklog:log` — 写日报

下班前运行，自动拉取今日 git 提交，让你补充说明，写入日记。

```
/worklog:log
```

### `/worklog:project` — 同步项目文档

在项目目录运行，分析代码库，提供操作菜单：

- 创建/更新项目文档
- 添加开发记录
- 生成架构画布

```
/worklog:project
```

### `/worklog:note` — 快速笔记

随时记一个想法或知识点，追加到今天的日记。

```
/worklog:note MongoDB 连接池默认最大连接数是 100
```

### `/worklog:summarize` — 整理本周笔记

周末运行，从日记中提取笔记候选，交互选择后整理到资源文件夹。已整理的条目会被标记，避免重复。

```
/worklog:summarize           # 整理本周
/worklog:summarize last-week # 整理上周
```

## 文件命名

- 日记：`YYYY-MM-DD.md`（如 `2026-04-03.md`）
- 项目：`{项目名}.md`（如 `Octopus.md`）
- 画布：`{项目名}架构.canvas`
- 资源：`{主题}.md`（如 `MongoDB.md`）

## 日记模板

```markdown
# YYYY-MM-DD

## 今天要做的
- [ ] 任务列表

## 工作记录
- 上午：...
- 下午：...

## 笔记
（临时想法、学到的东西）

## 明天继续
- ...
```

## 项目文档模板

```markdown
# 项目名

## 简介
一句话描述。

**Location:** `/path/to/project`
**GitHub:** https://github.com/...

## 技术栈
- 技术1
- 技术2

## 关键文件
| 文件 | 作用 |
|------|------|
| `路径` | 功能 |

## 开发记录
### YYYY-MM-DD
- 完成了什么
```