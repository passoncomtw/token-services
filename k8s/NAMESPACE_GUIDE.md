# Kubernetes 命名空間管理指南

## 概述

本專案的 Kubernetes 配置文件已經過優化，**移除了硬編碼的命名空間**，以支持多環境部署（staging、production 等）。

## 設計原則

### 為什麼移除硬編碼命名空間？

遵循以下軟體開發原則：

1. **DRY 原則（Don't Repeat Yourself）**
   - 避免為每個環境複製相同的配置文件
   - 單一配置文件可用於所有環境

2. **開放封閉原則（Open-Closed Principle）**
   - 配置對擴展開放：輕鬆支持新環境
   - 配置對修改封閉：不需要修改配置文件本身

3. **單一職責原則（Single Responsibility Principle）**
   - 配置文件負責定義資源規格
   - 部署腳本負責指定目標環境

## 命名空間架構

### 標準命名空間

本專案使用以下命名空間結構：

```
passontw-services-staging      # 測試環境
passontw-services-production   # 生產環境
```

### 命名空間命名規則

- 格式：`{project-name}-{environment}`
- project-name: `passontw-services`
- environment: `staging` | `production`

## 部署方式

### 方法一：使用測試腳本（推薦）

```bash
# 部署到 staging 環境
./scripts/test-deploy-workflow.sh -s all -e staging

# 部署到 production 環境
./scripts/test-deploy-workflow.sh -s all -e production

# 只部署 admin-api 到 staging
./scripts/test-deploy-workflow.sh -s admin-api -e staging
```

### 方法二：手動部署

```bash
# 1. 設定環境變數
export NAMESPACE="passontw-services-staging"

# 2. 創建命名空間（如果不存在）
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# 3. 部署 ConfigMaps
kubectl apply -f k8s/configmaps/admin-api-config.yaml -n $NAMESPACE
kubectl apply -f k8s/configmaps/app-api-config.yaml -n $NAMESPACE

# 4. 部署 Secrets（從範例文件複製並修改後）
kubectl apply -f k8s/secrets/database-secret.yaml -n $NAMESPACE
kubectl apply -f k8s/secrets/jwt-secret.yaml -n $NAMESPACE
kubectl apply -f k8s/secrets/ghcr-pull-secret.yaml -n $NAMESPACE

# 5. 部署服務
kubectl apply -f k8s/deployments/token-admin-api.yaml -n $NAMESPACE
kubectl apply -f k8s/services/token-admin-api-service.yaml -n $NAMESPACE

kubectl apply -f k8s/deployments/token-app-api.yaml -n $NAMESPACE
kubectl apply -f k8s/services/token-app-api-service.yaml -n $NAMESPACE

# 6. 部署 Ingress（可選）
kubectl apply -f k8s/ingress/ingress.yaml -n $NAMESPACE
```

### 方法三：使用 kubectl 批量部署

```bash
# 部署所有配置到指定命名空間
kubectl apply -f k8s/configmaps/ -n passontw-services-staging
kubectl apply -f k8s/deployments/ -n passontw-services-staging
kubectl apply -f k8s/services/ -n passontw-services-staging
```

## Secrets 管理

### 創建 Secrets

Secrets 文件不包含在版本控制中。需要從範例文件創建：

```bash
# 1. 複製範例文件
cp k8s/secrets/database-secret.yaml.example k8s/secrets/database-secret.yaml
cp k8s/secrets/jwt-secret.yaml.example k8s/secrets/jwt-secret.yaml
cp k8s/secrets/ghcr-pull-secret.yaml.example k8s/secrets/ghcr-pull-secret.yaml

# 2. 編輯文件，填入實際的敏感資訊
vim k8s/secrets/database-secret.yaml
vim k8s/secrets/jwt-secret.yaml
vim k8s/secrets/ghcr-pull-secret.yaml

# 3. 部署到對應的命名空間
kubectl apply -f k8s/secrets/database-secret.yaml -n passontw-services-staging
kubectl apply -f k8s/secrets/jwt-secret.yaml -n passontw-services-staging
kubectl apply -f k8s/secrets/ghcr-pull-secret.yaml -n passontw-services-staging

# 4. 生產環境的 Secrets 需要單獨創建和部署
kubectl apply -f k8s/secrets/database-secret.yaml -n passontw-services-production
kubectl apply -f k8s/secrets/jwt-secret.yaml -n passontw-services-production
kubectl apply -f k8s/secrets/ghcr-pull-secret.yaml -n passontw-services-production
```

### 使用命令行直接創建 Secrets

```bash
# Database Secret
kubectl create secret generic database-secret \
  --from-literal=DB_HOST=your-postgres-host \
  --from-literal=DB_PORT=5432 \
  --from-literal=DB_USER=your-db-user \
  --from-literal=DB_PASSWORD=your-db-password \
  --from-literal=DB_NAME=token_services \
  --from-literal=DB_SSLMODE=disable \
  -n passontw-services-staging

# JWT Secret
kubectl create secret generic jwt-secret \
  --from-literal=JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars-long \
  -n passontw-services-staging

# GHCR Pull Secret
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN \
  -n passontw-services-staging
```

