import React from 'react';
import { Image as BaseImage } from 'react-native-elements';

const Image = (props) => (
  <BaseImage placeholderStyle={{ backgroundColor: 'transparent' }} {...props} />
);

export default Image;
