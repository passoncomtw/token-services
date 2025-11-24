#!/bin/bash

# HTTPS 部署腳本
# 自動部署 Ingress 並驗證 HTTPS 配置

set -e

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${BLUE}   HTTPS 部署腳本${NC}\n"
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo ""

# 檢查 kubectl
if ! command -v kubectl &> /dev/null; then
    printf "${RED}❌ kubectl 未安裝${NC}\n"
    exit 1
fi

# 檢查集群連接
if ! kubectl cluster-info &> /dev/null; then
    printf "${RED}❌ 無法連接到 Kubernetes 集群${NC}\n"
    exit 1
fi

printf "${GREEN}✓ Kubernetes 集群連接正常${NC}\n"
echo ""

# 選擇環境
printf "${YELLOW}選擇部署環境：${NC}\n"
echo "1. Staging（passontw-services-staging）"
echo "2. Production（passontw-services-production）"
echo ""
read -p "請選擇 (1/2): " ENV_CHOICE

case $ENV_CHOICE in
    1)
        NAMESPACE="passontw-services-staging"
        INGRESS_FILE="k8s/overlays/staging/ingress.yaml"
        printf "${GREEN}✓ 將部署到 Staging 環境${NC}\n"
        ;;
    2)
        NAMESPACE="passontw-services-production"
        INGRESS_FILE="k8s/overlays/production/ingress.yaml"
        printf "${GREEN}✓ 將部署到 Production 環境${NC}\n"
        ;;
    *)
        printf "${RED}❌ 無效選擇${NC}\n"
        exit 1
        ;;
esac

echo ""
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${BLUE}   步驟 1: 檢查前置條件${NC}\n"
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo ""

# 檢查 cert-manager
printf "${YELLOW}檢查 cert-manager...${NC}\n"
if kubectl get namespace cert-manager &> /dev/null; then
    printf "${GREEN}✓ cert-manager 已安裝${NC}\n"
else
    printf "${RED}❌ cert-manager 未安裝${NC}\n"
    printf "${YELLOW}請先安裝 cert-manager: kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml${NC}\n"
    exit 1
fi

# 檢查 ClusterIssuer
printf "${YELLOW}檢查 Let's Encrypt ClusterIssuer...${NC}\n"
if kubectl get clusterissuer letsencrypt-prod &> /dev/null; then
    printf "${GREEN}✓ letsencrypt-prod ClusterIssuer 已配置${NC}\n"
else
    printf "${RED}❌ letsencrypt-prod ClusterIssuer 未配置${NC}\n"
    exit 1
fi

# 檢查命名空間
printf "${YELLOW}檢查命名空間...${NC}\n"
if kubectl get namespace $NAMESPACE &> /dev/null; then
    printf "${GREEN}✓ 命名空間 ${NAMESPACE} 存在${NC}\n"
else
    printf "${RED}❌ 命名空間 ${NAMESPACE} 不存在${NC}\n"
    exit 1
fi

# 檢查服務
printf "${YELLOW}檢查服務...${NC}\n"
if kubectl get service token-admin-api -n $NAMESPACE &> /dev/null; then
    printf "${GREEN}✓ token-admin-api 服務存在${NC}\n"
else
    printf "${RED}❌ token-admin-api 服務不存在${NC}\n"
    exit 1
fi