## 常用命令

### 查看資源

```bash
# 列出所有命名空間
kubectl get namespaces

# 查看特定命名空間的所有資源
kubectl get all -n passontw-services-staging

# 查看 Deployments
kubectl get deployments -n passontw-services-staging

# 查看 Pods
kubectl get pods -n passontw-services-staging

# 查看 Services
kubectl get services -n passontw-services-staging

# 查看 ConfigMaps
kubectl get configmaps -n passontw-services-staging

# 查看 Secrets（名稱）
kubectl get secrets -n passontw-services-staging
```

### 切換預設命名空間

如果經常操作同一個命名空間，可以設置為預設：

```bash
# 設置當前 context 的預設命名空間
kubectl config set-context --current --namespace=passontw-services-staging

# 驗證
kubectl config view --minify | grep namespace

# 之後的命令就不需要加 -n 參數了
kubectl get pods
kubectl get services
```

### 清理資源

```bash
# 刪除特定命名空間下的所有資源
kubectl delete all --all -n passontw-services-staging

# 刪除整個命名空間（包含所有資源）
kubectl delete namespace passontw-services-staging

# 注意：刪除命名空間會刪除其中的所有資源，請謹慎使用！
```

## 環境隔離

### 資源隔離

不同環境使用不同的命名空間，確保：

1. **資源隔離**：staging 和 production 的 Pods 完全獨立
2. **配置隔離**：不同環境可以使用不同的 ConfigMaps 和 Secrets
3. **安全隔離**：可以設置不同的 RBAC 權限
4. **網路隔離**：可以使用 Network Policies 限制跨命名空間訪問

### 最佳實踐

1. **永遠明確指定命名空間**
   ```bash
   # 好的做法
   kubectl apply -f deployment.yaml -n passontw-services-staging
   
   # 避免依賴預設命名空間
   kubectl apply -f deployment.yaml
   ```

2. **在自動化腳本中使用環境變數**
   ```bash
   NAMESPACE="passontw-services-${ENVIRONMENT}"
   kubectl apply -f deployment.yaml -n $NAMESPACE
   ```

3. **為不同環境使用不同的配置值**
   - Staging: 較低的資源限制、較多的日誌
   - Production: 較高的資源限制、生產級日誌

4. **測試先行**
   ```bash
   # 先在 staging 測試
   ./scripts/test-deploy-workflow.sh -e staging
   
   # 驗證無誤後再部署到 production
   ./scripts/test-deploy-workflow.sh -e production
   ```

## 遷移指南

### 從硬編碼命名空間遷移

如果您之前使用的是硬編碼 `namespace: passontw-services` 的配置：

```bash
# 1. 更新代碼（已完成）
# 所有配置文件已移除硬編碼的命名空間

# 2. 遷移現有資源
# 如果您有運行中的資源在舊命名空間，需要遷移：

# 方法 A：導出並重新創建
kubectl get deployment token-admin-api -n passontw-services -o yaml > temp-deployment.yaml
# 編輯 temp-deployment.yaml，修改命名空間
kubectl apply -f temp-deployment.yaml -n passontw-services-production

# 方法 B：直接在新命名空間重新部署
kubectl apply -f k8s/deployments/token-admin-api.yaml -n passontw-services-production

# 3. 遷移 Secrets
# Secrets 需要手動在新命名空間中重新創建
kubectl get secret database-secret -n passontw-services -o yaml | \
  sed 's/namespace: passontw-services/namespace: passontw-services-production/' | \
  kubectl apply -f -

# 4. 驗證新環境正常運行後，清理舊資源
kubectl delete namespace passontw-services
```

## 故障排除

### 問題：找不到 ConfigMap 或 Secret

```bash
# 檢查是否在正確的命名空間
kubectl get configmaps -n passontw-services-staging
kubectl get secrets -n passontw-services-staging

# 如果不存在，重新部署
kubectl apply -f k8s/configmaps/ -n passontw-services-staging
```

### 問題：Pod 無法啟動，提示找不到 Secret

```bash
# 檢查 Secret 是否存在於正確的命名空間
kubectl get secrets -n passontw-services-staging

# 查看 Pod 詳細資訊
kubectl describe pod <POD_NAME> -n passontw-services-staging

# 創建缺失的 Secrets
# 參考上面的 "Secrets 管理" 部分
```

### 問題：不小心部署到錯誤的命名空間

```bash
# 1. 列出錯誤命名空間的資源
kubectl get all -n wrong-namespace

# 2. 刪除資源
kubectl delete -f k8s/deployments/token-admin-api.yaml -n wrong-namespace

# 3. 部署到正確的命名空間
kubectl apply -f k8s/deployments/token-admin-api.yaml -n correct-namespace
```

## 參考資料

- [Kubernetes Namespaces 官方文檔](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
- [本專案部署指南](./DEPLOYMENT_GUIDE.md)
- [本地測試指南](../.github/workflows/LOCAL_TESTING.md)
- [測試腳本](../scripts/test-deploy-workflow.sh)

