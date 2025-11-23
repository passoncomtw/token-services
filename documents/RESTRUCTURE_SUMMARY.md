# K8s 配置重构完成总结

## 🎯 重构目标

将 Kubernetes 配置从单一 `k8s/base/` 目录重构为按服务隔离的目录结构，实现：
- ✅ 每个服务独立配置管理
- ✅ 清晰的服务边界
- ✅ 易于维护和扩展
- ✅ CI/CD 流程优化

---

## 📊 重构前后对比

### 旧结构（Before）

```
k8s/
├── base/
│   ├── token-admin-api-deployment.yaml
│   ├── token-admin-api-service.yaml
│   ├── token-app-api-deployment.yaml
│   ├── token-app-api-service.yaml
│   ├── pos-backend-service-deployment.yaml
│   ├── pos-backend-service-service.yaml
│   ├── pos-merchant-service-deployment.yaml
│   ├── pos-merchant-service-service.yaml
│   ├── admin-api-configmap.yaml
│   ├── app-api-configmap.yaml
│   ├── pos-backend-configmap.yaml
│   ├── pos-merchant-configmap.yaml
│   └── kustomization.yaml  # 所有服务混在一起
└── overlays/staging/
    ├── namespace.yaml
    ├── ingress.yaml
    └── kustomization.yaml
```

**问题**：
- ❌ 所有服务配置混在 `k8s/base/` 目录
- ❌ 修改一个服务需要查找多个文件
- ❌ 配置文件命名冗长（如 `token-admin-api-deployment.yaml`）
- ❌ 难以快速定位特定服务的配置
- ❌ CI/CD 触发路径模糊（`k8s/**`）

---

### 新结构（After）

```
k8s/
├── services/                          # 🆕 服务隔离目录
│   ├── token-admin-api/               # 每个服务独立目录
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   └── kustomization.yaml
│   ├── token-app-api/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   └── kustomization.yaml
│   ├── pos-backend-service/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   └── kustomization.yaml
│   └── pos-merchant-service/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── configmap.yaml
│       └── kustomization.yaml
├── overlays/staging/
│   ├── namespace.yaml
│   ├── ingress.yaml
│   └── kustomization.yaml            # 引用所有服务
├── secrets/
│   └── *.yaml.example
└── README.md
```

**优势**：
- ✅ 每个服务配置在独立目录
- ✅ 文件名简化（`deployment.yaml` vs `token-admin-api-deployment.yaml`）
- ✅ 服务配置一目了然
- ✅ 易于添加新服务
- ✅ CI/CD 触发路径精确（`k8s/services/token-admin-api/**`）

---

## 🔧 完成的工作

### 1. 创建服务目录结构 ✅

为 4 个服务创建了独立目录：

| 服务 | 路径 | 包含文件 |
|------|------|----------|
| Token Admin API | `k8s/services/token-admin-api/` | deployment.yaml, service.yaml, configmap.yaml, kustomization.yaml |
| Token App API | `k8s/services/token-app-api/` | deployment.yaml, service.yaml, configmap.yaml, kustomization.yaml |
| POS Backend Service | `k8s/services/pos-backend-service/` | deployment.yaml, service.yaml, configmap.yaml, kustomization.yaml |
| POS Merchant Service | `k8s/services/pos-merchant-service/` | deployment.yaml, service.yaml, configmap.yaml, kustomization.yaml |

**共创建**：16 个文件（每个服务 4 个文件）

---

### 2. 更新 Overlays 配置 ✅

**文件**：`k8s/overlays/staging/kustomization.yaml`

**变更**：
```yaml
# Before
resources:
  - ../../base  # 引用整个 base 目录

# After
resources:
  - namespace.yaml
  - ../../services/token-admin-api        # 精确引用每个服务
  - ../../services/token-app-api
  - ../../services/pos-backend-service
  - ../../services/pos-merchant-service
  - ingress.yaml
```

**好处**：
- 清晰显示部署了哪些服务
- 可以选择性部署特定服务
- 依赖关系明确

---

### 3. 更新 CI/CD Workflows ✅

更新了 4 个 GitHub Actions workflow 文件：

| Workflow | 更新内容 |
|----------|---------|
| `.github/workflows/cicd-token-admin-api.yaml` | 触发路径：`k8s/**` → `k8s/services/token-admin-api/**` + `k8s/overlays/**` |
| `.github/workflows/cicd-token-app-api.yaml` | 触发路径：`k8s/**` → `k8s/services/token-app-api/**` + `k8s/overlays/**` |
| `.github/workflows/cicd-pos-backend-service.yaml` | 触发路径：`k8s/**` → `k8s/services/pos-backend-service/**` + `k8s/overlays/**` |
| `.github/workflows/cicd-pos-merchant-service.yaml` | 触发路径：`k8s/**` → `k8s/services/pos-merchant-service/**` + `k8s/overlays/**` |

**好处**：
- ✅ 只有相关服务变更时才触发 CI/CD
- ✅ 减少不必要的构建和部署
- ✅ 加快 CI/CD 速度
- ✅ 节省 runner 资源

