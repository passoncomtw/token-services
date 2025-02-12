import React from 'react';
import SettingsIcon from '@material-ui/icons/Settings';
import BankIcon from '@material-ui/icons/AccountBalance';
import UserIcon from '@material-ui/icons/AccountBox';
import AssistantIcon from '@material-ui/icons/Assistant';
import StorageIcon from '@material-ui/icons/Storage';

const routerConfig = [
  {
    id: 'users',
    icon: <UserIcon />,
    title: '會員管理',
    path: 'users',
    children: [
      {
        id: 'userList',
        text: '會員列表',
        path: '/users/list',
      },
      {
        id: 'userAccount',
        text: '帳戶列表',
        path: '/users/account',
      },
      {
        id: 'addUser',
        text: '新增商家',
        path: '/users/add',
      },
    ],
  },
  {
    id: 'order',
    icon: <StorageIcon />,
    title: '訂單管理',
    path: '/orders',
  },
  {
    id: 'pending',
    icon: <AssistantIcon />,
    title: '掛單管理',
    path: '/pending',
  },
  {
    id: 'bank',
    icon: <BankIcon />,
    title: '銀行管理',
    path: '/banks',
  },
  {
    id: 'system',
    icon: <SettingsIcon />,
    title: '系統設置',
    path: 'system',
    children: [
      {
        id: 'accounts',
        text: '帳號列表',
        path: '/system/account',
      },
      {
        id: 'roles',
        text: '角色列表',
        path: '/system/role',
      },
    ],
  },
  {
    id: 'SysPage',
    permissionId: 'default',
    hide: true,
    children: [
      {
        title: '錯誤頁面404',
        funGroup: 'SystemFunction',
        path: '*',
      },
    ],
  },
];

export default routerConfig;
