import React from 'react';
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '~/components/TableFields';
import Button from '~/components/Buttons';
import { toHashText } from '~/utils/format';

const DEFAULT_HEADERS = ['姓名', '開户行', '銀行卡卡號', '開户支行', '操作'];

const getHeaders = () => ['帳號', ...DEFAULT_HEADERS];

const AccountsTable = ({ isUser = false, data, handleDelete }) => {
  const headers = isUser ? DEFAULT_HEADERS : getHeaders();

  return (
    <Table>
      <TableHead headers={headers} />
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={`${item.get('accountId')}-${index}`}>
            {!isUser && <TableCell>{item.get('account')}</TableCell>}
            <TableCell>{item.get('username')}</TableCell>
            <TableCell>{item.get('bankName')}</TableCell>
            <TableCell>{toHashText(item.get('cardNumber'))}</TableCell>
            <TableCell>{item.get('branchName')}</TableCell>
            <TableCell>
              <Button
                type='secondary'
                text='刪除帳戶'
                onClick={() => handleDelete(index)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AccountsTable;
