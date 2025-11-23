# Kubernetes 配置结构说明

本文档说明 PassonTW Backend Services 的 Kubernetes 配置目录结构和使用方法。

## 📁 目录结构

```
k8s/
├── base/                               # 🆕 共用配置（Patches）
│   ├── common-patches.yaml             # 安全设置、资源限制
│   ├── common-secrets-env.yaml         # Database + JWT Secrets
│   ├── redis-secrets-env.yaml          # Redis Secrets（仅 Token APIs）
│   ├── kustomization.yaml              # Base 配置说明
│   └── README.md                       # 详细使用文档
│
├── services/                           # 各服务的专属配置
│   ├── token-admin-api/
│   │   ├── deployment.yaml             # Deployment 配置
│   │   ├── service.yaml                # Service 配置
│   │   ├── configmap.yaml              # ConfigMap 配置
│   │   └── kustomization.yaml          # Kustomize 配置
│   │
│   ├── token-app-api/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   └── kustomization.yaml
│   │
│   ├── pos-backend-service/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   └── kustomization.yaml
│   │
│   └── pos-merchant-service/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── configmap.yaml
│       └── kustomization.yaml
│
├── overlays/                           # 环境特定的覆盖配置
│   └── staging/
│       ├── namespace.yaml              # Namespace 定义
│       ├── ingress.yaml                # Ingress 路由 + HTTPS/TLS
│       └── kustomization.yaml          # 引用所有服务 + 环境配置
│
├── secrets/                            # Secret 示例文件（不提交到 git）
│   ├── database-secret.yaml.example
│   ├── jwt-secret.yaml.example
│   ├── redis-secret.yaml.example
│   └── ghcr-pull-secret.yaml.example
│
└── README.md                           # K8s 配置总览
```

---

## 🎯 设计理念

### 1. 共用配置（DRY 原则）
- **Base Patches**：所有服务共用的配置集中在 `k8s/base/`
- **自动应用**：通过 Kustomize 的 `patchesStrategicMerge` 自动应用
- **可覆盖**：服务可以覆盖 base 中的任何配置
- **节省代码**：每个服务减少 ~50 行重复配置

### 2. 服务隔离
- **每个服务有独立的目录** (`k8s/services/${service-name}/`)
- **自包含配置**：deployment, service, configmap 都在服务目录下
- **易于维护**：修改一个服务不影响其他服务

### 3. 环境覆盖
- **基础配置**：在服务目录中定义（如副本数、资源限制）
- **环境配置**：在 `overlays/staging/` 中覆盖（如镜像标签、副本数调整）
- **可扩展**：未来可添加 `overlays/production/`

### 4. 共享资源
- **Namespace**：在 `overlays/staging/namespace.yaml`
- **Ingress**：统一管理所有服务的路由和 HTTPS
- **Secrets**：跨服务共享（database, jwt, redis）

---

## 📦 服务配置说明

### Token Admin API (`k8s/services/token-admin-api/`)

**用途**：管理后台 API 服务

**配置**：
- **镜像**：`ghcr.io/passoncomtw/token-admin-api`
- **端口**：8080
- **域名**：`token-admin-api.passon.tw`
- **健康检查**：`/health-check`
- **ConfigMap**：
  - `APP_ENV`: staging
  - `APP_PORT`: 8080
  - `LOG_LEVEL`: info
  - `SWAGGER_BASE_DOMAIN`: token-admin-api.passon.tw

**依赖的 Secrets**：
- `database-secret`
- `jwt-secret`
- `redis-secret`
- `ghcr-pull-secret`

---

### Token App API (`k8s/services/token-app-api/`)

**用途**：App 用户 API 服务

**配置**：
- **镜像**：`ghcr.io/passoncomtw/token-app-api`
- **端口**：8080
- **域名**：`token-app-api.passon.tw`
- **健康检查**：`/health-check`

**依赖的 Secrets**：
- `database-secret`
- `jwt-secret`
- `redis-secret`
- `ghcr-pull-secret`

