# GitHub Actions CI/CD 工作流

> **整合完成！** Build 和 Deploy 已整合為單一工作流，提供完整的 CI/CD 流程。

## 📦 工作流列表

| 服務 | 工作流檔案 | 觸發條件 | 流程 |
|------|-----------|----------|------|
| **Admin API** | `cicd-admin-api.yaml` | `cmd/token-admin-api/**`、`pkg/**` 變更 | 構建 → 推送 → 部署 → 驗證 |
| **App API** | `cicd-app-api.yaml` | `cmd/token-app-api/**`、`pkg/**` 變更 | 構建 → 推送 → 部署 → 驗證 |

### 工作流特性

✅ 自動構建 Docker 映像  
✅ 推送到 GitHub Container Registry  
✅ 自動部署到對應環境（develop→staging, main→production）  
✅ 部署前檢查必要的 Secrets  
✅ 健康檢查驗證  
✅ 失敗時自動回滾  
✅ 支援手動觸發與跳過構建選項  
✅ **多層緩存策略加速構建（第二次起快 3-5 倍）**

## 🚀 自動觸發

### 代碼推送觸發

```bash
# 推送到 develop → 自動構建並部署到 staging
git push origin develop

# 推送到 main → 自動構建並部署到 production  
git push origin main
```

**流程：**
1. ✅ 構建 Docker 映像
2. ✅ 推送映像到 GHCR
3. ✅ 自動部署到 K8s
4. ✅ 健康檢查驗證

## 🎮 手動觸發選項

### 標準部署（構建 + 部署）

```bash
# 使用 GitHub CLI
gh workflow run "CI/CD - Admin API" -f environment=staging
gh workflow run "CI/CD - App API" -f environment=production
```

**或通過網頁：**
1. Actions → 選擇工作流
2. Run workflow
3. 選擇環境：`auto`（自動）、`staging` 或 `production`

### 僅部署（跳過構建）

如果映像已存在，可以跳過構建直接部署：

```bash
gh workflow run "CI/CD - Admin API" \
  -f skip_build=true \
  -f image_tag=ghcr.io/youruser/token-admin-api:develop-abc1234 \
  -f environment=staging
```

## 📋 環境對應

| 分支 | 環境 | 命名空間 |
|------|------|----------|
| `develop` | staging | `passontw-services-staging` |
| `main` | production | `passontw-services-production` |

## 🔐 首次部署準備

### 必要的 Secrets

每個命名空間需要以下 Secrets：

```bash
# 從 GHCR 拉取映像
ghcr-pull-secret

# 資料庫連接
database-secret

# JWT 認證
jwt-secret
```

### 創建 Secrets

```bash
# 使用 kubectl 創建
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN \
  -n passontw-services-staging

kubectl create secret generic database-secret \
  --from-literal=DB_HOST=your-db-host \
  --from-literal=DB_PORT=5432 \
  --from-literal=DB_USER=your-db-user \
  --from-literal=DB_PASSWORD=your-db-password \
  --from-literal=DB_NAME=token_services \
  --from-literal=DB_SSLMODE=disable \
  -n passontw-services-staging

kubectl create secret generic jwt-secret \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  -n passontw-services-staging
```

**或參考範例檔案：**
- `k8s/secrets/database-secret.yaml.example`
- `k8s/secrets/jwt-secret.yaml.example`
- `k8s/secrets/ghcr-pull-secret.yaml.example`

## ⚡ 構建優化

### 多層緩存策略

工作流使用智能的多層緩存策略，顯著加快第二次及以後的構建速度：

**緩存層級：**
1. **分支特定緩存** - `scope=admin-api-develop`
2. **主分支緩存** - `scope=admin-api-main`（作為回退）
3. **通用緩存** - `scope=admin-api`（最後的回退）

**加速效果：**
- 首次構建：~3-5 分鐘（無緩存）
- 後續構建：~30-60 秒（完整緩存命中）
- 加速比：**3-5 倍**

**緩存內容：**
```yaml
# Go 依賴緩存
~/.cache/go-build
~/go/pkg/mod

# Docker 層緩存
type=gha,scope=admin-api-develop
```

**工作原理：**
1. 嘗試使用當前分支的緩存
2. 如果沒有，嘗試使用 main 分支的緩存
3. 如果還沒有，使用通用緩存
4. 構建完成後更新當前分支的緩存

### 查看緩存狀態

在 GitHub Actions 執行日誌中查找：
- `Cache not found` - 無緩存，完整構建
- `Cache restored` - 緩存命中，快速構建
- `Exporting cache` - 保存新緩存

