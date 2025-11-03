# ===================================
# 第一階段：建置 Go 應用程式
# ===================================
FROM golang:1.24.1-alpine AS builder

# 設定平台參數（自動檢測）
ARG TARGETARCH

# 設定工作目錄
WORKDIR /app

# 設定環境變數
ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=${TARGETARCH} \
    GO111MODULE=on

# 安裝必要的建置工具
RUN apk add --no-cache \
    bash \
    curl \
    git \
    make

# 複製依賴檔案並下載模組（利用 Docker 快取）
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# 複製所有原始碼
COPY . .

# 確保 Go 模組路徑正確
RUN go env GOMOD && go list -m

# 設定正確的 Go 工具路徑
ENV PATH="/go/bin:$PATH"

# 整理模組依賴
RUN go mod tidy

# 安裝 swag 工具並生成 swagger 文檔
RUN GOOS=linux GOARCH=${TARGETARCH} go install github.com/swaggo/swag/cmd/swag@latest && \
    swag init -g cmd/token-app-api/main.go \
      -o cmd/token-app-api/internal/docs \
      --parseDependency --parseInternal \
      --exclude cmd/token-admin-api,internal/token-admin-api

# 建置 Go 應用程式
RUN go build -installsuffix cgo \
    -ldflags='-w -s -extldflags "-static"' \
    -o token-app-api \
    ./cmd/token-app-api

# ===================================
# 第二階段：建立最小化執行映像
# ===================================
FROM scratch

# 設定工作目錄
WORKDIR /app

# 從 builder 階段複製建置好的執行檔
COPY --from=builder /app/token-app-api ./

# 複製 SSL 憑證（用於 HTTPS 連線）
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# 設定執行埠
EXPOSE 8081

# 設定啟動指令
ENTRYPOINT ["./token-app-api"]

