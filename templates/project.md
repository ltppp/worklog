# worklog:project — 同步项目文档

深度分析代码库，生成完整项目文档。

<!-- Obsidian 格式参考：~/.claude/skills/obsidian-markdown -->

## 配置

```
VAULT_PATH = "{{VAULT_PATH}}"
```

## 流程

---

### 阶段 1：项目检测

1. 扫描 `VAULT_PATH/项目/` 中所有 `.md` 文件
2. 匹配 cwd 路径与文件的 `**Location:` 字段
3. 或匹配目录名与项目文件名
4. 未找到则进入"创建模式"

---

### 阶段 2：深度代码分析

**依次执行以下分析，每项约 10-20 秒：**

#### 2.1 基本信息
- 读取 `README.md`、`package.json`、`go.mod`、`requirements.txt` 等
- 提取项目名称、描述、版本、依赖

#### 2.2 目录结构
- 扫描 2-3 层目录
- 识别标准目录：`src/`、`lib/`、`cmd/`、`api/`、`handler/`、`service/`、`model/`、`db/` 等
- 过滤掉 `node_modules/`、`vendor/`、`.git/` 等

#### 2.3 API 接口
- **Go**: 扫描路由注册（`gin.`, `http.HandleFunc`, `mux.HandleFunc`）
- **Node.js**: 扫描 `app.get/post/put/delete`、`router.*/**`
- **Python**: 扫描 `@app.route`、`@router.get/post`、FastAPI 路由
- 提取：方法、路径、Handler 函数名

#### 2.4 数据模型
- **Go**: 扫描 `struct` 定义，识别数据库标签（`gorm:""`, `json:""`）
- **Node.js**: 扫描 `schema`、`model` 定义，Sequelize/Mongoose
- **Python**: 扫描 `models.py`、SQLAlchemy Model、Pydantic
- 提取：模型名、字段列表

#### 2.5 关键文件
- 入口文件：`main.go`、`index.js`、`app.py`、`main.py`
- 配置文件：`config.*`、`.env.example`
- 核心模块：`service/`、`handler/`、`controller/` 下的主要文件

#### 2.6 开发配置
- 读取 `package.json scripts`、`Makefile`、`docker-compose.yml`
- 提取：启动命令、测试命令、Docker 配置

---

### 阶段 3：操作菜单

**使用 AskUserQuestion 工具呈现选项：**

**已存在项目文件时：**
```json
{
  "questions": [{
    "header": "操作",
    "multiSelect": false,
    "options": [
      {"label": "快速更新", "description": "只更新基本信息和技术栈"},
      {"label": "完整同步", "description": "重新分析 API、模型、结构"},
      {"label": "创建架构画布", "description": "生成 .canvas 文件"}
    ],
    "question": "请选择操作？"
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
      {"label": "创建完整文档", "description": "深度分析生成完整文档"},
      {"label": "创建简洁文档", "description": "只生成基本信息"},
      {"label": "创建文档 + 画布", "description": "同时生成 .md 和 .canvas"}
    ],
    "question": "项目文档不存在，请选择？"
  }]
}
```

---

### 阶段 4：生成项目文档

**完整文档模板：**

```markdown
---
title: {项目名}
date: YYYY-MM-DD
tags:
  - project
aliases:
  - {别名}
---

# {项目名}

{一句话描述}

**核心功能：**
- 功能 1
- 功能 2

## 基本信息

| 属性 | 值 |
|------|-----|
| **Location** | `/{绝对路径}` |
| **语言** | {语言} {版本} |
| **框架** | {框架} |
| **数据库** | {数据库} |

> [!abstract] 技术栈
> - {语言} {版本}
> - {框架}
> - {数据库}
> - {其他依赖}

> [!info] 目录结构
> ```
> {项目名}/
> ├── cmd/                # 入口
> ├── internal/
> │   ├── handler/        # HTTP 处理器
> │   ├── service/        # 业务逻辑
> │   └── model/          # 数据模型
> ├── pkg/                # 公共库
> ├── config/             # 配置
> └── go.mod
> ```

> [!example] API 接口
> | 方法 | 路径 | 说明 | Handler |
> |------|------|------|---------|
> | GET | `/api/users` | 获取用户列表 | `GetUsers` |
> | POST | `/api/users` | 创建用户 | `CreateUser` |
> | GET | `/api/users/:id` | 获取用户详情 | `GetUser` |
> | PUT | `/api/users/:id` | 更新用户 | `UpdateUser` |
> | DELETE | `/api/users/:id` | 删除用户 | `DeleteUser` |

> [!note] 数据模型
> **User** — 用户模型
> | 字段 | 类型 | 说明 |
> |------|------|------|
> | id | uint | 主键 |
> | username | string | 用户名 |
> | email | string | 邮箱 |
> | created_at | time | 创建时间 |

> [!tip] 关键文件
> | 文件 | 作用 |
> |------|------|
> | `cmd/server/main.go` | 服务入口 |
> | `internal/handler/user.go` | 用户接口处理 |
> | `internal/service/auth.go` | 认证逻辑 |
> | `config/config.yaml` | 配置文件 |

> [!success] 开发指引
> **本地启动：**
> ```bash
> go run cmd/server/main.go
> # 或
> make dev
> ```
>
> **运行测试：**
> ```bash
> go test ./...
> # 或
> make test
> ```
>
> **Docker：**
> ```bash
> docker-compose up -d
> ```

> [!example] 架构
> 画布：![[{项目名}架构.canvas]]

> [!note]+ 笔记
> - 重要决策、踩坑记录
```

