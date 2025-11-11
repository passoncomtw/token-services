#!/bin/bash
set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  建立 Kubernetes Secrets${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 檢查必要的環境變數
REQUIRED_VARS=(
  "DB_HOST"
  "DB_USER"
  "DB_PASSWORD"
  "DB_NAME"
  "JWT_SECRET"
  "GHCR_USERNAME"
  "GHCR_TOKEN"
)

echo -e "${YELLOW}檢查環境變數...${NC}"
MISSING_VARS=()

for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    MISSING_VARS+=("$VAR")
  else
    echo -e "  ${GREEN}✓${NC} $VAR"
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo ""
  echo -e "${RED}❌ 缺少以下環境變數:${NC}"
  for VAR in "${MISSING_VARS[@]}"; do
    echo -e "  ${RED}✗${NC} $VAR"
  done
  echo ""
  echo -e "${YELLOW}請設定環境變數後再執行此腳本${NC}"
  echo ""
  echo "範例:"
  echo "export DB_HOST=\"your-db-host\""
  echo "export DB_USER=\"your-db-user\""
  echo "export DB_PASSWORD=\"your-db-password\""
  echo "export DB_NAME=\"token_services\""
  echo "export JWT_SECRET=\"your-jwt-secret\""
  echo "export GHCR_USERNAME=\"passontw\""
  echo "export GHCR_TOKEN=\"ghp_xxxx\""
  exit 1
fi

echo ""
echo -e "${GREEN}✓ 所有環境變數已設定${NC}"
echo ""

# 檢查 namespace 是否存在
echo -e "${YELLOW}檢查 namespace...${NC}"
if kubectl get namespace passontw-services &> /dev/null; then
  echo -e "${GREEN}✓ Namespace passontw-services 已存在${NC}"
else
  echo -e "${YELLOW}建立 namespace passontw-services...${NC}"
  kubectl apply -f ../namespace.yaml
  echo -e "${GREEN}✓ Namespace 已建立${NC}"
fi
echo ""

# 建立資料庫 Secret
echo -e "${YELLOW}建立資料庫 Secret...${NC}"
kubectl create secret generic database-secret \
  --from-literal=DB_HOST="$DB_HOST" \
  --from-literal=DB_PORT="${DB_PORT:-5432}" \
  --from-literal=DB_USER="$DB_USER" \
  --from-literal=DB_PASSWORD="$DB_PASSWORD" \
  --from-literal=DB_NAME="$DB_NAME" \
  --from-literal=DB_SSLMODE="${DB_SSLMODE:-disable}" \
  --namespace=passontw-services \
  --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✓ 資料庫 Secret 已建立${NC}"
echo ""

# 建立 JWT Secret
echo -e "${YELLOW}建立 JWT Secret...${NC}"
kubectl create secret generic jwt-secret \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --namespace=passontw-services \
  --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✓ JWT Secret 已建立${NC}"
echo ""

# 建立 GHCR Pull Secret
echo -e "${YELLOW}建立 GHCR Pull Secret...${NC}"
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username="$GHCR_USERNAME" \
  --docker-password="$GHCR_TOKEN" \
  --namespace=passontw-services \
  --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✓ GHCR Pull Secret 已建立${NC}"
echo ""

# 驗證 Secrets
echo -e "${YELLOW}驗證 Secrets...${NC}"
kubectl get secrets -n passontw-services

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ 所有 Secrets 已成功建立${NC}"
echo -e "${GREEN}========================================${NC}"

