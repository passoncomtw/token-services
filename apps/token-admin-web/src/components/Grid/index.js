import React from 'react';
import { Grid as BasicGrid } from '@material-ui/core';

const Grid = ({ container, sixth, quarter, third, even, ...props }) => {
  if (container) {
    return <BasicGrid container spacing={2} {...props} />;
  }

  if (sixth) {
    return <BasicGrid item lg={2} md={6} xs={12} {...props} />;
  }

  if (quarter) {
    return <BasicGrid item lg={3} md={6} xs={12} {...props} />;
  }

  if (third) {
    return <BasicGrid item lg={4} md={6} xs={12} {...props} />;
  }

  if (even) {
    return <BasicGrid item lg={6} md={6} xs={12} {...props} />;
  }

  return <BasicGrid item {...props} />;
};

export default Grid;

Grid.defaultProps = {
  container: null,
  third: null,
  sixth: null,
  quarter: null,
  even: null,
};
