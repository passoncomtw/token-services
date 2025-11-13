# Kubernetes 部署指南

> 完整的 Kubernetes 部署、管理和故障排除文檔

## 📋 目錄

- [目錄結構](#目錄結構)
- [快速開始](#快速開始)
- [命名空間管理](#命名空間管理)
- [首次部署](#首次部署)
- [日常操作](#日常操作)
- [CI/CD 自動部署](#cicd-自動部署)
- [監控與維護](#監控與維護)
- [故障排除](#故障排除)
- [最佳實踐](#最佳實踐)

---

## 目錄結構

```
k8s/
├── README.md                          # 本文檔
├── namespace.yaml                     # 命名空間定義
├── configmaps/                        # 應用配置
│   ├── admin-api-config.yaml         # Admin API 配置
│   └── app-api-config.yaml           # App API 配置
├── secrets/                           # 敏感資訊（範例）
│   ├── database-secret.yaml.example  # 資料庫憑證範例
│   ├── jwt-secret.yaml.example       # JWT 密鑰範例
│   └── ghcr-pull-secret.yaml.example # GHCR 認證範例
├── deployments/                       # 部署配置
│   ├── token-admin-api.yaml          # Admin API 部署
│   └── token-app-api.yaml            # App API 部署
├── services/                          # 服務配置
│   ├── token-admin-api-service.yaml  # Admin API 服務
│   └── token-app-api-service.yaml    # App API 服務
├── ingress/                           # 入口配置
│   └── ingress.yaml                  # 統一入口
└── scripts/                           # 部署腳本
    ├── create-secrets.sh             # 創建 Secrets
    ├── deploy-all.sh                 # 部署所有服務
    ├── deploy-admin.sh               # 部署 Admin API
    ├── deploy-app.sh                 # 部署 App API
    └── rollback.sh                   # 回滾
```

---

## 快速開始

### 環境準備

**前置條件：**
- ✅ kubectl 已安裝並配置
- ✅ 可連接到 Kubernetes 集群
- ✅ PostgreSQL 資料庫已設置
- ✅ Docker 映像已推送到 GHCR

**驗證環境：**
```bash
kubectl cluster-info
kubectl get nodes
```

### 首次部署

```bash
# 1. 創建 Secrets
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_TOKEN \
  -n passontw-services-staging

kubectl create secret generic database-secret \
  --from-literal=DB_HOST=your-host \
  --from-literal=DB_PORT=5432 \
  --from-literal=DB_USER=your-user \
  --from-literal=DB_PASSWORD=your-password \
  --from-literal=DB_NAME=token_services \
  --from-literal=DB_SSLMODE=disable \
  -n passontw-services-staging

kubectl create secret generic jwt-secret \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  -n passontw-services-staging

# 2. 使用 GitHub Actions 自動部署
# 推送代碼到 develop 分支會自動部署到 staging
git push origin develop

# 或使用腳本部署
./k8s/scripts/deploy-all.sh
```

### 查看狀態

```bash
# 查看所有資源
kubectl get all -n passontw-services-staging

# 查看 Pods
kubectl get pods -n passontw-services-staging -w

# 查看日誌
kubectl logs -f deployment/token-admin-api -n passontw-services-staging
```

---

## 命名空間管理

### 設計原則

本專案已移除硬編碼命名空間，支持多環境部署，遵循以下原則：

- **DRY 原則** - 單一配置文件適用所有環境
- **開放封閉原則** - 易於擴展新環境，無需修改配置
- **單一職責原則** - 配置定義規格，部署腳本指定環境

### 命名空間架構

| 環境 | 命名空間 | 用途 |
|------|----------|------|
| Staging | `passontw-services-staging` | 測試環境 |
| Production | `passontw-services-production` | 生產環境 |

**命名規則：** `{project-name}-{environment}`

### 部署到不同環境

```bash
# 方式 1：使用 GitHub Actions（推薦）
git push origin develop    # → staging
git push origin main        # → production

# 方式 2：手動部署
NAMESPACE="passontw-services-staging"

kubectl apply -f k8s/configmaps/ -n $NAMESPACE
kubectl apply -f k8s/deployments/ -n $NAMESPACE
kubectl apply -f k8s/services/ -n $NAMESPACE

# 方式 3：使用腳本
./k8s/scripts/deploy-all.sh
```

### Secrets 管理

**為每個環境創建 Secrets：**

```bash
# Staging 環境
kubectl create secret generic database-secret \
  --from-literal=DB_HOST=staging-db \
  --from-literal=DB_PORT=5432 \
  --from-literal=DB_USER=staging_user \
  --from-literal=DB_PASSWORD=staging_pass \
  --from-literal=DB_NAME=token_services \
  --from-literal=DB_SSLMODE=disable \
  -n passontw-services-staging

# Production 環境（使用不同的憑證）
kubectl create secret generic database-secret \
  --from-literal=DB_HOST=prod-db \
  --from-literal=DB_PORT=5432 \
  --from-literal=DB_USER=prod_user \
  --from-literal=DB_PASSWORD=prod_pass \
  --from-literal=DB_NAME=token_services \
  --from-literal=DB_SSLMODE=require \
  -n passontw-services-production
```

### 常用命令

```bash
# 查看所有命名空間
kubectl get namespaces

# 查看特定命名空間的資源
kubectl get all -n passontw-services-staging

# 設置預設命名空間
kubectl config set-context --current --namespace=passontw-services-staging

# 切換環境
kubectl get pods -n passontw-services-production
```

---

## 首次部署

### 步驟 1：準備 Secrets

**方式 1：使用範例文件**

```bash
# 複製範例文件
cp k8s/secrets/database-secret.yaml.example k8s/secrets/database-secret.yaml
cp k8s/secrets/jwt-secret.yaml.example k8s/secrets/jwt-secret.yaml

# 編輯文件填入實際值
vim k8s/secrets/database-secret.yaml
vim k8s/secrets/jwt-secret.yaml

# 應用到命名空間
kubectl apply -f k8s/secrets/ -n passontw-services-staging
```

**方式 2：使用命令行直接創建**

```bash
kubectl create secret generic database-secret \
  --from-literal=DB_HOST=your-host \
  --from-literal=DB_PORT=5432 \
  --from-literal=DB_USER=your-user \
  --from-literal=DB_PASSWORD=your-password \
  --from-literal=DB_NAME=token_services \
  --from-literal=DB_SSLMODE=disable \
  -n passontw-services-staging

kubectl create secret generic jwt-secret \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  -n passontw-services-staging

kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_TOKEN \
  -n passontw-services-staging
```

### 步驟 2：部署服務

**使用 GitHub Actions（推薦）：**

```bash
# 推送代碼觸發自動部署
git push origin develop  # 部署到 staging
git push origin main     # 部署到 production
```

**或使用部署腳本：**

```bash
cd k8s
./scripts/deploy-all.sh
```

### 步驟 3：驗證部署

```bash
# 檢查 Pods 狀態
kubectl get pods -n passontw-services-staging

# 應該看到 Running 狀態
# NAME                               READY   STATUS    RESTARTS   AGE
# token-admin-api-xxx-yyy            1/1     Running   0          2m
# token-app-api-xxx-yyy              1/1     Running   0          2m

# 查看服務日誌
kubectl logs -f deployment/token-admin-api -n passontw-services-staging

# 測試健康檢查
kubectl port-forward deployment/token-admin-api 8080:8080 -n passontw-services-staging
curl http://localhost:8080/health-check
```

---

## 日常操作

### 更新服務

**方式 1：通過 CI/CD（推薦）**

```bash
# 推送代碼即可自動構建和部署
git push origin develop
```

**方式 2：更新映像**

```bash
# 更新到特定版本
kubectl set image deployment/token-admin-api \
  token-admin-api=ghcr.io/user/token-admin-api:develop-abc1234 \
  -n passontw-services-staging

# 查看更新狀態
kubectl rollout status deployment/token-admin-api -n passontw-services-staging
```

### 更新配置

**更新 ConfigMap：**

```bash
# 修改配置文件
vim k8s/configmaps/admin-api-config.yaml

# 應用變更
kubectl apply -f k8s/configmaps/admin-api-config.yaml -n passontw-services-staging

# 重啟 Pod 載入新配置
kubectl rollout restart deployment/token-admin-api -n passontw-services-staging
```

**更新 Secret：**

```bash
# 更新 Secret
kubectl create secret generic database-secret \
  --from-literal=DB_PASSWORD="new-password" \
  -n passontw-services-staging \
  --dry-run=client -o yaml | kubectl apply -f -

# 重啟 Pod
kubectl rollout restart deployment/token-admin-api -n passontw-services-staging
```

### 擴展副本

```bash
# 擴展到 3 個副本
kubectl scale deployment/token-admin-api --replicas=3 -n passontw-services-staging

# 查看狀態
kubectl get pods -n passontw-services-staging -l app=token-admin-api
```

### 回滾部署

```bash
# 查看部署歷史
kubectl rollout history deployment/token-admin-api -n passontw-services-staging

# 回滾到上一個版本
kubectl rollout undo deployment/token-admin-api -n passontw-services-staging

# 回滾到特定版本
kubectl rollout undo deployment/token-admin-api \
  -n passontw-services-staging \
  --to-revision=2

# 使用腳本回滾
./k8s/scripts/rollback.sh
```

---

## CI/CD 自動部署

### GitHub Actions 工作流

完整的 CI/CD 流程已整合在工作流中：

| 工作流 | 觸發條件 | 環境 |
|--------|----------|------|
| `cicd-admin-api.yaml` | Admin API 代碼變更 | develop→staging, main→production |
| `cicd-app-api.yaml` | App API 代碼變更 | develop→staging, main→production |

**自動部署流程：**
1. 代碼推送到 develop/main
2. 自動構建 Docker 映像
3. 推送到 GHCR
4. 檢查 Secrets
5. 部署到 Kubernetes
6. 健康檢查
7. 失敗時自動回滾

**手動觸發：**

```bash
# 使用 GitHub CLI
gh workflow run "CI/CD - Admin API" -f environment=staging

# 或在 GitHub 網頁 Actions 頁面手動觸發
```

**詳細說明：** 參考 [`.github/workflows/README.md`](../.github/workflows/README.md)

---

## 監控與維護

### 查看資源使用

```bash
# Pod 資源使用
kubectl top pods -n passontw-services-staging

# 節點資源
kubectl top nodes

# Pod 詳細資訊
kubectl describe pod <pod-name> -n passontw-services-staging
```

### 查看日誌

```bash
# 實時日誌
kubectl logs -f deployment/token-admin-api -n passontw-services-staging

# 最近 100 行
kubectl logs --tail=100 deployment/token-admin-api -n passontw-services-staging

# 所有容器日誌
kubectl logs <pod-name> --all-containers=true -n passontw-services-staging

# 之前容器的日誌（Pod 重啟後）
kubectl logs <pod-name> --previous -n passontw-services-staging
```

### 健康檢查

```bash
# 檢查 Pod 健康狀態
kubectl get pods -n passontw-services-staging

# 詳細健康資訊
kubectl describe pod <pod-name> -n passontw-services-staging

# 測試服務連接
kubectl run -it --rm debug \
  --image=curlimages/curl \
  --restart=Never \
  -n passontw-services-staging \
  -- curl http://token-admin-api:8080/health-check
```

### 進入 Pod 除錯

```bash
# 進入 Pod shell
kubectl exec -it <pod-name> -n passontw-services-staging -- sh

# 執行單一命令
kubectl exec <pod-name> -n passontw-services-staging -- env | grep DB_
```

---

## 故障排除

### Pod 無法啟動

**症狀：** `CrashLoopBackOff` 或 `Error`

```bash
# 1. 查看 Pod 狀態
kubectl describe pod <pod-name> -n passontw-services-staging

# 2. 查看日誌
kubectl logs <pod-name> -n passontw-services-staging
kubectl logs <pod-name> --previous -n passontw-services-staging

# 3. 查看事件
kubectl get events -n passontw-services-staging --sort-by='.lastTimestamp'
```

**常見原因：**
- 資料庫連接失敗
- 環境變數配置錯誤
- 映像拉取失敗
- 資源不足

### 映像拉取失敗

**症狀：** `ImagePullBackOff` 或 `ErrImagePull`

```bash
# 檢查 Secret
kubectl get secret ghcr-pull-secret -n passontw-services-staging

# 重新創建 Secret
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_TOKEN \
  -n passontw-services-staging \
  --dry-run=client -o yaml | kubectl apply -f -

# 刪除並重建 Pod
kubectl delete pod <pod-name> -n passontw-services-staging
```

### 資料庫連接問題

```bash
# 檢查 Secret
kubectl get secret database-secret -n passontw-services-staging -o yaml

# 查看解碼後的值
kubectl get secret database-secret -n passontw-services-staging \
  -o jsonpath='{.data.DB_HOST}' | base64 -d

# 測試資料庫連接
kubectl run -it --rm psql-test \
  --image=postgres:15-alpine \
  --restart=Never \
  -n passontw-services-staging \
  -- psql -h your-db-host -U your-user -d token_services
```

### 服務無法訪問

```bash
# 檢查 Service
kubectl get svc -n passontw-services-staging
kubectl describe svc token-admin-api -n passontw-services-staging

# 檢查 Endpoints
kubectl get endpoints -n passontw-services-staging

# 測試內部連接
kubectl run -it --rm curl-test \
  --image=curlimages/curl \
  --restart=Never \
  -n passontw-services-staging \
  -- curl -v http://token-admin-api:8080/health-check
```

---

## 最佳實踐

### 1. 資源管理
- ✅ 設定適當的 CPU 和記憶體限制
- ✅ 使用 HPA 自動擴展
- ✅ 監控資源使用趨勢

### 2. 高可用性
- ✅ 至少運行 2 個副本
- ✅ 使用 Pod Anti-Affinity 分散 Pod
- ✅ 設定適當的健康檢查

### 3. 配置管理
- ✅ 使用 ConfigMap 管理非敏感配置
- ✅ 使用 Secret 管理敏感資訊
- ✅ 不要硬編碼配置在映像中

### 4. 部署策略
- ✅ 使用滾動更新（Rolling Update）
- ✅ 設定適當的 maxSurge 和 maxUnavailable
- ✅ 先在 staging 環境測試

### 5. 監控與日誌
- ✅ 集中收集日誌
- ✅ 設定告警規則
- ✅ 定期檢查資源使用

### 6. 安全性
- ✅ 使用最小權限原則
- ✅ 定期更新映像
- ✅ 掃描安全漏洞
- ✅ 使用 NetworkPolicy 限制流量
- ✅ 不要將 Secrets 提交到版本控制

### 7. 命名空間隔離
- ✅ 不同環境使用不同命名空間
- ✅ 永遠明確指定命名空間
- ✅ 為不同環境使用不同的配置值

---

## 快速命令參考

```bash
# === 查看資源 ===
kubectl get all -n passontw-services-staging
kubectl get pods -n passontw-services-staging -w
kubectl get deployments -n passontw-services-staging
kubectl get services -n passontw-services-staging
kubectl get configmaps -n passontw-services-staging
kubectl get secrets -n passontw-services-staging

# === 查看日誌 ===
kubectl logs -f deployment/token-admin-api -n passontw-services-staging
kubectl logs --tail=100 deployment/token-admin-api -n passontw-services-staging

# === 進入 Pod ===
kubectl exec -it <pod-name> -n passontw-services-staging -- sh

# === 部署操作 ===
kubectl apply -f k8s/deployments/token-admin-api.yaml -n passontw-services-staging
kubectl rollout restart deployment/token-admin-api -n passontw-services-staging
kubectl rollout status deployment/token-admin-api -n passontw-services-staging
kubectl rollout undo deployment/token-admin-api -n passontw-services-staging

# === 擴展與刪除 ===
kubectl scale deployment/token-admin-api --replicas=3 -n passontw-services-staging
kubectl delete pod <pod-name> -n passontw-services-staging
kubectl delete deployment token-admin-api -n passontw-services-staging
```

---

## 相關資源

### 文檔
- [GitHub Actions CI/CD](../.github/workflows/README.md) - 自動化部署說明
- [部署架構](../DEPLOYMENT_ARCHITECTURE.md) - 系統架構文檔
- [快速開始](../QUICK_START.md) - 專案快速開始指南

### 配置檔案
- [ConfigMaps](./configmaps/) - 應用配置
- [Deployments](./deployments/) - 部署定義
- [Services](./services/) - 服務定義
- [Secrets 範例](./secrets/) - Secrets 範例檔案

### 部署腳本
- [deploy-all.sh](./scripts/deploy-all.sh) - 部署所有服務
- [deploy-admin.sh](./scripts/deploy-admin.sh) - 部署 Admin API
- [deploy-app.sh](./scripts/deploy-app.sh) - 部署 App API
- [rollback.sh](./scripts/rollback.sh) - 回滾腳本

### 外部資源
- [Kubernetes 官方文檔](https://kubernetes.io/docs/)
- [kubectl 速查表](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [k3s 文檔](https://docs.k3s.io/)

---

**最後更新：** 2025-11-13  
**維護者：** DevOps Team

**快速開始：** 
1. 創建 Secrets → 2. 推送代碼到 develop → 3. 自動部署完成！
