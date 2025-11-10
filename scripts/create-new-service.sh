#!/bin/bash
# create-new-service.sh - 創建新服務的輔助腳本
# 用法: ./scripts/create-new-service.sh {服務名稱}
# 範例: ./scripts/create-new-service.sh payment

set -e  # 遇到錯誤立即退出

SERVICE_NAME=$1

if [ -z "$SERVICE_NAME" ]; then
  echo "❌ 錯誤：未指定服務名稱"
  echo ""
  echo "使用方法: ./scripts/create-new-service.sh {服務名稱}"
  echo "範例: ./scripts/create-new-service.sh payment"
  echo ""
  echo "將會創建: token-${SERVICE_NAME}-api"
  exit 1
fi

echo "🚀 創建新服務: token-${SERVICE_NAME}-api"
echo "================================================"
echo ""

# 1. 創建目錄結構
echo "📁 創建目錄結構..."
mkdir -p cmd/token-${SERVICE_NAME}-api/internal/{handlers,interfaces,middlewares,services,server,initializers}
mkdir -p deploy/token-${SERVICE_NAME}-api
echo "   ✓ cmd/token-${SERVICE_NAME}-api/"
echo "   ✓ deploy/token-${SERVICE_NAME}-api/"

# 2. 創建 main.go
echo ""
echo "📝 創建 main.go..."
cat > cmd/token-${SERVICE_NAME}-api/main.go << 'EOF'
package main

import "log"

func main() {
    log.Println("Token service starting...")
    // TODO: 實作服務邏輯
}
EOF
echo "   ✓ cmd/token-${SERVICE_NAME}-api/main.go"

# 3. 複製 Dockerfile
echo ""
echo "📄 創建 Dockerfile..."
if [ ! -f "deploy/Dockerfile.template" ]; then
  echo "   ❌ 錯誤：找不到 deploy/Dockerfile.template"
  exit 1
fi

cp deploy/Dockerfile.template deploy/token-${SERVICE_NAME}-api/Dockerfile

# macOS 和 Linux 的 sed 語法不同
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/{SERVICE_NAME}/${SERVICE_NAME}/g" deploy/token-${SERVICE_NAME}-api/Dockerfile
else
  sed -i "s/{SERVICE_NAME}/${SERVICE_NAME}/g" deploy/token-${SERVICE_NAME}-api/Dockerfile
fi
echo "   ✓ deploy/token-${SERVICE_NAME}-api/Dockerfile"

# 3.5 更新現有服務的 Dockerfile（添加 --exclude）
echo ""
echo "🔧 更新現有服務的 Dockerfile（添加 --exclude）..."
updated_count=0
for dockerfile in deploy/token-*/Dockerfile; do
  if [[ "$dockerfile" != "deploy/token-${SERVICE_NAME}-api/Dockerfile" ]]; then
    # 檢查是否已經有這個 exclude
    if ! grep -q "exclude cmd/token-${SERVICE_NAME}-api" "$dockerfile"; then
      # 在 --parseDependency 前添加新的 --exclude 行
      if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "/--parseDependency/i\\
      --exclude cmd/token-${SERVICE_NAME}-api \\\\
" "$dockerfile"
      else
        sed -i "/--parseDependency/i\\      --exclude cmd/token-${SERVICE_NAME}-api \\\\" "$dockerfile"
      fi
      echo "   ✓ 更新 $dockerfile"
      ((updated_count++))
    else
      echo "   - $dockerfile (已包含排除規則)"
    fi
  fi
done
echo "   更新了 $updated_count 個 Dockerfile"

# 4. 複製 workflow
echo ""
echo "⚙️  創建 GitHub Actions workflow..."
if [ ! -f ".github/workflows/build-token-admin-api.yml" ]; then
  echo "   ❌ 錯誤：找不到 .github/workflows/build-token-admin-api.yml"
  exit 1
fi

cp .github/workflows/build-token-admin-api.yml \
   .github/workflows/build-token-${SERVICE_NAME}-api.yml

# 替換服務名稱
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/admin-api/${SERVICE_NAME}-api/g" .github/workflows/build-token-${SERVICE_NAME}-api.yml
  sed -i '' "s/Admin API/${SERVICE_NAME^} API/g" .github/workflows/build-token-${SERVICE_NAME}-api.yml
else
  sed -i "s/admin-api/${SERVICE_NAME}-api/g" .github/workflows/build-token-${SERVICE_NAME}-api.yml
  sed -i "s/Admin API/${SERVICE_NAME^} API/g" .github/workflows/build-token-${SERVICE_NAME}-api.yml
fi
echo "   ✓ .github/workflows/build-token-${SERVICE_NAME}-api.yml"

echo ""
echo "================================================"
echo "✅ 服務創建完成！"
echo ""
echo "📝 已完成的操作："
echo "   ✓ 創建服務目錄結構"
echo "   ✓ 創建 Dockerfile"
echo "   ✓ 更新 $updated_count 個現有服務的 Dockerfile（添加 --exclude）"
echo "   ✓ 創建 GitHub Actions workflow"
echo ""
echo "🔜 接下來的步驟："
echo ""
echo "1. 實作服務邏輯"
echo "   cd cmd/token-${SERVICE_NAME}-api/"
echo ""
echo "2. 調整 Dockerfile 中的埠號（避免衝突）"
echo "   編輯: deploy/token-${SERVICE_NAME}-api/Dockerfile"
echo "   修改: EXPOSE 8082  # 使用不同的埠號"
echo ""
echo "3. 本地測試建置"
echo "   docker build -t token-${SERVICE_NAME}-api:test -f deploy/token-${SERVICE_NAME}-api/Dockerfile ."
echo ""
echo "4. 檢查所有 Dockerfile 的 --exclude 配置"
echo "   grep -n \"--exclude\" deploy/*/Dockerfile"
echo ""
echo "5. 提交並推送"
echo "   git add ."
echo "   git status"
echo "   git commit -m \"feat: 添加 ${SERVICE_NAME} API 服務並更新 Swagger 隔離配置\""
echo "   git push origin develop"
echo ""
echo "================================================"

