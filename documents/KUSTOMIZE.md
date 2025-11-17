# Kustomize 部署指南

> **项目 Kubernetes 部署的统一配置管理方案（Staging 环境）**

本文档提供 Kustomize 的快速参考和完整指南，用于管理 Staging 环境的 Kubernetes 部署。

---

## 📑 目录

- [快速参考](#-快速参考)
- [目录结构](#-目录结构)
- [设计理念](#-设计理念)
- [使用方法](#-使用方法)
- [配置管理](#-配置管理)
- [CI/CD 集成](#-cicd-集成)
- [故障排查](#-故障排查)
- [参考资源](#-参考资源)

---

## ⚡ 快速参考

### 最常用命令

```bash
# 本地部署到 Staging
kubectl apply -k k8s/overlays/staging

# 使用交互式脚本
./scripts/kustomize-deploy-staging.sh develop-5a48c1c

# 预览配置
kubectl kustomize k8s/overlays/staging

# 查看差异
kubectl diff -k k8s/overlays/staging

# 验证部署
kubectl get all -n passontw-services-staging
```

### 设置镜像标签

```bash
cd k8s/overlays/staging
kustomize edit set image \
  ghcr.io/passontw/token-admin-api:develop-5a48c1c \
  ghcr.io/passontw/token-app-api:develop-5a48c1c
```

### 快速回滚

```bash
# 回滚到上一个版本
kubectl rollout undo deployment/token-admin-api -n passontw-services-staging

# 查看历史版本
kubectl rollout history deployment/token-admin-api -n passontw-services-staging
```

### 环境配置

| 特性 | Staging |
|-----|---------|
| 命名空间 | `passontw-services-staging` |
| 副本数 | 2 |
| 内存限制 | 512Mi |
| CPU 限制 | 500m |
| 镜像标签格式 | `develop-{sha}` |

---

## 📁 目录结构

```
k8s/
├── base/                                    # 基础配置
│   ├── kustomization.yaml                  # Base kustomization 配置
│   ├── token-admin-api-deployment.yaml     # Admin API Deployment
│   ├── token-admin-api-service.yaml        # Admin API Service
│   ├── token-app-api-deployment.yaml       # App API Deployment
│   ├── token-app-api-service.yaml          # App API Service
│   ├── admin-api-configmap.yaml            # Admin API ConfigMap
│   └── app-api-configmap.yaml              # App API ConfigMap
│
├── ingress/                                 # Ingress 配置
│   └── ingress-staging-https.yaml          # Staging HTTPS Ingress
│
├── overlays/                                # 环境特定配置
│   └── staging/                             # Staging 环境
│       ├── kustomization.yaml              # Staging 覆盖配置
│       └── namespace.yaml                  # Staging Namespace
│
└── secrets/                                 # Secret 示例文件
    ├── database-secret.yaml.example
    ├── ghcr-pull-secret.yaml.example
    ├── jwt-secret.yaml.example
    └── redis-secret.yaml.example
```

---

## 🎯 设计理念

### Base（基础配置）

- **共享配置**：包含所有服务的基础配置
- **占位符标签**：使用 `placeholder` 作为镜像标签
- **可复用**：作为所有 overlay 的基础

### Overlay - Staging（开发/测试环境）

- **命名空间**：`passontw-services-staging`
- **副本数**：2
- **镜像标签格式**：`develop-{sha}` (例如 `develop-5a48c1c`)
- **资源限制**：内存 512Mi，CPU 500m
- **用途**：开发测试、功能验证

---

## 🚀 使用方法

### 1. 安装 Kustomize

```bash
# macOS
brew install kustomize

# Linux
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash

# 或使用 kubectl 内置的 kustomize（推荐）
kubectl version  # 确保版本 >= 1.14
```

### 2. 本地开发部署

#### 预览生成的配置

```bash
# 查看 Staging 环境的完整配置
kubectl kustomize k8s/overlays/staging

# 或使用 kustomize 命令
kustomize build k8s/overlays/staging

# 查看差异
kubectl diff -k k8s/overlays/staging
```

#### 部署到 Staging

```bash
# 方法 1: 手动设置镜像标签
cd k8s/overlays/staging
kustomize edit set image \
  ghcr.io/passontw/token-admin-api:develop-abc1234 \
  ghcr.io/passontw/token-app-api:develop-abc1234
kubectl apply -k .

# 方法 2: 一步部署（从项目根目录）
kubectl apply -k k8s/overlays/staging

# 方法 3: 使用脚本（推荐，交互式）
./scripts/kustomize-deploy-staging.sh
```

### 3. 验证部署

```bash
# 查看 Staging 环境的所有资源
kubectl get all -n passontw-services-staging

# 查看部署的镜像标签
kubectl get deployment token-admin-api -n passontw-services-staging \
  -o jsonpath='{.spec.template.spec.containers[0].image}'

# 查看 Pod 状态
kubectl get pods -n passontw-services-staging

# 查看 Pod 日志
kubectl logs -f deployment/token-admin-api -n passontw-services-staging

# 测试 API
curl https://token-admin-api.passon.tw/health-check
```

---

## 🔧 配置管理

### Base 配置示例

```yaml
# k8s/base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - token-admin-api-deployment.yaml
  - token-admin-api-service.yaml
  - token-app-api-deployment.yaml
  - token-app-api-service.yaml
  - admin-api-configmap.yaml
  - app-api-configmap.yaml
```

### Staging Overlay 配置示例

```yaml
# k8s/overlays/staging/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../../base
  - namespace.yaml

namespace: passontw-services-staging

patches:
  - target:
      kind: Deployment
      name: token-admin-api
    patch: |
      - op: replace
        path: /spec/replicas
        value: 2
      - op: replace
        path: /spec/template/spec/containers/0/resources/limits/cpu
        value: "500m"
      - op: replace
        path: /spec/template/spec/containers/0/resources/limits/memory
        value: "512Mi"
  
  - target:
      kind: Deployment
      name: token-app-api
    patch: |
      - op: replace
        path: /spec/replicas
        value: 2
```

### 修改配置

#### 修改基础配置（影响所有环境）

```bash
# 编辑基础配置
vim k8s/base/token-admin-api-deployment.yaml

# 应用到 Staging
kubectl apply -k k8s/overlays/staging
```

#### 修改 Staging 特定配置

```yaml
# 在 k8s/overlays/staging/kustomization.yaml 中
patches:
  - patch: |-
      - op: replace
        path: /spec/replicas
        value: 4  # 改为 4 个副本
    target:
      kind: Deployment
      name: token-admin-api
```

#### 添加新的环境变量

```yaml
# 使用 ConfigMap Generator
configMapGenerator:
  - name: admin-api-config
    behavior: merge
    literals:
      - NEW_ENV_VAR=new_value
```

### 镜像管理

```bash
# 查看当前配置的镜像标签
cd k8s/overlays/staging
grep newTag kustomization.yaml

# 设置多个镜像标签
kustomize edit set image \
  ghcr.io/passontw/token-admin-api:develop-5a48c1c \
  ghcr.io/passontw/token-app-api:develop-5a48c1c

# 设置单个镜像标签
kustomize edit set image ghcr.io/passontw/token-admin-api:develop-5a48c1c
```

---

## 📋 常用命令

### Kustomize 命令

```bash
# 查看生成的配置（不应用）
kustomize build k8s/overlays/staging

# 验证配置
kustomize build k8s/overlays/staging | kubectl apply --dry-run=client -f -

# 比较当前配置和新配置
kustomize build k8s/overlays/staging | kubectl diff -f -
```

### Kubectl 命令

```bash
# 使用 kubectl 内置的 kustomize
kubectl apply -k k8s/overlays/staging

# 查看差异
kubectl diff -k k8s/overlays/staging

# 删除所有资源
kubectl delete -k k8s/overlays/staging

# Dry-run 测试
kubectl apply -k k8s/overlays/staging --dry-run=client
```

### 回滚操作

#### 使用 Kubectl Rollout

```bash
# 查看历史版本
kubectl rollout history deployment/token-admin-api -n passontw-services-staging

# 回滚到上一个版本
kubectl rollout undo deployment/token-admin-api -n passontw-services-staging

# 回滚到特定版本
kubectl rollout undo deployment/token-admin-api -n passontw-services-staging --to-revision=3
```

#### 使用 Git + Kustomize

```bash
# 1. 查看之前的 commit
git log k8s/overlays/staging/kustomization.yaml

# 2. 恢复到特定 commit
git checkout abc1234 -- k8s/overlays/staging/kustomization.yaml

# 3. 重新部署
kubectl apply -k k8s/overlays/staging
```

---

## 🔄 CI/CD 集成

### CI/CD 自动部署流程

CI/CD 会自动执行以下步骤：

1. **构建镜像**：编译并构建 Docker 镜像（标签：`develop-5a48c1c`）
2. **推送镜像**：推送到 GHCR（GitHub Container Registry）
3. **设置标签**：使用 Kustomize 动态设置镜像标签
4. **部署应用**：应用配置到 Kubernetes Staging 环境

### CI/CD 执行的命令

```bash
# 1. 提取镜像标签
IMAGE_TAG="develop-5a48c1c"

# 2. 进入 overlay 目录
cd k8s/overlays/staging

# 3. 设置镜像标签
kustomize edit set image ghcr.io/passontw/token-admin-api:${IMAGE_TAG}

# 4. 应用配置
kubectl apply -k .
```

### CI/CD 日志示例

```
🚀 開始部署 Admin API (使用 Kustomize)...
📦 部署資訊:
  環境: staging
  命名空間: passontw-services-staging
  映像標籤: ghcr.io/passontw/token-admin-api:develop-5a48c1c
🔄 設置映像標籤: develop-5a48c1c
📦 應用配置...
✅ 部署配置已應用（使用 Kustomize）
```

### 工作流配置摘要

```yaml
# .github/workflows/cicd-admin-api.yaml
- name: Deploy to Kubernetes with Kustomize
  env:
    ENV: staging
  run: |
    cd k8s/overlays/${ENV}
    kustomize edit set image ghcr.io/passontw/token-admin-api:${IMAGE_TAG}
    kubectl apply -k .
```

---

## 🐛 故障排查

### 问题 1：镜像拉取失败

```bash
# 检查镜像标签是否正确
kubectl describe pod <pod-name> -n passontw-services-staging

# 检查 kustomization.yaml 中的镜像配置
cat k8s/overlays/staging/kustomization.yaml | grep -A 5 images

# 检查镜像是否存在于 GHCR
kubectl get events -n passontw-services-staging
```

### 问题 2：配置未生效

```bash
# 查看实际应用的配置
kubectl kustomize k8s/overlays/staging

# 比较期望配置和实际配置
kubectl get deployment token-admin-api -n passontw-services-staging -o yaml

# 查看 Pod 事件
kubectl describe pod <pod-name> -n passontw-services-staging
```

### 问题 3：Kustomize 版本不兼容

```bash
# 检查 kustomize 版本
kustomize version

# 使用 kubectl 内置的 kustomize
kubectl version --short

# 更新 kustomize
brew upgrade kustomize  # macOS
```

### 问题 4：镜像标签未更新

```bash
# 检查 kustomization.yaml
cat k8s/overlays/staging/kustomization.yaml | grep newTag

# 手动设置
cd k8s/overlays/staging
kustomize edit set image ghcr.io/passontw/token-admin-api:develop-5a48c1c

# 验证更新
grep newTag kustomization.yaml
```

### 快速诊断命令

```bash
# 检查镜像配置
grep newTag k8s/overlays/staging/kustomization.yaml

# 查看实际应用的配置
kubectl get deployment token-admin-api -n passontw-services-staging -o yaml

# 查看 Pod 事件
kubectl describe pod <pod-name> -n passontw-services-staging

# 检查 Kustomize 生成的配置
kubectl kustomize k8s/overlays/staging > /tmp/staging-config.yaml
cat /tmp/staging-config.yaml
```

---

## 🎨 高级用法

### 1. 添加新服务

```bash
# 1. 在 base/ 中添加新的 deployment 和 service
vim k8s/base/new-service-deployment.yaml
vim k8s/base/new-service-service.yaml

# 2. 更新 base/kustomization.yaml
vim k8s/base/kustomization.yaml
# 添加到 resources 列表

# 3. 更新 staging overlay 配置（如果需要）
vim k8s/overlays/staging/kustomization.yaml
```

### 2. 使用 Patches

#### Strategic Merge Patch

```yaml
patchesStrategicMerge:
  - |-
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: token-admin-api
    spec:
      template:
        spec:
          containers:
          - name: token-admin-api
            env:
            - name: DEBUG
              value: "true"
```

#### JSON Patch

```yaml
patches:
  - patch: |-
      - op: add
        path: /spec/template/spec/containers/0/env/-
        value:
          name: DEBUG
          value: "true"
    target:
      kind: Deployment
      name: token-admin-api
```

### 3. 生成 ConfigMap

```yaml
# 在 overlay 中动态生成 ConfigMap
configMapGenerator:
  - name: app-config
    files:
      - config.properties
    literals:
      - ENV=staging
      - DEBUG=true
```

---

## 📚 最佳实践

### 1. 版本控制

- ✅ 提交 `kustomization.yaml` 到 Git
- ✅ 使用 Git tags 标记稳定版本
- ⚠️ 不要提交生成的 YAML 文件

### 2. 镜像标签

- ✅ 使用精确的 SHA 标签（`develop-5a48c1c`）
- ✅ 通过 CI/CD 自动设置
- ❌ 避免使用 `latest` 标签

### 3. 配置管理

- ✅ 敏感信息使用 Kubernetes Secrets
- ✅ 环境差异使用 Overlays
- ✅ 共享配置放在 Base

### 4. 测试

- ✅ 本地测试：`kubectl apply --dry-run=client -k .`
- ✅ 预览配置：`kubectl kustomize .`
- ✅ 比较差异：`kubectl diff -k .`

---

## ✅ 部署检查清单

### 部署前

- [ ] 确认镜像标签正确
- [ ] 预览配置：`kubectl kustomize k8s/overlays/staging`
- [ ] 检查差异：`kubectl diff -k k8s/overlays/staging`
- [ ] 确认命名空间正确

### 部署后

- [ ] 验证 Pod 状态：`kubectl get pods -n passontw-services-staging`
- [ ] 检查镜像版本：`kubectl get deployment -n passontw-services-staging -o wide`
- [ ] 查看日志：`kubectl logs -f deployment/token-admin-api -n passontw-services-staging`
- [ ] 测试 API：`curl https://token-admin-api.passon.tw/health-check`
- [ ] 检查 Swagger UI：访问 Swagger 页面并验证版本号

---

## 💡 使用提示

- 💾 **备份配置**：修改前备份 `kustomization.yaml`
- 🔍 **先预览**：使用 `kubectl kustomize` 预览配置
- 🧪 **Dry-run**：使用 `--dry-run=client` 测试
- 📝 **提交更改**：重要配置更改提交到 Git
- 🏷️ **使用精确标签**：避免使用 `latest` 标签
- 🔄 **滚动更新**：利用 Kubernetes 的滚动更新特性
- 🚀 **自动化**：通过 CI/CD 自动化部署流程

---

## 🔗 参考资源

### 官方文档

- [Kustomize 官方文档](https://kustomize.io/)
- [Kubectl Book](https://kubectl.docs.kubernetes.io/references/kustomize/)
- [Kubernetes 官方 Kustomize 指南](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/)

### 项目文档

- **部署脚本**：`scripts/kustomize-deploy-staging.sh`
- **CI/CD 配置**：`.github/workflows/cicd-*-api.yaml`
- **Base 配置**：`k8s/base/kustomization.yaml`
- **Staging Overlay**：`k8s/overlays/staging/kustomization.yaml`
- **Ingress 配置**：`k8s/ingress/ingress-staging-https.yaml`

---

## 🎉 总结

您现在拥有一个简洁高效的 Kustomize 配置：

- ✅ **结构化的配置管理**：清晰的 Base + Staging Overlay 结构
- ✅ **自动化的 CI/CD**：推送即部署，镜像标签自动匹配
- ✅ **完整的文档**：从快速开始到高级用法
- ✅ **专注 Staging**：专为开发测试环境优化
- ✅ **版本控制**：所有配置变更可追踪
- ✅ **易于维护**：简单清晰的目录结构

享受 Kustomize 带来的更好的 Kubernetes 配置管理体验！🚀

---

*最后更新：2024-11-17*
