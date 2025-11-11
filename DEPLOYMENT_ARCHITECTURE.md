# 🏗️ Token Services 部署架構

## 📊 架構概覽

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

## 🔄 CI/CD 流程

```
┌─────────────┐
│   GitHub    │
│ Repository  │
└──────┬──────┘
       │
       │ 1. git push
       ▼
┌─────────────────────────────────────┐
│   GitHub Actions                    │
│   ┌─────────────────────────────┐  │
│   │ Build Token Admin API       │  │
│   │ - Configure Docker          │  │
│   │ - Build image               │  │
│   │ - Push to GHCR              │  │
│   └───────────┬─────────────────┘  │
└───────────────┼─────────────────────┘
                │
                │ 2. Build success
                ▼
┌─────────────────────────────────────┐
│   GitHub Container Registry (GHCR)  │
│   ghcr.io/passontw/token-admin-api  │
│   ghcr.io/passontw/token-app-api    │
└───────────────┬─────────────────────┘
                │
                │ 3. Deploy trigger
                ▼
┌─────────────────────────────────────┐
│   GitHub Actions                    │
│   ┌─────────────────────────────┐  │
│   │ Deploy to Kubernetes        │  │
│   │ - Pull new image            │  │
│   │ - Apply manifests           │  │
│   │ - Rolling update            │  │
│   └───────────┬─────────────────┘  │
└───────────────┼─────────────────────┘
                │
                │ 4. kubectl apply
                ▼
┌─────────────────────────────────────┐
│   mac-mini-build (Runner)          │
│   - kubectl configured              │
│   - Connected to k3s                │
└───────────────┬─────────────────────┘
                │
                │ 5. Update deployment
                ▼
┌─────────────────────────────────────┐
│   k3s Cluster                       │
│   - Rolling update pods             │
│   - Health checks                   │
│   - Service routing                 │
└─────────────────────────────────────┘
```

## 🚀 快速開始

### 首次部署

```bash
# 1. 準備環境變數
export DB_HOST="your-db-host"
export DB_USER="your-db-user"
export DB_PASSWORD="your-db-password"
export DB_NAME="token_services"
export JWT_SECRET="your-jwt-secret"
export GHCR_USERNAME="passontw"
export GHCR_TOKEN="ghp_xxxx"

# 2. 建立 Secrets
cd /Users/tomaslin/Projects/golang-passontw-services/k8s
./scripts/create-secrets.sh

# 3. 部署所有服務
./scripts/deploy-all.sh

# 4. 驗證部署
kubectl get all -n passontw-services
```

### 日常更新

**自動部署（推薦）：**
```bash
# 推送程式碼到 GitHub
git push origin develop

# GitHub Actions 會自動：
# 1. 建置 Docker 映像
# 2. 推送到 GHCR
# 3. 部署到 Kubernetes
```

**手動部署：**
```bash
# 更新 Admin API
cd /Users/tomaslin/Projects/golang-passontw-services/k8s
./scripts/deploy-admin.sh

# 更新 App API
./scripts/deploy-app.sh
```

## 📁 目錄結構

```
golang-passontw-services/
├── .github/
│   └── workflows/
│       ├── build-token-admin-api.yml  # 建置 & 推送映像
│       └── deploy-to-k8s.yaml         # 部署到 Kubernetes
├── k8s/
│   ├── README.md                      # Kubernetes 概覽
│   ├── DEPLOYMENT_GUIDE.md            # 詳細部署指南
│   ├── namespace.yaml                 # 命名空間
│   ├── secrets/                       # Secret 範本
│   │   ├── database-secret.yaml.example
│   │   ├── jwt-secret.yaml.example
│   │   └── ghcr-pull-secret.yaml.example
│   ├── configmaps/                    # 配置
│   │   ├── admin-api-config.yaml
│   │   └── app-api-config.yaml
│   ├── deployments/                   # 部署
│   │   ├── token-admin-api.yaml
│   │   └── token-app-api.yaml
│   ├── services/                      # 服務
│   │   ├── token-admin-api-service.yaml
│   │   └── token-app-api-service.yaml
│   ├── ingress/                       # 入口
│   │   └── ingress.yaml
│   └── scripts/                       # 部署腳本
│       ├── create-secrets.sh          # 建立 Secrets
│       ├── deploy-all.sh              # 部署所有服務
│       ├── deploy-admin.sh            # 部署 Admin API
│       ├── deploy-app.sh              # 部署 App API
│       └── rollback.sh                # 回滾
├── cmd/
│   ├── token-admin-api/               # Admin API 程式碼
│   └── token-app-api/                 # App API 程式碼
├── deploy/
│   ├── token-admin-api/
│   │   └── Dockerfile                 # Admin API Dockerfile
│   └── token-app-api/
│       └── Dockerfile                 # App API Dockerfile
└── DEPLOYMENT_ARCHITECTURE.md         # 本文檔
```

