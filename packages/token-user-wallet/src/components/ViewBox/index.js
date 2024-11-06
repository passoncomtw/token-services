import React, { Fragment } from 'react';
import propTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import colors from '~/theme/color';

const ViewBox = ({
  isVisible,
  children,
  flex,
  fill,
  containerStyle,
  ...props
}) => {
  if (!isVisible) return <Fragment />;

  const basicStyle = {
    flex: flex ? 1 : 0,
    alignItems: fill ? 'stretch' : 'center',
  };

  return (
    <View
      style={[styles.containerStyle, basicStyle, containerStyle]}
      {...props}>
      {children}
    </View>
  );
};

ViewBox.propTypes = {
  isVisible: propTypes.bool,
  flex: propTypes.bool,
  fill: propTypes.bool,
};

ViewBox.defaultProps = {
  isVisible: true,
  flex: false,
  fill: false,
};

const styles = StyleSheet.create({
  containerStyle: {
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
});

export default ViewBox;
