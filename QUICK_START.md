# 🚀 快速開始指南

## 📋 前置條件檢查清單

- [ ] ✅ k3s 集群已設置並運行
- [ ] ✅ kubectl 已安裝並配置（本地和 mac-mini-build）
- [ ] ✅ PostgreSQL 資料庫已設置
- [ ] ✅ GitHub Personal Access Token 已建立
- [ ] ✅ GitHub Secrets 已配置

---

## 🎯 三步驟部署

### 步驟 1: 配置 Secrets（僅需執行一次）

```bash
cd /Users/tomaslin/Projects/golang-passontw-services/k8s

# 設定環境變數
export DB_HOST="your-postgres-host"
export DB_PORT="5432"
export DB_USER="your-db-user"
export DB_PASSWORD="your-db-password"
export DB_NAME="token_services"
export JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars-long"
export GHCR_USERNAME="passontw"
export GHCR_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 建立所有 Secrets
./scripts/create-secrets.sh
```

### 步驟 2: 首次部署

```bash
# 部署所有服務
./scripts/deploy-all.sh

# 等待 Pods 就緒
kubectl get pods -n passontw-services -w
```

### 步驟 3: 驗證部署

```bash
# 查看所有資源
kubectl get all -n passontw-services

# 查看服務日誌
kubectl logs -f -n passontw-services deployment/token-admin-api
kubectl logs -f -n passontw-services deployment/token-app-api

# 測試健康檢查
kubectl run -it --rm curl-test \
  --image=curlimages/curl \
  --restart=Never \
  -n passontw-services \
  -- curl http://token-admin-api:8080/health-check
```

---

## 🔄 日常操作

### 更新服務

**方式 1: 自動部署（推薦）**
```bash
# 推送程式碼到 GitHub
git add .
git commit -m "feat: 新功能"
git push origin develop

# GitHub Actions 會自動：
# 1. 建置 Docker 映像
# 2. 推送到 GHCR
# 3. 部署到 Kubernetes
```

**方式 2: 手動部署**
```bash
# 更新 Admin API
./k8s/scripts/deploy-admin.sh

# 更新 App API
./k8s/scripts/deploy-app.sh
```

### 查看狀態

```bash
# 查看所有資源
kubectl get all -n passontw-services

# 查看 Pods
kubectl get pods -n passontw-services

# 查看日誌
kubectl logs -f -n passontw-services deployment/token-admin-api
```

### 擴展服務

```bash
# 擴展到 3 個副本
kubectl scale deployment/token-admin-api --replicas=3 -n passontw-services
```

### 回滾部署

```bash
# 使用腳本（推薦）
./k8s/scripts/rollback.sh

# 或手動回滾
kubectl rollout undo deployment/token-admin-api -n passontw-services
```

---

## 📂 重要文件位置

```
├── DEPLOYMENT_ARCHITECTURE.md     # 完整架構說明
├── k8s/
│   ├── README.md                  # Kubernetes 配置概覽
│   ├── DEPLOYMENT_GUIDE.md        # 詳細部署指南
│   ├── scripts/
│   │   ├── create-secrets.sh      # 建立 Secrets
│   │   ├── deploy-all.sh          # 部署所有服務
│   │   ├── deploy-admin.sh        # 部署 Admin API
│   │   ├── deploy-app.sh          # 部署 App API
│   │   └── rollback.sh            # 回滾腳本
│   └── ...                        # 其他 Kubernetes 配置
└── .github/workflows/
    ├── build-token-admin-api.yml  # 建置映像
    └── deploy-to-k8s.yaml         # 自動部署
```

---

## 🔧 常用命令

### 查看資源
```bash
# 所有資源
kubectl get all -n passontw-services

# Pods
kubectl get pods -n passontw-services

# Deployments
kubectl get deployments -n passontw-services

# Services
kubectl get services -n passontw-services

# Ingress
kubectl get ingress -n passontw-services
```

### 日誌
```bash
# 實時日誌
kubectl logs -f -n passontw-services deployment/token-admin-api

# 最近 100 行
kubectl logs --tail=100 -n passontw-services deployment/token-admin-api

# 所有容器
kubectl logs -n passontw-services <pod-name> --all-containers=true
```

### 除錯
```bash
# Pod 詳情
kubectl describe pod -n passontw-services <pod-name>

# 進入 Pod
kubectl exec -it -n passontw-services <pod-name> -- sh

# 查看事件
kubectl get events -n passontw-services --sort-by='.lastTimestamp'
```

### 更新
```bash
# 應用配置
kubectl apply -f k8s/deployments/token-admin-api.yaml

# 重啟部署
kubectl rollout restart deployment/token-admin-api -n passontw-services

# 更新映像
kubectl set image deployment/token-admin-api \
  token-admin-api=ghcr.io/passontw/token-admin-api:new-tag \
  -n passontw-services
```

---

## 🆘 問題排除

### Pod 無法啟動？

```bash
# 1. 查看 Pod 狀態
kubectl describe pod -n passontw-services <pod-name>

# 2. 查看日誌
kubectl logs -n passontw-services <pod-name>

# 3. 檢查事件
kubectl get events -n passontw-services
```

### 映像無法拉取？

```bash
# 檢查 Secret
kubectl get secret ghcr-pull-secret -n passontw-services

# 重新建立 Secret
export GHCR_USERNAME="passontw"
export GHCR_TOKEN="ghp_xxxx"
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=$GHCR_USERNAME \
  --docker-password=$GHCR_TOKEN \
  --namespace=passontw-services \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 資料庫連接失敗？

```bash
# 檢查 Secret
kubectl get secret database-secret -n passontw-services -o yaml

# 測試資料庫連接
kubectl run -it --rm psql-test \
  --image=postgres:15-alpine \
  --restart=Never \
  -n passontw-services \
  -- psql -h your-db-host -U your-user -d token_services
```

### 服務無法訪問？

```bash
# 檢查 Service 和 Endpoints
kubectl get svc -n passontw-services
kubectl get endpoints -n passontw-services

# 測試內部連接
kubectl run -it --rm curl-test \
  --image=curlimages/curl \
  --restart=Never \
  -n passontw-services \
  -- curl -v http://token-admin-api:8080/health-check
```

---

## 📚 詳細文檔

- **完整部署指南**: [k8s/DEPLOYMENT_GUIDE.md](k8s/DEPLOYMENT_GUIDE.md)
- **架構說明**: [DEPLOYMENT_ARCHITECTURE.md](DEPLOYMENT_ARCHITECTURE.md)
- **Kubernetes 配置**: [k8s/README.md](k8s/README.md)

---

## ✅ 檢查清單

### 首次部署
- [ ] 環境變數已設定
- [ ] Secrets 已建立
- [ ] 服務已部署
- [ ] Pods 運行正常
- [ ] 健康檢查通過
- [ ] 日誌正常

### 日常維護
- [ ] 監控 Pod 狀態
- [ ] 檢查日誌
- [ ] 監控資源使用
- [ ] 定期更新映像
- [ ] 定期備份資料

### 故障處理
- [ ] 查看 Pod 狀態
- [ ] 檢查日誌
- [ ] 查看事件
- [ ] 測試連接
- [ ] 必要時回滾

---

**問題？** 查看 [DEPLOYMENT_GUIDE.md](k8s/DEPLOYMENT_GUIDE.md) 獲取詳細說明

**最後更新**: 2025-11-09

