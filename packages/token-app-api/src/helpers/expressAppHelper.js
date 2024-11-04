const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const { specs } = require('../constants/swaggerOptions');
const { jwtAuthorizationMiddleware } = require("../helpers/passportManager");
const indexRouter = require("../controllers/index");
const authRouter = require("../controllers/authRouter");
const homeRouter = require("../controllers/homeRouter");
const userRouter = require("../controllers/userRouter");
const bankcardRouter = require("../controllers/bankcardRouter");
const pendingOrderRouter = require("../controllers/pendingOrderRouter");
const orderRouter = require("../controllers/orderRouter");
const bankRouter = require("../controllers/bankRouter");

const ENVIRONMENT = process.env.ENV || "dev";

let expressApp = express();
if (ENVIRONMENT === "dev") {
  // Log every HTTP request. See https://github.com/expressjs/morgan for other
  // available formats.
  expressApp.use(morgan("dev"));
}

expressApp.use(cors());
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: false }));
expressApp.use(cookieParser());

expressApp.use(passport.initialize());

expressApp.use('/', indexRouter);
expressApp.use('/auth', authRouter);
expressApp.use('/banks', bankRouter);
expressApp.use('/users', userRouter);
expressApp.use('/home', jwtAuthorizationMiddleware, homeRouter);
expressApp.use('/bankcards', jwtAuthorizationMiddleware, bankcardRouter);
expressApp.use('/pending/orders', pendingOrderRouter);
expressApp.use('/orders', jwtAuthorizationMiddleware, orderRouter);

// Add GET /health-check express route
expressApp.get("/health-check", (req, res) => {
  res.json({
    success: true,
    data: { status: 'WORKING' }
  });
});

expressApp.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

module.exports = expressApp;