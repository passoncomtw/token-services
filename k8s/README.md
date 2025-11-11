# Kubernetes 部署文檔

## 目錄結構

```
k8s/
├── README.md                          # 本文檔
├── namespace.yaml                     # 命名空間
├── secrets/                           # 敏感配置
│   ├── database-secret.yaml          # 資料庫憑證
│   └── jwt-secret.yaml               # JWT 密鑰
├── configmaps/                        # 配置
│   ├── admin-api-config.yaml         # Admin API 配置
│   └── app-api-config.yaml           # App API 配置
├── deployments/                       # 部署
│   ├── token-admin-api.yaml          # Admin API 部署
│   └── token-app-api.yaml            # App API 部署
├── services/                          # 服務
│   ├── token-admin-api-service.yaml  # Admin API 服務
│   └── token-app-api-service.yaml    # App API 服務
├── ingress/                           # 入口
│   └── ingress.yaml                  # 統一入口配置
└── scripts/                           # 部署腳本
    ├── deploy-all.sh                 # 全部署
    ├── deploy-admin.sh               # 部署 Admin API
    ├── deploy-app.sh                 # 部署 App API
    └── rollback.sh                   # 回滾
```

## 快速開始

### 1. 首次部署

```bash
# 1. 設定環境變數（根據實際情況修改）
export DB_HOST="your-postgres-host"
export DB_USER="your-db-user"
export DB_PASSWORD="your-db-password"
export DB_NAME="token_services"
export JWT_SECRET="your-jwt-secret"
export GHCR_USERNAME="passontw"
export GHCR_TOKEN="your-github-token"

# 2. 建立 secrets（首次需要）
./k8s/scripts/create-secrets.sh

# 3. 部署所有服務
./k8s/scripts/deploy-all.sh
```

### 2. 更新部署

```bash
# 更新 Admin API
./k8s/scripts/deploy-admin.sh

# 更新 App API
./k8s/scripts/deploy-app.sh
```

### 3. 查看狀態

```bash
# 查看所有資源
kubectl get all -n passontw-services

# 查看 Pod 日誌
kubectl logs -f -n passontw-services deployment/token-admin-api
kubectl logs -f -n passontw-services deployment/token-app-api

# 查看 Pod 狀態
kubectl describe pod -n passontw-services <pod-name>
```

### 4. 回滾

```bash
# 查看歷史版本
kubectl rollout history deployment/token-admin-api -n passontw-services

# 回滾到上一個版本
kubectl rollout undo deployment/token-admin-api -n passontw-services

# 回滾到特定版本
kubectl rollout undo deployment/token-admin-api -n passontw-services --to-revision=2
```

## 部署策略

### 滾動更新（推薦）
- 零停機時間
- 逐步替換舊 Pod
- 自動健康檢查

### 藍綠部署
- 兩個完整環境
- 快速切換
- 易於回滾

### 金絲雀部署
- 部分流量測試
- 逐步增加新版本
- 風險最小

## 環境配置

### 開發環境
- Namespace: `passontw-services-dev`
- 副本數: 1
- 資源限制: 較小

### 生產環境
- Namespace: `passontw-services`
- 副本數: 2+
- 資源限制: 根據負載調整
- 高可用配置

## 監控與日誌

### 健康檢查
- Liveness Probe: `/health-check`
- Readiness Probe: `/health-check`

### 日誌收集
```bash
# 查看實時日誌
kubectl logs -f -n passontw-services deployment/token-admin-api

# 查看最近日誌
kubectl logs --tail=100 -n passontw-services deployment/token-admin-api
```

## 故障排除

### Pod 無法啟動
```bash
# 1. 查看 Pod 狀態
kubectl describe pod -n passontw-services <pod-name>

# 2. 查看 Pod 日誌
kubectl logs -n passontw-services <pod-name>

# 3. 檢查資源
kubectl top pod -n passontw-services
```

### 服務無法訪問
```bash
# 1. 檢查 Service
kubectl get svc -n passontw-services

# 2. 檢查 Endpoints
kubectl get endpoints -n passontw-services

# 3. 測試連接
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n passontw-services -- curl http://token-admin-api:8080/health-check
```

### 資料庫連接失敗
```bash
# 1. 檢查 Secret
kubectl get secret -n passontw-services database-secret -o yaml

# 2. 檢查環境變數
kubectl exec -it -n passontw-services <pod-name> -- env | grep DB_

# 3. 測試資料庫連接
kubectl exec -it -n passontw-services <pod-name> -- sh
```

## 安全最佳實踐

1. **使用 Secrets 管理敏感資訊**
   - 不要將密碼寫在配置文件中
   - 使用 base64 編碼

2. **限制資源使用**
   - 設定 CPU 和記憶體限制
   - 避免資源耗盡

3. **使用 NetworkPolicy**
   - 限制 Pod 間通信
   - 只允許必要的連接

4. **定期更新映像**
   - 使用最新的安全補丁
   - 定期掃描漏洞

## 相關連結

- [Kubernetes 官方文檔](https://kubernetes.io/docs/)
- [k3s 文檔](https://docs.k3s.io/)
- [kubectl 命令參考](https://kubernetes.io/docs/reference/kubectl/)

