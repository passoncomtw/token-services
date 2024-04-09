import React from 'react';
import { TableBody as BasicTableBody } from '@material-ui/core';

const TableBody = props => {
  const { children } = props;
  return <BasicTableBody>{children}</BasicTableBody>;
};

export default TableBody;
