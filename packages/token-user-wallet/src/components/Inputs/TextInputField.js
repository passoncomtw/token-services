import React from 'react';
import propTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import isEmpty from 'lodash/isEmpty';
import { StyleSheet } from 'react-native';
import { Input } from 'react-native-elements';
import Hint from '../Hint';
import theme from '~/theme';

const TextInputField = ({
  placeholder,
  iconName,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  leftIconContainerStyle,
  hidden,
  maxLength,
  placeholderTextColor,
  ...props
}) => {
  const styles = getStyles(props);
  if (hidden) return null;

  return (
    <>
      <Input
        autoCapitalize='none'
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor || theme.colors.grey}
        labelStyle={styles.label}
        containerStyle={[styles.container, containerStyle]}
        inputContainerStyle={[styles.inputContainer, inputContainerStyle]}
        inputStyle={[styles.input, inputStyle]}
        leftIconContainerStyle={[
          styles.leftIconContainer,
          leftIconContainerStyle,
        ]}
        maxLength={maxLength}
        leftIcon={
          isEmpty(iconName) ? null : (
            <Icon name={iconName} size={24} color={theme.colors.greyLight} />
          )
        }
        errorStyle={styles.errorStyle}
        disabledInputStyle={styles.disabledInputStyle}
        {...props}
      />
      {!isEmpty(props.hint) && <Hint inputHint content={props.hint} />}
    </>
  );
};

const getStyles = (props) => {
  return StyleSheet.create({
    container: {
      width: '100%',
      display: 'flex',
      alignItems: 'flex-start',
      flexDirection: 'column',
      paddingLeft: 0,
      paddingRight: 0,
    },
    inputContainer: {
      height: props.multiline ? 30 * props.numberOfLines : 40,
      borderWidth: 1,
      paddingLeft: 15,
      borderBottomWidth: 1,
      marginBottom: 0,
      borderColor: props.errorMessage
        ? theme.colors.error
        : theme.colors.greyLighter,
      backgroundColor: props.disabled ? theme.colors.greyLighter : null,
    },
    input: {
      height: props.multiline ? 30 * props.numberOfLines - 15 : 40,
      color: theme.colors.black,
      fontSize: theme.Text.h4Style.fontSize,
    },
    label: {
      marginBottom: 10,
      fontWeight: theme.fontWeights.normal,
      fontSize: theme.Text.h5Style.fontSize,
      color: theme.colors.black,
    },
    leftIconContainer: {
      paddingRight: theme.spacing.small,
    },
    errorStyle: {
      height: isEmpty(props.errorMessage) ? 0 : 15,
      fontSize: theme.Text.h6Style.fontSize,
      marginLeft: 0,
    },
    disabledInputStyle: {
      color: theme.colors.disabled,
      opacity: 1,
    },
  });
};

TextInputField.propTypes = {
  placeholder: propTypes.string,
  iconName: propTypes.string,
  hint: propTypes.arrayOf(propTypes.string),
  ...Input.propTypes,
};

TextInputField.defaultProps = {
  maxLength: 30,
  hint: [],
};

export default TextInputField;
