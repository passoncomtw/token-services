import React from 'react';
import {
  Table as BasicTable,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '~/components/TableFields';
import {
  ACTIVE_STATUS_TEXT,
  ACTIVE_STATUS_COLOR,
} from '~/constants/status.config';
import colors from '~/theme/colors';

const HEADERS = [
  '帳號',
  '暱稱',
  '郵箱',
  '會員狀態',
  '交易狀態',
  '掛單狀態',
  '會員類型',
  '備註',
];

const StatusCell = ({ status }) => {
  const text = ACTIVE_STATUS_TEXT[status];
  const color = ACTIVE_STATUS_COLOR[status];
  return <TableCell style={{ color: colors[color] }}>{text}</TableCell>;
};

const Table = ({ data, goToDetail }) => {
  return (
    <BasicTable>
      <TableHead headers={HEADERS} />
      <TableBody>
        {data.map(item => {
          const id = item.get('id');
          return (
            <TableRow key={`table_row_${id}`} onClick={goToDetail(id)}>
              <TableCell>{item.get('account')}</TableCell>
              <TableCell>{item.get('name')}</TableCell>
              <TableCell>{item.get('email')}</TableCell>
              <StatusCell status={item.get('status')} />
              <StatusCell status={item.get('transactionStatus')} />
              <StatusCell status={item.get('orderStatus')} />
              <StatusCell status={item.get('type')} />
              <TableCell>{item.get('markup')}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </BasicTable>
  );
};

export default Table;