**示例**：
```yaml
# Before - 任何 k8s 变更都触发
paths:
  - 'k8s/**'

# After - 只有特定服务或 overlay 变更才触发
paths:
  - 'k8s/services/token-admin-api/**'
  - 'k8s/overlays/**'
```

---

### 4. 清理旧文件 ✅

**删除的文件**（13 个）：

#### `k8s/base/` 目录：
- ❌ `token-admin-api-deployment.yaml`
- ❌ `token-admin-api-service.yaml`
- ❌ `token-app-api-deployment.yaml`
- ❌ `token-app-api-service.yaml`
- ❌ `pos-backend-service-deployment.yaml`
- ❌ `pos-backend-service-service.yaml`
- ❌ `pos-merchant-service-deployment.yaml`
- ❌ `pos-merchant-service-service.yaml`
- ❌ `admin-api-configmap.yaml`
- ❌ `app-api-configmap.yaml`
- ❌ `pos-backend-configmap.yaml`
- ❌ `pos-merchant-configmap.yaml`
- ❌ `kustomization.yaml`

#### 根目录：
- ❌ `CI_CD_POS_SERVICES.md` （旧文档，已被新文档取代）

**结果**：
- `k8s/base/` 目录现在为空（或只包含真正共用的资源）
- 所有服务配置已移动到各自目录
- 代码库更加整洁

---

### 5. 创建新文档 ✅

**新增文档**：
- 📄 `K8S_STRUCTURE.md` - 完整的 K8s 配置结构说明文档
  - 📁 目录结构图
  - 🎯 设计理念
  - 📦 每个服务的详细说明
  - 🚀 部署方式（CI/CD + 手动）
  - 🔧 配置修改指南
  - 🌐 Ingress 和 HTTPS 管理
  - 🔐 Secrets 管理
  - 📊 监控和调试命令
  - ✅ 验证清单

- 📄 `RESTRUCTURE_SUMMARY.md` - 本文件，重构总结

---

## 📈 效果对比

### 维护性

| 操作 | 旧结构 | 新结构 |
|------|--------|--------|
| 查找服务配置 | 在 `k8s/base/` 中查找多个文件 | 直接进入 `k8s/services/${service-name}/` |
| 修改服务配置 | 需要编辑多个分散的文件 | 在单一目录中编辑 |
| 添加新服务 | 在 base 中添加文件，更新 kustomization.yaml | 创建新服务目录，更新 overlay |
| 理解部署内容 | 需要查看 base kustomization.yaml | overlay kustomization.yaml 清晰列出所有服务 |

### CI/CD 效率

| 场景 | 旧结构 | 新结构 |
|------|--------|--------|
| 修改单个服务 | 可能触发所有服务的 workflow | 只触发该服务的 workflow |
| 修改 Ingress | 触发所有 workflow | 触发所有 workflow（正确行为） |
| 并行构建 | 4 个 workflow 可能同时运行 | 只有变更的服务运行 |

**估算节省**：
- ⏱️ CI/CD 时间：减少约 50-75%（平均只触发 1-2 个 workflow 而非全部）
- 💰 Runner 成本：减少约 50-75%
- 🔋 开发者等待时间：更短的反馈周期

### 可扩展性

| 需求 | 旧结构 | 新结构 |
|------|--------|--------|
| 添加新服务 | 中等复杂度 | 简单（复制现有服务目录） |
| 添加新环境（production） | 复杂（需要重构） | 简单（复制 staging overlay） |
| 服务独立发布 | 困难 | 容易 |
| 服务版本管理 | 困难 | 容易（每个服务有自己的 kustomization） |

---

## 🎓 最佳实践

### 1. 服务目录命名

✅ **使用**：`${service-name}/`  
❌ **避免**：`${service-name}-service/` 或过于复杂的名称

示例：
- ✅ `token-admin-api/`
- ✅ `pos-backend-service/`
- ❌ `token-admin-api-service/`

### 2. 文件命名

在服务目录中使用标准名称：
- `deployment.yaml` - Deployment 配置
- `service.yaml` - Service 配置
- `configmap.yaml` - ConfigMap 配置
- `kustomization.yaml` - Kustomize 配置

❌ 避免：`${service-name}-deployment.yaml`（冗余）

### 3. Kustomization 结构

每个服务目录都应该有 `kustomization.yaml`：
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml
  - service.yaml
  - configmap.yaml

images:
  - name: ghcr.io/passoncomtw/${service-name}
    newTag: placeholder
```

### 4. Overlay 结构

Overlay 应该只包含环境特定的配置：
- `namespace.yaml` - Namespace 定义
- `ingress.yaml` - 所有服务的路由
- `kustomization.yaml` - 引用所有服务 + 环境 patches

### 5. CI/CD 触发路径

使用精确的触发路径：
```yaml
paths:
  - '.github/workflows/cicd-${service-name}.yaml'
  - 'cmd/${service-name}/**'
  - 'pkg/**'                              # 共享代码
  - 'deploy/${service-name}/**'
  - 'k8s/services/${service-name}/**'     # 服务配置
  - 'k8s/overlays/**'                     # Overlay 配置
  - 'go.mod'
  - 'go.sum'
