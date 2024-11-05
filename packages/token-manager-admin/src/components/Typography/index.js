import React from 'react';
import { Typography as BasicTypography } from '@material-ui/core';

const Typography = ({ color, hide, ...props }) => {
  if (hide) return null;
  return (
    <BasicTypography
      style={{
        color,
      }}
      {...props}
    />
  );
};

export default Typography;
