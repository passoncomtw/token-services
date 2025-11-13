#!/bin/bash

# 遷移到新 CI/CD 工作流腳本
# 此腳本會：
# 1. 為新命名空間創建必要的 Secrets
# 2. 清理舊部署
# 3. 準備使用新的自動化工作流

set -e

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${BLUE}   遷移到新 CI/CD 工作流${NC}\n"
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo ""

# 設定環境
STAGING_NAMESPACE="passontw-services-staging"
PRODUCTION_NAMESPACE="passontw-services-production"
OLD_NAMESPACE="passontw-services"

printf "${YELLOW}選擇部署環境：${NC}\n"
echo "1. Staging（測試環境）"
echo "2. Production（生產環境）"
echo "3. 兩者都創建"
echo ""
read -p "請選擇 (1/2/3): " ENV_CHOICE

case $ENV_CHOICE in
    1)
        NAMESPACES=("$STAGING_NAMESPACE")
        printf "${GREEN}✓ 將為 Staging 環境創建 Secrets${NC}\n"
        ;;
    2)
        NAMESPACES=("$PRODUCTION_NAMESPACE")
        printf "${GREEN}✓ 將為 Production 環境創建 Secrets${NC}\n"
        ;;
    3)
        NAMESPACES=("$STAGING_NAMESPACE" "$PRODUCTION_NAMESPACE")
        printf "${GREEN}✓ 將為兩個環境創建 Secrets${NC}\n"
        ;;
    *)
        printf "${RED}❌ 無效選擇${NC}\n"
        exit 1
        ;;
esac

echo ""
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${BLUE}   步驟 1: 收集必要資訊${NC}\n"
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo ""

# === GitHub Container Registry 憑證 ===
printf "${YELLOW}📦 GitHub Container Registry 憑證${NC}\n"
echo ""
read -p "GitHub 用戶名: " GITHUB_USERNAME

echo ""
printf "${YELLOW}GitHub Personal Access Token:${NC}\n"
printf "  ${BLUE}獲取方式：https://github.com/settings/tokens${NC}\n"
printf "  ${BLUE}需要權限：read:packages${NC}\n"
echo ""
read -sp "GitHub Token: " GITHUB_TOKEN
echo ""
echo ""

if [ -z "$GITHUB_USERNAME" ] || [ -z "$GITHUB_TOKEN" ]; then
    printf "${RED}❌ GitHub 憑證不能為空${NC}\n"
    exit 1
fi

# === 資料庫連接資訊 ===
printf "${YELLOW}🗄️  資料庫連接資訊${NC}\n"
echo ""

# Staging 環境資料庫
if [[ " ${NAMESPACES[@]} " =~ " ${STAGING_NAMESPACE} " ]]; then
    printf "${BLUE}Staging 環境資料庫：${NC}\n"
    read -p "  主機 (例: localhost): " STAGING_DB_HOST
    read -p "  端口 (預設: 5432): " STAGING_DB_PORT
    STAGING_DB_PORT=${STAGING_DB_PORT:-5432}
    read -p "  用戶名: " STAGING_DB_USER
    read -sp "  密碼: " STAGING_DB_PASSWORD
    echo ""
    read -p "  資料庫名 (預設: token_services): " STAGING_DB_NAME
    STAGING_DB_NAME=${STAGING_DB_NAME:-token_services}
    read -p "  SSL 模式 (預設: disable): " STAGING_DB_SSLMODE
    STAGING_DB_SSLMODE=${STAGING_DB_SSLMODE:-disable}
    echo ""
fi

