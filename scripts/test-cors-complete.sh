#!/bin/bash

# 完整測試 CORS 配置

echo "🔍 完整測試 CORS 配置..."
echo ""

# 測試 OPTIONS 預檢請求
echo "📋 測試 1: OPTIONS 預檢請求"
echo "----------------------------------------"
curl -X OPTIONS \
  'https://token-admin-api.passon.tw/users' \
  -H 'Origin: http://localhost:3000' \
  -H 'Access-Control-Request-Method: GET' \
  -H 'Access-Control-Request-Headers: authorization' \
  -v 2>&1 | grep -E "(< HTTP|< Access-Control|OPTIONS)"

echo ""
echo ""

# 測試實際 GET 請求（需要有效的 token）
echo "📋 測試 2: GET 請求（需要有效的 token）"
echo "----------------------------------------"
echo "請提供您的 Bearer token（或按 Enter 跳過）:"
read -r TOKEN

if [ -n "$TOKEN" ]; then
  echo ""
  echo "發送 GET 請求..."
  curl -X GET \
    'https://token-admin-api.passon.tw/users' \
    -H 'Origin: http://localhost:3000' \
    -H 'Authorization: Bearer '"$TOKEN" \
    -H 'Content-Type: application/json' \
    -v 2>&1 | grep -E "(< HTTP|< Access-Control|GET|users)"
else
  echo "跳過 GET 請求測試"
fi

echo ""
echo ""
echo "✅ 測試完成"
echo ""
echo "如果 OPTIONS 請求成功（返回 204），CORS 配置應該正常"
echo "請在瀏覽器中測試實際的 API 請求"

