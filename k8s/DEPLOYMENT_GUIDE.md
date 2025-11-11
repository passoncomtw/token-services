
# Kubernetes 部署完整指南

## 📋 目錄

1. [環境準備](#環境準備)
2. [首次部署](#首次部署)
3. [日常更新](#日常更新)
4. [自動化部署](#自動化部署)
5. [監控與維護](#監控與維護)
6. [故障排除](#故障排除)

---

## 環境準備

### 前置條件

- ✅ k3s 集群已設置並運行
- ✅ kubectl 已安裝並配置
- ✅ 可以連接到 k3s master
- ✅ PostgreSQL 資料庫已設置
- ✅ Docker 映像已推送到 GHCR

### 驗證環境

```bash
# 驗證 kubectl 連接
kubectl cluster-info
kubectl get nodes

# 驗證資料庫連接（使用 psql 或其他工具）
psql -h your-db-host -U your-user -d token_services
```

---

## 首次部署

### 步驟 1: 準備 Secrets

```bash
cd /Users/tomaslin/Projects/golang-passontw-services/k8s

# 設定環境變數
export DB_HOST="your-postgres-host"
export DB_USER="your-db-user"
export DB_PASSWORD="your-db-password"
export DB_NAME="token_services"
export JWT_SECRET="your-jwt-secret-at-least-32-chars"
export GHCR_USERNAME="passontw"
export GHCR_TOKEN="ghp_xxxxxxxxxxxx"

# 建立 Secrets
./scripts/create-secrets.sh
```

**安全提示**：
- 不要將實際的密碼提交到 Git
- 使用環境變數或密鑰管理系統
- 定期輪換密鑰

### 步驟 2: 部署所有服務

```bash
# 部署所有服務
./scripts/deploy-all.sh
```

這個腳本會：
1. 建立 namespace
2. 應用 ConfigMaps
3. 部署 Admin API 和 App API
4. 建立 Services
5. （可選）部署 Ingress

### 步驟 3: 驗證部署

```bash
# 查看所有資源
kubectl get all -n passontw-services

# 查看 Pods 狀態
kubectl get pods -n passontw-services -w

# 查看服務日誌
kubectl logs -f -n passontw-services deployment/token-admin-api
kubectl logs -f -n passontw-services deployment/token-app-api
```

---

## 日常更新

### 更新單一服務

**更新 Admin API:**
```bash
cd /Users/tomaslin/Projects/golang-passontw-services/k8s
./scripts/deploy-admin.sh
```

**更新 App API:**
```bash
cd /Users/tomaslin/Projects/golang-passontw-services/k8s
./scripts/deploy-app.sh
```

### 更新配置

**更新 ConfigMap:**
```bash
# 編輯 ConfigMap
vi k8s/configmaps/admin-api-config.yaml

# 應用變更
kubectl apply -f k8s/configmaps/admin-api-config.yaml

# 重啟 Pod 以載入新配置
kubectl rollout restart deployment/token-admin-api -n passontw-services
```

**更新 Secret:**
```bash
# 更新 Secret
kubectl create secret generic database-secret \
  --from-literal=DB_PASSWORD="new-password" \
  --namespace=passontw-services \
  --dry-run=client -o yaml | kubectl apply -f -

# 重啟 Pod
kubectl rollout restart deployment/token-admin-api -n passontw-services
```

### 擴展副本數

```bash
# 擴展到 3 個副本
kubectl scale deployment/token-admin-api --replicas=3 -n passontw-services

# 查看狀態
kubectl get pods -n passontw-services -l app=token-admin-api
```

---

## 自動化部署

### GitHub Actions 自動部署

已配置的 workflow：`.github/workflows/deploy-to-k8s.yaml`

**觸發方式：**

1. **自動觸發**：當 `Build Token Admin API` workflow 成功完成時
2. **手動觸發**：通過 GitHub Actions UI

**手動部署步驟：**

1. 前往 GitHub Repository → Actions
2. 選擇 "Deploy to Kubernetes"
3. 點擊 "Run workflow"
4. 選擇：
   - 服務（all / admin-api / app-api）
   - 環境（production / staging）
5. 點擊 "Run workflow"

### 本地手動部署

**快速更新映像：**
```bash
# 更新 Admin API 映像
kubectl set image deployment/token-admin-api \
  token-admin-api=ghcr.io/passontw/token-admin-api:develop-abc123d \
  -n passontw-services

# 查看 rollout 狀態
kubectl rollout status deployment/token-admin-api -n passontw-services
```

---

## 監控與維護

### 查看資源使用

```bash
# 查看 Pod 資源使用
kubectl top pods -n passontw-services

# 查看節點資源
kubectl top nodes

# 詳細資源資訊
kubectl describe pod -n passontw-services <pod-name>
```

### 查看日誌

```bash
# 實時日誌
kubectl logs -f -n passontw-services deployment/token-admin-api

# 最近 100 行
kubectl logs --tail=100 -n passontw-services deployment/token-admin-api

# 所有容器的日誌
kubectl logs -n passontw-services <pod-name> --all-containers=true

# 之前容器的日誌（如果 Pod 重啟了）
kubectl logs -n passontw-services <pod-name> --previous
```

### 健康檢查

```bash
# 檢查 Pod 健康狀態
kubectl get pods -n passontw-services

# 檢查特定 Pod
kubectl describe pod -n passontw-services <pod-name>

# 測試服務連接
kubectl run -it --rm debug \
  --image=curlimages/curl \
  --restart=Never \
  -n passontw-services \
  -- curl http://token-admin-api:8080/health-check
```

### 進入 Pod 除錯

```bash
# 進入 Pod shell（如果映像包含 sh）
kubectl exec -it -n passontw-services <pod-name> -- sh

# 執行單一命令
kubectl exec -n passontw-services <pod-name> -- env | grep DB_
```

---

## 故障排除

### Pod 無法啟動

**問題：Pod 狀態為 `CrashLoopBackOff` 或 `Error`**

```bash
# 1. 查看 Pod 狀態
kubectl describe pod -n passontw-services <pod-name>

# 2. 查看日誌
kubectl logs -n passontw-services <pod-name>
kubectl logs -n passontw-services <pod-name> --previous

# 3. 檢查事件
kubectl get events -n passontw-services --sort-by='.lastTimestamp'
```

**常見原因：**
- 資料庫連接失敗
- 環境變數配置錯誤
- 映像拉取失敗
- 資源不足

### 映像拉取失敗

**問題：`ImagePullBackOff` 或 `ErrImagePull`**

```bash
# 驗證 Secret
kubectl get secret ghcr-pull-secret -n passontw-services -o yaml

# 重新建立 Secret
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=$GHCR_USERNAME \
  --docker-password=$GHCR_TOKEN \
  --namespace=passontw-services \
  --dry-run=client -o yaml | kubectl apply -f -

# 刪除並重新建立 Pod
kubectl delete pod -n passontw-services <pod-name>
```

### 資料庫連接問題

```bash
# 檢查 Secret
kubectl get secret database-secret -n passontw-services -o jsonpath='{.data.DB_HOST}' | base64 -d

# 測試資料庫連接
kubectl run -it --rm psql-test \
  --image=postgres:15-alpine \
  --restart=Never \
  -n passontw-services \
  -- psql -h your-db-host -U your-user -d token_services
```

### 服務無法訪問

```bash
# 檢查 Service
kubectl get svc -n passontw-services
kubectl describe svc token-admin-api -n passontw-services

# 檢查 Endpoints
kubectl get endpoints -n passontw-services

# 測試內部連接
kubectl run -it --rm curl-test \
  --image=curlimages/curl \
  --restart=Never \
  -n passontw-services \
  -- curl -v http://token-admin-api:8080/health-check
```

### 回滾部署

**使用腳本：**
```bash
./k8s/scripts/rollback.sh
```

**手動回滾：**
```bash
# 查看歷史
kubectl rollout history deployment/token-admin-api -n passontw-services

# 回滾到上一個版本
kubectl rollout undo deployment/token-admin-api -n passontw-services

# 回滾到特定版本
kubectl rollout undo deployment/token-admin-api -n passontw-services --to-revision=2

# 查看回滾狀態
kubectl rollout status deployment/token-admin-api -n passontw-services
```

---

## 最佳實踐

### 1. 資源管理

- 設定適當的 CPU 和記憶體限制
- 使用 HPA（Horizontal Pod Autoscaler）自動擴展
- 監控資源使用趨勢

### 2. 高可用性

- 至少運行 2 個副本
- 使用 Pod Anti-Affinity 分散 Pod
- 設定適當的健康檢查

### 3. 配置管理

- 使用 ConfigMap 管理非敏感配置
- 使用 Secret 管理敏感資訊
- 不要硬編碼配置

### 4. 部署策略

- 使用滾動更新（Rolling Update）
- 設定適當的 maxSurge 和 maxUnavailable
- 總是先在 staging 環境測試

### 5. 監控與日誌

- 集中收集日誌
- 設定告警規則
- 定期檢查資源使用

### 6. 安全性

- 使用最小權限原則
- 定期更新映像
- 掃描安全漏洞
- 使用 NetworkPolicy 限制流量

---

## 快速命令參考

```bash
# 查看所有資源
kubectl get all -n passontw-services

# 查看 Pod
kubectl get pods -n passontw-services
kubectl get pods -n passontw-services -w  # 監看模式

# 查看日誌
kubectl logs -f -n passontw-services deployment/token-admin-api

# 進入 Pod
kubectl exec -it -n passontw-services <pod-name> -- sh

# 更新部署
kubectl apply -f k8s/deployments/token-admin-api.yaml

# 重啟部署
kubectl rollout restart deployment/token-admin-api -n passontw-services

# 擴展副本
kubectl scale deployment/token-admin-api --replicas=3 -n passontw-services

# 回滾
kubectl rollout undo deployment/token-admin-api -n passontw-services

# 刪除資源
kubectl delete -f k8s/deployments/token-admin-api.yaml
kubectl delete namespace passontw-services  # 小心使用！
```

---

## 相關文件

- [k8s/README.md](README.md) - Kubernetes 配置概覽
- [../documents/tech_spec.md](../documents/tech_spec.md) - 技術規格
- [GitHub Actions Workflows](../.github/workflows/) - CI/CD 配置

---

**最後更新**: 2025-11-09  
**維護者**: DevOps Team

