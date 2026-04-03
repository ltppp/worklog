# Octopus

## 简介
Go 语言财务对账系统，章鱼隐喻：每个触手是独立业务单元，通过中央大脑协调。

## 技术栈
- Go（主语言）
- MongoDB（数据存储）
- gRPC（API 通信）
- Redis（缓存）

## 关键文件
- `main.go` - 入口
- `grpc-service/` - gRPC API 入口
- `service/` - 业务逻辑层
- `reponsitory/` - MongoDB 数据访问层

## 开发记录
### 2026-04-03
- 创建 worklog 知识库简化工作记录流程