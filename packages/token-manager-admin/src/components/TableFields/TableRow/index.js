import React from 'react';
import propTypes from 'prop-types';
import styled from 'styled-components';
import { TableRow as BasicTableRow } from '@material-ui/core';
import colors from '~/theme/colors';

const StyledTableRow = styled(BasicTableRow)`
  & > td {
    line-height: 36px;
    padding-top: 6px;
    padding-bottom: 6px;
    white-space: nowrap;
    vertical-align: baseline;
    border-bottom: 1px solid ${colors.linelight};
  }
  > th {
    color: ${colors.greydark};
    white-space: nowrap;
    border-bottom: solid 2px ${colors.linedark};
  }

  & > td:first-child,
  & > th:first-child {
    padding-left: 24px;
    text-align: left;
  }

  & > td:last-child,
  & > th:last-child {
    padding-right: 24px;
  }

  &:hover > td {
    background-color: #edf8f9;
    border-left-color: #edf8f9 !important;
    border-right-color: #edf8f9 !important;
  }
  &.Mui-selected,
  &.Mui-selected:hover {
    background-color: #edf8f9;
  }

  & > td {
    ${props => (props.underline === 'true' ? '' : 'border-bottom: 0px')}
  }
`;

const TableRow = ({ underline = true, ...props }) => {
  return <StyledTableRow underline={underline.toString()} {...props} />;
};

TableRow.propTypes = {
  underline: propTypes.bool,
};

export default TableRow;