# Production 環境資料庫
if [[ " ${NAMESPACES[@]} " =~ " ${PRODUCTION_NAMESPACE} " ]]; then
    printf "${BLUE}Production 環境資料庫：${NC}\n"
    
    if [[ " ${NAMESPACES[@]} " =~ " ${STAGING_NAMESPACE} " ]]; then
        read -p "  使用與 Staging 相同的資料庫? (y/n): " USE_SAME_DB
        if [ "$USE_SAME_DB" = "y" ]; then
            PRODUCTION_DB_HOST=$STAGING_DB_HOST
            PRODUCTION_DB_PORT=$STAGING_DB_PORT
            PRODUCTION_DB_USER=$STAGING_DB_USER
            PRODUCTION_DB_PASSWORD=$STAGING_DB_PASSWORD
            PRODUCTION_DB_NAME=$STAGING_DB_NAME
            PRODUCTION_DB_SSLMODE=$STAGING_DB_SSLMODE
            printf "${GREEN}  ✓ 使用相同的資料庫配置${NC}\n"
        else
            read -p "  主機: " PRODUCTION_DB_HOST
            read -p "  端口 (預設: 5432): " PRODUCTION_DB_PORT
            PRODUCTION_DB_PORT=${PRODUCTION_DB_PORT:-5432}
            read -p "  用戶名: " PRODUCTION_DB_USER
            read -sp "  密碼: " PRODUCTION_DB_PASSWORD
            echo ""
            read -p "  資料庫名 (預設: token_services): " PRODUCTION_DB_NAME
            PRODUCTION_DB_NAME=${PRODUCTION_DB_NAME:-token_services}
            read -p "  SSL 模式 (預設: require): " PRODUCTION_DB_SSLMODE
            PRODUCTION_DB_SSLMODE=${PRODUCTION_DB_SSLMODE:-require}
        fi
    else
        read -p "  主機: " PRODUCTION_DB_HOST
        read -p "  端口 (預設: 5432): " PRODUCTION_DB_PORT
        PRODUCTION_DB_PORT=${PRODUCTION_DB_PORT:-5432}
        read -p "  用戶名: " PRODUCTION_DB_USER
        read -sp "  密碼: " PRODUCTION_DB_PASSWORD
        echo ""
        read -p "  資料庫名 (預設: token_services): " PRODUCTION_DB_NAME
        PRODUCTION_DB_NAME=${PRODUCTION_DB_NAME:-token_services}
        read -p "  SSL 模式 (預設: require): " PRODUCTION_DB_SSLMODE
        PRODUCTION_DB_SSLMODE=${PRODUCTION_DB_SSLMODE:-require}
    fi
    echo ""
fi

echo ""
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${BLUE}   步驟 2: 創建 Secrets${NC}\n"
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo ""

# 函數：為指定命名空間創建 Secrets
create_secrets_for_namespace() {
    local NAMESPACE=$1
    local DB_HOST=$2
    local DB_PORT=$3
    local DB_USER=$4
    local DB_PASSWORD=$5
    local DB_NAME=$6
    local DB_SSLMODE=$7
    
    printf "${YELLOW}📦 為 ${NAMESPACE} 創建 Secrets...${NC}\n"
    
    # 創建命名空間
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        printf "${GREEN}  ✓ 命名空間 ${NAMESPACE} 已存在${NC}\n"
    else
        kubectl create namespace $NAMESPACE
        printf "${GREEN}  ✓ 命名空間 ${NAMESPACE} 已創建${NC}\n"
    fi
    
    # 創建 GHCR Pull Secret
    printf "  🔐 創建 ghcr-pull-secret...\n"
    kubectl create secret docker-registry ghcr-pull-secret \
      --docker-server=ghcr.io \
      --docker-username="$GITHUB_USERNAME" \
      --docker-password="$GITHUB_TOKEN" \
      -n $NAMESPACE \
      --dry-run=client -o yaml | kubectl apply -f - > /dev/null
    printf "${GREEN}  ✓ ghcr-pull-secret 創建成功${NC}\n"
    
    # 創建 Database Secret
    printf "  🗄️  創建 database-secret...\n"
    kubectl create secret generic database-secret \
      --from-literal=DB_HOST="$DB_HOST" \
      --from-literal=DB_PORT="$DB_PORT" \
      --from-literal=DB_USER="$DB_USER" \
      --from-literal=DB_PASSWORD="$DB_PASSWORD" \
      --from-literal=DB_NAME="$DB_NAME" \
      --from-literal=DB_SSLMODE="$DB_SSLMODE" \
      -n $NAMESPACE \
      --dry-run=client -o yaml | kubectl apply -f - > /dev/null
    printf "${GREEN}  ✓ database-secret 創建成功${NC}\n"
    
    # 創建 JWT Secret
    printf "  🔑 創建 jwt-secret...\n"
    JWT_SECRET=$(openssl rand -base64 32)
    kubectl create secret generic jwt-secret \
      --from-literal=JWT_SECRET="$JWT_SECRET" \
      -n $NAMESPACE \
      --dry-run=client -o yaml | kubectl apply -f - > /dev/null
    printf "${GREEN}  ✓ jwt-secret 創建成功${NC}\n"
    
    echo ""
}

