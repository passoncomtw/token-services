# 技術規格文檔

## 目錄
1. [系統架構](#系統架構)
2. [技術選型](#技術選型)
3. [API 設計](#api-設計)
4. [數據模型](#數據模型)
5. [安全規範](#安全規範)
6. [部署與運維](#部署與運維)
7. [效能考量](#效能考量)
8. [擴展性設計](#擴展性設計)

## 系統架構

### 整體架構
本項目採用前後端分離的微服務架構，基於 Yarn Workspace 的 monorepo 方式組織代碼：

```
token-services/
├── apps/
│   ├── token-app-api/      # 為移動應用提供的後端 API
│   ├── token-admin-api/    # 為管理後台提供的後端 API
│   └── token-admin-web/    # React 管理後台界面
```

### 服務拆分
- **App API 服務**: 處理移動應用的請求，包括用戶註冊、登錄、訂單創建等
- **Admin API 服務**: 處理管理後台的請求，包括用戶管理、訂單管理、數據統計等
- **Admin Web 服務**: 提供管理員操作的網頁界面

### 通信方式
- 前後端通信: RESTful API + JWT 認證
- 服務間通信: 通過數據庫共享數據

## 技術選型

### 前端技術
- **框架**: React 16+
- **狀態管理**: Redux + Redux-Saga
- **UI 組件庫**: Material-UI 4.x
- **數據獲取**: Axios
- **路由**: React Router
- **開發環境**: Create React App (custom-scripts)

### 後端技術
- **運行環境**: Node.js 14+
- **Web 框架**: Express.js
- **ORM**: Sequelize
- **API 文檔**: Swagger/OpenAPI
- **日誌**: Winston
- **安全**: Helmet, CORS, Rate Limiting

### 數據庫
- **主數據庫**: MySQL 8.0
- **緩存**: Redis (可選)

### 開發工具
- **版本控制**: Git (GitHub)
- **CI/CD**: GitHub Actions
- **容器化**: Docker, Kubernetes
- **項目管理**: Yarn Workspaces
- **測試**: Jest

## API 設計

### 設計原則
- 遵循 RESTful 設計規範
- 使用 JSON 作為數據交換格式
- 使用 JWT 進行身份驗證
- 統一錯誤處理和返回格式
- 支持分頁、篩選和排序
- 版本控制 (v1, v2)

### 主要 API 端點

#### App API
- **/api/v1/auth**: 認證相關（登錄、註冊、刷新令牌）
- **/api/v1/users**: 用戶資料管理
- **/api/v1/bankcards**: 銀行卡管理
- **/api/v1/orders**: 訂單管理
- **/api/v1/pending-orders**: 待處理訂單

#### Admin API
- **/api/v1/auth**: 管理員認證
- **/api/v1/backend-users**: 後台用戶管理
- **/api/v1/users**: 前台用戶管理
- **/api/v1/orders**: 訂單管理
- **/api/v1/banks**: 銀行管理
- **/api/v1/backend-actors**: 後台角色管理
- **/api/v1/pending-orders**: 待處理訂單管理

### 認證機制
使用 JWT (JSON Web Token) 進行認證，包含以下流程：
1. 用戶提供認證憑證（用戶名/密碼）
2. 服務端驗證並生成 JWT
3. 客戶端在隨後的請求中使用 Bearer Token 方式提供 JWT
4. Token 過期處理與刷新機制

## 數據模型

### 核心實體
- **User**: 平台用戶
- **Backenduser**: 後台管理員
- **Backendactor**: 後台角色
- **Order**: 交易訂單
- **PendingOrder**: 待處理訂單
- **Bankcard**: 用戶銀行卡
- **Bank**: 支持的銀行
- **Wallet**: 用戶錢包
- **OrderStatistics**: 訂單統計

### 關聯關係
- User 1:N Bankcard (一個用戶可有多張銀行卡)
- User 1:N Order (一個用戶可有多個訂單)
- Bank 1:N Bankcard (一家銀行可有多張卡)
- Backendactor 1:N Backenduser (一個角色可對應多個後台用戶)

## 安全規範

### 認證與授權
- 強密碼策略和密碼加密存儲
- 基於角色的訪問控制 (RBAC)
- JWT 令牌安全處理
- 防止會話固定攻擊

### API 安全
- 速率限制防止暴力攻擊
- HTTPS 加密傳輸
- CORS 配置
- 敏感數據過濾和脫敏
- 輸入驗證和參數清理

### 數據安全
- 敏感數據加密存儲
- 數據庫訪問控制
- 定期備份和災難恢復方案
- 數據脫敏和隱私保護

## 部署與運維

### 容器化
使用 Docker 實現服務容器化，提供 Dockerfile 和 Docker Compose 配置。

### 部署架構
- **開發環境**: 本地開發
- **測試環境**: 容器化部署
- **生產環境**: Kubernetes 集群

### CI/CD 流程
1. GitHub 代碼提交觸發 CI 流程
2. 自動化測試 (單元測試、集成測試)
3. 構建服務鏡像
4. 部署到對應環境

### 監控與日誌
- 服務健康檢查
- 性能監控
- 集中式日誌
- 錯誤追蹤和告警

## 效能考量

### 優化策略
- API 響應時間優化
- 數據庫索引優化
- 緩存策略
- 非同步處理
- 負載均衡

### 可擴展性
- 水平擴展設計
- 服務獨立部署
- 數據庫讀寫分離

## 擴展性設計

### 模塊化架構
項目遵循模塊化設計原則，便於功能擴展和重用。

### 未來可能的擴展
- 多幣種支持
- 國際化支持
- 報表與分析功能
- 更多支付方式
- 消息推送系統
- 風控系統 