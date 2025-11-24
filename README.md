# 🚀 PassOnTW Backend Services

> 基於 Go + Fiber + PostgreSQL 的後端服務，採用 Kubernetes + CI/CD 自動化部署

## 📋 目錄

- [快速開始](#-快速開始)
  - [遷移現有部署](#遷移現有部署到新-cicd-架構)
  - [全新部署](#全新部署)
- [部署驗證](#-部署驗證)
- [DNS 和 HTTPS 設定](#-dns-和-https-設定)
  - [快速部署（3 步驟）](#快速部署3-步驟)
  - [詳細設定指南](#詳細設定指南)
  - [自動更新機制](#自動更新機制)
- [架構說明](#-架構說明)
- [CI/CD 工作流](#-cicd-工作流)
- [POS Services 環境變數管理](#-pos-services-環境變數管理)
- [日常操作](#-日常操作)
- [故障排除](#-故障排除)
- [Longhorn 存儲系統](#-longhorn-存儲系統)
- [安全配置](#-安全配置)
- [CORS 配置](#-cors-配置)
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

## 🌐 DNS 和 HTTPS 設定

> 為您的 API 配置自訂域名和自動化 HTTPS 證書

### 📌 重要資訊

| 項目 | 值 |
|------|-----|
| **域名示例** | token-admin-api.passon.tw |
| **Traefik IP** | 172.237.27.17, 172.237.27.51 |
| **證書簽發** | Let's Encrypt（自動） |
| **證書有效期** | 90 天 |
| **自動更新** | 到期前 30 天 |

### 📋 前置條件

您的系統已經具備：
- ✅ k3s 集群運行中
- ✅ Traefik Ingress Controller（k3s 預設）
- ✅ cert-manager 已安裝
- ✅ Let's Encrypt ClusterIssuer 已配置

---

### 快速部署（3 步驟）

#### 1️⃣ Gandi DNS 設定（5 分鐘）

登入 https://admin.gandi.net/ → 選擇您的域名

**添加 DNS A 記錄：**

```
類型: A
名稱: token-admin-api
IPv4: 172.237.27.17
TTL: 300
```

**驗證 DNS：**

```bash
# 等待 DNS 傳播（5-30 分鐘）
dig token-admin-api.passon.tw

# 期望看到：
# token-admin-api.passon.tw has address 172.237.27.17
```

#### 2️⃣ 部署 HTTPS Ingress（2 分鐘）

**方式 A：使用自動化腳本（推薦）**

```bash
./scripts/deploy-https.sh
```

腳本會自動：
- ✅ 檢查所有前置條件
- ✅ 驗證 DNS 解析
- ✅ 部署 Ingress 配置
- ✅ 等待證書簽發
- ✅ 測試 HTTPS 訪問

**方式 B：手動部署**

```bash
# 部署到 staging 環境
kubectl apply -f k8s/ingress/ingress-staging-https.yaml

# 驗證部署
kubectl get ingress -n passontw-services-staging
kubectl get certificate -n passontw-services-staging
```

#### 3️⃣ 驗證（1 分鐘）

```bash
# 測試 HTTPS
curl https://token-admin-api.passon.tw/health-check

# 在瀏覽器訪問
https://token-admin-api.passon.tw/health-check
```

**期望結果：**
- ✅ 證書狀態：Ready = True
- ✅ HTTPS 返回 JSON 響應
- ✅ 瀏覽器顯示綠色鎖頭 🔒
- ✅ HTTP 自動重定向到 HTTPS

---

### 詳細設定指南

#### Gandi DNS 設定

**單一 IP（推薦）：**

```
類型: A
名稱: token-admin-api
IPv4 地址: 172.237.27.17
TTL: 300 (5分鐘) 或 3600 (1小時)
```

**多個 IP（高可用）：**

如果您有多個節點，可以添加多條 A 記錄：

```
記錄 1:
類型: A
名稱: token-admin-api
IPv4 地址: 172.237.27.17
TTL: 300

記錄 2:
類型: A
名稱: token-admin-api
IPv4 地址: 172.237.27.51
TTL: 300
```

#### Ingress 配置說明

系統會自動創建以下 Ingress 配置：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: token-services-ingress-staging
  annotations:
    kubernetes.io/ingress.class: "traefik"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    traefik.ingress.kubernetes.io/redirect-entry-point: https
spec:
  tls:
  - hosts:
    - token-admin-api.passon.tw
    secretName: token-admin-api-tls
  rules:
  - host: token-admin-api.passon.tw
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

#### 證書申請流程

```
1. Ingress 部署
   ↓
2. cert-manager 檢測到 cert-manager.io/cluster-issuer annotation
   ↓
3. 自動創建 Certificate 資源
   ↓
4. 創建 CertificateRequest
   ↓
5. 創建 Order（Let's Encrypt 訂單）
   ↓
6. 創建 Challenge（HTTP-01 驗證）
   ↓
7. Let's Encrypt 驗證域名所有權
   ↓
8. 驗證成功 → 簽發證書
   ↓
9. 證書存儲在 Secret: token-admin-api-tls
   ↓
10. Traefik 自動使用證書
```

---

### 自動更新機制

#### cert-manager 自動更新

cert-manager 會**自動更新證書**，完全無需手動操作：

**更新時機：**
- 📅 證書到期前 30 天開始嘗試更新
- 🔄 每小時檢查一次證書狀態
- ✅ 自動更新成功後更新 Secret
- 🔁 Traefik 自動重載新證書（無需重啟）

**更新流程：**

```
證書到期前 30 天：
1. cert-manager 檢測到證書即將過期
2. 自動創建新的 CertificateRequest
3. 向 Let's Encrypt 請求新證書
4. Let's Encrypt 驗證域名所有權
5. 簽發新證書
6. 更新 Secret: token-admin-api-tls
7. Traefik 自動使用新證書
8. 完成！（整個過程自動化，無停機時間）
```

#### 監控證書

```bash
# 查看證書狀態
kubectl get certificate -n passontw-services-staging

# 查看證書到期時間
kubectl get certificate token-admin-api-tls \
  -n passontw-services-staging \
  -o jsonpath='{.status.notAfter}'

# 查看證書詳情
kubectl describe certificate token-admin-api-tls \
  -n passontw-services-staging

# 查看證書申請進度
kubectl get challenge -n passontw-services-staging

# 查看 cert-manager 日誌
kubectl logs -n cert-manager deployment/cert-manager -f
```

---

### 🔍 常用檢查命令

```bash
# DNS 檢查
dig token-admin-api.passon.tw

# Ingress 狀態
kubectl get ingress -n passontw-services-staging

# 證書狀態
kubectl get certificate -n passontw-services-staging

# 測試 HTTP 重定向
curl -I http://token-admin-api.passon.tw/health-check

# 測試 HTTPS 訪問
curl https://token-admin-api.passon.tw/health-check

# 查看證書信息
openssl s_client -connect token-admin-api.passon.tw:443 \
  -servername token-admin-api.passon.tw < /dev/null 2>/dev/null | \
  openssl x509 -noout -dates
```

---

### 🔧 DNS & HTTPS 故障排除

#### 問題 1：DNS 無法解析

```bash
# 檢查 DNS 傳播
dig token-admin-api.passon.tw +trace
```

**可能原因：**
- DNS 尚未傳播（等待 5-30 分鐘）
- Gandi 配置錯誤
- TTL 設定過高

#### 問題 2：證書申請失敗

```bash
# 查看詳細錯誤
kubectl describe certificate token-admin-api-tls -n passontw-services-staging
kubectl describe challenge -n passontw-services-staging
```

**常見原因：**
- DNS 尚未生效
- 80 端口無法訪問
- Let's Encrypt 速率限制（50 證書/週）

**解決方案：**
```bash
# 先使用 staging issuer 測試
# 修改 Ingress annotation:
# cert-manager.io/cluster-issuer: "letsencrypt-staging"
```

#### 問題 3：HTTPS 無法訪問

```bash
# 檢查證書是否就緒
kubectl get certificate -n passontw-services-staging

# 檢查 Ingress 配置
kubectl describe ingress token-services-ingress-staging \
  -n passontw-services-staging

# 查看 Traefik 日誌
kubectl logs -n kube-system deployment/traefik --tail=50
```

#### 問題 4：HTTP 沒有重定向到 HTTPS

```bash
# 檢查 Ingress annotations
kubectl get ingress token-services-ingress-staging \
  -n passontw-services-staging \
  -o yaml | grep annotations -A 10
```

確保有：
```yaml
traefik.ingress.kubernetes.io/redirect-entry-point: https
```

#### 問題 5：證書不受信任

檢查是否使用了 staging issuer：

```bash
kubectl get ingress token-services-ingress-staging \
  -n passontw-services-staging \
  -o yaml | grep cluster-issuer
```

應該是：
```yaml
cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

而不是：`letsencrypt-staging`

---

### 📊 為 App API 添加 HTTPS

如果您也想為 App API 設定 HTTPS：

#### 1. Gandi DNS 設定

```
類型: A
名稱: token-app-api
IPv4 地址: 172.237.27.17
TTL: 300
```

#### 2. 更新 Ingress 配置

編輯 `k8s/ingress/ingress-staging-https.yaml` 添加：

```yaml
spec:
  tls:
  - hosts:
    - token-admin-api.passon.tw
    secretName: token-admin-api-tls
  - hosts:
    - token-app-api.passon.tw
    secretName: token-app-api-tls
  
  rules:
  - host: token-admin-api.passon.tw
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: token-admin-api
            port:
              number: 8080
  
  - host: token-app-api.passon.tw
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: token-app-api
            port:
              number: 8080
```

#### 3. 重新部署

```bash
kubectl apply -f k8s/ingress/ingress-staging-https.yaml
```

cert-manager 會自動為 `token-app-api.passon.tw` 申請證書。

---

### ✅ HTTPS 檢查清單

#### DNS 設定
- [ ] 登入 Gandi
- [ ] 添加 A 記錄：token-admin-api.passon.tw → 172.237.27.17
- [ ] 等待 DNS 傳播（5-30 分鐘）
- [ ] 驗證 DNS：`dig token-admin-api.passon.tw`

#### HTTPS 設定
- [ ] 部署 Ingress：`kubectl apply -f k8s/ingress/ingress-staging-https.yaml`
- [ ] 檢查 Ingress：`kubectl get ingress -n passontw-services-staging`
- [ ] 檢查 Certificate：`kubectl get certificate -n passontw-services-staging`
- [ ] 等待證書簽發（1-5 分鐘）

#### 測試驗證
- [ ] 測試 HTTP 重定向：`curl -I http://token-admin-api.passon.tw`
- [ ] 測試 HTTPS 訪問：`curl https://token-admin-api.passon.tw/health-check`
- [ ] 瀏覽器測試：https://token-admin-api.passon.tw/health-check
- [ ] 檢查證書有效期

#### 自動更新
- [ ] 確認 cert-manager 運行中
- [ ] 證書會在到期前 30 天自動更新
- [ ] 無需手動操作 ✨

---

### 📚 Let's Encrypt 相關

#### 速率限制

- **證書/註冊域名/週**: 50 個
- **重複證書/週**: 5 個
- **失敗驗證/帳戶/小時**: 5 次

**建議：**
- 測試時使用 `letsencrypt-staging`
- 確認無誤後再切換到 `letsencrypt-prod`

#### 證書有效期

- **Let's Encrypt 證書**: 90 天
- **自動更新時間**: 到期前 30 天
- **更新頻率**: cert-manager 每小時檢查一次

---

### 🎉 完成！

現在您的 API 已經：
- ✅ 使用自訂域名（如：token-admin-api.passon.tw）
- ✅ 啟用 HTTPS 加密
- ✅ 自動更新 SSL 證書
- ✅ HTTP 自動重定向到 HTTPS
- ✅ 零停機部署

**自動化腳本：**
```bash
# 一鍵部署 DNS & HTTPS
./scripts/deploy-https.sh
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

## 🔧 環境變數管理

> 所有服務的自動化環境變數管理（Token APIs 和 POS Services）

### 📋 概述

所有服務使用以下方式管理環境變數：

- **非敏感配置** → Kubernetes ConfigMap（從 GitHub Secrets 自動同步）
- **敏感配置** → Kubernetes Secret（手動創建，如 DB_PASSWORD, JWT_SECRET）

### 🎯 支援的服務

| 服務 | GitHub Secret | ConfigMap 名稱 |
|------|---------------|----------------|
| **token-admin-api** | `DEV_TOKEN_ADMIN` | `admin-api-config` |
| **token-app-api** | `DEV_TOKEN_APP` | `app-api-config` |
| **pos-backend-api** | `DEV_POS_BACKEND` | `pos-backend-config` |
| **pos-merchant-service** | `DEV_POS_MERCHANT` | `pos-merchant-config` |

### 🎯 核心功能

#### 1. 自動同步環境變數
- 從 GitHub Secrets（`DEV_POS_BACKEND`, `DEV_POS_MERCHANT`）讀取 .env 內容
- 自動過濾敏感信息（包含 SECRET/PASSWORD/KEY/TOKEN 的變量）
- 更新 Kubernetes ConfigMap
- 部署時自動應用新配置

#### 2. 安全性保護
- ✅ 敏感信息自動過濾，不會寫入 ConfigMap
- ✅ ConfigMap 只包含非敏感配置
- ✅ 敏感配置繼續使用 Kubernetes Secret 管理

#### 3. 簡化配置
- ✅ 使用 `envFrom` 自動載入所有 ConfigMap 變數
- ✅ 新增環境變數無需修改 deployment.yaml
- ✅ 維護更簡單

### 🚀 快速設定

#### 步驟 1：在 GitHub 添加 Secrets

前往：Repository → Settings → Secrets and variables → Actions

**Token Admin API: `DEV_TOKEN_ADMIN`**
```bash
APP_ENV=staging
APP_PORT=8080
LOG_LEVEL=info
CORS_ALLOWED_ORIGINS=*
SWAGGER_BASE_DOMAIN=token-admin-api.passon.tw
MAX_CONNECTIONS=100
IDLE_TIMEOUT=120s
READ_TIMEOUT=30s
WRITE_TIMEOUT=30s
# ... 其他非敏感配置
```

**Token App API: `DEV_TOKEN_APP`**
```bash
APP_ENV=staging
APP_PORT=8080
LOG_LEVEL=info
SWAGGER_BASE_DOMAIN=token-app-api.passon.tw
# ... 其他非敏感配置
```

**POS Backend API: `DEV_POS_BACKEND`**
```bash
APP_ENV=staging
HTTP_PORT=8080
LOG_LEVEL=info
SWAGGER_BASE_DOMAIN=pos-backend-api.passon.tw
# ... 其他非敏感配置
```

**POS Merchant Service: `DEV_POS_MERCHANT`**
```bash
APP_ENV=staging
HTTP_PORT=8080
LOG_LEVEL=info
LOG_DEVELOPMENT=false
LOG_ENCODING=json
SWAGGER_BASE_DOMAIN=pos-merchant-api.passon.tw
# ... 其他非敏感配置
```

#### 步驟 2：觸發部署

```bash
# 推送代碼自動部署
git push origin develop

# 或手動觸發（GitHub Actions 頁面）
```

#### 步驟 3：驗證

```bash
# 查看 ConfigMap
kubectl get configmap admin-api-config -n passontw-services-staging -o yaml
kubectl get configmap app-api-config -n passontw-services-staging -o yaml
kubectl get configmap pos-backend-config -n passontw-services-staging -o yaml
kubectl get configmap pos-merchant-config -n passontw-services-staging -o yaml

# 查看 Pod 狀態
kubectl get pods -n passontw-services-staging -l app=token-admin-api
kubectl get pods -n passontw-services-staging -l app=token-app-api
kubectl get pods -n passontw-services-staging -l app=pos-backend-service
kubectl get pods -n passontw-services-staging -l app=pos-merchant-service
```

### ⚠️ 重要注意事項

#### 什麼應該放在 GitHub Secrets？

✅ **可以放入**（非敏感配置）：
- `APP_ENV`
- `HTTP_PORT`
- `LOG_LEVEL`
- `LOG_DEVELOPMENT`
- `LOG_ENCODING`
- `SWAGGER_BASE_DOMAIN`
- 任何不包含密碼、密鑰的配置

❌ **不應放入**（敏感配置）：
- `DB_PASSWORD`
- `JWT_SECRET`
- `API_KEY`
- `SECRET_TOKEN`
- 任何包含 `SECRET`, `PASSWORD`, `KEY`, `TOKEN` 的變量

**原因**：CI/CD 會自動過濾包含 `SECRET/PASSWORD/KEY/TOKEN` 的變量，這些應該在 Kubernetes Secrets 中管理。

### 🔄 工作流程

```
開發本地 .env
    ↓
複製內容到 GitHub Secret
(DEV_POS_BACKEND / DEV_POS_MERCHANT)
    ↓
推送代碼到 develop 分支
    ↓
GitHub Actions 觸發
    ↓
CI/CD 讀取 GitHub Secret
    ↓
過濾敏感信息
    ↓
更新 Kubernetes ConfigMap
    ↓
部署應用
    ↓
Pod 自動載入新配置
```

### 📝 添加新環境變數

#### 快速步驟

1. **更新本地 .env**
```bash
# cmd/pos-backend-api/.env
NEW_FEATURE_ENABLED=true
```

2. **更新 GitHub Secret**
- 前往 GitHub → Settings → Secrets
- 編輯 `DEV_POS_BACKEND`
- 添加新行：`NEW_FEATURE_ENABLED=true`

3. **觸發部署**
```bash
git push origin develop
```

4. **完成** 🎉
- ConfigMap 自動更新
- Pod 自動重啟（如果配置有變化）
- 新環境變數生效

### 📊 配置對比

#### 更新前（傳統方式）

```yaml
# deployment.yaml - 每個環境變數都要手動定義
env:
- name: APP_ENV
  valueFrom:
    configMapKeyRef:
      name: pos-backend-config
      key: APP_ENV
- name: HTTP_PORT
  valueFrom:
    configMapKeyRef:
      name: pos-backend-config
      key: HTTP_PORT
# ... 重複 N 次
```

**問題**：
- ❌ 每次新增環境變數都要修改 deployment.yaml
- ❌ 容易遺漏
- ❌ 維護困難

#### 更新後（新方式）

```yaml
# deployment.yaml - 自動載入所有 ConfigMap 變數
envFrom:
- configMapRef:
    name: pos-backend-config

env:
# 只需定義 Secret 引用
- name: DB_HOST
  valueFrom:
    secretKeyRef: ...
```

**優勢**：
- ✅ 新增環境變數只需更新 GitHub Secret
- ✅ 自動同步到 Kubernetes
- ✅ 維護簡單
- ✅ 敏感信息自動過濾

### 🔐 敏感信息管理

#### 如何添加敏感配置？

敏感配置應該使用 Kubernetes Secret 管理：

```bash
# 創建 Secret
kubectl create secret generic pos-backend-secrets \
  --from-literal=API_KEY="your-api-key" \
  --from-literal=SECRET_TOKEN="your-secret" \
  -n passontw-services-staging

# 或更新現有 Secret
kubectl create secret generic pos-backend-secrets \
  --from-literal=API_KEY="new-key" \
  --dry-run=client -o yaml | kubectl apply -f -
```

#### 在 Deployment 中使用 Secret

如果需要添加新的敏感配置，需要更新 `k8s/services/pos-backend-api/deployment.yaml`：

```yaml
env:
# ... 現有的 Secret 引用 ...

# 新增 Secret 引用
- name: API_KEY
  valueFrom:
    secretKeyRef:
      name: pos-backend-secrets
      key: API_KEY
```

### 🧪 測試和驗證

#### 測試 ConfigMap 更新

```bash
# 1. 查看當前 ConfigMap
kubectl describe configmap pos-backend-config -n passontw-services-staging

# 2. 更新 GitHub Secret
# （在 GitHub 網頁更新）

# 3. 觸發部署
git commit --allow-empty -m "test: trigger deployment"
git push origin develop

# 4. 等待部署完成後檢查
kubectl get configmap pos-backend-config -n passontw-services-staging -o yaml

# 5. 檢查 Pod 是否使用新配置
kubectl get pods -n passontw-services-staging -l app=pos-backend-api
kubectl logs <pod-name> -n passontw-services-staging | head -20
```

#### 驗證環境變數

```bash
# 進入 Pod
kubectl exec -it <pod-name> -n passontw-services-staging -- sh

# 查看所有環境變數
env | sort

# 查看特定環境變數
echo $APP_ENV
echo $LOG_LEVEL
```

### 🚨 故障排除

#### 問題 1：ConfigMap 沒有更新

**可能原因**：
- GitHub Secret 格式錯誤
- 所有變量都包含敏感關鍵字被過濾了

**解決方法**：
```bash
# 查看 GitHub Actions 日誌
# Actions → 選擇最近的 workflow run → 查看 "Update ConfigMap from .env" 步驟

# 手動驗證 Secret 格式
# 確保每行格式為：KEY=VALUE
# 沒有多餘的空格或特殊字符
```

#### 問題 2：Pod 無法啟動

**可能原因**：
- 缺少必要的環境變數
- 環境變數格式錯誤

**解決方法**：
```bash
# 查看 Pod 日誌
kubectl logs <pod-name> -n passontw-services-staging

# 查看 Pod 事件
kubectl describe pod <pod-name> -n passontw-services-staging

# 檢查 ConfigMap
kubectl get configmap pos-backend-config -n passontw-services-staging -o yaml
```

#### 問題 3：環境變數沒有生效

**可能原因**：
- Pod 沒有重啟
- ConfigMap 引用錯誤

**解決方法**：
```bash
# 強制重啟 Pod
kubectl rollout restart deployment/pos-backend-api -n passontw-services-staging

# 等待重啟完成
kubectl rollout status deployment/pos-backend-api -n passontw-services-staging

# 驗證新 Pod
kubectl exec -it <new-pod-name> -n passontw-services-staging -- env | grep YOUR_VAR
```

### ✨ 優勢總結

#### 1. 自動化
- ✅ 環境變數自動從 GitHub Secrets 同步
- ✅ 無需手動更新 ConfigMap
- ✅ 部署時自動應用

#### 2. 安全性
- ✅ 敏感信息自動過濾
- ✅ ConfigMap 只包含非敏感配置
- ✅ 敏感配置使用 Kubernetes Secret

#### 3. 易維護
- ✅ 統一的配置管理
- ✅ 使用 `envFrom` 自動載入
- ✅ 新增變數無需修改 deployment.yaml

#### 4. 一致性
- ✅ 本地 .env 與 Kubernetes 配置一致
- ✅ 降低配置錯誤風險

### 📚 相關文件

**已更新的文件**：

**Token APIs**：
1. `.github/workflows/cicd-token-admin-api.yaml` - 添加 ConfigMap 同步步驟
2. `.github/workflows/cicd-token-app-api.yaml` - 添加 ConfigMap 同步步驟
3. `k8s/services/token-admin-api/deployment.yaml` - 改用 envFrom
4. `k8s/services/token-app-api/deployment.yaml` - 改用 envFrom
5. `k8s/services/token-admin-api/configmap.yaml` - 添加說明註釋
6. `k8s/services/token-app-api/configmap.yaml` - 添加說明註釋

**POS Services**：
7. `.github/workflows/cicd-pos-backend-api.yaml` - 添加 ConfigMap 同步步驟
8. `.github/workflows/cicd-pos-merchant-service.yaml` - 添加 ConfigMap 同步步驟
9. `k8s/services/pos-backend-api/deployment.yaml` - 改用 envFrom
10. `k8s/services/pos-merchant-service/deployment.yaml` - 改用 envFrom
11. `k8s/services/pos-backend-api/configmap.yaml` - 添加說明註釋
12. `k8s/services/pos-merchant-service/configmap.yaml` - 添加說明註釋

### ✅ 驗證檢查清單

部署後請驗證：

- [ ] GitHub Secrets 已設定
  - [ ] `DEV_TOKEN_ADMIN`（Token Admin API）
  - [ ] `DEV_TOKEN_APP`（Token App API）
  - [ ] `DEV_POS_BACKEND`（POS Backend API）
  - [ ] `DEV_POS_MERCHANT`（POS Merchant Service）
- [ ] CI/CD 執行成功
- [ ] ConfigMap 已更新（`kubectl get configmap -n passontw-services-staging`）
- [ ] Pod 正常運行（`kubectl get pods -n passontw-services-staging`）
- [ ] 應用日誌正常（`kubectl logs -f deployment/<service-name>`）
- [ ] 健康檢查通過（`/health-check` 或 `/health`, `/ready`）

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

## 🌍 CORS 配置

### 概述

本專案已在 `pkg/middleware/cors.go` 中實作完整的 CORS（跨域資源共享）配置，以支援前端應用程式的跨域 API 請求。

### 已配置的 CORS 設定

#### 允許的來源 (AllowOrigins)

```go
[]string{
    "*"    // 允許所有來源（開發階段使用）
}
```

⚠️ **重要提醒**：
- 當前配置允許**所有來源**存取 API，適合開發和測試階段
- 生產環境建議限制特定來源以提高安全性
- 當 `AllowOrigins` 設為 `"*"` 時，`AllowCredentials` 必須為 `false`

#### 允許的 HTTP 方法 (AllowMethods)

- `GET`
- `POST`
- `PUT`
- `PATCH`
- `DELETE`
- `OPTIONS` ⚠️ **必須包含以處理預檢請求**

#### 允許的請求標頭 (AllowHeaders)

- `Origin`
- `Content-Type`
- `Accept`
- `Authorization`
- `X-Requested-With`
- `X-CSRF-Token`

#### 其他設定

- **AllowCredentials**: `false` - 不允許攜帶憑證（因使用萬用字元 `"*"`）
- **MaxAge**: `12 小時` - 預檢請求結果快取時間
- **ExposeHeaders**: `Content-Length`, `Content-Type` - 允許前端存取的回應標頭

⚠️ **關於 AllowCredentials**：
- 當 `AllowOrigins` 為 `"*"` 時，`AllowCredentials` 必須為 `false`
- 如需使用 cookies 或 Authorization headers，請改用明確的來源清單

### 部署狀態

| 服務 | 狀態 | 網域 | 測試指令 |
|------|------|------|----------|
| token-admin-api | ✅ 已配置 | `https://token-admin-api.passon.tw` | `./scripts/test-cors.sh token-admin-api` |
| token-app-api | ✅ 已配置 | `https://token-app-api.passon.tw` | `./scripts/test-cors.sh token-app-api` |

### 測試 CORS 配置

#### 方法 1: 使用測試腳本（推薦）

```bash
# 測試 token-admin-api
./scripts/test-cors.sh token-admin-api

# 測試 token-app-api
./scripts/test-cors.sh token-app-api

# 自訂測試
./scripts/test-cors.sh <service> <domain> <origin>
```

#### 方法 2: 使用 curl 手動測試

```bash
# 測試 OPTIONS 預檢請求
curl -X OPTIONS \
  'https://token-admin-api.passon.tw/auth/login' \
  -H 'Origin: http://localhost:3000' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type,authorization' \
  -v
```

**預期回應標頭**:
```
HTTP/2 200
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Requested-With, X-CSRF-Token
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 43200
```

#### 方法 3: 使用瀏覽器開發工具測試

1. 開啟前端應用（http://localhost:3000）
2. 打開瀏覽器開發者工具（F12）
3. 切換到 **Network** 分頁
4. 執行登入或其他 API 請求
5. 檢查是否有 OPTIONS 請求，狀態應為 `200` 或 `204`
6. 檢查 POST/GET 等實際請求是否成功

### 常見問題排查

#### ❌ OPTIONS 請求返回 404

**原因**: 後端沒有處理 OPTIONS 請求  
**解決**: 已在 `pkg/middleware/cors.go` 配置 CORS 中介軟體

#### ❌ 瀏覽器顯示 CORS 錯誤

**錯誤訊息**:
```
Access to fetch at 'https://token-admin-api.passon.tw/auth/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**可能原因**:
1. 前端請求的 Origin 不在允許清單中
2. 請求的標頭不在 AllowHeaders 中
3. CORS 中介軟體未正確載入

**解決方案**:
1. 檢查 `pkg/middleware/cors.go` 的 `AllowOrigins` 是否包含前端 Origin
2. 檢查 `cmd/token-*-api/internal/server/server.go` 是否正確載入 CORS 中介軟體
3. 重新部署後端服務

#### ❌ 攜帶 credentials 時出錯

**錯誤訊息**:
```
The value of the 'Access-Control-Allow-Origin' header must not be '*' 
when the request's credentials mode is 'include'
```

**原因**: 當 `AllowCredentials` 為 `true` 時，不能使用萬用字元 `*`  
**解決**: 已正確配置為明確的來源清單

### 架構說明

```
請求流程:
前端 (localhost:3000) 
  ↓
  [OPTIONS 預檢請求]
  ↓
後端 CORS 中介軟體 (pkg/middleware/cors.go)
  ↓
  [檢查 Origin, Method, Headers]
  ↓
  [返回 Access-Control-* 標頭]
  ↓
前端收到許可
  ↓
  [發送實際的 POST/GET 請求]
  ↓
後端處理請求
  ↓
返回結果（包含 CORS 標頭）
```

### 中介軟體載入順序

**重要**: CORS 中介軟體必須在其他中介軟體之前載入

```go
engine.Use(gin.Recovery())
engine.Use(corsMw.Handler())   // ✅ CORS 必須優先
engine.Use(loggerMw.Handler())
```

### 如何限制特定來源（生產環境建議）

當前配置允許所有來源（`"*"`）。如需限制特定來源：

1. 編輯 `pkg/middleware/cors.go`
2. 修改 `allowOrigins` 為明確的來源清單：

```go
func NewCORSMiddleware(allowOrigins []string) *CORSMiddleware {
	if len(allowOrigins) == 0 {
		// 指定允許的來源
		allowOrigins = []string{
			"http://localhost:3000",             // 本地開發
			"http://localhost:3001",             // 備用開發
			"https://admin.passon.tw",           // 前端生產環境
			"https://app.passon.tw",             // App 生產環境
		}
	}
	// ...
}
```

3. 如需攜帶憑證，將 `AllowCredentials` 改為 `true`：

```go
AllowCredentials: true,  // 允許 cookies 和 Authorization headers
```

4. 重新編譯並部署
5. 使用測試腳本驗證

### 安全建議

⚠️ **當前配置（開發模式）**:
- ✅ 允許所有來源（`"*"`）- 方便開發和測試
- ⚠️ 不適合生產環境 - 存在安全風險
- ⚠️ 無法攜帶憑證 - AllowCredentials 為 false

✅ **生產環境推薦做法**:
- 明確列出允許的來源（避免使用 `*`）
- 只開放必要的 HTTP 方法
- 只允許必要的請求標頭
- 設定合理的 MaxAge
- 定期檢視和更新允許的來源清單
- 如需攜帶憑證，使用明確來源 + AllowCredentials: true

❌ **生產環境避免做法**:
- 使用萬用字元 `AllowOrigins: ["*"]`（當前設定）
- 開放所有 HTTP 方法
- 允許所有請求標頭
- 在生產環境中允許開發用的 Origin

### 相關檔案

- `pkg/middleware/cors.go` - CORS 中介軟體實作
- `pkg/middleware/module.go` - 中介軟體模組配置
- `cmd/token-admin-api/internal/server/server.go` - Admin API 伺服器配置
- `cmd/token-app-api/internal/server/server.go` - App API 伺服器配置
- `scripts/test-cors.sh` - CORS 測試腳本

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

