import React, { Fragment } from 'react';
import isEmpty from 'lodash/isEmpty';
import {
  Table as BasicTable,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from '~/components/TableFields';
import Button from '~/components/Buttons';
import {
  ACTIVE_STATUS_TEXT,
  ACTIVE_STATUS_COLOR,
} from '~/constants/status.config';

const HEADERS = ['帳號', '姓名', '角色', '帳號狀態', '操作'];

const StatusCell = ({ status }) => {
  const text = ACTIVE_STATUS_TEXT[status];
  const color = ACTIVE_STATUS_COLOR[status];
  return <TableCell style={{ color }}>{text}</TableCell>;
};

const RolesCell = ({ allRoleMap, roleIds }) => {
  const roles = roleIds ? roleIds.toJS() : [];
  const selectedRoles = roles.map(roleId => {
    return isEmpty(allRoleMap[roleId]) ? '' : allRoleMap[roleId];
  });

  const roleNames = selectedRoles
    .filter(roleName => !isEmpty(roleName))
    .join(', ');

  return (
    <TableCell style={{ whiteSpace: 'inherit' }}>
      {isEmpty(roleNames) ? '-' : roleNames}
    </TableCell>
  );
};

const Table = ({ data, openDetailDialog, onDelete, allRoleMap }) => {
  if (isEmpty(data)) return <Fragment />;
  return (
    <BasicTable>
      <TableHead headers={HEADERS} />
      <TableBody>
        {data.map(item => {
          const id = item.get('id');
          return (
            <TableRow
              key={`account_table_${item.get('account')}`}
              onClick={openDetailDialog('EDIT', id)}
            >
              <TableCell>{item.get('account')}</TableCell>
              <TableCell>{item.get('name')}</TableCell>
              <RolesCell
                allRoleMap={allRoleMap}
                roleIds={item.get('roleList')}
              />
              <StatusCell status={item.get('status')} />
              <TableCell style={{ width: 150 }}>
                <Button
                  type='secondary'
                  text='刪除賬號'
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
