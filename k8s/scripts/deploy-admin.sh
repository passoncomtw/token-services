#!/bin/bash
set -e

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  部署 Token Admin API${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

cd "$(dirname "$0")/.."

# 更新 ConfigMap
echo -e "${YELLOW}更新 ConfigMap...${NC}"
kubectl apply -f configmaps/admin-api-config.yaml
echo -e "${GREEN}✓ ConfigMap 已更新${NC}"
echo ""

# 部署 Deployment 和 Service
echo -e "${YELLOW}部署 Admin API...${NC}"
kubectl apply -f deployments/token-admin-api.yaml
kubectl apply -f services/token-admin-api-service.yaml
echo -e "${GREEN}✓ Deployment 和 Service 已更新${NC}"
echo ""

# 等待 rollout 完成
echo -e "${YELLOW}等待 rollout 完成...${NC}"
kubectl rollout status deployment/token-admin-api -n passontw-services --timeout=300s
echo -e "${GREEN}✓ Rollout 完成${NC}"
echo ""

# 顯示狀態
echo -e "${YELLOW}當前狀態:${NC}"
kubectl get deployment token-admin-api -n passontw-services
kubectl get pods -l app=token-admin-api -n passontw-services
echo ""

echo -e "${GREEN}✓ Admin API 部署完成${NC}"