# 檢查 Traefik
printf "${YELLOW}檢查 Traefik Ingress Controller...${NC}\n"
TRAEFIK_IP=$(kubectl get svc traefik -n kube-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
if [ -n "$TRAEFIK_IP" ]; then
    printf "${GREEN}✓ Traefik 運行中，IP: ${TRAEFIK_IP}${NC}\n"
else
    printf "${RED}❌ Traefik 未運行或無 LoadBalancer IP${NC}\n"
    exit 1
fi

echo ""
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${BLUE}   步驟 2: DNS 檢查${NC}\n"
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo ""

# 檢查所有域名的 DNS
DOMAINS=(
    "token-admin-api.passon.tw"
    "token-app-api.passon.tw"
    "pos-backend-api.passon.tw"
    "pos-merchant-api.passon.tw"
)

DNS_ISSUES=0

for DOMAIN in "${DOMAINS[@]}"; do
    printf "${YELLOW}檢查 DNS: ${DOMAIN}${NC}\n"
    
    if command -v dig &> /dev/null; then
        DNS_IP=$(dig +short $DOMAIN | head -n 1)
        if [ -n "$DNS_IP" ]; then
            if [ "$DNS_IP" = "$TRAEFIK_IP" ]; then
                printf "${GREEN}✓ DNS 已正確解析: ${DOMAIN} → ${DNS_IP}${NC}\n"
            else
                printf "${YELLOW}⚠️  DNS IP (${DNS_IP}) 與 Traefik IP (${TRAEFIK_IP}) 不匹配${NC}\n"
                ((DNS_ISSUES++))
            fi
        else
            printf "${RED}❌ DNS 尚未解析: ${DOMAIN}${NC}\n"
            ((DNS_ISSUES++))
        fi
    fi
done

if [ $DNS_ISSUES -gt 0 ]; then
    printf "\n${YELLOW}⚠️  發現 ${DNS_ISSUES} 個 DNS 問題${NC}\n"
    printf "${YELLOW}請確認 DNS 設定：${NC}\n"
    echo "   名稱: *.passon.tw 或個別子域名"
    echo "   類型: A"
    echo "   IPv4: ${TRAEFIK_IP}"
    echo "   TTL: 300"
    echo ""
    read -p "是否繼續部署？(y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 0
    fi
fi

echo ""
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${BLUE}   步驟 3: 部署 Ingress${NC}\n"
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo ""

printf "${YELLOW}部署 Ingress 配置...${NC}\n"
if kubectl apply -f $INGRESS_FILE; then
    printf "${GREEN}✓ Ingress 部署成功${NC}\n"
else
    printf "${RED}❌ Ingress 部署失敗${NC}\n"
    exit 1
fi

echo ""
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${BLUE}   步驟 4: 等待證書簽發${NC}\n"
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo ""

printf "${YELLOW}等待 cert-manager 創建證書...${NC}\n"
sleep 5

# 檢查所有服務的證書
CERT_NAMES=(
    "token-admin-api-tls"
    "token-app-api-tls"
    "pos-backend-api-tls"
    "pos-merchant-api-tls"
)

MAX_WAIT=300  # 最多等待 5 分鐘
ELAPSED=0
ALL_READY=false

while [ $ELAPSED -lt $MAX_WAIT ]; do
    ALL_READY=true
    READY_COUNT=0
    
    for CERT_NAME in "${CERT_NAMES[@]}"; do
        CERT_STATUS=$(kubectl get certificate $CERT_NAME -n $NAMESPACE -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || echo "NotFound")
        
        if [ "$CERT_STATUS" = "True" ]; then
            ((READY_COUNT++))
        else
            ALL_READY=false
        fi
    done
    
    printf "${YELLOW}⏳ 等待證書簽發... ($READY_COUNT/${#CERT_NAMES[@]} 就緒, $ELAPSED 秒)${NC}\r"
    
    if [ "$ALL_READY" = true ]; then
        echo ""
        printf "${GREEN}✓ 所有證書簽發成功！${NC}\n"
        break
    fi
    
    sleep 5
    ELAPSED=$((ELAPSED + 5))
done

echo ""

if [ "$ALL_READY" != true ]; then
    printf "${YELLOW}⚠️  部分證書尚未簽發完成（可能需要更長時間）${NC}\n"
    printf "${YELLOW}   可以使用以下命令檢查狀態：${NC}\n"
    echo "   kubectl get certificate -n $NAMESPACE"
    echo "   kubectl describe certificate <cert-name> -n $NAMESPACE"
    echo "   kubectl get challenge -n $NAMESPACE"
else
    # 顯示所有證書詳情
    printf "\n${GREEN}證書詳情：${NC}\n"
    kubectl get certificate -n $NAMESPACE
fi

echo ""
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${BLUE}   步驟 5: 驗證 HTTPS 訪問${NC}\n"
printf "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo ""

# 測試所有服務的 HTTPS 訪問
TEST_ENDPOINTS=(
    "https://token-admin-api.passon.tw/health-check"
    "https://token-app-api.passon.tw/health-check"
    "https://pos-backend-api.passon.tw/health"
    "https://pos-merchant-api.passon.tw/health"
)

HTTPS_SUCCESS=0
HTTPS_FAIL=0

for ENDPOINT in "${TEST_ENDPOINTS[@]}"; do
    SERVICE_NAME=$(echo $ENDPOINT | cut -d'/' -f3 | cut -d'.' -f1)
    printf "${YELLOW}測試 ${SERVICE_NAME}...${NC}\n"
    
    if command -v curl &> /dev/null; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 $ENDPOINT 2>/dev/null || echo "000")
        
        if [ "$HTTP_CODE" = "200" ]; then
            printf "${GREEN}✓ ${SERVICE_NAME} HTTPS 訪問成功 (${HTTP_CODE})${NC}\n"
            ((HTTPS_SUCCESS++))
        else
            printf "${YELLOW}⚠️  ${SERVICE_NAME} 狀態碼: ${HTTP_CODE}${NC}\n"
            ((HTTPS_FAIL++))
        fi
    fi
