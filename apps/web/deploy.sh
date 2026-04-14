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
ACTION=${1:-deploy}

case $ACTION in
  deploy)
    echo -e "${YELLOW}步骤 1/4: 清理构建缓存...${NC}"
    rm -rf .next
    echo -e "${GREEN}缓存清理完成${NC}"

    echo -e "${YELLOW}步骤 2/4: 构建 Docker 镜像...${NC}"
    docker build -t nbti-web:latest .
    echo -e "${GREEN}镜像构建成功${NC}"

    echo -e "${YELLOW}步骤 3/4: 更新容器...${NC}"
    # 停止并删除旧容器（如果存在）
    docker stop nbti-web 2>/dev/null || true
    docker rm nbti-web 2>/dev/null || true
    # 启动新容器
    docker run -d -p 3000:3000 --name nbti-web --restart unless-stopped nbti-web:latest
    echo -e "${GREEN}容器启动成功${NC}"

    echo -e "${YELLOW}步骤 4/4: 验证部署...${NC}"
    sleep 3
    if curl -sf http://localhost:3000 > /dev/null; then
      echo -e "${GREEN}========================================${NC}"
      echo -e "${GREEN}   部署完成！访问 http://localhost:3000${NC}"
      echo -e "${GREEN}========================================${NC}"
    else
      echo -e "${RED}警告: 服务可能未正常启动，请检查日志${NC}"
      echo "运行 '$0 logs' 查看日志"
    fi
    ;;

  build)
    echo -e "${YELLOW}构建 Docker 镜像...${NC}"
    rm -rf .next
    docker build -t nbti-web:latest .
    echo -e "${GREEN}镜像构建成功${NC}"
    ;;

  start)
    echo -e "${YELLOW}启动容器...${NC}"
    if docker ps --format '{{.Names}}' | grep -q "^nbti-web$"; then
      echo -e "${YELLOW}容器已在运行中${NC}"
    else
      docker stop nbti-web 2>/dev/null || true
      docker rm nbti-web 2>/dev/null || true
      docker run -d -p 3000:3000 --name nbti-web --restart unless-stopped nbti-web:latest
      echo -e "${GREEN}容器启动成功${NC}"
      echo ""
      echo -e "${GREEN}访问 http://localhost:3000${NC}"
    fi
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
    echo -e "${YELLOW}用法: $0 {deploy|build|start|stop|restart|remove|logs}${NC}"
    echo ""
    echo "命令说明:"
    echo "  deploy   - 完整部署流程 (清理缓存 + 构建 + 启动) (默认)"
    echo "  build    - 仅构建镜像"
    echo "  start    - 启动容器"
    echo "  stop     - 停止容器"
    echo "  restart  - 重启容器"
    echo "  remove   - 删除容器"
    echo "  logs     - 查看容器日志"
    exit 1
    ;;
esac
