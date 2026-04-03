# worklog

极简的个人工作管理知识库。

**只需记住一件事：打开今天的文件，写。**

## 安装

```bash
npm install -g worklog
```

## 快速开始

```bash
# 初始化知识库
worklog init ~/projects/my-worklog

# 或在当前目录初始化
cd ~/projects/my-worklog
worklog init
```

初始化会自动：
- 创建目录结构（日记/、项目/、资源/、画布/）
- 安装技能到 Claude Code
- 创建今日日记

## 使用

```
/worklog:log         写日报
/worklog:note xxx    快速笔记
/worklog:project     同步项目
/worklog:summarize   整理笔记
```

## 目录结构

```
my-worklog/
├── 日记/           ← 每天一个文件
├── 项目/           ← 项目文档
├── 资源/           ← 可复用知识点
├── 画布/           ← Canvas 架构图
└── CLAUDE.md       ← 知识库指引
```

## 工作流

1. **上班** → 打开今天的日记，写任务、记进展
2. **下班** → `/worklog:log` 写日报
3. **随时** → `/worklog:note` 快速记笔记
4. **周末** → `/worklog:summarize` 整理笔记到资源

## 命令详解

### `/worklog:log` — 写日报

下班前运行，自动拉取今日 git 提交，让你补充说明，写入日记。

### `/worklog:project` — 同步项目文档

在项目目录运行，分析代码库，更新项目文档或生成架构画布。

### `/worklog:note` — 快速笔记

随时记一个想法或知识点，追加到今天的日记。

### `/worklog:summarize` — 整理本周笔记

周末运行，从日记中提取笔记，交互选择后整理到资源文件夹。

## 更新

```bash
# 在知识库目录运行
worklog update
```

## 手动安装（无需 npm）

如果你不想全局安装 npm 包：

```bash
git clone https://github.com/ltppp/worklog.git
cd worklog
npm link
```

或直接复制模板：

```bash
cp templates/*.md ~/.claude/commands/worklog/
# 然后手动替换 {{VAULT_PATH}}
```

## 许可证

MIT