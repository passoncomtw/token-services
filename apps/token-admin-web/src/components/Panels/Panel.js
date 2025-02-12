import React from 'react';
import { Box, Paper as BasicPaper } from '@material-ui/core';

const Panel = ({ children, ...props }) => {
  return (
    <Box
      pt={1}
      mb={1}
      boxShadow='0 1px 14px 0 rgba(209, 193, 75, 0.05)'
      {...props}>
      <BasicPaper elevation={0}>{children}</BasicPaper>
    </Box>
  );
};

export default Panel;