---

### POS Backend Service (`k8s/services/pos-backend-service/`)

**用途**：POS 后端服务

**配置**：
- **镜像**：`ghcr.io/passoncomtw/pos-backend-service`
- **端口**：8080
- **域名**：`pos-backend-api.passon.tw`
- **健康检查**：`/health` + `/ready`
- **ConfigMap**：
  - `APP_ENV`: staging
  - `HTTP_PORT`: 8080
  - `LOG_LEVEL`: info
  - `SWAGGER_BASE_DOMAIN`: pos-backend-api.passon.tw

**依赖的 Secrets**：
- `database-secret`
- `jwt-secret`
- `ghcr-pull-secret`

---

### POS Merchant Service (`k8s/services/pos-merchant-service/`)

**用途**：POS 商户服务

**配置**：
- **镜像**：`ghcr.io/passoncomtw/pos-merchant-service`
- **端口**：8080
- **域名**：`pos-merchant-api.passon.tw`
- **健康检查**：`/health` + `/ready`
- **ConfigMap**：
  - `APP_ENV`: staging
  - `HTTP_PORT`: 8080
  - `LOG_LEVEL`: info
  - `LOG_DEVELOPMENT`: false
  - `LOG_ENCODING`: json
  - `SWAGGER_BASE_DOMAIN`: pos-merchant-api.passon.tw

**依赖的 Secrets**：
- `database-secret`
- `jwt-secret`
- `ghcr-pull-secret`

---

## 🚀 部署方式

### 方式 1：通过 CI/CD 自动部署（推荐）

当推送代码到 `develop` 分支时，GitHub Actions 自动触发：

```yaml
# 触发路径示例（.github/workflows/cicd-token-admin-api.yaml）
paths:
  - 'cmd/token-admin-api/**'
  - 'k8s/services/token-admin-api/**'
  - 'k8s/overlays/**'
```

**部署流程**：
1. Ubuntu runner 编译并推送 Docker 镜像到 GHCR
2. Mac mini runner 更新 Kustomize 镜像标签
3. 应用配置到 Kubernetes
4. 等待部署完成（5 分钟超时）
5. 验证 Pod 健康状态
6. 失败时自动回滚

---

### 方式 2：手动部署

#### 部署单个服务

```bash
# 进入 staging overlay 目录
cd k8s/overlays/staging

# 更新特定服务的镜像标签
kustomize edit set image \
  ghcr.io/passoncomtw/token-admin-api=ghcr.io/passoncomtw/token-admin-api:develop-abc1234

# 应用配置
kubectl apply -k .

# 等待部署完成
kubectl rollout status deployment/token-admin-api -n passontw-services-staging
```

#### 部署所有服务

```bash
cd k8s/overlays/staging

# 应用所有配置
kubectl apply -k .

# 查看所有 Pods
kubectl get pods -n passontw-services-staging

# 查看所有 Services
kubectl get svc -n passontw-services-staging
```

---

## 🔧 修改配置

### 修改服务的 ConfigMap

```bash
# 编辑服务的 configmap.yaml
vim k8s/services/token-admin-api/configmap.yaml

# 应用更改
cd k8s/overlays/staging
kubectl apply -k .

# 重启 Pods 使配置生效
kubectl rollout restart deployment/token-admin-api -n passontw-services-staging
```

### 调整资源限制

```bash
# 编辑服务的 deployment.yaml
vim k8s/services/token-admin-api/deployment.yaml

# 修改 resources 部分
resources:
  requests:
    memory: "256Mi"  # 原 128Mi
    cpu: "200m"      # 原 100m
  limits:
    memory: "1Gi"    # 原 512Mi
    cpu: "1000m"     # 原 500m

# 应用更改
cd k8s/overlays/staging
kubectl apply -k .
```

### 调整副本数

有两种方式：

**方式 1：修改 overlay 的 patch**（推荐，环境特定）

