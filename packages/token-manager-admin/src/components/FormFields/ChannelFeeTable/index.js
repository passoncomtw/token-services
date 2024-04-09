import React, { Fragment } from 'react';
import propTypes from 'prop-types';
import AddIcon from '@material-ui/icons/Add';
import { Grid, Box } from '@material-ui/core';
import Button from '~/components/Buttons';
import {
  Table as BasicTable,
  TableBody,
  TableHead,
} from '~/components/TableFields';
import TableRow from './TableRow';

const defaultRowData = {
  amount: 0,
  feePercent: 0,
};

const handleCreate = (rows, onValueChange) => () => {
  onValueChange([...rows, defaultRowData]);
};

const handleDelete = (rows, onValueChange) => deleteIndex => {
  const filteredRows = rows.filter((_, index) => index !== deleteIndex);
  onValueChange(filteredRows);
};
const handleRowChange = (rows, onValueChange) => changedIndex => ({
  name,
  value,
}) => {
  const result = rows.map((row, index) => {
    return index === changedIndex ? { ...row, [name]: value } : row;
  });
  onValueChange(result);
};

const ChannelFeeTable = ({ name, hide, rows, typeText, onChange, errors }) => {
  if (hide) return <Fragment />;

  const headers = [`${typeText}金额`, ' ', '手续费率', '操作'];
  const onValueChange = value => onChange({ name, value });
  const onCreate = handleCreate(rows, onValueChange);
  const onDelete = handleDelete(rows, onValueChange);
  const onRowChange = handleRowChange(rows, onValueChange);

  return (
    <Grid item xs={12} md={12} lg={12}>
      <BasicTable className='dialog-table'>
        <TableHead headers={headers} />
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={index}
              rows={rows}
              row={row}
              index={index}
              onDelete={onDelete}
              onRowChange={onRowChange}
              errorAmount={errors[`${name}.steps[${index}].amount`]}
              errorPercent={errors[`${name}.steps[${index}].feePercent`]}
            />
          ))}
        </TableBody>
      </BasicTable>
      <Box pt={2}>
        <Button text='新增' onClick={onCreate} startIcon={<AddIcon />} />
      </Box>
    </Grid>
  );
};

ChannelFeeTable.propTypes = {
  name: propTypes.string,
  typeText: propTypes.string,
  hide: propTypes.bool,
  errors: propTypes.shape(),
  rows: propTypes.array.isRequired,
  typeText: propTypes.string.isRequired,
  onChange: propTypes.func.isRequired,
};

ChannelFeeTable.defaultProps = {
  typeText: '',
  hide: false,
  errors: {},
  name: 'steps',
};

export default ChannelFeeTable;
