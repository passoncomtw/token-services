import React, { Fragment } from 'react';
import isEmpty from 'lodash/isEmpty';
import {
  Table as BasicTable,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '~/components/TableFields';
import Button from '~/components/Buttons';

const HEADERS = ['角色', '说明', '操作'];

const Table = ({ data, onDelete, onDetail }) => {
  if (isEmpty(data)) return <Fragment />;

  return (
    <BasicTable>
      <TableHead headers={HEADERS} />
      <TableBody>
        {data.map(item => {
          const id = item.get('id');
          return (
            <TableRow key={`table_row_${id}`} onClick={onDetail(item.toJS())}>
              <TableCell>{item.get('name')}</TableCell>
              <TableCell>{item.get('markup')}</TableCell>
              <TableCell operator>
                <Button
                  type='secondary'
                  text='删除角色'
                  onClick={onDelete(id)}
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
