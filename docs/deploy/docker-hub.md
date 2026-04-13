# Docker Hub 部署指南

## 1. 创建 Docker Hub 仓库

### 1.1 注册 Docker Hub

访问 [Docker Hub](https://hub.docker.com/) 注册账号

### 1.2 创建公开仓库

1. 登录后点击「Create Repository」
2. 仓库名称：`nbti-web`
3. 可见性：Public（免费）
4. 点击创建

## 2. 获取 Access Token

为提高安全性，建议使用 Access Token 而非密码：

1. 登录 Docker Hub
2. 点击右上角头像 → 「Account Settings」
3. 左侧菜单选择「Security」
4. 点击「New Access Token」
5. 输入描述（如 `github-actions`）
6. 复制生成的 Token

## 3. 配置 GitHub Secrets

在 GitHub 仓库 → Settings → Secrets and variables → Actions 中添加：

| Secret 名称           | 说明              | 示例             |
| --------------------- | ----------------- | ---------------- |
| `DOCKERHUB_USERNAME`  | Docker Hub 用户名 | `myusername`     |
| `DOCKERHUB_TOKEN`     | Access Token      | `dckr_pat_xxxxx` |
| `STAGING_HOST`        | Staging 服务器 IP | `1.2.3.4`        |
| `STAGING_USER`        | Staging 用户名    | `root`           |
| `STAGING_PASSWORD`    | Staging 密码      | `your-password`  |
| `STAGING_SSH_PORT`    | SSH 端口          | `22`             |
| `PRODUCTION_HOST`     | 生产服务器 IP     | `5.6.7.8`        |
| `PRODUCTION_USER`     | 生产用户名        | `root`           |
| `PRODUCTION_PASSWORD` | 生产密码          | `your-password`  |
| `PRODUCTION_SSH_PORT` | SSH 端口          | `22`             |

## 4. 服务器初始化

在 CentOS 服务器上执行初始化脚本：

```bash
# 下载脚本
curl -O https://raw.githubusercontent.com/你的用户名/nbti/main/scripts/init-server.sh

# 添加执行权限
chmod +x init-server.sh

# 以 root 身份执行
sudo bash init-server.sh
```

## 5. 配置防火墙

确保服务器防火墙允许以下端口：

```bash
# 开放端口
firewall-cmd --permanent --add-port=3000/tcp   # 生产环境
firewall-cmd --permanent --add-port=3001/tcp   # Staging 环境
firewall-cmd --permanent --add-port=22/tcp     # SSH

# 重载防火墙
firewall-cmd --reload
```

或者在腾讯云安全组中配置入站规则。

## 6. 验证部署

部署完成后访问：

- 生产环境：`http://服务器IP:3000`
- Staging 环境：`http://服务器IP:3001`

## 7. 常用命令

```bash
# 查看容器状态
docker ps

# 查看日志
docker logs nbti-web

# 重启容器
docker restart nbti-web

# 手动更新部署
docker pull 你的用户名/nbti-web:main
docker stop nbti-web && docker rm nbti-web
docker run -d --name nbti-web -p 3000:3000 --restart unless-stopped \
  你的用户名/nbti-web:main
```

## 8. 镜像标签说明

| 触发条件          | 镜像标签 | 示例                         |
| ----------------- | -------- | ---------------------------- |
| 推送到 main 分支  | `main`   | `myusername/nbti-web:main`   |
| 推送 tag `v1.0.0` | `v1.0.0` | `myusername/nbti-web:v1.0.0` |
| 推送 PR           | `pr-123` | `myusername/nbti-web:pr-123` |
