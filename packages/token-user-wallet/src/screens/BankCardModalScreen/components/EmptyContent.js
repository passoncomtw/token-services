import React from 'react';
import propTypes from 'prop-types';
import { Icon } from 'react-native-elements';
import ImageInfoContent from '~/components/ImageInfoContent';
import colors from '~/theme/color';
import imgEmptyPayment from '~/assets/images/imgEmptyPayment.png';

const EmptyContent = ({ hide = false, onPress = () => false }) => {
  if (hide) return null;

  return (
    <ImageInfoContent
      hint={['您還沒有收付款賬户']}
      btnTitle='新增'
      imageSource={imgEmptyPayment}
      onPress={onPress}
      btnIcon={<Icon name='add' size={30} color={colors.secondary} />}
    />
  );
};

EmptyContent.propTypes = {
  hide: propTypes.bool,
  onPress: propTypes.func,
};

export default EmptyContent;
