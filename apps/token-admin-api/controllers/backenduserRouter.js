const express = require('express');
const router = express.Router();
const yup = require('yup');
const { responseOk, responseErrWithMsg } = require('../helpers/response');
const { createBackendUser, getBackendUsers, getBackendUser, updateBackendUser, deleteBackendUser } = require('../services/backenduserServices');

router.get('/', async (req, res) => {
  try {
    const result = await getBackendUsers(req.query);
    responseOk(res, { success: true, data: result });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

const createRequestSchema = yup.object({
  name: yup.string().required('暱稱不可為空'),
  // actors: yup.array().required('角色不可為空'),
  account: yup.string().required('帳號不可為空'),
  password: yup.string().required('密碼不可為空'),
});

router.post('/', async (req, res) => {
  try {
    await createRequestSchema.validate(req.body);
    const userId = req.user.data.id;
    const result = await createBackendUser(userId, req.body);
    const newBackendUser = await getBackendUser(result.id);
    responseOk(res, { success: true, data: newBackendUser });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

const updateBackendUserRequestSchema = yup.object({
  name: yup.string().required('暱稱不可為空'),
  status: yup.mixed().oneOf([0, 1], '狀態錯誤'),
  account: yup.string().required('帳號不可為空'),
});

router.put('/:backendUserId', async (req, res) => {
  try {
    const { backendUserId } = req.params;

    if (Number(backendUserId) === 1) {
      throw new Error('權限不足');
    }

    await updateBackendUserRequestSchema.validate(req.body);
    await updateBackendUser(backendUserId, req.body);
    responseOk(res, { success: true });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

router.delete('/:backendUserId', async (req, res) => {
  try {
    const userId = req.user.data.id;
    const { backendUserId } = req.params;
    if (Number(userId) === Number(backendUserId)) {
      throw new Error('不能刪除自己');
    }

    if (Number(backendUserId) === 1) {
      throw new Error('權限不足');
    }

    await deleteBackendUser(backendUserId);
    responseOk(res, { success: true });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

module.exports = router;
