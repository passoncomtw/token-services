import React from 'react';
import propTypes from 'prop-types';
import isFunction from 'lodash/isFunction';
import { View, Image, StyleSheet } from 'react-native';
import Text from '~/components/Text';
import themeSet from '~/theme';
import ConfirmButton from '~/components/Button/ConfirmButton';

const ImageInfoContent = ({
  title,
  imageSource,
  hint,
  smallHint,
  onPress,
  btnTitle,
  btnIcon,
  btnType,
}) => {
  const styles = getStyle(themeSet);

  return (
    <View style={styles.emptyRoot}>
      <Image source={imageSource} />
      <Text h5 style={styles.title}>
        {title}
      </Text>
      <View style={styles.hint}>
        {hint.map((text, index) => (
          <Text key={`hint-text-${index}`} h5 style={styles.hintText}>
            {text}
          </Text>
        ))}
        {smallHint.map((text, index) => (
          <Text key={`small-hint-${index}`} h6 style={styles.hintText}>
            {text}
          </Text>
        ))}
      </View>
      {isFunction(onPress) && (
        <ConfirmButton
          type={btnType}
          title={btnTitle}
          icon={btnIcon}
          onPress={onPress}
          containerStyle={styles.button}
        />
      )}
    </View>
  );
};

ImageInfoContent.propTypes = {
  title: propTypes.string,
  btnTitle: propTypes.string,
  // imageSource: propTypes.element,
  hint: propTypes.arrayOf(propTypes.string),
  smallHint: propTypes.arrayOf(propTypes.string),
  onPress: propTypes.oneOfType([propTypes.object, propTypes.func]),
};

ImageInfoContent.defaultProps = {
  title: '',
  imageSource: null,
  hint: [],
  smallHint: [],
  onPress: null,
  btnTitle: '',
  btnIcon: null,
  btnType: 'primary',
};

const getStyle = (theme) =>
  StyleSheet.create({
    emptyRoot: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      paddingTop: theme.spacing.big,
    },
    hint: {
      alignItems: 'center',
      marginBottom: theme.spacing.middle,
      paddingVertical: theme.spacing.small,
    },
    hintText: {
      color: theme.colors.brownGrey,
    },
    button: {
      width: 130,
    },
  });

export default ImageInfoContent;
