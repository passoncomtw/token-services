#!/bin/bash

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Kubernetes 部署回滾${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 選擇要回滾的服務
echo -e "${YELLOW}請選擇要回滾的服務:${NC}"
echo "1) Token Admin API"
echo "2) Token App API"
echo "3) 取消"
echo ""
read -p "請輸入選項 (1-3): " choice

case $choice in
  1)
    DEPLOYMENT="token-admin-api"
    ;;
  2)
    DEPLOYMENT="token-app-api"
    ;;
  3)
    echo -e "${YELLOW}已取消${NC}"
    exit 0
    ;;
  *)
    echo -e "${RED}無效的選項${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${YELLOW}查看 $DEPLOYMENT 的部署歷史...${NC}"
kubectl rollout history deployment/$DEPLOYMENT -n passontw-services

echo ""
echo -e "${YELLOW}選擇回滾方式:${NC}"
echo "1) 回滾到上一個版本"
echo "2) 回滾到特定版本"
echo "3) 取消"
echo ""
read -p "請輸入選項 (1-3): " rollback_choice

case $rollback_choice in
  1)
    echo ""
    echo -e "${YELLOW}回滾到上一個版本...${NC}"
    kubectl rollout undo deployment/$DEPLOYMENT -n passontw-services
    ;;
  2)
    echo ""
    read -p "請輸入要回滾到的版本號: " revision
    echo -e "${YELLOW}回滾到版本 $revision...${NC}"
    kubectl rollout undo deployment/$DEPLOYMENT -n passontw-services --to-revision=$revision
    ;;
  3)
    echo -e "${YELLOW}已取消${NC}"
    exit 0
    ;;
  *)
    echo -e "${RED}無效的選項${NC}"
    exit 1
    ;;
esac

# 等待回滾完成
echo ""
echo -e "${YELLOW}等待回滾完成...${NC}"
kubectl rollout status deployment/$DEPLOYMENT -n passontw-services

echo ""
echo -e "${GREEN}✓ 回滾完成${NC}"
echo ""

# 顯示當前狀態
echo -e "${YELLOW}當前狀態:${NC}"
kubectl get deployment $DEPLOYMENT -n passontw-services
kubectl get pods -l app=$DEPLOYMENT -n passontw-services

