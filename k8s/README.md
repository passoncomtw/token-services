# Kubernetes 部署指南

> 完整的 Kubernetes 部署、管理和故障排除文檔

## 📋 目錄

- [目錄結構](#目錄結構)
- [快速開始](#快速開始)
- [Base 共用配置](#base-共用配置)
  - [快速指南](#快速指南)
  - [詳細說明](#詳細說明)
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
├── README.md                          # 本文檔（包含完整使用指南）
├── BASE_USAGE_GUIDE.md               # ⚠️ 已整合到本文檔
├── base/                              # 共用配置（透過 Kustomize patches）
│   ├── README.md                     # ⚠️ 已整合到本文檔
│   ├── kustomization.yaml            # Base 層配置
│   ├── common-patches.yaml           # 所有服務共用的配置
│   ├── common-secrets-env.yaml       # Database & JWT Secrets
│   └── redis-secrets-env.yaml        # Redis Secrets（僅 Token APIs）
├── services/                          # 各服務配置目錄
│   ├── token-admin-api/
│   │   ├── kustomization.yaml        # 服務配置清單
│   │   ├── deployment.yaml           # 部署定義
│   │   ├── service.yaml              # 服務定義
│   │   └── configmap.yaml            # 配置映射
│   ├── token-app-api/
│   ├── pos-backend-service/
│   └── pos-merchant-service/
├── overlays/                          # 環境覆蓋配置
│   └── staging/
│       ├── kustomization.yaml        # Staging 環境配置
│       ├── namespace.yaml            # 命名空間
│       └── ingress.yaml              # Ingress & SSL
└── secrets/                           # Secrets 範例
    ├── database-secret.yaml.example
    ├── jwt-secret.yaml.example
    ├── redis-secret.yaml.example
    └── ghcr-pull-secret.yaml.example
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

## Base 共用配置

> 透過 Kustomize 自動應用共用配置到所有服務，避免重複定義，確保一致性

### 快速指南

#### 📦 什麼是 Base？

`k8s/base/` 目錄包含所有服務共用的配置，通過 Kustomize 自動應用到每個服務，避免重複配置。

#### 🎯 Base 包含什麼？

**1. `common-patches.yaml` - 所有服務共用**
- ✅ 安全設置（非 root 用戶、只讀文件系統）
- ✅ 資源限制（128Mi/100m 請求，512Mi/500m 限制）
- ✅ imagePullSecrets（GHCR 凭证）
- ✅ 重启策略

**2. `common-secrets-env.yaml` - 所有服務共用**
- ✅ Database Secret（DB_HOST, DB_PORT, etc.）
- ✅ JWT Secret（JWT_SECRET）

**3. `redis-secrets-env.yaml` - 僅 Token APIs**
- ✅ Redis Secret（REDIS_HOST, REDIS_PORT, etc.）

#### 🚀 如何使用？

**各服務的 `kustomization.yaml`**

```yaml
patchesStrategicMerge:
  - ../../base/common-patches.yaml       # ← 所有服務必須
  - ../../base/common-secrets-env.yaml   # ← 所有服務必須
  - ../../base/redis-secrets-env.yaml    # ← 僅 Token APIs 需要
```

**服務分類**

| 服務類型 | common-patches | common-secrets-env | redis-secrets-env |
|---------|----------------|-------------------|-------------------|
| Token Admin API | ✅ | ✅ | ✅ |
| Token App API | ✅ | ✅ | ✅ |
| POS Backend | ✅ | ✅ | ❌ |
| POS Merchant | ✅ | ✅ | ❌ |

#### 🔧 常見操作

**1. 更新所有服務的資源限制**

```bash
# 編輯 base 配置
vim k8s/base/common-patches.yaml

# 修改 resources 部分
resources:
  requests:
    memory: "256Mi"  # 原 128Mi
    cpu: "200m"      # 原 100m

# 應用（所有服務自動生效）
cd k8s/overlays/staging
kubectl apply -k .
```

**2. 特定服務覆蓋 Base 配置**

在服務的 `deployment.yaml` 中直接定義即可，Kustomize 會自動合併：

```yaml
# k8s/services/my-service/deployment.yaml
spec:
  template:
    spec:
      containers:
      - name: my-service
        resources:
          limits:
            memory: "2Gi"  # 覆蓋 base 的 512Mi
```

#### ✅ 驗證配置

```bash
# 查看 token-admin-api 的最終配置
cd k8s/services/token-admin-api
kustomize build .

# 檢查是否包含 base 的配置
kustomize build . | grep -E "(imagePullSecrets|securityContext|DB_HOST|REDIS_HOST)"
```

#### 📊 對比示例

**沒有使用 Base（傳統方式）**

```yaml
# 每個服務都要重複這些配置
spec:
  template:
    spec:
      imagePullSecrets:          # ❌ 重複 4 次
        - name: ghcr-pull-secret
      securityContext:           # ❌ 重複 4 次
        fsGroup: 65534
      containers:
      - name: my-service
        imagePullPolicy: Always  # ❌ 重複 4 次
        resources:               # ❌ 重複 4 次
          requests:
            memory: "128Mi"
        env:                     # ❌ 重複 4 次
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: DB_HOST
```

**使用 Base（新方式）**

```yaml
# kustomization.yaml - 引用 base
patchesStrategicMerge:
  - ../../base/common-patches.yaml      # ✅ 一次定義
  - ../../base/common-secrets-env.yaml  # ✅ 所有服務共用

# deployment.yaml - 只需服務特定配置
spec:
  template:
    spec:
      containers:
      - name: my-service
        image: ghcr.io/passoncomtw/my-service:latest
        ports:
        - containerPort: 8080
        
        # 服務特定的 ConfigMap
        env:
        - name: APP_ENV
          valueFrom:
            configMapKeyRef:
              name: my-config
              key: APP_ENV
        
        # 共用配置自動應用（無需重複定義）
```

#### 💡 核心價值

| 指標 | 效果 |
|------|------|
| **代碼減少** | 每個服務節省 ~50 行 |
| **維護點** | 從 4 個文件 → 1 個文件 |
| **一致性** | 100% 保證 |
| **擴展性** | 新服務自動繼承 |

---

### 詳細說明

#### 📁 文件說明

**`common-patches.yaml`**

共用的基礎配置，應用到所有服務：

| 配置項 | 值 | 說明 |
|--------|-----|------|
| `imagePullSecrets` | `ghcr-pull-secret` | GHCR 鏡像拉取凭证 |
| `imagePullPolicy` | `Always` | 始終拉取最新鏡像 |
| `restartPolicy` | `Always` | Pod 重啟策略 |
| `fsGroup` | `65534` | Pod 安全策略 - 文件系統組 |
| `runAsNonRoot` | `true` | 容器必須以非 root 用戶運行 |
| `runAsUser` | `65534` | 容器運行用戶 ID (nobody) |
| `readOnlyRootFilesystem` | `true` | 只讀根文件系統 |
| `allowPrivilegeEscalation` | `false` | 禁止權限提升 |
| `capabilities.drop` | `ALL` | 刪除所有 Linux capabilities |
| `resources.requests` | `128Mi / 100m` | 資源請求（內存/CPU）|
| `resources.limits` | `512Mi / 500m` | 資源限制（內存/CPU）|

**`common-secrets-env.yaml`**

共用的 Secret 環境變量，應用到所有服務：

**Database Secret**
- `DB_HOST` - 數據庫主機
- `DB_PORT` - 數據庫端口
- `DB_USER` - 數據庫用戶
- `DB_PASSWORD` - 數據庫密碼
- `DB_NAME` - 數據庫名稱
- `DB_SSL_MODE` - SSL 模式

**JWT Secret**
- `JWT_SECRET` - JWT 簽名密鑰

**`redis-secrets-env.yaml`**

Redis Secret 環境變量，僅應用到 Token APIs：

- `REDIS_HOST` - Redis 主機
- `REDIS_PORT` - Redis 端口
- `REDIS_PASSWORD` - Redis 密碼
- `REDIS_DB` - Redis 數據庫編號

#### 🔧 使用方式

**1. 在服務中引用**

在每個服務的 `kustomization.yaml` 中：

```yaml
patchesStrategicMerge:
  - ../../base/common-patches.yaml       # 所有服務都需要
  - ../../base/common-secrets-env.yaml   # 所有服務都需要
  - ../../base/redis-secrets-env.yaml    # 僅 Token APIs 需要
```

**2. 服務分類**

**Token APIs（使用所有 patches）**
- `token-admin-api`
- `token-app-api`

```yaml
patchesStrategicMerge:
  - ../../base/common-patches.yaml
  - ../../base/common-secrets-env.yaml
  - ../../base/redis-secrets-env.yaml  # ✅ 使用 Redis
```

**POS Services（不使用 Redis）**
- `pos-backend-service`
- `pos-merchant-service`

```yaml
patchesStrategicMerge:
  - ../../base/common-patches.yaml
  - ../../base/common-secrets-env.yaml
  # ❌ 不使用 redis-secrets-env.yaml
```

#### ✨ 優勢

**1. DRY 原則（Don't Repeat Yourself）**
- ✅ 共用配置只定義一次
- ✅ 修改一處，所有服務生效
- ✅ 減少配置冗餘

**2. 一致性**
- ✅ 所有服務使用相同的安全設置
- ✅ 統一的資源限制
- ✅ 標準化的 Secret 引用

**3. 易維護**
- ✅ 更新安全策略只需修改一個文件
- ✅ 調整資源限制統一生效
- ✅ 新增服務可直接使用 base patches

**4. 靈活性**
- ✅ 服務可以覆蓋 base 中的配置
- ✅ 可選擇性應用 patches（如 Redis）
- ✅ 保持服務特定配置的獨立性

#### 🔄 配置覆蓋

**如何覆蓋 Base 配置？**

如果某個服務需要不同的配置，可以在服務的 `deployment.yaml` 中定義，Kustomize 會自動合併：

**示例：增加特定服務的資源限制**

```yaml
# k8s/services/high-memory-service/deployment.yaml
spec:
  template:
    spec:
      containers:
      - name: high-memory-service
        resources:
          requests:
            memory: "256Mi"  # 覆蓋 base 的 128Mi
            cpu: "200m"      # 覆蓋 base 的 100m
          limits:
            memory: "2Gi"    # 覆蓋 base 的 512Mi
            cpu: "2000m"     # 覆蓋 base 的 500m
```

Kustomize 會自動合併，最終結果：
- ✅ 資源限制使用服務特定的值（已覆蓋）
- ✅ 安全設置使用 base 的值（未覆蓋）
- ✅ imagePullSecrets 使用 base 的值（未覆蓋）

#### 📊 配置對比

**使用 Base Patches 前後對比**

**Before（每個服務重複定義）**

```yaml
# token-admin-api/deployment.yaml
spec:
  template:
    spec:
      imagePullSecrets:
        - name: ghcr-pull-secret    # ❌ 重複
      securityContext:
        fsGroup: 65534              # ❌ 重複
      containers:
      - name: token-admin-api
        imagePullPolicy: Always     # ❌ 重複
        resources:                  # ❌ 重複
          requests:
            memory: "128Mi"
            cpu: "100m"
        securityContext:            # ❌ 重複
          runAsNonRoot: true
          runAsUser: 65534
        env:
        - name: DB_HOST             # ❌ 重複
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: DB_HOST
        # ... 更多重複配置
```

**問題**：
- 4 個服務 × 每個 50 行重複配置 = 200 行冗餘代碼
- 修改安全策略需要更新 4 個文件
- 容易出現不一致

**After（使用 Base Patches）**

```yaml
# token-admin-api/deployment.yaml（簡化後）
spec:
  template:
    spec:
      containers:
      - name: token-admin-api
        image: ghcr.io/passoncomtw/token-admin-api:placeholder
        ports:
        - name: http
          containerPort: 8080
        
        # 服務特定的 ConfigMap 環境變量
        env:
        - name: APP_ENV
          valueFrom:
            configMapKeyRef:
              name: admin-api-config
              key: APP_ENV
        
        # 健康檢查（服務特定）
        livenessProbe:
          httpGet:
            path: /health-check
            port: 8080
        
        # 共用配置通過 base patches 自動應用：
        # ✅ imagePullSecrets
        # ✅ securityContext
        # ✅ resources
        # ✅ DB/JWT/Redis secrets
```

**好處**：
- 每個服務的 deployment.yaml 減少 50% 代碼
- 共用配置集中管理
- 修改一次，所有服務生效

#### 🎯 最佳實踐

**1. 什麼應該放在 Base？**

✅ **應該放在 Base**：
- 安全設置（所有服務統一）
- 資源限制的默認值（可覆蓋）
- 共用的 Secret 引用（Database, JWT）
- imagePullSecrets（統一使用 GHCR）
- 標準化的 labels/annotations

❌ **不應該放在 Base**：
- 服務特定的端口
- 健康檢查路徑（各服務不同）
- ConfigMap 引用（服務特定）
- 副本數（可能不同）
- 服務特定的環境變量

**2. 如何決定是否共用？**

問自己三個問題：

1. **這個配置在所有服務中都相同嗎？**
   - 是 → 放 base
   - 否 → 放服務目錄

2. **這個配置需要統一管理嗎？**
   - 是 → 放 base
   - 否 → 放服務目錄

3. **這個配置是否關鍵到需要明確可見？**
   - 是 → 保留在服務 deployment.yaml
   - 否 → 可以只在 base

**3. 推薦的配置策略**

**選項 A：完全簡化**（推薦給熟悉 Kustomize 的團隊）
- 服務的 deployment.yaml 只包含服務特定配置
- 所有共用配置通過 base patches 應用
- **優點**：最小化重複，易維護
- **缺點**：需要理解 Kustomize 合併機制

**選項 B：保持完整**（推薦給需要清晰可見配置的團隊）
- 服務的 deployment.yaml 保持完整配置
- base patches 作為"保險"確保配置一致
- **優點**：配置一目了然，易理解
- **缺點**：有一定重複，但 Kustomize 會自動合併

**本項目採用**：選項 B（保持完整），因為：
- 配置更直觀，新人容易理解
- 查看單個服務時能看到完整配置
- base patches 作為"安全網"確保關鍵配置不被遺漏

#### 🧪 驗證配置

**查看最終合併後的配置**

```bash
# 構建單個服務的配置（不應用）
cd k8s/services/token-admin-api
kustomize build .

# 查看 Deployment
kustomize build . | grep -A 200 "kind: Deployment"

# 驗證 patches 是否正確應用
kustomize build . | grep -A 10 "securityContext"
kustomize build . | grep -A 10 "imagePullSecrets"
```

**驗證 Secrets 引用**

```bash
# 查看環境變量配置
kustomize build . | grep -A 50 "env:"

# 應該看到：
# - DB_HOST, DB_PORT, etc. (來自 common-secrets-env.yaml)
# - JWT_SECRET (來自 common-secrets-env.yaml)
# - REDIS_HOST, etc. (來自 redis-secrets-env.yaml，僅 Token APIs)
```

#### 📝 修改共用配置

**示例：更新所有服務的資源限制**

```bash
# 編輯 base 配置
vim k8s/base/common-patches.yaml

# 修改 resources 部分
resources:
  requests:
    memory: "256Mi"  # 從 128Mi 增加到 256Mi
    cpu: "200m"      # 從 100m 增加到 200m
  limits:
    memory: "1Gi"    # 從 512Mi 增加到 1Gi
    cpu: "1000m"     # 從 500m 增加到 1000m

# 應用更改（所有服務自動生效）
cd k8s/overlays/staging
kubectl apply -k .

# 驗證
kubectl get deployments -n passontw-services-staging -o yaml | grep -A 5 "resources:"
```

#### 🚨 故障排除

**問題 1：配置沒有生效**

**症狀**：修改了 base 配置但服務沒有更新

**原因**：可能服務的 `kustomization.yaml` 沒有引用 base patches

**解決**：
```bash
# 檢查服務的 kustomization.yaml
cat k8s/services/my-service/kustomization.yaml

# 確保包含：
patchesStrategicMerge:
  - ../../base/common-patches.yaml
```

**問題 2：Kustomize 構建失敗**

**症狀**：`kustomize build` 報錯

**常見原因**：
1. Base patches 的路徑錯誤
2. YAML 語法錯誤

**解決**：
```bash
# 驗證 YAML 語法
yamllint k8s/base/common-patches.yaml

# 測試構建
cd k8s/services/my-service
kustomize build . --enable-alpha-plugins
```

**問題 3：配置衝突**

**症狀**：部署後配置與預期不符

**原因**：服務的 deployment.yaml 和 base patch 有衝突

**解決**：Kustomize 的合併規則是服務配置優先，無需擔心衝突

#### 🎉 總結

**共用配置的好處**

| 方面 | 傳統方式 | 使用 Base Patches |
|------|---------|-------------------|
| **代碼重複** | 200+ 行重複 | 0 行重複 |
| **維護性** | 需要更新 4 個文件 | 只需更新 1 個文件 |
| **一致性** | 容易出現差異 | 保證一致 |
| **擴展性** | 添加服務需要複製配置 | 添加服務自動繼承 |
| **可讀性** | 配置分散 | 集中管理 |

**文件統計**

- **Base Patches**：3 個文件（~150 行）
- **節省代碼**：~200 行（每個服務節省 50 行）
- **維護點**：從 4 個文件減少到 1 個文件

---

## 命名空間管理

### 設計原則

本專案使用 Staging 環境進行開發和測試，遵循以下原則：

- **DRY 原則** - 單一配置文件，避免重複
- **簡單明確** - 專注於 Staging 環境，配置清晰
- **單一職責原則** - 配置定義規格，部署腳本執行部署

### 命名空間架構

| 環境 | 命名空間 | 用途 |
|------|----------|------|
| Staging | `passontw-services-staging` | 開發/測試環境 |

**命名規則：** `{project-name}-staging`

**注意：** 目前只使用 Staging 環境

### 部署到 Staging 環境

```bash
# 方式 1：使用 GitHub Actions（推薦）
git push origin develop    # → 自動部署到 staging

# 方式 2：手動部署
NAMESPACE="passontw-services-staging"

kubectl apply -f k8s/configmaps/ -n $NAMESPACE
kubectl apply -f k8s/deployments/ -n $NAMESPACE
kubectl apply -f k8s/services/ -n $NAMESPACE

# 方式 3：使用腳本
./k8s/scripts/deploy-all.sh
```

### Secrets 管理

**創建 Staging 環境的 Secrets：**

```bash
# Staging 環境
kubectl create secret generic database-secret \
  --from-literal=DB_HOST=your-db-host \
  --from-literal=DB_PORT=5432 \
  --from-literal=DB_USER=your_user \
  --from-literal=DB_PASSWORD=your_password \
  --from-literal=DB_NAME=token_services \
  --from-literal=DB_SSLMODE=disable \
  -n passontw-services-staging
```

### 常用命令

```bash
# 查看 Staging 命名空間的資源
kubectl get all -n passontw-services-staging

# 設置預設命名空間
kubectl config set-context --current --namespace=passontw-services-staging

# 查看所有 Pods
kubectl get pods -n passontw-services-staging
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
# 推送代碼觸發自動部署到 Staging
git push origin develop
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
| `cicd-admin-api.yaml` | Admin API 代碼變更 | develop→staging |
| `cicd-app-api.yaml` | App API 代碼變更 | develop→staging |

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

## SSL 證書管理（各自管理）

> 本專案管理 Backend APIs 的 SSL 證書和 Ingress 配置

### 🎯 架構設計

**各專案獨立管理原則：**
- ✅ 本專案管理：token-admin-api.passon.tw、token-app-api.passon.tw
- ✅ Web 專案管理：token-admin-web.passon.tw（在 passontw-web-services）
- ✅ cert-manager 自動申請和續期 Let's Encrypt 證書
- ✅ 微服務獨立性 - 各專案部署互不影響
- ✅ 避免跨專案依賴 - 前後端配置分離

### 📊 架構圖

```
┌─────────────────────────────────────────────────────────────┐
│ passontw-web-services/k8s/overlays/staging/ingress.yaml    │
│  Ingress: token-admin-web-ingress-staging                  │
│  └─ token-admin-web.passon.tw → token-admin-web-tls       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
              ┌─────────────────────────┐
              │   cert-manager          │
              │   ClusterIssuer:        │
              │   letsencrypt-prod      │
              └─────────────────────────┘
                            ↑
                            │
┌─────────────────────────────────────────────────────────────┐
│ passontw-backend-services/k8s/overlays/staging/ingress.yaml│
│  Ingress: token-backend-apis-ingress-staging               │
│  ├─ token-admin-api.passon.tw → token-admin-api-tls       │
│  └─ token-app-api.passon.tw   → token-app-api-tls         │
└─────────────────────────────────────────────────────────────┘

✅ 各專案獨立管理自己的 Ingress 和證書
✅ 使用不同的 Ingress 名稱，避免衝突
✅ cert-manager 自動為所有域名申請 Production 證書
```

### 🔐 證書管理策略

**本專案管理 Backend APIs 證書：**

```yaml
# passontw-backend-services/k8s/overlays/staging/ingress.yaml
tls:
- hosts:
  - token-admin-api.passon.tw
  secretName: token-admin-api-tls
- hosts:
  - token-app-api.passon.tw
  secretName: token-app-api-tls
```

**優點：**
- ✅ 各專案獨立部署，互不影響
- ✅ 前後端配置分離，職責清晰
- ✅ cert-manager 自動處理證書操作
- ✅ 符合微服務獨立性原則

### 🚀 新增服務流程

當需要新增服務時（例如：token-payment-api），只需 3 步驟：

#### 1. 部署服務
```bash
kubectl apply -f k8s/deployments/token-payment-api.yaml -n passontw-services-staging
kubectl apply -f k8s/services/token-payment-api-service.yaml -n passontw-services-staging
```

#### 2. 更新統一 Ingress
編輯 `k8s/overlays/staging/ingress.yaml`：

```yaml
spec:
  tls:
  # 添加新域名的 TLS 配置
  - hosts:
    - token-payment-api.passon.tw
    secretName: token-payment-api-tls
  
  rules:
  # 添加路由規則
  - host: token-payment-api.passon.tw
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: token-payment-api
            port:
              number: 80
```

#### 3. 應用配置
```bash
kubectl apply -f k8s/overlays/staging/ingress.yaml
```

**完成！** cert-manager 會在 2-3 分鐘內自動為新域名申請證書。

### 📋 證書狀態檢查

#### 查看所有證書
```bash
kubectl get certificate -n passontw-services-staging
```

**期望輸出（僅顯示本專案管理的證書）：**
```
NAME                  READY   SECRET                AGE
token-admin-api-tls   True    token-admin-api-tls   5d
token-app-api-tls     True    token-app-api-tls     5d
```

✅ **READY = True** 表示證書正常！

**注意：** token-admin-web-tls 在 passontw-web-services 專案中管理

#### 查看證書詳情
```bash
kubectl describe certificate <cert-name> -n passontw-services-staging
```

#### 查看後端 API 證書到期時間
```bash
for cert in token-admin-api-tls token-app-api-tls; do
  echo "=== $cert ==="
  kubectl get certificate $cert -n passontw-services-staging \
    -o jsonpath='{.status.notAfter}' | xargs -I {} echo "到期時間: {}"
  echo ""
done
```

### 🔄 證書生命週期

```
1. 部署 Ingress
   ↓
2. cert-manager 自動檢測 TLS 配置
   ↓
3. 創建 Certificate 資源
   ↓
4. 向 Let's Encrypt 發起 ACME Challenge
   ↓
5. Let's Encrypt 驗證域名所有權
   ↓
6. 簽發證書（2-3 分鐘）
   ↓
7. 存儲到 Kubernetes Secret
   ↓
8. Ingress 自動使用證書
   ↓
9. 到期前 30 天自動續期（90 天週期）
```

**您不需要手動操作任何證書！**

### 🔧 故障排除

#### 證書申請失敗

```bash
# 1. 查看詳細錯誤
kubectl describe certificate <cert-name> -n passontw-services-staging

# 2. 查看證書申請請求
kubectl get certificaterequest -n passontw-services-staging

# 3. 查看 ACME 驗證
kubectl get challenge -n passontw-services-staging

# 4. 查看 cert-manager 日誌
kubectl logs -n cert-manager -l app=cert-manager --tail=100
```

#### 強制重新簽發證書

```bash
# 刪除證書和 Secret
kubectl delete certificate <cert-name> -n passontw-services-staging
kubectl delete secret <cert-name> -n passontw-services-staging

# cert-manager 會自動重新申請（2-3 分鐘）
kubectl get certificate -n passontw-services-staging -w
```

#### 瀏覽器顯示不安全

**原因：** 瀏覽器快取

**解決：**
- Chrome/Edge: `Ctrl + Shift + R`
- Firefox: `Ctrl + F5`
- Safari: `Cmd + Option + R`
- 或重新啟動瀏覽器

### 🌐 驗證 SSL 證書

#### 瀏覽器驗證（後端 API）
1. 訪問 Swagger 文檔：
   - https://token-admin-api.passon.tw/swagger/index.html
   - https://token-app-api.passon.tw/swagger/index.html
2. 檢查地址欄左側的 🔒 鎖頭圖示
3. 點擊鎖頭 → 查看憑證
4. 確認：
   - ✅ 簽發者：Let's Encrypt
   - ✅ 有效期：90 天
   - ✅ 域名正確

#### 命令行驗證
```bash
# 使用 curl 測試
curl -vI https://token-admin-api.passon.tw/health-check

# 使用 openssl 檢查證書
echo | openssl s_client -servername token-admin-api.passon.tw \
  -connect token-admin-api.passon.tw:443 2>/dev/null | \
  openssl x509 -noout -issuer -dates
```

### 📝 維護清單

#### 日常檢查（每週）
- [ ] 所有證書 READY = True
- [ ] 所有服務可通過 HTTPS 訪問
- [ ] 瀏覽器顯示 🔒 鎖頭
- [ ] 證書有效期 > 30 天

**如果以上全部正常，無需任何操作！**

#### 證書自動更新
- Let's Encrypt 證書有效期：**90 天**
- cert-manager 自動續期時間：**到期前 30 天**
- **您不需要手動更新證書**

### 💡 核心原則

```
★ 專案獨立
  └─ 各專案管理自己的 Ingress（前後端分離）

★ 職責清晰
  └─ 本專案僅管理後端 API 的 SSL 證書

★ 自動化優先
  └─ cert-manager 自動處理證書

★ 簡單配置
  └─ 標準化所有後端 API 配置

★ 最小維護
  └─ 每週檢查一次，通常無需操作

結果：
├─ 5 分鐘完成初始設定
├─ 每週 1 分鐘檢查狀態
├─ 證書自動續期（90 天週期）
└─ 新增 API 只需 3 步驟
```

### 🔗 ClusterIssuer 配置

**Production 證書簽發者：**
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@passon.tw
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: traefik
```

**位置：** 通常已在集群層級配置，無需修改

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
- [統一 Ingress](./overlays/staging/ingress.yaml) - SSL 證書和路由管理

### 部署腳本
- [deploy-all.sh](./scripts/deploy-all.sh) - 部署所有服務
- [deploy-admin.sh](./scripts/deploy-admin.sh) - 部署 Admin API
- [deploy-app.sh](./scripts/deploy-app.sh) - 部署 App API
- [rollback.sh](./scripts/rollback.sh) - 回滾腳本

### 外部資源
- [Kubernetes 官方文檔](https://kubernetes.io/docs/)
- [kubectl 速查表](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [k3s 文檔](https://docs.k3s.io/)
- [cert-manager 文檔](https://cert-manager.io/docs/)
- [Let's Encrypt 文檔](https://letsencrypt.org/docs/)

---

**最後更新：** 2025-11-20  
**維護者：** DevOps Team

**快速開始：** 
1. 創建 Secrets → 2. 推送代碼到 develop → 3. 自動部署完成！

**SSL 管理：**
cert-manager 自動處理所有證書，您只需檢查證書狀態（每週 1 分鐘）
