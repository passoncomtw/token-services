import React from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { TableRow, TableCell } from '~/components/TableFields';
import { TextInput } from '~/components/FormFields';
import Button from '~/components/Buttons';
import Adornment from '~/components/FormFields/TextInput/Adornment';
import Typography from '~/components/Typography';
import { addPointNumber } from '~/utils/channelUtils';

export const getAmountPrefixText = (rows, index, isFirstRow, isLastRow) => {
  if (isFirstRow) return '0 ~';
  const { amount = 0 } = rows[index - 1];
  const prevAmount = addPointNumber(amount);
  return isLastRow ? `${prevAmount} 以上` : `${prevAmount} ~ `;
};

const titleStyle = {
  minWidth: 80,
  lineHeight: 'unset',
  justifyContent: 'flex-start',
};

const AmountTableCell = styled(TableCell)`
  align-items: center;
  display: flex;
`;

const ChannelFeeTableRow = ({
  rows,
  row,
  index,
  onDelete,
  onRowChange,
  errorAmount,
  errorPercent,
}) => {
  const isFirstRow = index === 0;
  const isLastRow = index === rows.length - 1;
  return (
    <TableRow underline>
      <TableCell>
        <Typography style={titleStyle}>
          {getAmountPrefixText(rows, index, isFirstRow, isLastRow)}
        </Typography>
      </TableCell>
      <TableCell>
        <Box maxWidth={250}>
          <TextInput
            hide={isLastRow}
            name='amount'
            value={row.amount}
            onChange={onRowChange(index)}
            type='number'
            errorMessage={errorAmount}
            inputProps={{
              step: 1,
              min: 0,
            }}
          />
        </Box>
      </TableCell>
      <TableCell width={250}>
        <TextInput
          name='feePercent'
          value={row.feePercent}
          onChange={onRowChange(index)}
          endAdornment={<Adornment text='%' position='end' />}
          type='number'
          errorMessage={errorPercent}
          inputProps={{
            step: 0.1,
            min: 0,
            max: 100,
          }}
        />
      </TableCell>
      <TableCell>
        <Button
          type='secondary'
          hide={isFirstRow || isLastRow}
          text='删除'
          onClick={() => onDelete(index)}
        />
      </TableCell>
    </TableRow>
  );
};

export default ChannelFeeTableRow;
