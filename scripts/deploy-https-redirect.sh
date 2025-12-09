#!/bin/bash

# 部署 HTTPS 重定向配置

set -e

echo "🚀 部署 HTTPS 重定向配置..."
echo ""

cd "$(dirname "$0")/../k8s/overlays/staging" || exit 1

echo "📦 應用 Ingress 配置（啟用 HTTPS 重定向）..."
kubectl apply -f ingress.yaml

echo ""
echo "✅ 部署完成！"
echo ""
echo "🔍 驗證配置："
kubectl describe ingress passontw-backend-apis-ingress-staging -n passontw-services-staging | grep -A 3 "middlewares"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 重要提醒："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ HTTPS 重定向已啟用"
echo "✅ 所有 HTTP 請求會自動重定向到 HTTPS"
echo ""
echo "⚠️  前端應該使用 HTTPS URL："
echo "   ✅ https://token-admin-api.passon.tw"
echo "   ❌ http://token-admin-api.passon.tw（會被重定向）"
echo ""
echo "💡 如果前端使用 HTTP，OPTIONS 預檢請求可能失敗"
echo "   因為瀏覽器不會跟隨 OPTIONS 請求的重定向"
echo "   建議前端直接使用 HTTPS"
echo ""