## 🔍 監控部署

### 查看工作流狀態

```bash
# 查看最近的執行
gh run list --workflow="CI/CD - Admin API"

# 查看特定執行的日誌
gh run view <RUN_ID> --log
```

### 查看 Kubernetes 狀態

```bash
# 查看 Pods
kubectl get pods -n passontw-services-staging

# 查看部署
kubectl get deployment -n passontw-services-staging

# 查看日誌
kubectl logs -f deployment/token-admin-api -n passontw-services-staging
```

## 🔄 CI/CD 更新機制

### CI/CD 會自動更新現有的部署嗎？

**✅ 是的！** CI/CD 工作流會**更新現有的 Kubernetes 部署**，而不是創建新的部署。

### 更新機制說明

當您推送代碼或手動觸發工作流時，CI/CD 執行以下步驟：

```bash
# 步驟 1: 應用 Deployment 配置（聲明式更新）
kubectl apply -f k8s/deployments/token-admin-api.yaml -n ${NAMESPACE}

# 步驟 2: 應用 Service 配置
kubectl apply -f k8s/services/token-admin-api-service.yaml -n ${NAMESPACE}

# 步驟 3: 更新容器映像（觸發滾動更新）
kubectl set image deployment/token-admin-api \
  token-admin-api=${IMAGE_FULL} \
  -n ${NAMESPACE}
```

### kubectl apply 的行為

**重要概念**：`kubectl apply` 是**聲明式更新**，不是創建新資源。

| 情況 | 行為 |
|------|------|
| 資源不存在 | 創建新資源 |
| 資源已存在 | 更新現有資源（保留不變的部分） |
| 配置相同 | 不做任何更改 |

### 滾動更新流程

當 CI/CD 更新映像時，Kubernetes 執行**滾動更新**（零停機）：

```
現有狀態：
  Pod 1: token-admin-api-old-xxx (運行中)
  Pod 2: token-admin-api-old-yyy (運行中)

觸發更新後：
  1. 創建新 Pod → token-admin-api-new-zzz
  2. 等待新 Pod 就緒 ✅
  3. 終止一個舊 Pod
  4. 創建第二個新 Pod → token-admin-api-new-www
  5. 等待新 Pod 就緒 ✅
  6. 終止最後一個舊 Pod

最終狀態：
  Pod 3: token-admin-api-new-zzz (運行中)
  Pod 4: token-admin-api-new-www (運行中)
```

**滾動更新配置**：
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0   # 確保零停機
    maxSurge: 1         # 最多多出 1 個 Pod
```

**優勢**：
- ✅ **零停機時間** - 始終有至少 1 個 Pod 在運行
- ✅ **逐步替換** - 不會一次性刪除所有舊 Pod
- ✅ **健康檢查** - 只有新 Pod 就緒後才會刪除舊 Pod
- ✅ **自動回滾** - 如果新版本失敗，可以快速回滾

### 實時監控更新

```bash
# 監控滾動更新進度
kubectl rollout status deployment/token-admin-api -n passontw-services-staging

# 實時查看 Pods 變化
kubectl get pods -n passontw-services-staging -w

# 查看更新歷史
kubectl rollout history deployment/token-admin-api -n passontw-services-staging
```

### 驗證更新

```bash
# 查看當前映像版本
kubectl get deployment token-admin-api \
  -n passontw-services-staging \
  -o jsonpath='{.spec.template.spec.containers[0].image}'

# 查看 ReplicaSet 歷史
kubectl get replicaset -n passontw-services-staging

# 輸出示例：
# NAME                         DESIRED   CURRENT   READY   AGE
# token-admin-api-6f8775587    2         2         2       1h    ← 當前版本
# token-admin-api-855858b9db   0         0         0       16h   ← 舊版本（已縮容）
```

**說明**：
- 每次更新都會創建新的 ReplicaSet
- 舊的 ReplicaSet 會縮容到 0（但保留用於回滾）
- Deployment 本身保持不變，只是管理不同的 ReplicaSet

### 更新行為總結

| 資源 | 行為 |
|------|------|
| **Deployment** | 更新現有（不創建新的） |
| **Service** | 保持不變（除非配置改變） |
| **ConfigMap** | 更新現有 |
| **Pods** | 逐步替換（滾動更新） |
| **ReplicaSet** | 創建新的（舊的縮容保留） |

---

## 🔄 回滾機制

### 自動回滾

部署失敗時，工作流會自動回滾到上一個穩定版本：

```yaml
- name: Rollback on failure
  if: failure()
  run: |
    kubectl rollout undo deployment/token-admin-api -n ${NAMESPACE}
