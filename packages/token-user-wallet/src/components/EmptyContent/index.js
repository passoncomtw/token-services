import React, { Fragment } from 'react';
import propTypes from 'prop-types';
import { Icon } from 'react-native-elements';
import { View, StyleSheet } from 'react-native';
import ImageInfoContent from '~/components/ImageInfoContent';
import colors from '~/theme/color';

const imgEmptyPending = require("~/assets/images/pending/imgEmptyPending.png");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
});

const EmptyContent = ({ hide = false, title='', ...props }) => {
  if (hide) return <Fragment />;

  return (
    <View style={styles.container}>
      <ImageInfoContent
        btnTitle='新增'
        title={title}
        imageSource={imgEmptyPending}
        btnIcon={<Icon name='add' size={30} color={colors.secondary} />}
        {...props}
      />
    </View>
  );
};

EmptyContent.propTypes = {
  hide: propTypes.bool.isRequired,
  title: propTypes.string,
};

export default EmptyContent;
