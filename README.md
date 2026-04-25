# NBTI Web

在线测评系统前端，基于 Next.js 构建。

## 环境要求

- Node.js >= 18.12.0
- pnpm >= 10.19.0
- Docker >= 20.10 (用于容器化部署)

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（http://localhost:3000）
pnpm dev

# 类型检查
pnpm check

# 代码格式检查
pnpm format-check
```

## 生产构建

```bash
# 构建 Next.js 应用
pnpm build
```

## Docker 部署

### 构建镜像

```bash
# 方式一：直接构建
docker build -t nbti-web:latest -f apps/web/Dockerfile .

# 方式二：使用 docker-compose（推荐）
docker compose -f apps/web/docker-compose.yml build

# 方式三：使用 package.json 脚本
cd apps/web && pnpm docker:build
```

### 运行容器

```bash
# 方式一：直接运行
docker run -d -p 3000:3000 --name nbti-web nbti-web:latest

# 方式二：使用 docker-compose（推荐，自动重启、健康检查）
docker compose -f apps/web/docker-compose.yml up -d

# 方式三：使用 package.json 脚本
cd apps/web && pnpm docker:run
```

### 查看日志

```bash
docker logs -f nbti-web
```

### 停止容器

```bash
# 直接运行的容器
docker stop nbti-web && docker rm nbti-web

# docker-compose 启动的容器
docker compose -f apps/web/docker-compose.yml down
```

## 镜像命名与推送

### 常见命名格式

```bash
# 构建完成后打标签
docker tag nbti-web:latest <仓库地址>/nbti-web:<版本>

# 推送到远程仓库
docker push <仓库地址>/nbti-web:<版本>
```

### 推送到私有仓库

```bash
# 例如推送到 82.156.109.240
docker tag nbti-web:latest 82.156.109.240:5000/nbti-web:latest
docker push 82.156.109.240:5000/nbti-web:latest
```

### 在服务器上部署

```bash
# 拉取镜像
docker pull 82.156.109.240:5000/nbti-web:latest

# 运行容器
docker run -d -p 3001:3000 --name nbti-web 82.156.109.240:5000/nbti-web:latest
```

## 常用版本标签

```bash
# 按版本号
docker tag nbti-web:latest <仓库>/nbti-web:v1.0.0

# 按日期
docker tag nbti-web:latest <仓库>/nbti-web:$(date +%Y%m%d)

# latest 始终指向最新
docker tag nbti-web:latest <仓库>/nbti-web:latest
```

## 一键构建 + 推送

```bash
# 构建并推送到私有仓库
docker build -t nbti-web:latest -f apps/web/Dockerfile . \
  && docker tag nbti-web:latest 82.156.109.240:5000/nbti-web:latest \
  && docker push 82.156.109.240:5000/nbti-web:latest
```

## 静态资源

- `apps/web/public/` 目录下的文件直接映射到 `/` 路径下
- 包含 `favicon.ico` 及 `types/` 下的所有图片文件
- Docker 镜像中文件位于 `apps/web/public/`（standalone 模式要求）

## 端口说明

- 应用内部端口: `3000`
- docker-compose 默认映射: `3000:3000`
- 服务器可按需映射为 `3001:3000` 等
