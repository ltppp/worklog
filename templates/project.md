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

**布局规范（参考 Obsidian Canvas 最佳实践）：**

| 元素 | 尺寸 | 位置 | 颜色 |
|------|------|------|------|
| 标题节点 | 400x100 | 居中顶部 | `"0"` 灰色 |
| 层标签 | 180x60 | x: -40 | `"6"` 紫色 |
| 内容节点 | 340x120 | x: 200+ | 根据类型 |
| 层间距 | - | 200px | - |

**颜色语义：**
- `"1"` 红色 — 入口、核心系统
- `"5"` 青色 — API层、网络服务
- `"3"` 黄色 — 数据层、数据库
- `"4"` 绿色 — UI、前端
- `"2"` 橙色 — 缓存、消息队列
- `"6"` 紫色 — 层标签

**垂直流向，从上到下：**

---

**后端 API 项目示例：**

```json
{
  "nodes": [
    {
      "id": "title",
      "type": "text",
      "text": "# {项目名} Architecture",
      "x": 100,
      "y": -500,
      "width": 400,
      "height": 80,
      "color": "0"
    },
    {
      "id": "label_entry",
      "type": "text",
      "text": "**入口层**",
      "x": -40,
      "y": -350,
      "width": 180,
      "height": 60,
      "color": "6"
    },
    {
      "id": "client",
      "type": "text",
      "text": "## 客户端\n\nWeb / App / Mobile\nHTTP 请求",
      "x": 200,
      "y": -360,
      "width": 340,
      "height": 120,
      "color": "4"
    },
    {
      "id": "label_api",
      "type": "text",
      "text": "**API 层**",
      "x": -40,
      "y": -150,
      "width": 180,
      "height": 60,
      "color": "6"
    },
    {
      "id": "api",
      "type": "text",
      "text": "## API 服务\n\n{框架}\n路由 / Handler / 中间件",
      "x": 200,
      "y": -160,
      "width": 340,
      "height": 120,
      "color": "5"
    },
    {
      "id": "label_data",
      "type": "text",
      "text": "**数据层**",
      "x": -40,
      "y": 50,
      "width": 180,
      "height": 60,
      "color": "6"
    },
    {
      "id": "db",
      "type": "text",
      "text": "## 数据库\n\n{数据库类型}\n数据持久化",
      "x": 200,
      "y": 40,
      "width": 340,
      "height": 120,
      "color": "3"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "fromNode": "client",
      "fromSide": "bottom",
      "toNode": "api",
      "toSide": "top"
    },
    {
      "id": "e2",
      "fromNode": "api",
      "fromSide": "bottom",
      "toNode": "db",
      "toSide": "top"
    }
  ]
}
```

---

**前后端分离项目示例：**

```json
{
  "nodes": [
    {
      "id": "title",
      "type": "text",
      "text": "# {项目名} Architecture",
      "x": 100,
      "y": -600,
      "width": 400,
      "height": 80,
      "color": "0"
    },
    {
      "id": "label_frontend",
      "type": "text",
      "text": "**前端层**",
      "x": -40,
      "y": -450,
      "width": 180,
      "height": 60,
      "color": "6"
    },
    {
      "id": "frontend",
      "type": "text",
      "text": "## 前端应用\n\nReact / Vue\n组件 / 状态管理 / 路由",
      "x": 200,
      "y": -460,
      "width": 340,
      "height": 120,
      "color": "4"
    },
    {
      "id": "label_gateway",
      "type": "text",
      "text": "**网关层**",
      "x": -40,
      "y": -250,
      "width": 180,
      "height": 60,
      "color": "6"
    },
    {
      "id": "gateway",
      "type": "text",
      "text": "## API 网关\n\nNginx / Gateway\n负载均衡 / 反向代理",
      "x": 200,
      "y": -260,
      "width": 340,
      "height": 120,
      "color": "5"
    },
    {
      "id": "label_backend",
      "type": "text",
      "text": "**后端层**",
      "x": -40,
      "y": -50,
      "width": 180,
      "height": 60,
      "color": "6"
    },
    {
      "id": "backend",
      "type": "text",
      "text": "## 后端服务\n\n{框架}\n业务逻辑 / API",
      "x": 200,
      "y": -60,
      "width": 340,
      "height": 120,
      "color": "5"
    },
    {
      "id": "label_data",
      "type": "text",
      "text": "**数据层**",
      "x": -40,
      "y": 150,
      "width": 180,
      "height": 60,
      "color": "6"
    },
    {
      "id": "db",
      "type": "text",
      "text": "## 数据库\n\n{数据库类型}",
      "x": 200,
      "y": 140,
      "width": 340,
      "height": 120,
      "color": "3"
    },
    {
      "id": "cache",
      "type": "text",
      "text": "## 缓存\n\nRedis\n会话 / 热数据",
      "x": 560,
      "y": 140,
      "width": 340,
      "height": 120,
      "color": "2"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "fromNode": "frontend",
      "fromSide": "bottom",
      "toNode": "gateway",
      "toSide": "top"
    },
    {
      "id": "e2",
      "fromNode": "gateway",
      "fromSide": "bottom",
      "toNode": "backend",
      "toSide": "top"
    },
    {
      "id": "e3",
      "fromNode": "backend",
      "fromSide": "bottom",
      "toNode": "db",
      "toSide": "top"
    },
    {
      "id": "e4",
      "fromNode": "backend",
      "fromSide": "bottom",
      "toNode": "cache",
      "toSide": "top"
    }
  ]
}
```

