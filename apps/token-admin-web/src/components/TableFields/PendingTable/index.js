import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '~/components/TableFields';
import { formatMoney } from '~/utils/format';
import Typography from '~/components/Typography';
import Button from '~/components/Buttons';
import ConfirmDialog from '~/components/AlertDialogWrapper/ConfirmDialog';
import {
  PENDING_STATUS,
  TRANSACTION_TYPE_TEXT,
  PENDING_STATUS_TEXT,
} from '~/constants/status.config';

const DIALOG_TYPE = {
  CANCEL: 'CANCEL',
  DELETE: 'DELETE',
  OPEN: 'OPEN',
  STOP: 'STOP',
};

const DIALOG_ACTION_TEXT = {
  CANCEL: '取消',
  DELETE: '刪除',
  OPEN: '開啓',
  STOP: '暫停',
};

const getHeaders = isUser => [
  '掛單時間',
  '掛單編號',
  ...(isUser ? [] : ['帳號']),
  '數量',
  '金額',
  '交易類型',
  '交易帳戶',
  '支付時效',
  '掛單狀態',
  '交易筆數',
  '剩餘數量',
  '操作',
];

const BankCell = ({ bank }) => {
  return (
    <TableCell account>
      <Typography varient='h4'>{bank.get('name')}</Typography>
      <Typography varient='h4'>{bank.get('bankName')}</Typography>
      <Typography varient='h4'>{bank.get('branchName')}</Typography>
      <Typography varient='h4'>{bank.get('cardNumber')}</Typography>
    </TableCell>
  );
};

const PendingTable = ({
  isUser,
  data,
  handleCancelPendingOrder,
  handleDeletePendingOrder,
  handleOpenPendingOrder,
  handleStopPendingOrder,
}) => {
  const [openDialogType, setOpenDialogType] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const headers = getHeaders(isUser);
  const cancelDialog = () => {
    setSelectedId('');
  };
  const confirmDialog = () => {
    const actions = {
      [DIALOG_TYPE.CANCEL]: handleCancelPendingOrder,
      [DIALOG_TYPE.DELETE]: handleDeletePendingOrder,
      [DIALOG_TYPE.OPEN]: handleOpenPendingOrder,
      [DIALOG_TYPE.STOP]: handleStopPendingOrder,
    };
    actions[openDialogType]({ orderId: selectedId });
    cancelDialog();
  };

  const openCancelDialog = (targetId, type) => () => {
    setOpenDialogType(type);
    setSelectedId(targetId);
  };

  return (
    <>
      <ConfirmDialog
        open={selectedId !== ''}
        text={`您確定要${DIALOG_ACTION_TEXT[openDialogType]}掛單嗎？`}
        onCancel={cancelDialog}
        onConfirm={confirmDialog}
      />
      <Table>
        <TableHead headers={headers} />
        <TableBody>
          {data.map(item => {
            const id = item.get('id');
            const type = item.get('type');
            const status = item.get('status');
            const amount = item.get('amount');
            const balance = item.get('balance');
            const processAmount = item.get('processAmount');
            const successAmount = item.get('successAmount');
            const cancelAmount = item.get('cancelAmount');

            const isProcessing = status === PENDING_STATUS.PROCESSING;
            const buttonText = isProcessing ? '暫停掛單' : '開啓掛單';
            const buttonType = isProcessing
              ? DIALOG_TYPE.STOP
              : DIALOG_TYPE.OPEN;
            return (
              <TableRow key={`table_row_${id}`}>
                <TableCell>{item.get('createdAt')}</TableCell>
                <TableCell>{item.get('id')}</TableCell>
                {!isUser && (
                  <TableCell>{item.getIn(['user', 'account'])}</TableCell>
                )}
                <TableCell>{formatMoney(amount)}</TableCell>
                <TableCell>{formatMoney(amount)}</TableCell>
                <TableCell>{TRANSACTION_TYPE_TEXT[type]}</TableCell>
                <BankCell bank={item.get('bankcard')} />
                <TableCell>{`${item.get('transactionMinutes')}分鐘`}</TableCell>
                <TableCell>{PENDING_STATUS_TEXT[status]}</TableCell>
                <TableCell>
                  <Typography varient='h4'>
                    進行中 {item.get('processCount')} 筆 /{' '}
                    {formatMoney(processAmount)} e幣
                  </Typography>
                  <Typography varient='h4'>
                    已完成 {item.get('successCount')} 筆 /{' '}
                    {formatMoney(successAmount)} e幣
                  </Typography>
                  <Typography varient='h4'>
                    已取消 {item.get('cancelCount')} 筆 /{' '}
                    {formatMoney(cancelAmount)} e幣
                  </Typography>
                </TableCell>
                <TableCell>{formatMoney(balance)}</TableCell>
                <TableCell operator>
                  <Box display='flex' flexDirection='column'>
                    <Button
                      text={buttonText}
                      onClick={openCancelDialog(id, DIALOG_TYPE[buttonType])}
                      style={{ marginBottom: 8 }}
                    />
                    <Button
                      hide={isProcessing}
                      type='secondary'
                      style={{ marginBottom: 8 }}
                      text='刪除掛單'
                      onClick={openCancelDialog(id, DIALOG_TYPE.DELETE)}
                    />
                    <Button
                      hide={status === PENDING_STATUS.CANCELED}
                      text='取消掛單'
                      onClick={openCancelDialog(id, DIALOG_TYPE.CANCEL)}
                      type='light'
                    />
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

PendingTable.defaultProps = {
  isUser: false,
  handleCancelPendingOrder: () => false,
  handleDeletePendingOrder: () => false,
  handleOpenPendingOrder: () => false,
  handleStopPendingOrder: () => false,
};

export default PendingTable;
