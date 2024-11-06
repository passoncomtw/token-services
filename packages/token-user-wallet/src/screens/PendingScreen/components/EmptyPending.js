import React, { Fragment } from 'react';
import propTypes from 'prop-types';
import { Icon } from 'react-native-elements';
import ImageInfoContent from '~/components/ImageInfoContent';
import imgEmptyPending from '~/assets/images/pending/imgEmptyPending.png';
import colors from '~/theme/color';

const EmptyPending = ({ hide, onPress }) => {
  if (hide) return <Fragment />;

  return (
    <ImageInfoContent
      title='目前無掛單'
      smallHint={[
        '當您的訂單數量較大，或於『交易』頁找不到',
        '符合您需求的賣家/買家，您可以掛單交易',
      ]}
      btnTitle='新增'
      imageSource={imgEmptyPending}
      onPress={onPress}
      btnIcon={<Icon name='add' size={30} color={colors.secondary} />}
    />
  );
};

EmptyPending.defaultProps = {
  hide: false,
};

EmptyPending.propTypes = {
  hide: propTypes.bool,
  onPress: propTypes.func.isRequired,
};

export default EmptyPending;
