import React from 'react';
import propTypes from 'prop-types';
import { Image } from 'react-native';

const ImageIcon = ({ source, size, style }) => {
  const styleProps = {
    ...style,
    width: size,
    height: size,
    resizeMode: 'contain',
  };
  return <Image style={styleProps} source={source} />;
};

ImageIcon.propTypes = {
  size: propTypes.number,
};

ImageIcon.defaultProps = {
  size: 16,
};

export default ImageIcon;
