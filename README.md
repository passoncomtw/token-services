# 🚀 PassOnTW Backend Services

> 基於 Go + Fiber + PostgreSQL 的後端服務，採用 Kubernetes + CI/CD 自動化部署

## 📋 目錄

- [快速開始](#-快速開始)
  - [遷移現有部署](#遷移現有部署到新-cicd-架構)
  - [全新部署](#全新部署)
- [部署驗證](#-部署驗證)
- [架構說明](#-架構說明)
- [CI/CD 工作流](#-cicd-工作流)
- [日常操作](#-日常操作)
- [故障排除](#-故障排除)
- [Longhorn 存儲系統](#-longhorn-存儲系統)
- [安全配置](#-安全配置)
- [相關文檔](#-相關文檔)

---

## ⚡ 快速開始

### 遷移現有部署到新 CI/CD 架構

如果您的 Pods 處於 `ImagePullBackOff` 狀態或需要從舊架構遷移：

#### 步驟 1：執行遷移腳本（2 分鐘）

```bash
./scripts/migrate-to-cicd.sh
```

**腳本會引導您：**
1. 選擇環境（Staging / Production / 兩者）
2. 輸入 GitHub 憑證（[獲取 Token](https://github.com/settings/tokens)，需要 `read:packages` 權限）
3. 輸入資料庫連接資訊
4. 自動創建所有必要的 Secrets
5. 清理舊部署並驗證設置

#### 步驟 2：觸發部署（30 秒）

```bash
# 推送代碼自動部署到 Staging
git push origin develop

# 或手動觸發
gh workflow run "CI/CD - Admin API" -f environment=staging
gh workflow run "CI/CD - App API" -f environment=staging
```

#### 步驟 3：驗證部署（1 分鐘）

```bash
# 監控部署進度
kubectl get pods -n passontw-services-staging -w
```

**等待 Pods 狀態變為 `Running` ✅**

---

### 全新部署

#### 前置條件

- ✅ k3s 集群已設置並運行
- ✅ kubectl 已安裝並配置
- ✅ PostgreSQL 資料庫已設置
- ✅ GitHub Personal Access Token 已建立

#### 部署步驟

**1. 創建 Kubernetes Secrets**

選擇自動或手動方式：

**方式 A：自動創建（推薦）**

```bash
./scripts/migrate-to-cicd.sh
```

**方式 B：手動創建**

```bash
NAMESPACE="passontw-services-staging"

# 1. GitHub Container Registry Secret
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN \
  -n $NAMESPACE

# 2. 資料庫 Secret
kubectl create secret generic database-secret \
  --from-literal=DB_HOST=your-db-host \
  --from-literal=DB_PORT=5432 \
  --from-literal=DB_USER=your-db-user \
  --from-literal=DB_PASSWORD=your-db-password \
  --from-literal=DB_NAME=token_services \
  --from-literal=DB_SSLMODE=disable \
  -n $NAMESPACE

# 3. JWT Secret
kubectl create secret generic jwt-secret \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  -n $NAMESPACE
```

**2. 觸發部署**

```bash
# 推送代碼自動部署
git push origin develop

# 或手動觸發工作流
gh workflow run "CI/CD - Admin API" -f environment=staging
gh workflow run "CI/CD - App API" -f environment=staging
```

**3. 驗證部署**

```bash
# 查看 Pods 狀態
kubectl get pods -n passontw-services-staging

# 查看服務日誌
kubectl logs -f deployment/token-admin-api -n passontw-services-staging
kubectl logs -f deployment/token-app-api -n passontw-services-staging

# 測試健康檢查
kubectl exec -it deployment/token-admin-api -n passontw-services-staging -- \
  curl localhost:8080/health
```

---

## ✅ 部署驗證

### 驗證部署成功

部署完成後，使用以下方法驗證服務狀態：

#### 1. 檢查 Pod 狀態

```bash
kubectl get pods -n passontw-services-staging
```

期望輸出：
```
NAME                               READY   STATUS    RESTARTS   AGE
token-admin-api-xxx-xxx            1/1     Running   0          2m
token-admin-api-xxx-yyy            1/1     Running   0          2m
token-app-api-xxx-xxx              1/1     Running   0          2m
token-app-api-xxx-yyy              1/1     Running   0          2m
```

✅ **所有 Pods 應該是 Running 狀態，READY 為 1/1**

#### 2. API 健康檢查

```bash
# 使用臨時 Pod 測試 Admin API
kubectl run curl-test --rm -i --image=curlimages/curl --restart=Never \
  -n passontw-services-staging -- curl -s http://token-admin-api:8080/health-check
```

期望響應：
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "service": "sk-demo",
    "status": "ok"
  },
  "code": "SUCCESS"
}
```

#### 3. 查看資源使用

```bash
kubectl top pods -n passontw-services-staging
```

典型輸出：
```
NAME                              CPU(cores)   MEMORY(bytes)
token-admin-api-xxx-xxx           1m           14Mi
token-admin-api-xxx-yyy           1m           13Mi
```

**資源使用應該在合理範圍內**：
- CPU: < 5m（正常待機）
- Memory: 10-50Mi（正常範圍）

#### 4. 檢查服務配置

```bash
# 查看 Secrets
kubectl get secrets -n passontw-services-staging

# 應該看到：
# ghcr-pull-secret    kubernetes.io/dockerconfigjson
# database-secret     Opaque
# jwt-secret          Opaque
```

```bash
# 查看 Deployment 配置
kubectl describe deployment token-admin-api -n passontw-services-staging
```

檢查項目：
- ✅ Image: `ghcr.io/passoncomtw/token-admin-api:develop`
- ✅ Replicas: 2/2
- ✅ Strategy: RollingUpdate
- ✅ Liveness Probe: Configured
- ✅ Readiness Probe: Configured

#### 5. 查看部署歷史

```bash
kubectl rollout history deployment/token-admin-api -n passontw-services-staging
```

#### 6. 實時日誌監控

```bash
# 查看實時日誌
kubectl logs -f deployment/token-admin-api -n passontw-services-staging

# 應該看到類似的健康檢查日誌：
# {"level":"info","ts":...,"msg":"Request completed","status":200,"method":"GET","path":"/health-check"}
```

### 驗證檢查清單

部署成功的標準：

- [ ] ✅ 所有 Pods 狀態為 Running
- [ ] ✅ READY 顯示 1/1
- [ ] ✅ 健康檢查返回 200 OK
- [ ] ✅ API 響應格式正確
- [ ] ✅ 資源使用在合理範圍
- [ ] ✅ 必要的 Secrets 已配置
- [ ] ✅ 日誌輸出正常
- [ ] ✅ 無錯誤或警告訊息

### 常見驗證問題

#### 問題 1：Pod 停留在 Pending 狀態

```bash
kubectl describe pod <pod-name> -n passontw-services-staging
```

**可能原因**：
- 資源不足（CPU/Memory）
- 節點不可用
- 存儲卷無法掛載

#### 問題 2：Pod 停留在 ContainerCreating

**可能原因**：
- 拉取映像失敗（檢查 ghcr-pull-secret）
- 存儲卷問題
- 網路問題

#### 問題 3：Pod 處於 CrashLoopBackOff

```bash
kubectl logs <pod-name> -n passontw-services-staging --previous
```

**可能原因**：
- 應用程式崩潰
- 配置錯誤
- 資料庫連接失敗

### 網路訪問驗證

#### 內部訪問（集群內）

```bash
# 完整域名
curl http://token-admin-api.passontw-services-staging.svc.cluster.local:8080/health-check

# 簡寫（同命名空間內）
curl http://token-admin-api:8080/health-check
```

#### 外部訪問（如果配置了 Ingress）

```bash
# 查看 Ingress 配置
kubectl get ingress -n passontw-services-staging

# 測試外部訪問
curl http://token-admin-api-staging.yourdomain.com/health-check
```

---

## 🏗️ 架構說明

### 系統架構

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    k3s Ingress (Traefik)                         │
│  ┌──────────────────┐          ┌──────────────────┐            │
│  │  admin-api.*     │          │  app-api.*       │            │
│  └────────┬─────────┘          └────────┬─────────┘            │
└───────────┼────────────────────────────┼─────────────────────────┘
            │                            │
            ▼                            ▼
┌───────────────────────┐    ┌───────────────────────┐
│ token-admin-api       │    │ token-app-api         │
│ ┌───────────────────┐ │    │ ┌───────────────────┐ │
│ │   Service         │ │    │ │   Service         │ │
│ │   ClusterIP:8080  │ │    │ │   ClusterIP:8080  │ │
│ └────────┬──────────┘ │    │ └────────┬──────────┘ │
│          │            │    │          │            │
│          ▼            │    │          ▼            │
│ ┌───────────────────┐ │    │ ┌───────────────────┐ │
│ │ Deployment        │ │    │ │ Deployment        │ │
│ │ Replicas: 2       │ │    │ │ Replicas: 2       │ │
│ │                   │ │    │ │                   │ │
│ │ ┌───┐     ┌───┐  │ │    │ │ ┌───┐     ┌───┐  │ │
│ │ │Pod│     │Pod│  │ │    │ │ │Pod│     │Pod│  │ │
│ │ └───┘     └───┘  │ │    │ │ └───┘     └───┘  │ │
│ └───────────────────┘ │    │ └───────────────────┘ │
└───────────┬───────────┘    └───────────┬───────────┘
            │                            │
            └──────────┬─────────────────┘
                       │
                       ▼
           ┌───────────────────────┐
           │   PostgreSQL          │
           │   Database            │
           └───────────────────────┘
```

### 目錄結構

```
passontw-backend-services/
├── .github/
│   └── workflows/
│       ├── cicd-admin-api.yaml       # Admin API CI/CD
│       ├── cicd-app-api.yaml         # App API CI/CD
│       └── README.md                 # CI/CD 文檔
├── cmd/
│   ├── token-admin-api/              # Admin API 程式碼
│   └── token-app-api/                # App API 程式碼
├── pkg/
│   ├── auth/                         # 認證相關
│   ├── config/                       # 配置管理
│   ├── database/                     # 資料庫相關
│   ├── middleware/                   # 中間件
│   ├── models/                       # 資料模型
│   └── response/                     # 回應處理
├── k8s/
│   ├── README.md                     # Kubernetes 文檔
│   ├── namespace.yaml                # 命名空間
│   ├── secrets/                      # Secret 範本
│   ├── configmaps/                   # 配置
│   ├── deployments/                  # 部署
│   ├── services/                     # 服務
│   ├── ingress/                      # 入口
│   └── scripts/                      # 部署腳本
├── deploy/
│   ├── token-admin-api/Dockerfile    # Admin API Dockerfile
│   └── token-app-api/Dockerfile      # App API Dockerfile
├── scripts/
│   └── migrate-to-cicd.sh            # 遷移腳本
└── README.md                         # 本文檔
```

---

## 🔄 CI/CD 工作流

### 自動化流程

```
┌─────────────┐
│   GitHub    │
│ Repository  │
└──────┬──────┘
       │
       │ 1. git push
       ▼
┌─────────────────────────────────────┐
│   GitHub Actions CI/CD              │
│   ┌─────────────────────────────┐  │
│   │ Build Stage                 │  │
│   │ - Configure Docker          │  │
│   │ - Build image (cached)      │  │
│   │ - Push to GHCR              │  │
│   └───────────┬─────────────────┘  │
│               ▼                     │
│   ┌─────────────────────────────┐  │
│   │ Deploy Stage                │  │
│   │ - Pull new image            │  │
│   │ - Apply manifests           │  │
│   │ - Rolling update            │  │
│   │ - Health check              │  │
│   │ - Auto rollback on failure  │  │
│   └───────────┬─────────────────┘  │
└───────────────┼─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│   k3s Cluster                       │
│   - Rolling update pods             │
│   - Health checks                   │
│   - Service routing                 │
└─────────────────────────────────────┘
```

### 工作流特性

| 功能 | 說明 |
|------|------|
| **自動觸發** | develop → staging<br>main → production |
| **構建加速** | 多層緩存策略，第二次起快 **3-5 倍** |
| **環境隔離** | staging / production 完全分離 |
| **自動回滾** | 部署失敗自動回滾到上一版本 |
| **健康檢查** | 自動驗證部署成功 |
| **手動觸發** | 支援手動觸發指定環境部署 |

### 觸發方式

**方式 1：自動觸發（推薦）**

```bash
# 推送到 develop 分支 → 自動部署到 staging
git push origin develop

# 推送到 main 分支 → 自動部署到 production
git push origin main
```

**方式 2：手動觸發**

```bash
# 使用 GitHub CLI
gh workflow run "CI/CD - Admin API" -f environment=staging
gh workflow run "CI/CD - App API" -f environment=production

# 或在 GitHub 網頁上：
# Actions → CI/CD - Admin API → Run workflow → 選擇環境
```

**方式 3：跳過構建直接部署**

```bash
# 適用於只修改了 k8s 配置的情況
gh workflow run "CI/CD - Admin API" -f skip_build=true
```

---

## 📖 日常操作

### 開發工作流

```bash
# 1. 創建功能分支
git checkout -b feature/new-feature

# 2. 開發和測試
# ... 編寫代碼 ...

# 3. 提交變更
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 4. 創建 Pull Request
gh pr create

# 5. 合併到 develop（自動部署到 staging）
gh pr merge

# 6. 測試通過後，合併到 main（自動部署到 production）
git checkout main
git pull
git merge develop
git push origin main
```

### 常用命令

**查看資源狀態**

```bash
# 所有資源
kubectl get all -n passontw-services-staging

# Pods
kubectl get pods -n passontw-services-staging -w

# Deployments
kubectl get deployments -n passontw-services-staging

# Services
kubectl get services -n passontw-services-staging
```

**查看日誌**

```bash
# 實時日誌
kubectl logs -f deployment/token-admin-api -n passontw-services-staging

# 最近 100 行
kubectl logs --tail=100 deployment/token-admin-api -n passontw-services-staging

# 所有 Pods 日誌
kubectl logs -f -l app=token-admin-api -n passontw-services-staging
```

**擴展服務**

```bash
# 手動擴展
kubectl scale deployment/token-admin-api --replicas=5 -n passontw-services-staging

# 自動擴展（HPA）
kubectl autoscale deployment token-admin-api \
  --min=2 --max=10 --cpu-percent=70 \
  -n passontw-services-staging
```

**更新部署**

```bash
# 重啟部署
kubectl rollout restart deployment/token-admin-api -n passontw-services-staging

# 查看滾動更新狀態
kubectl rollout status deployment/token-admin-api -n passontw-services-staging

# 查看部署歷史
kubectl rollout history deployment/token-admin-api -n passontw-services-staging
```

**回滾部署**

```bash
# 回滾到上一版本
kubectl rollout undo deployment/token-admin-api -n passontw-services-staging

# 回滾到指定版本
kubectl rollout undo deployment/token-admin-api --to-revision=3 -n passontw-services-staging
```

---

## 🔧 故障排除

### 問題 1：Pods 處於 ImagePullBackOff 狀態

**診斷：**
```bash
kubectl describe pod <pod-name> -n passontw-services-staging
```

**解決方案：**
```bash
# 1. 檢查 Secret 是否存在
kubectl get secrets -n passontw-services-staging

# 2. 重新創建 Secret
kubectl delete secret ghcr-pull-secret -n passontw-services-staging
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_TOKEN \
  -n passontw-services-staging

# 3. 重啟 Pods
kubectl rollout restart deployment/token-admin-api -n passontw-services-staging
```

### 問題 2：資料庫連接失敗

**診斷：**
```bash
kubectl logs deployment/token-admin-api -n passontw-services-staging | grep -i database
```

**解決方案：**
```bash
# 1. 檢查資料庫 Secret
kubectl describe secret database-secret -n passontw-services-staging

# 2. 測試資料庫連接
kubectl run psql-test --rm -it --image=postgres:15 \
  --env="PGPASSWORD=your_password" \
  -n passontw-services-staging \
  -- psql -h your-db-host -U your-db-user -d token_services

# 3. 更新 Secret（如果配置錯誤）
kubectl delete secret database-secret -n passontw-services-staging
kubectl create secret generic database-secret \
  --from-literal=DB_HOST=correct-db-host \
  --from-literal=DB_PORT=5432 \
  --from-literal=DB_USER=correct-user \
  --from-literal=DB_PASSWORD=correct-password \
  --from-literal=DB_NAME=token_services \
  --from-literal=DB_SSLMODE=disable \
  -n passontw-services-staging

# 4. 重啟 Pods
kubectl rollout restart deployment/token-admin-api -n passontw-services-staging
```

### 問題 3：CI/CD 工作流未觸發

**檢查：**
```bash
# 查看最近的工作流執行
gh run list --workflow="CI/CD - Admin API"

# 查看詳細日誌
gh run view <run-id> --log
```

**常見原因：**
- ✅ 檢查是否修改了正確的路徑（`cmd/token-admin-api/**` 或 `pkg/**`）
- ✅ 確認推送到正確的分支（develop / main）
- ✅ 檢查 GitHub Secrets 是否配置正確

**手動觸發：**
```bash
gh workflow run "CI/CD - Admin API" -f environment=staging
```

### 問題 4：Pod 無法啟動

**診斷：**
```bash
# 查看 Pod 詳情
kubectl describe pod <pod-name> -n passontw-services-staging

# 查看事件
kubectl get events -n passontw-services-staging --sort-by='.lastTimestamp'

# 進入 Pod（如果可以）
kubectl exec -it <pod-name> -n passontw-services-staging -- sh
```

**常見原因：**
- 資源不足（CPU/Memory）
- 配置錯誤
- 健康檢查失敗
- 權限問題

### 問題 5：服務無法訪問

**診斷：**
```bash
# 檢查 Service 和 Endpoints
kubectl get svc -n passontw-services-staging
kubectl get endpoints -n passontw-services-staging

# 測試內部連接
kubectl run -it --rm curl-test \
  --image=curlimages/curl \
  --restart=Never \
  -n passontw-services-staging \
  -- curl -v http://token-admin-api:8080/health
```

---

## 💾 Longhorn 存儲系統

### 什麼是 Longhorn？

**Longhorn** 是 Kubernetes 的分布式塊存儲系統（由 Rancher/SUSE 開發），為您的有狀態服務提供持久化存儲。

**主要功能**：
- 🔄 為 Pods 提供持久化存儲
- 💾 自動備份和恢復
- 📊 數據複製和高可用
- 🔧 動態卷管理
- 🌐 跨節點數據分布

**簡單來說**：Longhorn 讓您的 PostgreSQL、Redis 等有狀態服務的數據可以持久化保存，即使 Pod 重啟也不會丟失數據。

### 為什麼有這麼多 Longhorn Pods？

如果您在集群中看到 18+ 個 Longhorn Pods，**這是完全正常的**！Longhorn 是分布式系統，需要多個組件協同工作。

#### Pod 數量組成

```
longhorn-system Pods 組成：
├── CSI 組件（8 個）- Kubernetes 存儲介面
│   ├── csi-attacher (1 個)
│   ├── csi-provisioner (1 個)
│   ├── csi-resizer (3 個，高可用)
│   └── csi-snapshotter (3 個，高可用)
│
├── 核心組件（6 個）- Longhorn 核心功能
│   ├── longhorn-manager (每節點 1 個)
│   ├── longhorn-csi-plugin (每節點 1 個)
│   ├── longhorn-driver-deployer (1 個)
│   └── longhorn-ui (1 個)
│
└── 引擎組件（4+ 個）- 數據引擎
    ├── engine-image (每節點 1 個)
    └── instance-manager (每節點 1 個)
```

#### Pod 數量計算

| 組件類型 | 數量公式 | 示例（2 節點集群） |
|---------|---------|-------------------|
| **DaemonSet（每節點）** | 節點數 × 4 | 2 × 4 = 8 Pod |
| **高可用組件** | 固定 6 個 | 6 Pod |
| **單例組件** | 固定 4 個 | 4 Pod |
| **總計** | - | **18 Pod** ✅ |

### Longhorn 的實際用途

#### 檢查 Longhorn 使用情況

```bash
# 查看 Longhorn 創建的存儲卷
kubectl get pv | grep longhorn

# 典型輸出：
# pvc-xxx  8Gi   RWO  Bound  postgresql/data-postgresql-0    longhorn
# pvc-yyy  2Gi   RWO  Bound  redis-cluster/redis-data-0      longhorn
```

#### 您的系統使用情況

Longhorn 通常用於：
- 📊 **PostgreSQL** - 8Gi 持久化數據存儲
- 🔴 **Redis Cluster** - 每個節點 2Gi（3 節點 = 6Gi）
- 💾 **其他有狀態服務** - 需要持久化的應用

### 訪問 Longhorn UI

Longhorn 提供了一個 Web UI 來管理存儲：

#### 方式 1：Port Forward（本地訪問）

```bash
kubectl port-forward -n longhorn-system svc/longhorn-frontend 8080:80

# 然後在瀏覽器訪問
http://localhost:8080
```

#### 方式 2：配置 Ingress（域名訪問）

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: longhorn-ingress
  namespace: longhorn-system
spec:
  rules:
  - host: longhorn.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: longhorn-frontend
            port:
              number: 80
```

### Longhorn 管理

#### 查看狀態

```bash
# 查看所有 Longhorn Pods
kubectl get pods -n longhorn-system

# 查看 Longhorn 卷
kubectl get pv | grep longhorn

# 查看資源使用
kubectl top pods -n longhorn-system
```

#### 資源使用

典型的 Longhorn 資源使用：

| 組件 | CPU | Memory | 備註 |
|------|-----|--------|------|
| Manager | 5-10m | 50-100Mi | 每節點 |
| CSI Plugin | 1-5m | 20-50Mi | 每節點 |
| Instance Manager | 1-5m | 50-100Mi | 每節點 |
| 其他組件 | < 5m | 20-50Mi | 單例 |

**總體來說，Longhorn 的資源佔用相對較低**（對於它提供的功能而言）。

### 是否需要 Longhorn？

#### 您需要 Longhorn 如果：

✅ 您有有狀態的應用（PostgreSQL、Redis、MySQL 等）  
✅ 需要數據持久化  
✅ 需要數據備份和恢復功能  
✅ 需要跨節點的存儲高可用  
✅ 需要動態擴展存儲容量  

#### 您可能不需要 Longhorn 如果：

❌ 所有應用都是無狀態的  
❌ 不需要數據持久化  
❌ 有其他存儲方案（NFS、Ceph、雲存儲等）  

### Longhorn 組件說明

#### CSI（Container Storage Interface）組件

**csi-attacher** - 將存儲卷附加到 Pod 所在的節點  
**csi-provisioner** - 動態創建存儲卷  
**csi-resizer** - 調整存儲卷大小（3 副本高可用）  
**csi-snapshotter** - 管理存儲卷快照（3 副本高可用）  

#### 核心管理組件

**longhorn-manager** - Longhorn 的核心管理器（每節點 1 個）
- 管理卷、副本、快照
- 監控存儲健康狀態
- 協調數據複製

**longhorn-csi-plugin** - CSI 驅動程序插件（每節點 1 個）
- 實現 CSI 標準的驅動程序
- 與 Kubernetes 存儲系統集成

**longhorn-ui** - Web 管理介面
- 可視化管理存儲卷、備份、快照

#### 引擎組件

**engine-image** - Longhorn 引擎映像（每節點 1 個）
- 包含 Longhorn 的數據引擎程序
- 用於實際的 I/O 操作

**instance-manager** - 管理引擎和副本實例（每節點 1 個）
- 管理該節點上的卷引擎進程
- 管理該節點上的副本進程

### 故障排除

#### 查看 Longhorn 日誌

```bash
# Manager 日誌
kubectl logs -n longhorn-system deployment/longhorn-manager

# UI 日誌
kubectl logs -n longhorn-system deployment/longhorn-ui
```

#### 常見問題

**問題 1：存儲卷無法創建**
- 檢查節點存儲空間是否充足
- 查看 longhorn-manager 日誌

**問題 2：Pod 無法掛載卷**
- 檢查 CSI 組件狀態
- 查看 longhorn-csi-plugin 日誌

**問題 3：性能問題**
- 檢查網路延遲
- 查看磁盤 I/O 性能
- 調整副本數量

### 總結

- ✅ **Longhorn Pod 數量是正常的** - 分布式系統需要多個組件
- ✅ **資源使用合理** - 相對於提供的功能
- ✅ **提供重要功能** - PostgreSQL、Redis 等的持久化存儲
- ✅ **保持運行** - 對於有狀態服務是必需的

---

## 🔐 安全配置

### Secrets 管理

| Secret | 用途 | 必需 |
|--------|------|------|
| `ghcr-pull-secret` | 拉取 Docker 映像 | ✅ |
| `database-secret` | 資料庫連接 | ✅ |
| `jwt-secret` | JWT 認證 | ✅ |

### 最佳實踐

✅ **最小權限原則** - 使用 `runAsNonRoot` 和 `readOnlyRootFilesystem`  
✅ **定期輪換密鑰** - 定期更新 JWT Secret 和資料庫密碼  
✅ **使用 HTTPS** - 生產環境必須使用 TLS  
✅ **網路隔離** - 使用 NetworkPolicy 限制 Pod 間通信  
✅ **審計日誌** - 啟用 Kubernetes 審計日誌  

---

## 📊 資源配置

### 預設配置

| 資源 | Requests | Limits |
|------|----------|--------|
| CPU | 100m | 500m |
| Memory | 128Mi | 512Mi |
| Replicas | 2 | - |

### 調整資源

編輯 `k8s/deployments/token-admin-api.yaml`：

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

應用變更：
```bash
kubectl apply -f k8s/deployments/token-admin-api.yaml
```

---

## 📚 相關文檔

### 內部文檔

- **[CI/CD 工作流詳細說明](.github/workflows/README.md)** - GitHub Actions 配置和優化
- **[Kubernetes 部署指南](k8s/README.md)** - Kubernetes 配置和管理
- **[日誌系統說明](pkg/logger/README.md)** - 日誌配置和使用

### 外部資源

- [Kubernetes 官方文檔](https://kubernetes.io/docs/)
- [GitHub Actions 文檔](https://docs.github.com/en/actions)
- [Fiber 框架文檔](https://docs.gofiber.io/)
- [PostgreSQL 文檔](https://www.postgresql.org/docs/)

---

## 🎯 最佳實踐

### 開發

✅ 遵循 **單一職責原則** - 每個函數/類別只做一件事  
✅ 使用 **有意義的命名** - 避免縮寫和模糊命名  
✅ **DRY 原則** - 避免重複程式碼  
✅ **編寫測試** - 保持高測試覆蓋率  
✅ **程式碼審查** - 所有變更都需要 PR 審查  

### 部署

✅ **使用 CI/CD** - 自動化構建和部署  
✅ **滾動更新** - 零停機部署  
✅ **健康檢查** - 配置 liveness 和 readiness probe  
✅ **資源限制** - 設定合理的資源 requests 和 limits  
✅ **監控告警** - 設置監控和告警機制  

### 維護

✅ **定期備份** - 資料庫和配置  
✅ **日誌管理** - 集中管理和分析日誌  
✅ **安全更新** - 及時更新依賴和基礎映像  
✅ **性能優化** - 定期檢查和優化性能  
✅ **文檔更新** - 保持文檔與代碼同步  

---

## 🤝 貢獻

歡迎貢獻！請遵循以下流程：

1. Fork 本倉庫
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 創建 Pull Request

### Commit 訊息規範

```
feat: 新功能
fix: 修復 Bug
docs: 文檔更新
style: 程式碼格式調整
refactor: 重構
test: 測試相關
chore: 其他雜項
```

---

## 📝 版本歷史

### v2.0.0 (2025-11-13)
- ✨ 整合 CI/CD 工作流（Build + Deploy）
- ⚡ 添加多層緩存策略，構建速度提升 3-5 倍
- 🏗️ 環境分離（staging / production）
- 🔄 自動回滾機制
- 📚 完整的文檔整合

### v1.0.0 (2025-11-09)
- 🎉 初始版本
- 基本的 Kubernetes 部署配置
- GitHub Actions 基礎工作流

---

## 📧 聯絡方式

- **項目維護者**: DevOps Team
- **文檔維護**: 持續更新
- **最後更新**: 2025-11-13

---

## 📄 授權

本項目採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 文件

---

**🚀 開始使用？執行遷移腳本：**

```bash
./scripts/migrate-to-cicd.sh
```

**📖 需要幫助？** 查看 [CI/CD 文檔](.github/workflows/README.md) 或 [Kubernetes 指南](k8s/README.md)

