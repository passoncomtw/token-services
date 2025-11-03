#!/bin/bash

cd /Users/tomaslin/Projects/golang-token-services

echo "=== 開始測試 token-app-api ==="
echo ""

echo "1. 檢查 Go 版本..."
go version
echo ""

echo "2. 檢查目錄結構..."
ls -la cmd/token-app-api/
echo ""

echo "3. 嘗試編譯..."
cd cmd/token-app-api
go build -v -o /tmp/token-app-api main.go 2>&1
EXIT_CODE=$?
echo "編譯退出碼: $EXIT_CODE"
echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo "4. 編譯成功，嘗試運行..."
    /tmp/token-app-api &
    PID=$!
    echo "進程 PID: $PID"
    sleep 2
    
    if ps -p $PID > /dev/null; then
        echo "✅ 程序正在運行"
        kill $PID
    else
        echo "❌ 程序已退出"
    fi
else
    echo "❌ 編譯失敗"
fi

echo ""
echo "=== 測試完成 ==="

