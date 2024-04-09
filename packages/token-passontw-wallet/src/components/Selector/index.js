import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { StyleSheet, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Icon } from 'react-native-elements';
import Text from '~/components/Text';
import theme from '~/theme';
import spacing from '~/theme/spacing';

const Selector = ({
  label,
  hint,
  errorMessage,
  containerStyle,
  disabled,
  ...props
}) => {
  const hasError = !isEmpty(errorMessage);

  const inputColor = disabled ? theme.colors.greyLight : theme.colors.secondary;
  const chevronColor = disabled ? theme.colors.greyLight : theme.colors.grey;

  const pickerStyles = {
    inputIOS: {
      color: inputColor,
      paddingTop: theme.spacing.small,
      paddingRight: theme.spacing.big,
      paddingHorizontal: theme.spacing.middle,
      paddingBottom: theme.spacing.small,
      ...theme.Text.h4Style,
    },
    inputAndroid: {
      color: inputColor,
      ...theme.Text.h4Style,
      paddingLeft: theme.spacing.middle,
      paddingRight: theme.spacing.big,
    },
    placeholder: {
      color: theme.colors.greyLight,
      paddingLeft: theme.spacing.empty,
    },
    underline: { borderTopWidth: 0 },
  };

  const customizedStyle = {
    borderColor: isEmpty(errorMessage)
      ? theme.colors.greyLighter
      : theme.colors.error,
    backgroundColor: disabled ? theme.colors.greyLighter : null,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text h5 color='secondary' fontWeight='medium'>
        {label}
      </Text>
      <View style={[styles.inputContainer, customizedStyle]}>
        <RNPickerSelect
          hideDoneBar
          useNativeAndroidPickerStyle={false}
          style={pickerStyles}
          disabled={disabled}
          Icon={() => (
            <Icon
              name='keyboard-arrow-down'
              color={chevronColor}
              containerStyle={styles.chevron}
            />
          )}
          doneText='完成'
          {...props}
        />
      </View>
      <Text
        h6
        color='error'
        isVisible={hasError}
        style={styles.errorMessageStyle}>
        {errorMessage}
      </Text>
      {hint && (
        <Text h6 style={styles.hintStyle}>
          {hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: theme.spacing.smallest,
    marginBottom: theme.spacing.middle,
  },
  inputContainer: {
    borderWidth: 1,
    marginTop: theme.spacing.small,
  },
  hintStyle: {
    paddingVertical: spacing.smallest,
  },
  errorMessageStyle: {
    marginLeft: theme.spacing.small,
    marginTop: theme.spacing.smallest,
  },
  errorDividerStyle: {
    backgroundColor: theme.colors.error,
    height: 1.2,
  },
  chevron: {
    paddingTop: 10,
    paddingRight: 8,
  },
});

Selector.propTypes = {
  ...RNPickerSelect.propTypes,
};

Selector.defaultProps = {
  placeholder: { label: '请选择...', value: null },
  containerStyle: {},
  hint: null,
};

export default Selector;
