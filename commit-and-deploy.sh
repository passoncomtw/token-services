#!/bin/bash

echo "🚀 開始提交並部署修復..."

cd /Users/tomaslin/Projects/passontw-backend-services

# 添加所有修改
echo "📦 添加修改的文件..."
git add pkg/config/config.go
git add cmd/token-app-api/main.go
git add cmd/token-app-api/internal/server/server.go
git add cmd/token-app-api/internal/server/router.go
git add cmd/pos-backend-api/internal/config/config.go
git add cmd/pos-backend-api/internal/server/http.go
git add cmd/pos-merchant-api/internal/modules/config.go
git add cmd/pos-merchant-api/internal/server/server.go
git add cmd/token-admin-api/STARTUP_GUIDE.md
git add cmd/token-admin-api/README.md
git add k8s/services/*/configmap.yaml
git add k8s/README.md
git add .github/workflows/cicd-token-app-api.yaml
git add .github/workflows/cicd-pos-backend-api.yaml
git add .github/workflows/cicd-pos-merchant-api.yaml
git add .github/workflows/cicd-token-admin-api.yaml
git add documents/README.md

echo ""
echo "📋 即將提交的文件："
git status --short

# 提交
echo ""
echo "💾 提交修改..."
git commit -m "fix: integrate pkg/swagger, remove HTTP_HOST, and fix deployment issues

🔧 Token App API - Swagger 整合
- 使用 pkg/swagger 模組統一管理 Swagger
- 修復 GetSwaggerHost() 移除協議前綴和尾部斜線
- 動態設置 Swagger Host, BasePath 和 Schemes

🐛 移除所有服務的 HTTP_HOST 配置
- 從 pkg/config 和所有服務配置中移除 HTTPHost/HTTP.Host
- HTTP 服務器始終綁定到 :port（所有接口）
- Swagger Host 使用 SWAGGER_BASE_DOMAIN 環境變數控制
- Swagger Host 預設值改為 0.0.0.0:port（綁定所有接口）
- 更新所有 ConfigMaps 移除 HTTP_HOST
- 更新文檔移除 HTTP_HOST 引用
- 修復 pos-backend-api 在 Kubernetes 中啟動失敗的問題

🚀 GitHub Actions - 部署優化
- 添加 kubectl rollout restart 強制重啟
- 解決固定 Docker tag (develop) 不更新的問題
- 添加手動部署功能
- 統一所有服務使用 develop tag

📚 文檔更新
- 整合所有 .md 文件到 documents/README.md
- 更新 k8s/README.md 移除 HTTP_HOST 引用
- 更新服務文檔移除 HTTP_HOST 配置示例"

# 推送
echo ""
echo "🌐 推送到 develop 分支..."
git push origin develop

echo ""
echo "✅ 代碼已推送！"
echo ""
echo "⏳ GitHub Actions 將自動開始構建和部署..."
echo "📊 查看進度："
echo "   - Token App API: https://github.com/PassonTW/passontw-backend-services/actions/workflows/cicd-token-app-api.yaml"
echo "   - POS Backend API: https://github.com/PassonTW/passontw-backend-services/actions/workflows/cicd-pos-backend-api.yaml"
echo ""
echo "預計時間："
echo "  - 構建 Docker 鏡像：3-5 分鐘"
echo "  - 部署到 Kubernetes：2-3 分鐘"
echo "  - 總計：約 5-8 分鐘"
echo ""
echo "🔗 部署完成後驗證："
echo "   - Token App Swagger: https://token-app-api.passon.tw/swagger/index.html"
echo "   - POS Backend Health: https://pos-backend-api.passon.tw/health"
echo ""

