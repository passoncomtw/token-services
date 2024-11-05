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
import Button from '~/components/Buttons';

const HEADERS = ['銀行代碼', '銀行', '銀行狀態', '操作'];

const StatusCell = ({ status }) => {
  const text = ACTIVE_STATUS_TEXT[status];
  const color = ACTIVE_STATUS_COLOR[status];
  return <TableCell style={{ color }}>{text}</TableCell>;
};

const Table = ({ data, onEditClick }) => {
  return (
    <BasicTable>
      <TableHead headers={HEADERS} />
      <TableBody>
        {data.map((item, index) => {
          return (
            <TableRow key={`table_row_${index}`}>
              <TableCell>{item.get('bankCode')}</TableCell>
              <TableCell>{item.get('bankName')}</TableCell>
              <StatusCell status={item.get('status')} />
              <TableCell style={{ width: 150 }}>
                <Button
                  type='secondary'
                  text='編輯'
                  onClick={onEditClick(index)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </BasicTable>
  );
};

export default Table;