```bash
# 编辑 k8s/overlays/staging/kustomization.yaml
vim k8s/overlays/staging/kustomization.yaml

# 修改对应服务的 replicas 值
patches:
  - patch: |-
      - op: replace
        path: /spec/replicas
        value: 3  # 原 2
    target:
      kind: Deployment
      name: token-admin-api

# 应用更改
kubectl apply -k .
```

**方式 2：直接修改 deployment.yaml**（基础配置）

```bash
# 编辑服务的 deployment.yaml
vim k8s/services/token-admin-api/deployment.yaml

# 修改 spec.replicas
spec:
  replicas: 3  # 原 2

# 应用更改
cd k8s/overlays/staging
kubectl apply -k .
```

---

## 🌐 Ingress 和 HTTPS

### 路由配置

所有服务的路由在 `k8s/overlays/staging/ingress.yaml` 中统一管理：

```yaml
rules:
  # Token Admin API
  - host: token-admin-api.passon.tw
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: token-admin-api
            port:
              number: 80
  
  # Token App API
  - host: token-app-api.passon.tw
    ...
  
  # POS Backend Service
  - host: pos-backend-api.passon.tw
    ...
  
  # POS Merchant Service
  - host: pos-merchant-api.passon.tw
    ...
```

### HTTPS/TLS 自动化

使用 **cert-manager + Let's Encrypt** 自动生成和续期证书：

```yaml
tls:
  - hosts:
    - token-admin-api.passon.tw
    secretName: token-admin-api-tls  # 自动创建
  - hosts:
    - token-app-api.passon.tw
    secretName: token-app-api-tls
  # ... 其他服务
```

**特性**：
- ✅ 自动生成 Let's Encrypt 证书
- ✅ 强制 HTTPS 重定向
- ✅ HSTS 安全标头
- ✅ 证书自动续期

### 添加新域名

```bash
# 1. 编辑 ingress.yaml
vim k8s/overlays/staging/ingress.yaml

# 2. 添加 TLS 配置
tls:
  - hosts:
    - new-service.passon.tw
    secretName: new-service-tls

# 3. 添加路由规则
rules:
  - host: new-service.passon.tw
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: new-service
            port:
              number: 80

# 4. 应用更改
kubectl apply -k .

# 5. 查看证书状态
kubectl get certificate -n passontw-services-staging
```

---

## 🔐 Secrets 管理

### 创建 Secrets

```bash
# 1. 复制示例文件
cp k8s/secrets/database-secret.yaml.example k8s/secrets/database-secret.yaml
cp k8s/secrets/jwt-secret.yaml.example k8s/secrets/jwt-secret.yaml
cp k8s/secrets/redis-secret.yaml.example k8s/secrets/redis-secret.yaml

# 2. 编辑并填入实际值（base64 编码）
vim k8s/secrets/database-secret.yaml

# 3. 应用到 Kubernetes
kubectl apply -f k8s/secrets/database-secret.yaml
kubectl apply -f k8s/secrets/jwt-secret.yaml
kubectl apply -f k8s/secrets/redis-secret.yaml

# 注意：这些文件已在 .gitignore 中，不会提交到 git
```

### GHCR Pull Secret

```bash
# 创建 GHCR 拉取镜像的 Secret
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=<GITHUB_USERNAME> \
  --docker-password=<GITHUB_PAT> \
  --namespace=passontw-services-staging
```

---

## 📊 监控和调试

### 查看 Pods 状态

```bash
# 所有服务
kubectl get pods -n passontw-services-staging

# 特定服务
kubectl get pods -n passontw-services-staging -l app=token-admin-api

# 详细信息
kubectl describe pod <POD_NAME> -n passontw-services-staging
```

### 查看日志

```bash
# 实时日志
kubectl logs -f <POD_NAME> -n passontw-services-staging

# 最近 100 行
kubectl logs <POD_NAME> -n passontw-services-staging --tail=100

# 所有 Pod 日志（使用 label selector）
kubectl logs -l app=token-admin-api -n passontw-services-staging --tail=50
```

### 查看部署历史

