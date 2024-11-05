import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import ReturnBar from '~/components/ReturnBar';
import RefreshTime from '~/components/RefreshTime';
import Panel from '~/components/Panels/Panel';
import InfoPanel from './components/InfoPanel';
import PendingPanel from './components/PendingPanel';
import UserInfoPanel from './components/UserInfoPanel';
import UserOrderPanel from './components/UserOrderPanel';
import UserAccountPanel from './components/UserAccountPanel';

const UserDetailScreen = props => {
  const {
    history,
    userInfo,
    orders,
    pendings,
    accounts,
    refreshAt,
    handleGetUserInfo,
    handleUpdateUserInfo,
    handleGetUserAccountsList,
    handleGetUserOrderList,
    handleGetUserPendingOrderList,
    handleCancelOrder,
    handleCompleteOrder,
    handleCancelPendingOrder,
    handleDeletePendingOrder,
    handleOpenPendingOrder,
    handleStopPendingOrder,
    handleDeleteAccount,
    handleUpdateUserPwd,
    handleUpdateUserTransPwd,
    handleUnlockLogin,
    handleUnlockTransaction,
  } = props;
  const [activeTab, setActiveTab] = useState('order');
  const [refreshCount, setRefreshCount] = useState(0);
  const isActiveTab = tab => activeTab === tab;
  const goToUsers = () => history.push({ pathname: `/users/list` });
  const { userId } = useParams();

  useEffect(() => {
    handleGetUserInfo({ userId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setRefreshCount(refreshCount + 1);
  };

  return (
    <Box m={3}>
      <ReturnBar
        title='會員列表'
        onClick={goToUsers}
        rightElement={
          <RefreshTime dateTime={refreshAt} onRefrshClick={handleRefresh} />
        }
      />
      <InfoPanel data={userInfo} handleGetUserInfo={handleGetUserInfo} />
      <Panel>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab value='order' label='訂單' />
          <Tab value='pending' label='掛單' />
          <Tab value='bank' label='收付帳戶' />
          <Tab value='info' label='會員資料' />
        </Tabs>
        <UserOrderPanel
          show={isActiveTab('order')}
          userId={userId}
          refreshCount={refreshCount}
          data={orders}
          handleGetList={handleGetUserOrderList}
          handleCancelOrder={handleCancelOrder}
          handleCompleteOrder={handleCompleteOrder}
        />
        <PendingPanel
          show={isActiveTab('pending')}
          userId={userId}
          refreshCount={refreshCount}
          data={pendings}
          handleGetList={handleGetUserPendingOrderList}
          handleCancelPendingOrder={handleCancelPendingOrder}
          handleDeletePendingOrder={handleDeletePendingOrder}
          handleOpenPendingOrder={handleOpenPendingOrder}
          handleStopPendingOrder={handleStopPendingOrder}
        />
        <UserAccountPanel
          show={isActiveTab('bank')}
          userId={userId}
          refreshCount={refreshCount}
          data={accounts}
          handleGetList={handleGetUserAccountsList}
          handleDeleteAccount={handleDeleteAccount}
        />
        <UserInfoPanel
          show={isActiveTab('info')}
          user={userInfo}
          handleUpdateUserInfo={handleUpdateUserInfo}
          handleUpdateUserPwd={handleUpdateUserPwd}
          handleUpdateUserTransPwd={handleUpdateUserTransPwd}
          handleUnlockLogin={handleUnlockLogin}
          handleUnlockTransaction={handleUnlockTransaction}
        />
      </Panel>
    </Box>
  );
};

export default UserDetailScreen;
