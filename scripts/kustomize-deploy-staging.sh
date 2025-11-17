#!/bin/bash

# Kustomize 部署脚本 - Staging 环境
# 用法: ./scripts/kustomize-deploy-staging.sh [image-tag]
# 示例: ./scripts/kustomize-deploy-staging.sh develop-5a48c1c

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 默认使用当前 commit SHA
if [ -z "$1" ]; then
    BRANCH=$(git branch --show-current)
    SHORT_SHA=$(git rev-parse --short HEAD)
    IMAGE_TAG="${BRANCH}-${SHORT_SHA}"
else
    IMAGE_TAG="$1"
fi

echo -e "${GREEN}🚀 开始部署到 Staging 环境${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "镜像标签: ${IMAGE_TAG}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 进入 overlay 目录
cd k8s/overlays/staging

# 备份当前配置
cp kustomization.yaml kustomization.yaml.backup
echo -e "${YELLOW}📝 已备份当前配置${NC}"

# 设置镜像标签
echo -e "${GREEN}🔄 设置镜像标签...${NC}"
kustomize edit set image \
  ghcr.io/passontw/token-admin-api:${IMAGE_TAG} \
  ghcr.io/passontw/token-app-api:${IMAGE_TAG}

# 预览配置
echo ""
echo -e "${YELLOW}📋 预览配置（前 30 行）:${NC}"
kubectl kustomize . | head -30
echo "..."

# 确认部署
echo ""
read -p "确认部署到 Staging？(y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ 已取消部署${NC}"
    mv kustomization.yaml.backup kustomization.yaml
    exit 1
fi

# 部署
echo ""
echo -e "${GREEN}📦 应用配置...${NC}"
kubectl apply -k .

# 等待部署完成
echo ""
echo -e "${GREEN}⏳ 等待部署完成...${NC}"
kubectl rollout status deployment/token-admin-api -n passontw-services-staging --timeout=5m
kubectl rollout status deployment/token-app-api -n passontw-services-staging --timeout=5m

# 验证部署
echo ""
echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "📊 当前状态:"
kubectl get pods -n passontw-services-staging -l app.kubernetes.io/managed-by=kustomize

echo ""
echo "🔍 部署的镜像:"
kubectl get deployment token-admin-api -n passontw-services-staging \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
echo ""
kubectl get deployment token-app-api -n passontw-services-staging \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
echo ""

# 清理备份
rm kustomization.yaml.backup

echo ""
echo -e "${GREEN}🎉 部署成功！${NC}"

