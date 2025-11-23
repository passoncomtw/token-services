# 🔍 POS Backend Service 部署調試指南

## 問題描述

```
Waiting for deployment "pos-backend-service" rollout to finish: 0 of 2 updated replicas are available...
error: timed out waiting for the condition
```

**狀態**: 部署創建成功，但 Pod 無法變成 Ready 狀態（等待 5 分鐘後超時）

## ✅ 已完成的修復

### 1. 已添加調試信息輸出

修改了 `.github/workflows/cicd-pos-backend-service.yaml`，在部署失敗時自動輸出：
- Pod 狀態
- Pod 詳細描述
- 最近的 K8s 事件
- Pod 日誌（如果可用）

### 2. 已添加 Kubernetes Secrets 創建步驟

POS Backend Service 需要以下 Secrets：
- `database-secret` (DB 配置)
- `jwt-secret` (JWT 配置)

工作流現在會在部署前自動創建這些 Secrets。

## 📋 可能的原因和解決方案

### 原因 1: Kubernetes Secrets 不存在 ⚠️

**症狀**: Pod 無法啟動，狀態顯示 `CreateContainerConfigError`

**檢查方法**:
```bash
kubectl get secrets -n passontw-services-staging
```

**解決方案**: 確保以下 GitHub Secrets 已設置：
```
DB_HOST=your-database-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_SSLMODE=disable
JWT_SECRET=your-jwt-secret
```

### 原因 2: 健康檢查失敗 ⚠️

**症狀**: Pod 啟動但健康檢查持續失敗

**當前配置**:
```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
```

**可能的問題**:
1. 應用程序不在 8080 端口監聽
2. `/ready` 端點不存在或返回錯誤
3. 應用程序啟動時間超過 `initialDelaySeconds` (10秒)

**檢查方法**:
```bash
# 查看 Pod 事件
kubectl describe pod -n passontw-services-staging -l app=pos-backend-service

# 查看應用日誌
kubectl logs -n passontw-services-staging -l app=pos-backend-service --tail=100
```

**解決方案**:

**選項 A**: 增加 `initialDelaySeconds`（如果應用啟動慢）

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 30  # 從 10 增加到 30
  periodSeconds: 5
```

**選項 B**: 修改健康檢查路徑（如果端點不對）

檢查應用程序的實際健康檢查路徑，可能是：
- `/health`
- `/healthz`
- `/api/health`

### 原因 3: 應用程序崩潰 ⚠️

**症狀**: Pod 狀態顯示 `CrashLoopBackOff` 或 `Error`

**可能的問題**:
1. 資料庫連接失敗
2. 環境變數缺失或錯誤
3. 應用程序代碼錯誤

**檢查方法**:
```bash
# 查看 Pod 狀態
kubectl get pods -n passontw-services-staging -l app=pos-backend-service

# 查看崩潰日誌
kubectl logs -n passontw-services-staging -l app=pos-backend-service --previous
```

### 原因 4: 資源不足 ⚠️

**症狀**: Pod 處於 `Pending` 狀態

**當前配置**:
```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

**檢查方法**:
```bash
kubectl describe pod -n passontw-services-staging -l app=pos-backend-service | grep -A 5 "Events:"
```

## 🚀 下一步調試流程

### 1. 推送更新並查看詳細日誌

```bash
# 提交修改
git add .github/workflows/cicd-pos-backend-service.yaml
git commit -m "debug: add detailed logging for pos-backend-service deployment failures"
git push origin develop
```

### 2. 觀察 GitHub Actions 輸出

推送後，GitHub Actions 會重新運行。如果部署失敗，會自動輸出：
- ✅ Pod 狀態
- ✅ Pod 詳細描述
- ✅ 事件日誌
- ✅ 應用日誌

### 3. 根據日誌定位問題

查看 GitHub Actions 的輸出，特別注意：

**A. Pod 狀態**
```
NAME                                  READY   STATUS              RESTARTS   AGE
pos-backend-service-xxx-yyy           0/2     CreateContainerConfigError   0          2m
```
→ 表示 Secret 缺失

**B. 事件日誌**
```
Warning  Failed    kubelet    Error: secret "database-secret" not found
```
→ 需要創建 Secrets

**C. 應用日誌**
```
Error connecting to database: dial tcp: lookup xxx: no such host
```
→ 資料庫配置錯誤

## 📊 修改摘要

### 修改的文件

1. ✅ `.github/workflows/cicd-pos-backend-service.yaml`
   - 添加 Kubernetes Secrets 創建步驟
   - 添加詳細的調試日誌輸出

2. ✅ 回滾其他服務的工作流
   - `cicd-pos-merchant-service.yaml` - 已恢復
   - `cicd-token-admin-api.yaml` - 已恢復
   - `cicd-token-app-api.yaml` - 已恢復

### 未修改的文件

- Kustomize 配置（k8s/）
- Deployment YAML
- Dockerfile

## 🎯 預期結果

推送後：
1. GitHub Actions 會自動構建並部署
2. 如果部署失敗，會輸出詳細的調試信息
3. 根據調試信息，我們可以準確定位問題
4. 然後針對性地修復

---

**最後更新**: 2025-11-23

**狀態**: ⏳ 等待推送和觀察調試輸出

