import React, { Fragment } from 'react';
import propTypes from 'prop-types';
import { TableCell as BasicTableCell } from '@material-ui/core';
import styled from 'styled-components';
import theme from '~/theme';

const amountCellStyle = 'width: 85px;';
const operatorCellStyle = 'width: 110px; text-align: left;';
const accountCellStyle = 'width: 120px; text-align: left';

const StyledTableCell = styled(BasicTableCell)`
  border-width: 0;
  padding-left: 0;
  ${theme.font.h5}
  color: ${theme.colors.greydark};
  ${props => (props.amount === 'true' ? amountCellStyle : '')}
  ${props => (props.account === 'true' ? accountCellStyle : '')}
  ${props => (props.operator === 'true' ? operatorCellStyle : '')}
`;

const TableCell = ({ amount, hide, account, operator, children, ...props }) => {
  if (hide) return <Fragment />;

  return (
    <StyledTableCell
      amount={amount.toString()}
      account={account.toString()}
      operator={operator.toString()}
      children={children || '-'}
      {...props}
    />
  );
};

TableCell.propTypes = {
  hide: propTypes.bool,
  align: propTypes.string,
  amount: propTypes.bool,
  account: propTypes.bool,
  operator: propTypes.bool,
};

TableCell.defaultProps = {
  hide: false,
  align: 'center',
  amount: false,
  account: false,
  operator: false,
};

export default TableCell;
