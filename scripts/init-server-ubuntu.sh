#!/bin/bash
#
# Ubuntu 服务器初始化脚本
# 用于在腾讯云 Ubuntu 服务器上安装 Docker 和相关配置
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Ubuntu 服务器初始化脚本${NC}"
echo -e "${GREEN}   NBTI 部署环境配置${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}请使用 root 用户运行此脚本${NC}"
  echo -e "${YELLOW}提示: sudo bash $0${NC}"
  exit 1
fi

# 1. 更新系统
echo -e "\n${BLUE}[1/6] 更新系统...${NC}"
apt update -y && apt upgrade -y
echo -e "${GREEN}系统更新完成${NC}"

# 2. 安装必要工具
echo -e "\n${BLUE}[2/6] 安装必要工具...${NC}"
apt install -y ca-certificates curl wget gnupg lsb-release
echo -e "${GREEN}工具安装完成${NC}"

# 3. 添加 Docker 官方 GPG 密钥
echo -e "\n${BLUE}[3/6] 添加 Docker 仓库...${NC}"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# 添加 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
echo -e "${GREEN}Docker 仓库添加完成${NC}"

# 4. 安装 Docker
echo -e "\n${BLUE}[4/6] 安装 Docker...${NC}"
apt update -y
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
echo -e "${GREEN}Docker 安装完成${NC}"

# 5. 配置 Docker 镜像加速
echo -e "\n${BLUE}[5/6] 配置 Docker 镜像加速...${NC}"
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyun.me"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  }
}
EOF
echo -e "${GREEN}Docker 镜像加速配置完成${NC}"

# 6. 启动 Docker 服务
echo -e "\n${BLUE}[6/6] 启动 Docker 服务...${NC}"
systemctl enable docker
systemctl start docker
echo -e "${GREEN}Docker 服务启动完成${NC}"

# 验证 Docker 安装
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   验证安装${NC}"
echo -e "${GREEN}========================================${NC}"
docker --version
docker compose version

# 添加当前用户到 docker 组（可选）
CURRENT_USER=${SUDO_USER:-$(whoami)}
if [ -n "$CURRENT_USER" ] && [ "$CURRENT_USER" != "root" ]; then
  usermod -aG docker $CURRENT_USER
  echo -e "${GREEN}已将用户 $CURRENT_USER 添加到 docker 组${NC}"
  echo -e "${YELLOW}请重新登录以使 docker 组权限生效${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   服务器初始化完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}下一步操作：${NC}"
echo "1. 在 Docker Hub 创建公开仓库（nbti-web）"
echo "2. 在 GitHub 仓库设置中添加以下 Secrets:"
echo "   - DOCKERHUB_USERNAME: Docker Hub 用户名"
echo "   - DOCKERHUB_TOKEN: Docker Hub Access Token"
echo "   - STAGING_HOST: 服务器 IP"
echo "   - STAGING_USER: 服务器用户名"
echo "   - STAGING_PASSWORD: 服务器密码"
echo "3. 推送代码到 main 分支触发部署"
echo ""
