const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const { specs } = require('../constants/swaggerOptions');
const { jwtAuthorizationMiddleware } = require('../helpers/passportManager');
const indexRouter = require('../controllers/index');
const authRouter = require('../controllers/authRouter');
const userRouter = require('../controllers/userRouter');
const backenduserRouter = require('../controllers/backenduserRouter');
const backendactorRouter = require('../controllers/backendactorRouter');
const pendingOrderRouter = require('../controllers/pendingOrderRouter');
const bankcardRouter = require('../controllers/bankcardRouter');
const orderRouter = require('../controllers/orderRouter');
const bankRouter = require('../controllers/bankRouter');

const ENVIRONMENT = process.env.ENV || 'dev';

let expressApp = express();
if (ENVIRONMENT === 'dev') {
  // Log every HTTP request. See https://github.com/expressjs/morgan for other
  // available formats.
  expressApp.use(morgan('dev'));
}

expressApp.use(cors());
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: false }));
expressApp.use(cookieParser());

expressApp.use(passport.initialize());

expressApp.use('/', indexRouter);
expressApp.use('/auth', authRouter);
expressApp.use('/banks', jwtAuthorizationMiddleware, bankRouter);
expressApp.use('/bankcards', jwtAuthorizationMiddleware, bankcardRouter);
expressApp.use('/backendusers', jwtAuthorizationMiddleware, backenduserRouter);
expressApp.use('/backendactors', jwtAuthorizationMiddleware, backendactorRouter);
expressApp.use('/users', jwtAuthorizationMiddleware, userRouter);
expressApp.use('/orders', jwtAuthorizationMiddleware, orderRouter);
expressApp.use('/pending/orders', jwtAuthorizationMiddleware, pendingOrderRouter);

// Add GET /health-check express route
expressApp.get('/health-check', (req, res) => {
  res.json({
    success: true,
    data: { status: 'WORKING' }
  });
});

// Swagger JSON 端點 - 提供 JSON 格式的 API 文檔
// 訪問 http://localhost:8300/api-docs.json 可取得完整的 Swagger 規格 JSON
expressApp.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(specs);
});

// Swagger UI - 視覺化 API 文檔
expressApp.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    swaggerOptions: {
      url: "/api-docs.json", // 告訴 Swagger UI 從這個 URL 載入 JSON
      persistAuthorization: true, // 保持授權狀態，重新載入頁面後仍保留 token
    },
  })
);

module.exports = expressApp;