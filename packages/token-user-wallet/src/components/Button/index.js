import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as BaseButton } from 'react-native-elements';
import propTypes from 'prop-types';
import preventDoubleClickHOC from '~/utils/preventDoubleClickHOC';
import colors from '~/theme/color';

class Button extends React.PureComponent {
  static propTypes = {
    onPress: propTypes.func.isRequired,
    ...Button.propTypes,
  };

  render() {
    const {
      type = 'solid',
      isVisible = true,
      buttonStyle = {},
      titleStyle = {},
      onPress = () => false,
      ...props
    } = this.props;
    if (!isVisible) return null;
    const styles = getStyles(type);
    return (
      <BaseButton
        {...props}
        disabledStyle={styles.disabledStyle}
        disabledTitleStyle={styles.disabledTitleStyle}
        buttonStyle={[styles.buttonStyle, buttonStyle]}
        titleStyle={[styles.titleStyle, titleStyle]}
        onPress={onPress}
        type={type}
      />
    );
  }
}

export default preventDoubleClickHOC(Button);

const getStyles = (type) => {
  const disabledColor = colors.disable;
  return StyleSheet.create({
    disabledStyle: {
      backgroundColor: type === 'solid' ? disabledColor : colors.transparent,
      borderColor: type === 'outline' ? disabledColor : colors.transparent,
    },
    disabledTitleStyle: {
      color: type === 'solid' ? colors.white : disabledColor,
    },
    buttonStyle: {
      backgroundColor: ['clear', 'outline'].includes(type)
        ? colors.transparent
        : colors.primary,
      borderColor: type === 'outline' ? colors.secondary : colors.transparent,
    },
    titleStyle: {
      fontWeight: 'bold',
      color: colors.secondary,
    },
  });
};
