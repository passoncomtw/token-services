const express = require('express');
const yup = require('yup');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const pick = require('lodash/pick');
const { responseOk, responseErrWithMsg } = require('../helpers/response');
const {
  parseBackendUserResponse,
} = require('../services/backenduserServices');
const { updateBackendUserLoginPassword } = require('../services/authServices');
const { jwtAuthorizationMiddleware } = require('../helpers/passportManager');

const router = express.Router();
const { AUTH_SECRET } = process.env;

const updateLoginPasswordRequestSchema = yup.object({
  password: yup.string().required('舊密碼不可為空'),
  newPassword: yup.string().required('新密碼不可為空'),
});

router.post('/login/password', jwtAuthorizationMiddleware, async (req, res) => {
  try {
    const validation = await updateLoginPasswordRequestSchema.validate(req.body);
    const userId = req.user.data.id;
    await updateBackendUserLoginPassword(userId, validation);
    responseOk(res, { success: true });
  } catch(error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

router.post('/login', (req, res) => {
  passport.authenticate('local', { session: true }, (error, user) => {
    if (error) return responseErrWithMsg(res, error.message);

    // const expireIn = add(new Date(), { days: 1 }).getTime();
    const signInfo = pick(user, ['id', 'account', 'name', 'email', 'type', 'merchant']);
    const token = jwt.sign(
      {
        data: signInfo,
        // exp: expireIn,
      },
      AUTH_SECRET
    );
    return responseOk(res, {
      success: true,
      data: {
        token,
        expireIn: undefined,
        user: parseBackendUserResponse(user),
      },
    });
  })(req, res);
});

router.post('/logout', (req, res) => {
  responseOk(res, {
    success: true,
  });
});

module.exports = router;
