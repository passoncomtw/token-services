const express = require('express');
const router = express.Router();
const yup = require('yup');
const { getBackendactors, getBackendactor, createBackendactor, updateBackendactor, deleteBackendactor } = require('../services/backendactorServices');
const { responseOk, responseErrWithMsg } = require('../helpers/response');
const { backendactorPermissonsSchema } = require('../helpers/validateSchemas');

router.get('/', async (req, res) => {
  try {
    const data = await getBackendactors(req.query);
    responseOk(res, {
      success: true,
      data,
     });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

router.get('/permissions', async (req, res) => {
  try {
    responseOk(res, {
      success: true,
      data: [
        {
          functionName: '会员管理',
          functionIdentify: 1,
          parentId: null,
          children: [
            {
              functionName: '会员列表',
              functionIdentify: 2,
              parentId: 1,
              children: [
                {
                  functionName: '订单（检视）',
                  functionIdentify: 3,
                  parentId: 2,
                  children: [],
                },
                {
                  functionName: '订单（取消订单）',
                  functionIdentify: 4,
                  parentId: 2,
                  children: [],
                },
                {
                  functionName: '挂单（检视）',
                  functionIdentify: 5,
                  parentId: 2,
                  children: [],
                },
                {
                  functionName: '挂单（操作）',
                  functionIdentify: 6,
                  parentId: 2,
                  children: [],
                },
                {
                  functionName: '收付账户（检视）',
                  functionIdentify: 7,
                  parentId: 2,
                  children: [],
                },
                {
                  functionName: '收付账户（删除账户）',
                  functionIdentify: 8,
                  parentId: 2,
                  children: [],
                },
                {
                  functionName: '会员资料（检视）',
                  functionIdentify: 9,
                  parentId: 2,
                  children: [],
                },
                {
                  functionName: '会员资料（编辑）',
                  functionIdentify: 10,
                  parentId: 2,
                  children: [],
                },
                {
                  functionName: '会员资料（更改登录密码）',
                  functionIdentify: 11,
                  parentId: 2,
                  children: [],
                },
                {
                  functionName: '会员资料（更改交易密码）',
                  functionIdentify: 12,
                  parentId: 2,
                  children: [],
                },
                {
                  functionName: '会员资料（解除锁定）',
                  functionIdentify: 13,
                  parentId: 2,
                  children: [],
                },
                {
                  functionName: '会员资料（购买手续费）',
                  functionIdentify: 14,
                  parentId: 2,
                  children: [],
                },
                {
                  functionName: '会员资料（出售手续费）',
                  functionIdentify: 15,
                  parentId: 2,
                  children: [],
                },
              ],
            },
            {
              functionName: '账户列表',
              functionIdentify: 16,
              parentId: 1,
              children: [
                {
                  functionName: '账户列表（删除账户）',
                  functionIdentify: 17,
                  parentId: 16,
                  children: [],
                },
              ],
            },
            {
              functionName: '新增商家',
              functionIdentify: 18,
              parentId: 1,
              children: [],
            },
          ],
        },
        {
          functionName: '订单管理',
          functionIdentify: 19,
          parentId: null,
          children: [
            {
              functionName: '订单管理（取消订单）',
              functionIdentify: 20,
              parentId: 19,
              children: [],
            },
          ],
        },
        {
          functionName: '挂单管理',
          functionIdentify: 21,
          parentId: null,
          children: [
            {
              functionName: '挂单管理（操作）',
              functionIdentify: 22,
              parentId: 21,
              children: [],
            },
          ],
        },
        {
          functionName: '系统设置',
          functionIdentify: 23,
          parentId: null,
          children: [
            {
              functionName: '帳號列表',
              functionIdentify: 24,
              parentId: 23,
              children: [
                {
                  functionName: '账号列表（新增账号）',
                  functionIdentify: 25,
                  parentId: 24,
                  children: [],
                },
                {
                  functionName: '账号列表（删除账号）',
                  functionIdentify: 26,
                  parentId: 24,
                  children: [],
                },
              ],
            },
            {
              functionName: '角色權限',
              functionIdentify: 27,
              parentId: 23,
              children: [
                {
                  functionName: '角色权限（新增角色）',
                  functionIdentify: 28,
                  parentId: 27,
                  children: [],
                },
                {
                  functionName: '角色权限（删除角色）',
                  functionIdentify: 29,
                  parentId: 27,
                  children: [],
                },
              ],
            },
          ],
        },
      ],
     });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

const createRequestSchema = yup.object({
  name: yup.string().required('暱稱不可為空'),
  markup: yup.string(),
  permissions: backendactorPermissonsSchema,
});

router.post('/', async (req, res) => {
  try {
    await createRequestSchema.validate(req.body);
    const result = await createBackendactor(req.body);
    responseOk(res, { success: true, data: result });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

router.put('/:backendActorId', async (req, res) => {
  try {
    await createRequestSchema.validate(req.body);
    const {backendActorId} = req.params;
    await updateBackendactor(backendActorId, req.body);
    const result = await getBackendactor({ id: backendActorId});
    responseOk(res, { success: true, data: result });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

router.delete('/:backendActorId', async (req, res) => {
  try {
    const {backendActorId} = req.params;
    await deleteBackendactor(backendActorId);
    responseOk(res, { success: true });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

module.exports = router;
