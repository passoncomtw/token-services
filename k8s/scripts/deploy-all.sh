#!/bin/bash
set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  部署所有服務到 Kubernetes${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 切換到 k8s 目錄
cd "$(dirname "$0")/.."

# 1. 建立 Namespace
echo -e "${YELLOW}1. 建立 Namespace...${NC}"
kubectl apply -f namespace.yaml
echo -e "${GREEN}✓ Namespace 已建立/更新${NC}"
echo ""

# 2. 建立 ConfigMaps
echo -e "${YELLOW}2. 建立 ConfigMaps...${NC}"
kubectl apply -f configmaps/
echo -e "${GREEN}✓ ConfigMaps 已建立/更新${NC}"
echo ""

# 3. 部署服務
echo -e "${YELLOW}3. 部署服務...${NC}"

echo "  部署 Admin API..."
kubectl apply -f deployments/token-admin-api.yaml
kubectl apply -f services/token-admin-api-service.yaml
echo -e "  ${GREEN}✓${NC} Admin API 已部署"

echo "  部署 App API..."
kubectl apply -f deployments/token-app-api.yaml
kubectl apply -f services/token-app-api-service.yaml
echo -e "  ${GREEN}✓${NC} App API 已部署"

echo -e "${GREEN}✓ 所有服務已部署${NC}"
echo ""

# 4. 部署 Ingress（可選）
if [ -f "ingress/ingress.yaml" ]; then
  echo -e "${YELLOW}4. 部署 Ingress...${NC}"
  read -p "是否部署 Ingress? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    kubectl apply -f ingress/ingress.yaml
    echo -e "${GREEN}✓ Ingress 已部署${NC}"
  else
    echo -e "${YELLOW}⊘ 跳過 Ingress 部署${NC}"
  fi
  echo ""
fi

# 5. 等待 Pods 就緒
echo -e "${YELLOW}5. 等待 Pods 就緒...${NC}"
echo "等待 Admin API..."
kubectl rollout status deployment/token-admin-api -n passontw-services --timeout=300s
echo "等待 App API..."
kubectl rollout status deployment/token-app-api -n passontw-services --timeout=300s
echo -e "${GREEN}✓ 所有 Pods 已就緒${NC}"
echo ""

# 6. 顯示部署狀態
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  部署狀態${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}Deployments:${NC}"
kubectl get deployments -n passontw-services
echo ""

echo -e "${YELLOW}Pods:${NC}"
kubectl get pods -n passontw-services
echo ""

echo -e "${YELLOW}Services:${NC}"
kubectl get services -n passontw-services
echo ""

if kubectl get ingress -n passontw-services &> /dev/null; then
  echo -e "${YELLOW}Ingress:${NC}"
  kubectl get ingress -n passontw-services
  echo ""
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ 部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo -e "${YELLOW}查看日誌:${NC}"
echo "  kubectl logs -f -n passontw-services deployment/token-admin-api"
echo "  kubectl logs -f -n passontw-services deployment/token-app-api"
echo ""

echo -e "${YELLOW}查看 Pod 狀態:${NC}"
echo "  kubectl describe pod -n passontw-services <pod-name>"
echo ""

echo -e "${YELLOW}進入 Pod:${NC}"
echo "  kubectl exec -it -n passontw-services <pod-name> -- sh"