---

**微服务项目示例：**

```json
{
  "nodes": [
    {
      "id": "title",
      "type": "text",
      "text": "# {项目名} Architecture\n微服务架构",
      "x": 200,
      "y": -700,
      "width": 400,
      "height": 100,
      "color": "0"
    },
    {
      "id": "label_gateway",
      "type": "text",
      "text": "**网关层**",
      "x": -40,
      "y": -550,
      "width": 180,
      "height": 60,
      "color": "6"
    },
    {
      "id": "gateway",
      "type": "text",
      "text": "## API Gateway\n\nKong / Nginx\n路由 / 限流 / 认证",
      "x": 200,
      "y": -560,
      "width": 340,
      "height": 120,
      "color": "5"
    },
    {
      "id": "label_services",
      "type": "text",
      "text": "**服务层**",
      "x": -40,
      "y": -350,
      "width": 180,
      "height": 60,
      "color": "6"
    },
    {
      "id": "user_svc",
      "type": "text",
      "text": "## 用户服务\n\nUser Service\n认证 / 用户管理",
      "x": 200,
      "y": -360,
      "width": 340,
      "height": 120,
      "color": "5"
    },
    {
      "id": "order_svc",
      "type": "text",
      "text": "## 订单服务\n\nOrder Service\n订单处理",
      "x": 560,
      "y": -360,
      "width": 340,
      "height": 120,
      "color": "5"
    },
    {
      "id": "product_svc",
      "type": "text",
      "text": "## 商品服务\n\nProduct Service\n商品管理",
      "x": 920,
      "y": -360,
      "width": 340,
      "height": 120,
      "color": "5"
    },
    {
      "id": "label_infra",
      "type": "text",
      "text": "**基础设施**",
      "x": -40,
      "y": -150,
      "width": 180,
      "height": 60,
      "color": "6"
    },
    {
      "id": "db",
      "type": "text",
      "text": "## 数据库集群\n\nPostgreSQL / MySQL\n主从复制",
      "x": 200,
      "y": -160,
      "width": 340,
      "height": 120,
      "color": "3"
    },
    {
      "id": "mq",
      "type": "text",
      "text": "## 消息队列\n\nKafka / RabbitMQ\n异步通信",
      "x": 560,
      "y": -160,
      "width": 340,
      "height": 120,
      "color": "2"
    },
    {
      "id": "cache",
      "type": "text",
      "text": "## 缓存集群\n\nRedis Cluster\n分布式缓存",
      "x": 920,
      "y": -160,
      "width": 340,
      "height": 120,
      "color": "2"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "fromNode": "gateway",
      "fromSide": "bottom",
      "toNode": "user_svc",
      "toSide": "top"
    },
    {
      "id": "e2",
      "fromNode": "gateway",
      "fromSide": "bottom",
      "toNode": "order_svc",
      "toSide": "top"
    },
    {
      "id": "e3",
      "fromNode": "gateway",
      "fromSide": "bottom",
      "toNode": "product_svc",
      "toSide": "top"
    },
    {
      "id": "e4",
      "fromNode": "user_svc",
      "fromSide": "bottom",
      "toNode": "db",
      "toSide": "top"
    },
    {
      "id": "e5",
      "fromNode": "order_svc",
      "fromSide": "bottom",
      "toNode": "mq",
      "toSide": "top"
    },
    {
      "id": "e6",
      "fromNode": "product_svc",
      "fromSide": "bottom",
      "toNode": "cache",
      "toSide": "top"
    }
  ]
}
```

---

**注意事项：**
- 所有 y 坐标使用负数，从顶部向下递减
- 节点 text 支持多行，使用 `\n` 换行
- 层标签固定在 x: -40，内容节点从 x: 200 开始
- 同层多个节点横向排列，间距 360px
- 写入文件时使用 `JSON.stringify(canvasData, null, 0)` 压缩格式

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