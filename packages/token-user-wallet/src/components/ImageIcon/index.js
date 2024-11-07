import React from 'react';
import propTypes from 'prop-types';
import { Image } from 'react-native';

const ImageIcon = ({ source, style = {}, size = 16 }) => {
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

export default ImageIcon;
