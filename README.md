# 幣安風格 C2C 交易平台

這個項目是仿照幣安 C2C 交易功能開發的全功能交易平台，包含應用端服務、Web 管理後台以及相應的後端 API。

## 項目架構

該項目採用 monorepo 架構，使用 Yarn Workspaces 管理多個子項目：

- `apps/token-app-api`: 為移動應用提供的後端 API 服務
- `apps/token-admin-api`: 為管理後台提供的後端 API 服務
- `apps/token-admin-web`: 基於 React 的管理後台 Web 界面

## 特性

- 點對點數位貨幣交易
- 用戶註冊與身份驗證
- 訂單管理與處理
- 支付方式管理
- 安全交易流程
- 完整的管理後台

## 技術棧

- **前端**: React, Material-UI
- **後端**: Node.js, Express
- **數據庫**: MySQL (Sequelize ORM)
- **容器化**: Docker, Kubernetes
- **CI/CD**: GitHub Actions

## 快速開始

### 安裝依賴

```bash
yarn install
```

### 開發環境

```bash
# 啟動所有服務
yarn dev

# 或分別啟動
cd apps/token-app-api && yarn start:watch
cd apps/token-admin-api && yarn start:watch
cd apps/token-admin-web && yarn start
```

### 數據庫設置

```bash
# 應用 API 數據庫初始化
cd apps/token-app-api && yarn reset:local:db

# 管理後台 API 數據庫初始化
cd apps/token-admin-api && yarn reset:local:db
```

### 生產環境構建

```bash
yarn build
```

## 文檔

- [技術規格](./docs/tech_spec.md)
- [產品規格](./docs/product_spec.md)

## 許可證

GPL-3.0 