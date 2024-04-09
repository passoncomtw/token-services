import React from 'react';
import propTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Selector from '~/components/FormFields/Selector';
import Typography from '~/components/Typography';
import colors from '~/theme/colors';

const PAGE_SIZE = [
  { text: '10 筆', value: 10 },
  { text: '20 筆', value: 20 },
  { text: '50 筆', value: 50 },
];

const Pagination = props => {
  const { size, page, totalCount, totalPageCount, onPageChange, onSizeChange } =
    props;

  const isFirstPage = page <= 1;
  const isLastPage = page === totalPageCount;
  const handleOnPageChange = page => () => {
    onPageChange(page);
  };

  const handleOnSizeChange = ({ value }) => {
    onSizeChange(value);
  };

  return (
    <Box
      p={2}
      display='flex'
      flexDirection='row'
      justifyContent='flex-end'
      alignItems='center'
    >
      <Typography variant='h6' style={{ marginRight: 48 }}>
        共 {totalCount} 條 第 {page}/{totalPageCount} 頁
      </Typography>
      <Typography variant='h6' style={{ marginRight: 4 }}>
        每頁筆數：
      </Typography>
      <Selector
        name='size'
        items={PAGE_SIZE}
        value={size}
        onChange={handleOnSizeChange}
      />
      <IconButton onClick={handleOnPageChange(page - 1)}>
        <ChevronLeftIcon
          style={{
            color: isFirstPage ? colors.greylight : colors.secondary,
          }}
        />
      </IconButton>
      <IconButton onClick={handleOnPageChange(page + 1)}>
        <ChevronRightIcon
          style={{
            color: isLastPage ? colors.greylight : colors.secondary,
          }}
        />
      </IconButton>
    </Box>
  );
};

Pagination.propTypes = {
  page: propTypes.number,
  size: propTypes.number,
  totalCount: propTypes.number,
  totalPageCount: propTypes.number,
  onPageChange: propTypes.func.isRequired,
  onSizeChange: propTypes.func.isRequired,
};

Pagination.defaultProps = {
  page: 1,
  size: 10,
  totalCount: 0,
  totalPageCount: 0,
};

export default Pagination;
