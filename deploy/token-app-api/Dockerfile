# ===================================
# 第一階段：建置 Go 應用程式
# ===================================
FROM golang:1.23-alpine AS builder

ARG TARGETARCH

WORKDIR /app

# 設定環境變數以優化編譯
ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=${TARGETARCH} \
    GO111MODULE=on \
    GOPROXY=https://goproxy.cn,https://proxy.golang.org,direct \
    GOSUMDB=sum.golang.org

# 安裝建置工具（合併減少層數）
RUN apk add --no-cache git ca-certificates tzdata

# 複製依賴檔案（優先快取）
COPY go.mod go.sum ./

# 下載依賴（使用 BuildKit cache mount）
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download && go mod verify

# 複製原始碼
COPY . .

# 安裝 swag 並生成文檔（只掃描當前服務和共用程式碼）
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go install github.com/swaggo/swag/cmd/swag@latest && \
    swag init -g cmd/token-app-api/main.go \
      -o cmd/token-app-api/internal/docs \
      --dir ./ \
      --exclude cmd/token-admin-api \
      --parseDependency --parseInternal

# 編譯應用程式（使用更積極的優化參數）
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -v -trimpath \
    -ldflags="-w -s -X main.version=${VERSION:-dev}" \
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

