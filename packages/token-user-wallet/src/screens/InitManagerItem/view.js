import React, { Fragment } from 'react';

const InitManagerItem = ({ isInitialed, handleInitial }) => {
  if (!isInitialed) {
    handleInitial();
  }

  return <Fragment />;
};

export default React.memo(InitManagerItem, (prevProps, nextProps) => {
  return prevProps.isAuth === nextProps.isAuth;
});