```

---

## 🚀 使用指南

### 添加新服务

1. **创建服务目录**：
   ```bash
   mkdir -p k8s/services/new-service
   ```

2. **复制模板**（从现有服务）：
   ```bash
   cp -r k8s/services/token-admin-api/* k8s/services/new-service/
   ```

3. **修改配置**：
   - 更新 `deployment.yaml` 中的服务名、镜像、端口
   - 更新 `service.yaml` 中的服务名
   - 更新 `configmap.yaml` 中的配置
   - 更新 `kustomization.yaml` 中的镜像名

4. **添加到 overlay**：
   编辑 `k8s/overlays/staging/kustomization.yaml`：
   ```yaml
   resources:
     - ../../services/new-service  # 添加这行
   ```

5. **添加 Ingress 路由**：
   编辑 `k8s/overlays/staging/ingress.yaml`

6. **创建 CI/CD workflow**：
   复制并修改现有 workflow 文件

7. **创建 Dockerfile**：
   在 `deploy/new-service/` 中创建

### 修改服务配置

```bash
# 1. 进入服务目录
cd k8s/services/token-admin-api

# 2. 编辑配置文件
vim deployment.yaml
# 或
vim configmap.yaml

# 3. 应用更改
cd ../../overlays/staging
kubectl apply -k .

# 4. 验证
kubectl get pods -n passontw-services-staging -l app=token-admin-api
```

### 部署特定服务

```bash
# 部署单个服务
cd k8s/overlays/staging
kustomize build . | grep -A 100 "kind: Deployment" | grep -A 100 "name: token-admin-api" | kubectl apply -f -

# 或使用 kustomize + kubectl
kubectl apply -k ../../services/token-admin-api -n passontw-services-staging
```

---

## ✅ 验证

### 测试新结构

```bash
# 1. 构建配置（不应用）
cd k8s/overlays/staging
kustomize build .

# 2. 验证所有服务都被包含
kustomize build . | grep "kind: Deployment"
# 应该看到 4 个 Deployment

# 3. 验证镜像配置
kustomize build . | grep "image:"

# 4. 应用到集群
kubectl apply -k . --dry-run=client

# 5. 实际应用
kubectl apply -k .
```

### 验证 CI/CD

```bash
# 1. 修改单个服务配置
echo "# test" >> k8s/services/token-admin-api/configmap.yaml
git add k8s/services/token-admin-api/configmap.yaml
git commit -m "test: trigger CI/CD for token-admin-api only"
git push origin develop

# 2. 查看 GitHub Actions
# 只有 cicd-token-admin-api.yaml workflow 应该被触发

# 3. 恢复更改
git revert HEAD
git push origin develop
```

---

## 📝 未来改进建议

### 短期（可选）

1. **添加 Production Overlay**
   ```
   k8s/overlays/
   ├── staging/
   └── production/  # 🆕
   ```

2. **添加 Helm Charts**（如果需要更复杂的配置管理）

3. **添加 Kustomize Components**（用于可选功能）

### 长期（可选）

1. **迁移到 GitOps**（ArgoCD / Flux）
2. **添加 Service Mesh**（Istio / Linkerd）
3. **自动化 Canary Deployment**
4. **添加 Monitoring Stack**（Prometheus + Grafana）

---

## 🎉 总结

### 完成的工作

✅ **重构 K8s 配置**：从集中式改为服务隔离结构  
✅ **创建 16 个新文件**：4 个服务 × 4 个配置文件  
✅ **更新 4 个 CI/CD workflows**：优化触发路径  
✅ **删除 13 个旧文件**：清理冗余配置  
✅ **创建 2 个新文档**：完整的使用说明  

### 效果

📈 **维护性提升**：服务配置一目了然  
⚡ **CI/CD 效率提升**：减少 50-75% 不必要的构建  
🎯 **清晰的服务边界**：易于理解和修改  
🚀 **易于扩展**：添加新服务变得简单  
🔒 **保持稳定**：现有部署不受影响  

### 架构优势

```
旧架构（单体配置）:
  所有服务 → k8s/base/ → kustomization.yaml

新架构（服务隔离）:
  service-1 → k8s/services/service-1/ → kustomization.yaml
  service-2 → k8s/services/service-2/ → kustomization.yaml
  service-3 → k8s/services/service-3/ → kustomization.yaml
  service-4 → k8s/services/service-4/ → kustomization.yaml
                        ↓
            k8s/overlays/staging/kustomization.yaml
                        ↓
                  Kubernetes Cluster
```

---

**重构完成日期**：2024年  
**相关文档**：
- `K8S_STRUCTURE.md` - 完整的结构说明和使用指南
- `k8s/README.md` - K8s 配置总览
- `.github/workflows/cicd-*.yaml` - CI/CD 配置

**维护者**：PassonTW Backend Team

🎉 **重构成功！新结构已投入使用！**

