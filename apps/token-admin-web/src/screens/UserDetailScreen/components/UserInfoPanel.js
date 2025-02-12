import React, { Fragment, useState } from 'react';
import Grid from '~/components/Grid';
import CreateIcon from '@material-ui/icons/Create';
import LabelText from '~/components/FormFields/LabelText';
import { PanelHeader, PanelBody } from '~/components/Panels';
import colors from '~/theme/colors';
import {
  USER_TYPE_TEXT,
  ACTIVE_STATUS_TEXT,
  WHETHER_STATUS_TEXT,
} from '~/constants/status.config';
import Button from '~/components/Buttons';
import MerchantInfo from './MerchantInfo';
import UnlockDialog from './UnlockDialog';
import EditInfoDialog from './EditInfoDialog';
import EditPasswordDialog from './EditPasswordDialog';
import EditFeeSettingsDialog from './EditFeeSettingsDialog';

const DIALOG_TYPES = {
  AUTH_PASSWORD: 'auth',
  TRANS_PASSWORD: 'trans',
  SELLING_SETTINGS: 'selling',
  BUYING_SETTINGS: 'buying',
  AUTH_UNLOCK: 'unlockAuth',
  TRANS_UNLOCK: 'unlockTrans',
  EDIT_INFO: 'editInfo',
};

const PASSWORD_DIALOG = [
  DIALOG_TYPES.AUTH_PASSWORD,
  DIALOG_TYPES.TRANS_PASSWORD,
];

const UNLOCK_DIALOG = [DIALOG_TYPES.AUTH_UNLOCK, DIALOG_TYPES.TRANS_UNLOCK];

const FEE_DIALOG = [
  DIALOG_TYPES.SELLING_SETTINGS,
  DIALOG_TYPES.BUYING_SETTINGS,
];

const styles = {
  linkButton: {
    color: colors.primary,
    textDecoration: 'underline',
    marginLeft: 10,
    cursor: 'pointer',
  },
};

const LinkButton = ({ show, text, onClick }) => {
  if (!show) return <Fragment />;

  return (
    <span style={styles.linkButton} onClick={onClick}>
      {text}
    </span>
  );
};

const QuarterLabelText = ({ title, value }) => (
  <Grid quarter>
    <LabelText title={title} value={value} />
  </Grid>
);

const UserInfoPanel = ({
  show,
  user,
  handleUpdateUserInfo,
  handleUpdateUserPwd,
  handleUpdateUserTransPwd,
  handleUnlockLogin,
  handleUnlockTransaction,
}) => {
  const [dialogType, setDialogType] = useState(null);

  if (!show) return <Fragment />;

  const userId = user.get('id');
  const status = user.get('status');
  const type = user.get('type');
  const transStatus = user.get('transStatus');
  const loginLock = user.get('loginLock');
  const transLock = user.get('transLock');
  const pendingStatus = user.get('pendingStatus');

  const openDialog = type => () => {
    setDialogType(type);
  };

  const onCancel = () => {
    setDialogType(null);
  };

  const onConfirm = payload => {
    switch (dialogType) {
      case 'editInfo':
        return handleUpdateUserInfo(payload);
      case 'auth':
        return handleUpdateUserPwd(payload);
      case 'trans':
        return handleUpdateUserTransPwd(payload);
      case 'unlockAuth':
        return handleUnlockLogin({ userId });
      case 'unlockTrans':
        return handleUnlockTransaction({ userId });
      case 'selling':
      case 'buying':
      default:
        break;
    }
  };

  return (
    <>
      <EditPasswordDialog
        open={PASSWORD_DIALOG.includes(dialogType)}
        isAuthPwd={dialogType === DIALOG_TYPES.AUTH_PASSWORD}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
      <UnlockDialog
        open={UNLOCK_DIALOG.includes(dialogType)}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
      <EditInfoDialog
        user={user.toJS()}
        open={dialogType === DIALOG_TYPES.EDIT_INFO}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
      <EditFeeSettingsDialog
        isSell={dialogType === DIALOG_TYPES.SELLING_SETTINGS}
        dialogType={dialogType}
        open={FEE_DIALOG.includes(dialogType)}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
      <PanelHeader
        title='會員基本資料'
        rightElement={
          <Button
            text='編輯'
            startIcon={<CreateIcon />}
            onClick={openDialog(DIALOG_TYPES.EDIT_INFO)}
          />
        }
      />
      <PanelBody>
        <Grid container>
          <QuarterLabelText title='帳號' value={user.get('account')} />
          <QuarterLabelText
            title='會員狀態'
            value={ACTIVE_STATUS_TEXT[status]}
          />
          <QuarterLabelText title='會員類型' value={USER_TYPE_TEXT[type]} />
          <QuarterLabelText title='暱稱' value={user.get('username')} />
          <QuarterLabelText title='郵箱' value={user.get('email')} />
          <QuarterLabelText title='註冊時間' value={user.get('registerTime')} />
          <QuarterLabelText title='聯絡人姓名' value={user.get('contactor')} />
          <QuarterLabelText title='手機號' value={user.get('phone')} />
          <QuarterLabelText title='Telegram' value={user.get('telegram')} />
          <QuarterLabelText title='推薦碼' value={user.get('refererCode')} />
          <Grid quarter>
            <LabelText title='登錄密碼' value='******'>
              <LinkButton
                show
                text='更改'
                onClick={openDialog(DIALOG_TYPES.AUTH_PASSWORD)}
              />
            </LabelText>
          </Grid>
          <Grid quarter>
            <LabelText title='交易密碼' value='******'>
              <LinkButton
                show
                text='更改'
                onClick={openDialog(DIALOG_TYPES.TRANS_PASSWORD)}
              />
            </LabelText>
          </Grid>
          <QuarterLabelText title='推薦人帳號' value={user.get('referer')} />
          <QuarterLabelText
            title='交易狀態'
            value={ACTIVE_STATUS_TEXT[transStatus]}
          />
          <QuarterLabelText
            title='掛單狀態'
            value={ACTIVE_STATUS_TEXT[pendingStatus]}
          />
          <Grid quarter>
            <LabelText title='登錄鎖定' value={WHETHER_STATUS_TEXT[loginLock]}>
              <LinkButton
                show={loginLock === 1}
                text='解除'
                onClick={openDialog(DIALOG_TYPES.AUTH_UNLOCK)}
              />
            </LabelText>
          </Grid>
          <Grid quarter>
            <LabelText title='交易鎖定' value={WHETHER_STATUS_TEXT[transLock]}>
              <LinkButton
                show={transLock === 1}
                text='解除'
                onClick={openDialog(DIALOG_TYPES.TRANS_UNLOCK)}
              />
            </LabelText>
          </Grid>
          <QuarterLabelText title='備註' value={user.get('remark')} />
        </Grid>
      </PanelBody>
      <MerchantInfo
        show
        buying={user.get('buying')}
        selling={user.get('selling')}
        buyingDialog={openDialog(DIALOG_TYPES.BUYING_SETTINGS)}
        sellingDialog={openDialog(DIALOG_TYPES.SELLING_SETTINGS)}
      />
    </>
  );
};

export default UserInfoPanel;