## 🔐 安全配置

### Secrets 管理

**資料庫憑證**：
- 存儲在 Kubernetes Secret: `database-secret`
- 注入為環境變數到 Pod
- 不要提交到 Git

**JWT 密鑰**：
- 存儲在 Kubernetes Secret: `jwt-secret`
- 至少 32 字符
- 定期輪換

**GHCR 認證**：
- 存儲在 Kubernetes Secret: `ghcr-pull-secret`
- 用於拉取私有映像
- 使用 Personal Access Token

### 最小權限原則

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 65534
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL
```

## 📊 資源配置

### 預設配置

**Requests（保證資源）：**
- CPU: 100m
- Memory: 128Mi

**Limits（最大資源）：**
- CPU: 500m
- Memory: 512Mi

### 副本數

- **開發環境**: 1 副本
- **生產環境**: 2+ 副本

### 自動擴展（可選）

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: token-admin-api
  namespace: passontw-services
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: token-admin-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 🔍 監控與健康檢查

### Liveness Probe

檢查應用是否還活著（如果失敗，Kubernetes 會重啟 Pod）：

```yaml
livenessProbe:
  httpGet:
    path: /health-check
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Readiness Probe

檢查應用是否準備好接受流量：

```yaml
readinessProbe:
  httpGet:
    path: /health-check
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

## 🌐 網路配置

### 服務類型

- **ClusterIP**: 內部訪問（預設）
- **NodePort**: 外部訪問（指定端口）
- **LoadBalancer**: 雲端負載均衡器
- **Ingress**: HTTP(S) 路由

### Ingress 配置

```yaml
spec:
  rules:
  - host: admin-api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: token-admin-api
            port:
              number: 8080
```

## 📈 擴展策略

### 水平擴展（增加 Pod 數量）

```bash
# 手動擴展
kubectl scale deployment/token-admin-api --replicas=5 -n passontw-services

# 自動擴展（HPA）
kubectl autoscale deployment token-admin-api \
  --min=2 --max=10 --cpu-percent=70 \
  -n passontw-services
```

### 垂直擴展（增加資源）

編輯 deployment.yaml 中的 resources：

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

## 🔄 滾動更新策略

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # 最多多出 1 個 Pod
    maxUnavailable: 0   # 確保零停機時間
```

**更新流程：**
1. 建立新版本的 Pod
2. 等待新 Pod 就緒
3. 將流量路由到新 Pod
4. 終止舊 Pod
5. 重複直到所有 Pod 更新完成

## 🛠️ 故障排除

### 常用命令

```bash
# 查看 Pod 狀態
kubectl get pods -n passontw-services

# 查看 Pod 日誌
kubectl logs -f -n passontw-services <pod-name>

# 查看 Pod 詳情
kubectl describe pod -n passontw-services <pod-name>

# 查看事件
kubectl get events -n passontw-services --sort-by='.lastTimestamp'

# 進入 Pod
kubectl exec -it -n passontw-services <pod-name> -- sh

# 回滾部署
kubectl rollout undo deployment/token-admin-api -n passontw-services
```

## 📚 相關文檔

- [Kubernetes 部署指南](k8s/DEPLOYMENT_GUIDE.md)
- [Kubernetes 配置概覽](k8s/README.md)
- [GitHub Actions Workflows](.github/workflows/)

## 🎯 最佳實踐總結

✅ **使用 ConfigMaps 和 Secrets** 管理配置  
✅ **設定資源限制** 防止資源耗盡  
✅ **配置健康檢查** 確保服務可用性  
✅ **使用滾動更新** 實現零停機部署  
✅ **運行多個副本** 提供高可用性  
✅ **實施自動化部署** 提高效率  
✅ **監控和日誌** 及時發現問題  
✅ **定期備份** 資料和配置  
✅ **安全第一** 最小權限和加密  
✅ **文檔完整** 便於維護和交接

---

**最後更新**: 2025-11-09  
**維護者**: DevOps Team  
**版本**: 1.0.0

