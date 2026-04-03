# worklog:note — 快速笔记

快速记录一个想法或知识点，追加到今天的日记。

## 配置

```
VAULT_PATH = "/Users/liutianpeng/projects/worklog"
```

## 用法

```
/worklog:note {笔记内容}
```

示例：
```
/worklog:note MongoDB 连接池默认最大连接数是 100
/worklog:note Go context 传递要用 context.WithValue
/worklog:note grpcurl 可以用来测试 gRPC 接口，类似 curl
```

## 流程

当此命令被调用时：

### 1. 解析参数

命令后的所有内容作为笔记内容。如果没有参数，提示用户：
```
请输入笔记内容：/worklog:note {你的笔记}
```

### 2. 定位日记文件

- 文件路径：`VAULT_PATH/日记/YYYY-MM-DD.md`（YYYY-MM-DD 为今天日期）
- 如果文件不存在，创建新日记使用模板：
```markdown
# YYYY-MM-DD

## 今天要做的
- [ ]

## 工作记录

## 笔记

## 明天继续
```

### 3. 追加到笔记部分

在 `## 笔记` 部分追加：
```markdown
## 笔记
- {笔记内容}
```

如果没有 `## 笔记` 部分，在 `## 工作记录` 之后创建该部分。

### 4. 报告结果

```
已追加到 日记/YYYY-MM-DD.md
```

## 注意

- 笔记内容先记到日记，周末用 `/worklog:summarize` 整理到资源
- 保持单一入口，不纠结"这个值不值得单独存"
- 笔记可以是任何内容：技术知识点、想法、待查资料、临时备忘