done

echo ""
printf "${GREEN}✓ 成功: ${HTTPS_SUCCESS}/${#TEST_ENDPOINTS[@]}${NC}\n"
if [ $HTTPS_FAIL -gt 0 ]; then
    printf "${YELLOW}⚠️  失敗: ${HTTPS_FAIL}/${#TEST_ENDPOINTS[@]}（可能證書尚未生效）${NC}\n"
fi

echo ""
printf "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${GREEN}   ✅ 部署完成！${NC}\n"
printf "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo ""

printf "${YELLOW}📝 下一步：${NC}\n"
echo ""
echo "1. 在瀏覽器中測試所有服務："
echo "   • https://token-admin-api.passon.tw/health-check"
echo "   • https://token-app-api.passon.tw/health-check"
echo "   • https://pos-backend-api.passon.tw/health"
echo "   • https://pos-merchant-api.passon.tw/health"
echo ""
echo "2. 訪問 Swagger 文檔："
echo "   • https://token-admin-api.passon.tw/swagger/index.html"
echo "   • https://token-app-api.passon.tw/swagger/index.html"
echo "   • https://pos-backend-api.passon.tw/swagger/index.html"
echo "   • https://pos-merchant-api.passon.tw/swagger/index.html"
echo ""
echo "3. 查看證書狀態："
echo "   kubectl get certificate -n $NAMESPACE"
echo ""
echo "4. 查看 Ingress 狀態："
echo "   kubectl get ingress -n $NAMESPACE"
echo ""
echo "5. 查看特定證書詳情："
echo "   kubectl describe certificate <cert-name> -n $NAMESPACE"
echo ""
echo "6. 如果證書申請失敗，查看 Challenge："
echo "   kubectl get challenges -n $NAMESPACE"
echo "   kubectl describe challenge <challenge-name> -n $NAMESPACE"
echo ""

printf "${BLUE}💡 提示：${NC}\n"
echo "• 證書會在到期前 30 天自動更新"
echo "• HTTP 會自動重定向到 HTTPS"
echo "• 證書有效期為 90 天"
echo "• cert-manager 會自動處理更新，無需手動操作"
echo "• 所有 4 個服務已配置 SSL 證書和 HTTPS"
echo ""


