import React from 'react';
import theme from '~/theme';
import TableHeadWrapper from '../TableHeadWrapper';
import { TableCell, TableRow } from '~/components/TableFields';

const TableHead = props => {
  const { headers, className } = props;
  return (
    <TableHeadWrapper className={className}>
      <TableRow>
        {headers.map(title => (
          <TableCell
            key={`table_header_${title}`}
            style={{
              color: theme.colors.greydark,
              fontWeight: theme.fontWeight.medium,
              ...theme.font.h5,
            }}>
            {title}
          </TableCell>
        ))}
      </TableRow>
    </TableHeadWrapper>
  );
};

export default TableHead;