```bash
# 查看 rollout 历史
kubectl rollout history deployment/token-admin-api -n passontw-services-staging

# 查看特定 revision
kubectl rollout history deployment/token-admin-api -n passontw-services-staging --revision=2
```

### 手动回滚

```bash
# 回滚到上一个版本
kubectl rollout undo deployment/token-admin-api -n passontw-services-staging

# 回滚到特定版本
kubectl rollout undo deployment/token-admin-api -n passontw-services-staging --to-revision=3

# 查看回滚状态
kubectl rollout status deployment/token-admin-api -n passontw-services-staging
```

### 进入 Pod 调试

```bash
# 进入 Pod shell（如果有 shell）
kubectl exec -it <POD_NAME> -n passontw-services-staging -- /bin/sh

# 运行单个命令
kubectl exec <POD_NAME> -n passontw-services-staging -- env

# 注意：scratch 镜像没有 shell，需要使用 ephemeral containers 或查看日志
```

### 查看 Events

```bash
# 查看 namespace 的所有 events
kubectl get events -n passontw-services-staging --sort-by='.lastTimestamp'

# 查看特定 Pod 的 events
kubectl describe pod <POD_NAME> -n passontw-services-staging | grep -A 10 Events
```

---

## ✅ 验证清单

部署后检查：

```bash
# 1. Pod 状态
kubectl get pods -n passontw-services-staging
# 期望：所有 Pods 处于 Running 状态，READY 为 1/1

# 2. Service 状态
kubectl get svc -n passontw-services-staging
# 期望：所有 Services 存在，TYPE 为 ClusterIP

# 3. Ingress 状态
kubectl get ingress -n passontw-services-staging
# 期望：所有域名都有 ADDRESS

# 4. Certificate 状态
kubectl get certificate -n passontw-services-staging
# 期望：所有证书 READY 为 True

# 5. 健康检查
curl https://token-admin-api.passon.tw/health-check
curl https://token-app-api.passon.tw/health-check
curl https://pos-backend-api.passon.tw/health
curl https://pos-merchant-api.passon.tw/health

# 6. Swagger 文档
open https://token-admin-api.passon.tw/swagger/
open https://token-app-api.passon.tw/swagger/
open https://pos-backend-api.passon.tw/swagger/
open https://pos-merchant-api.passon.tw/swagger/
```

---

## 🎉 总结

### 架构优势

✅ **服务隔离**：每个服务独立配置，互不影响  
✅ **易于维护**：修改一个服务不需要了解其他服务  
✅ **环境分离**：基础配置 + 环境覆盖，清晰明确  
✅ **自动化**：CI/CD 自动部署，HTTPS 自动管理  
✅ **可扩展**：易于添加新服务或新环境  
✅ **高可用**：2 副本 + 滚动更新 + 健康检查  
✅ **安全**：非 root 用户 + 只读文件系统 + Secrets 管理  

### 目录对照

| 旧结构 | 新结构 | 说明 |
|--------|--------|------|
| `k8s/base/*.yaml` | `k8s/services/*/` | 每个服务独立目录 |
| `k8s/base/kustomization.yaml` | `k8s/services/*/kustomization.yaml` | 每个服务自己的 kustomization |
| `k8s/overlays/staging/` | `k8s/overlays/staging/` | 统一引用所有服务 |

### 快速参考

```bash
# 部署所有服务
kubectl apply -k k8s/overlays/staging

# 查看所有资源
kubectl get all -n passontw-services-staging

# 查看特定服务
kubectl get all -n passontw-services-staging -l app=token-admin-api

# 更新镜像标签（CI/CD 自动执行）
cd k8s/overlays/staging
kustomize edit set image ghcr.io/passoncomtw/token-admin-api=ghcr.io/passoncomtw/token-admin-api:develop-abc1234
kubectl apply -k .

# 回滚
kubectl rollout undo deployment/token-admin-api -n passontw-services-staging
```

---

**最后更新**：2024年（重构为服务隔离结构）

**维护者**：PassonTW Backend Team