---

### 阶段 5：创建架构画布

**创建文件：** `VAULT_PATH/画布/{项目名}架构.canvas`

**根据项目类型生成架构图：**

**后端 API 项目：**
```json
{
  "nodes": [
    {"id": "client", "type": "text", "x": 0, "y": 60, "width": 180, "height": 60, "text": "客户端\nWeb/App/Mobile", "color": "4"},
    {"id": "api", "type": "text", "x": 240, "y": 60, "width": 180, "height": 60, "text": "API 服务\n{框架}", "color": "5"},
    {"id": "service", "type": "text", "x": 480, "y": 20, "width": 160, "height": 50, "text": "业务层\nService", "color": "6"},
    {"id": "repo", "type": "text", "x": 480, "y": 100, "width": 160, "height": 50, "text": "数据层\nRepository", "color": "6"},
    {"id": "db", "type": "text", "x": 720, "y": 60, "width": 180, "height": 60, "text": "数据库\n{数据库类型}", "color": "1"}
  ],
  "edges": [
    {"id": "e1", "fromNode": "client", "toNode": "api", "fromSide": "right", "toSide": "left"},
    {"id": "e2", "fromNode": "api", "toNode": "service", "fromSide": "right", "toSide": "left"},
    {"id": "e3", "fromNode": "api", "toNode": "repo", "fromSide": "right", "toSide": "left"},
    {"id": "e4", "fromNode": "service", "toNode": "db", "fromSide": "right", "toSide": "left"},
    {"id": "e5", "fromNode": "repo", "toNode": "db", "fromSide": "right", "toSide": "left"}
  ]
}
```

**前后端分离项目：**
```json
{
  "nodes": [
    {"id": "web", "type": "text", "x": 0, "y": 0, "width": 160, "height": 50, "text": "前端\nReact/Vue", "color": "4"},
    {"id": "api", "type": "text", "x": 0, "y": 120, "width": 160, "height": 50, "text": "API\n{框架}", "color": "5"},
    {"id": "gateway", "type": "text", "x": 240, "y": 60, "width": 160, "height": 50, "text": "网关\nNginx/Gateway", "color": "3"},
    {"id": "db", "type": "text", "x": 480, "y": 60, "width": 160, "height": 50, "text": "数据库\n{类型}", "color": "1"},
    {"id": "cache", "type": "text", "x": 480, "y": 140, "width": 160, "height": 50, "text": "缓存\nRedis", "color": "2"}
  ],
  "edges": [
    {"id": "e1", "fromNode": "web", "toNode": "gateway", "fromSide": "right", "toSide": "left"},
    {"id": "e2", "fromNode": "api", "toNode": "gateway", "fromSide": "right", "toSide": "left"},
    {"id": "e3", "fromNode": "gateway", "toNode": "db", "fromSide": "right", "toSide": "left"},
    {"id": "e4", "fromNode": "gateway", "toNode": "cache", "fromSide": "right", "toSide": "left"}
  ]
}
```

**微服务项目：**
```json
{
  "nodes": [
    {"id": "gateway", "type": "text", "x": 240, "y": 0, "width": 180, "height": 50, "text": "API Gateway", "color": "3"},
    {"id": "user", "type": "text", "x": 0, "y": 120, "width": 140, "height": 50, "text": "用户服务\nUser Service", "color": "5"},
    {"id": "order", "type": "text", "x": 180, "y": 120, "width": 140, "height": 50, "text": "订单服务\nOrder Service", "color": "5"},
    {"id": "product", "type": "text", "x": 360, "y": 120, "width": 140, "height": 50, "text": "商品服务\nProduct Service", "color": "5"},
    {"id": "payment", "type": "text", "x": 540, "y": 120, "width": 140, "height": 50, "text": "支付服务\nPayment Service", "color": "5"},
    {"id": "db", "type": "text", "x": 240, "y": 220, "width": 200, "height": 50, "text": "数据库集群", "color": "1"},
    {"id": "mq", "type": "text", "x": 480, "y": 220, "width": 160, "height": 50, "text": "消息队列\nKafka/RabbitMQ", "color": "2"}
  ],
  "edges": [
    {"id": "e1", "fromNode": "gateway", "toNode": "user", "fromSide": "bottom", "toSide": "top"},
    {"id": "e2", "fromNode": "gateway", "toNode": "order", "fromSide": "bottom", "toSide": "top"},
    {"id": "e3", "fromNode": "gateway", "toNode": "product", "fromSide": "bottom", "toSide": "top"},
    {"id": "e4", "fromNode": "gateway", "toNode": "payment", "fromSide": "bottom", "toSide": "top"},
    {"id": "e5", "fromNode": "order", "toNode": "db", "fromSide": "bottom", "toSide": "top"},
    {"id": "e6", "fromNode": "payment", "toNode": "mq", "fromSide": "bottom", "toSide": "top"}
  ]
}
```

---

### 阶段 6：报告结果

```
## 同步完成

**项目：** {名称}
**文件：** 项目/{项目名}.md
**画布：** 画布/{项目名}架构.canvas

**分析结果：**
- API 接口：{N} 个
- 数据模型：{N} 个
- 关键文件：{N} 个

查看反向链接：在项目文档底部可见相关日记
```

---

## 设计理念

- 深度分析代码，自动提取完整信息
- 文档结构清晰：概述 → 结构 → 接口 → 数据 → 开发
- 架构图根据项目类型自动适配
- 开发者可直接作为项目文档使用