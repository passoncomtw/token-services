import React, { useState } from 'react';
import { Box, Tooltip } from '@material-ui/core';
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '~/components/TableFields';
import InfoIcon from '@material-ui/icons/Info';
import { formatMoney } from '~/utils/format';
import Typography from '~/components/Typography';
import Button from '~/components/Buttons';
import ConfirmDialog from '~/components/AlertDialogWrapper/ConfirmDialog';
import CancelOrderDialog from '~/components/CancelOrderDialog';
import {
  ORDER_TYPE_TEXT,
  ORDER_TYPE_LIST,
  TRANSACTION_TYPE_TEXT,
} from '~/constants/status.config';
import colors from '~/theme/colors';
import { toDateTimeText } from '~/utils/dateUtils';

const LIMIT_TIME = '00:30:00';

const DEFAULT_HEADERS = [
  '訂單時間',
  '訂單編號',
  '數量',
  '金額',
  '付款帳戶',
  '收款帳戶',
  '訂單狀態',
  '交易時間',
  '操作',
];

const DIALOG_TYPE = {
  CANCEL: 'CANCEL',
  COMPLETE: 'COMPLETE',
};

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

const OrderStatusCell = ({ orderType, reason }) => {
  const isCancel = ORDER_TYPE_LIST[orderType] === 'CANCEL';
  return (
    <TableCell>
      <Box display='flex' alignItems='center'>
        {ORDER_TYPE_TEXT[orderType]}
        {isCancel && (
          <Tooltip title={reason}>
            <InfoIcon color='error' />
          </Tooltip>
        )}
      </Box>
    </TableCell>
  );
};

const TransationTimeCell = ({
  orderType,
  transationTimeType,
  createAt,
  finishAt,
}) => {
  const ORDER_TYPE_KEY = ORDER_TYPE_LIST[orderType];
  if (ORDER_TYPE_KEY === 'CANCEL') {
    return <TableCell>-</TableCell>;
  }
  if (ORDER_TYPE_KEY === 'SUCCESS') {
    return <TableCell>{finishAt}</TableCell>;
  }

  // TODO：真的串 API 的時候計算已耗時 BY createAt ?
  const elapsedTime = '00:06:16';
  const isOverdue = transationTimeType === 1;
  const color = isOverdue ? colors.danger : colors.success;
  return (
    <TableCell>
      <Typography
        color={color}
        varient='h4'
      >{`${elapsedTime} / ${LIMIT_TIME}`}</Typography>
    </TableCell>
  );
};

const getHeaders = () =>
  [DEFAULT_HEADERS[0], '帳號'].concat(DEFAULT_HEADERS.slice(1));

const OrderTable = ({
  isUser,
  data,
  handleCancelOrder,
  handleCompleteOrder,
}) => {
  const [openDialogType, setOpenDialogType] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const headers = isUser ? DEFAULT_HEADERS : getHeaders();
  const cancelDialog = () => {
    setOpenDialogType('');
    setSelectedId('');
  };
  const confirmDialog = params => {
    const actions = {
      [DIALOG_TYPE.CANCEL]: handleCancelOrder,
      [DIALOG_TYPE.COMPLETE]: handleCompleteOrder,
    };
    actions[openDialogType]({ transationId: selectedId, ...params });
    cancelDialog();
  };

  const openCancelDialog = (targetId, type) => () => {
    setOpenDialogType(type);
    setSelectedId(targetId);
  };
  return (
    <>
      <ConfirmDialog
        open={openDialogType === 'COMPLETE'}
        text='訂單完成後無法取消，您確定訂單已完成嗎？'
        onCancel={cancelDialog}
        onConfirm={confirmDialog}
      />
      <CancelOrderDialog
        open={openDialogType === 'CANCEL'}
        onCancel={cancelDialog}
        handleConfirm={confirmDialog}
      />
      <Table>
        <TableHead headers={headers} />
        <TableBody>
          {data.map(item => {
            const id = item.get('id');
            const amount = item.get('amount');
            const orderType = item.get('orderType');
            const transactionType = item.get('transactionType');
            const hideAction = ['SUCCESS', 'CANCEL'].includes(
              ORDER_TYPE_LIST[orderType]
            );

            return (
              <TableRow key={`table_row_${id}`}>
                <TableCell>{toDateTimeText(item.get('createdAt'))}</TableCell>
                {!isUser && (
                  <TableCell>{item.getIn(['beneficiary', 'name'])}</TableCell>
                )}
                <TableCell>{id}</TableCell>
                <TableCell>{formatMoney(amount)}</TableCell>
                <TableCell>{formatMoney(amount)}</TableCell>
                <BankCell bank={item.get('senderBankcard')} />
                <BankCell bank={item.get('beneficiaryBankcard')} />
                <OrderStatusCell
                  orderType={item.get('status')}
                  reason={item.get('reason')}
                />
                <TransationTimeCell
                  orderType={orderType}
                  transationTimeType={item.get('transationTime')}
                  createAt={item.get('finishAt')}
                  finishAt={item.get('finishAt')}
                />
                <TableCell operator>
                  <Button
                    hide={hideAction}
                    type='secondary'
                    text='取消訂單'
                    onClick={openCancelDialog(id, DIALOG_TYPE.CANCEL)}
                  />
                  <Button
                    hide={hideAction}
                    text='已完成'
                    onClick={openCancelDialog(id, DIALOG_TYPE.COMPLETE)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

OrderTable.defaultProps = {
  isUser: false,
  handleCancelOrder: () => false,
  handleCompleteOrder: () => false,
};

export default OrderTable;