```

### 手動回滾

```bash
# 回滾到上一個版本
kubectl rollout undo deployment/token-admin-api -n passontw-services-staging

# 查看歷史
kubectl rollout history deployment/token-admin-api -n passontw-services-staging

# 回滾到特定版本
kubectl rollout undo deployment/token-admin-api \
  -n passontw-services-staging \
  --to-revision=2

# 查看回滾狀態
kubectl rollout status deployment/token-admin-api -n passontw-services-staging
```

### 使用工作流重新部署舊版本

```bash
gh workflow run "CI/CD - Admin API" \
  -f skip_build=true \
  -f image_tag=ghcr.io/youruser/token-admin-api:develop-stable \
  -f environment=production
```

## 📊 工作流特性

### ✅ 包含功能

- **自動構建** - 代碼變更時自動構建 Docker 映像
- **自動部署** - 構建成功後自動部署到對應環境
- **Secrets 檢查** - 部署前檢查必要的 Secrets
- **健康檢查** - 部署後驗證服務健康狀態
- **自動回滾** - 失敗時自動回滾到上一版本
- **詳細日誌** - 每個步驟都有詳細的日誌輸出
- **部署摘要** - 生成詳細的部署報告

### 🎯 觸發條件

**Admin API (`cicd-admin-api.yaml`)** 會在以下情況觸發：
- 修改 `cmd/token-admin-api/**`
- 修改 `pkg/**`（共用套件）
- 修改 `deploy/token-admin-api/**`
- 修改相關 K8s 配置
- 修改 `go.mod` 或 `go.sum`
- 手動觸發

**App API (`cicd-app-api.yaml`)** 會在以下情況觸發：
- 修改 `cmd/token-app-api/**`
- 修改 `pkg/**`（共用套件）
- 修改 `deploy/token-app-api/**`
- 修改相關 K8s 配置
- 修改 `go.mod` 或 `go.sum`
- 手動觸發

## 🆘 故障排除

### 問題：構建失敗

```bash
# 檢查 Go 依賴
go mod tidy
go mod verify

# 本地測試構建
docker build -f deploy/token-admin-api/Dockerfile .
```

### 問題：部署失敗 - 缺少 Secrets

**錯誤訊息：**
```
❌ 缺少必要的 Secrets: ghcr-pull-secret database-secret jwt-secret
```

**解決：** 參考上方「創建 Secrets」部分

### 問題：健康檢查失敗

```bash
# 查看 Pod 日誌
kubectl logs deployment/token-admin-api -n passontw-services-staging

# 查看 Pod 詳細資訊
kubectl describe pod <POD_NAME> -n passontw-services-staging

# 手動測試健康檢查
kubectl port-forward deployment/token-admin-api 8080:8080 -n passontw-services-staging
curl http://localhost:8080/health-check
```

## 📚 相關文檔

- [Kubernetes 配置](../../k8s/)
- [部署架構](../../DEPLOYMENT_ARCHITECTURE.md)
- [Secrets 範例](../../k8s/secrets/)

## 💡 最佳實踐

### 1. 開發流程

```bash
# 1. 在功能分支開發
git checkout -b feature/new-feature

# 2. 合併到 develop 測試
git checkout develop
git merge feature/new-feature
git push origin develop
# → 自動部署到 staging

# 3. 在 staging 驗證功能

# 4. 合併到 main 上線
git checkout main
git merge develop
git push origin main
# → 自動部署到 production
```

### 2. 緊急修復

```bash
# 1. 從 main 創建 hotfix 分支
git checkout -b hotfix/critical-fix main

# 2. 修復問題並推送
git push origin hotfix/critical-fix

# 3. 手動觸發部署到 staging 測試
gh workflow run "CI/CD - Admin API" -f environment=staging

# 4. 驗證後合併到 main
git checkout main
git merge hotfix/critical-fix
git push origin main
```

### 3. 監控部署

```bash
# 部署後持續監控
watch kubectl get pods -n passontw-services-production

# 實時查看日誌
kubectl logs -f deployment/token-admin-api -n passontw-services-production
```

---

**快速開始：**
```bash
# 1. 創建 Secrets
kubectl create secret ... (參考上方說明)

# 2. 推送代碼
git push origin develop

# 3. 查看部署狀態
kubectl get pods -n passontw-services-staging
```

**需要幫助？** 查看 GitHub Actions 頁面的執行日誌或檢查 Pod 日誌。

