#!/bin/bash
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   NBTI Web Docker 部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装${NC}"
    exit 1
fi

# 检查 Docker 是否运行
if ! docker info &> /dev/null; then
    echo -e "${RED}错误: Docker 未运行${NC}"
    exit 1
fi

# 解析命令行参数
ACTION=${1:-build}

case $ACTION in
  build)
    echo -e "${YELLOW}步骤 1/2: 构建 Docker 镜像...${NC}"
    docker build -t nbti-web:latest .
    echo -e "${GREEN}镜像构建成功!${NC}"
    echo ""
    echo -e "${GREEN}运行以下命令启动容器:${NC}"
    echo -e "  docker run -d -p 3000:3000 --name nbti-web nbti-web:latest"
    ;;

  start)
    echo -e "${YELLOW}启动容器...${NC}"
    # 检查是否已存在容器
    if docker ps -a --format '{{.Names}}' | grep -q "^nbti-web$"; then
      if docker ps --format '{{.Names}}' | grep -q "^nbti-web$"; then
        echo -e "${YELLOW}容器已在运行中${NC}"
      else
        echo -e "${YELLOW}删除旧容器...${NC}"
        docker rm nbti-web
        docker run -d -p 3000:3000 --name nbti-web nbti-web:latest
        echo -e "${GREEN}容器启动成功!${NC}"
      fi
    else
      docker run -d -p 3000:3000 --name nbti-web nbti-web:latest
      echo -e "${GREEN}容器启动成功!${NC}"
    fi
    echo ""
    echo -e "${GREEN}访问 http://localhost:3000${NC}"
    ;;

  stop)
    echo -e "${YELLOW}停止容器...${NC}"
    docker stop nbti-web
    echo -e "${GREEN}容器已停止${NC}"
    ;;

  restart)
    echo -e "${YELLOW}重启容器...${NC}"
    docker restart nbti-web
    echo -e "${GREEN}容器已重启${NC}"
    ;;

  remove)
    echo -e "${RED}删除容器...${NC}"
    docker stop nbti-web 2>/dev/null || true
    docker rm nbti-web 2>/dev/null || true
    echo -e "${GREEN}容器已删除${NC}"
    ;;

  logs)
    docker logs -f nbti-web
    ;;

  *)
    echo -e "${YELLOW}用法: $0 {build|start|stop|restart|remove|logs}${NC}"
    echo ""
    echo "命令说明:"
    echo "  build   - 构建 Docker 镜像 (默认)"
    echo "  start   - 启动容器"
    echo "  stop    - 停止容器"
    echo "  restart - 重启容器"
    echo "  remove  - 删除容器"
    echo "  logs    - 查看容器日志"
    exit 1
    ;;
esac