# 為每個選定的命名空間創建 Secrets
if [[ " ${NAMESPACES[@]} " =~ " ${STAGING_NAMESPACE} " ]]; then
    create_secrets_for_namespace \
        "$STAGING_NAMESPACE" \
        "$STAGING_DB_HOST" \
        "$STAGING_DB_PORT" \
        "$STAGING_DB_USER" \
        "$STAGING_DB_PASSWORD" \
        "$STAGING_DB_NAME" \
        "$STAGING_DB_SSLMODE"
fi

if [[ " ${NAMESPACES[@]} " =~ " ${PRODUCTION_NAMESPACE} " ]]; then
    create_secrets_for_namespace \
        "$PRODUCTION_NAMESPACE" \
        "$PRODUCTION_DB_HOST" \
        "$PRODUCTION_DB_PORT" \
        "$PRODUCTION_DB_USER" \
        "$PRODUCTION_DB_PASSWORD" \
        "$PRODUCTION_DB_NAME" \
        "$PRODUCTION_DB_SSLMODE"
fi

echo ""
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${BLUE}   步驟 3: 清理舊部署${NC}\n"
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo ""

if kubectl get namespace $OLD_NAMESPACE &> /dev/null; then
    printf "${YELLOW}⚠️  發現舊命名空間: ${OLD_NAMESPACE}${NC}\n"
    echo ""
    read -p "是否刪除舊命名空間? (y/n): " DELETE_OLD
    
    if [ "$DELETE_OLD" = "y" ]; then
        printf "${YELLOW}🗑️  刪除舊命名空間...${NC}\n"
        kubectl delete namespace $OLD_NAMESPACE
        printf "${GREEN}✓ 舊命名空間已刪除${NC}\n"
    else
        printf "${YELLOW}⚠️  保留舊命名空間（建議稍後手動刪除）${NC}\n"
    fi
else
    printf "${GREEN}✓ 沒有舊命名空間需要清理${NC}\n"
fi

echo ""
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${BLUE}   步驟 4: 驗證設置${NC}\n"
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo ""

for NAMESPACE in "${NAMESPACES[@]}"; do
    printf "${YELLOW}檢查 ${NAMESPACE}:${NC}\n"
    
    # 檢查 Secrets
    SECRETS=$(kubectl get secrets -n $NAMESPACE -o name | wc -l)
    printf "  Secrets: ${GREEN}${SECRETS} 個${NC}\n"
    
    kubectl get secrets -n $NAMESPACE | grep -E "(ghcr-pull-secret|database-secret|jwt-secret)" | while read line; do
        printf "    ${GREEN}✓${NC} $line\n"
    done
    
    echo ""
done

echo ""
printf "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${GREEN}   ✅ 遷移準備完成！${NC}\n"
printf "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo ""

printf "${YELLOW}📝 下一步：使用 CI/CD 自動部署${NC}\n"
echo ""
echo "方式 1: 推送代碼自動部署"
echo "  git push origin develop    # → 自動部署到 staging"
echo "  git push origin main        # → 自動部署到 production"
echo ""
echo "方式 2: 手動觸發部署"
echo "  gh workflow run \"CI/CD - Admin API\" -f environment=staging"
echo "  gh workflow run \"CI/CD - App API\" -f environment=staging"
echo ""
echo "查看部署狀態："
echo "  kubectl get pods -n passontw-services-staging -w"
echo ""

printf "${BLUE}💡 提示：${NC}\n"
echo "• 新的 CI/CD 工作流會自動構建和部署"
echo "• develop 分支自動部署到 staging"
echo "• main 分支自動部署到 production"
echo "• 部署失敗時會自動回滾"
echo ""

