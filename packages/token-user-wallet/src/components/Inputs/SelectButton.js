import React from 'react';
import { StyleSheet } from 'react-native';
import { isEmpty } from 'lodash';
import { View } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { Icon } from 'react-native-elements';
import theme from '~/theme';
import Hint from '../Hint';
import ErrorMessage from './ErrorMessage';

const SelectButton = ({
  label,
  placeholder,
  value,
  errorMessage,
  onPress,
  disabled,
  ...props
}) => {
  const styles = getStyle({ value, errorMessage, disabled, ...props });

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>
      <Button
        title={value || placeholder}
        onPress={onPress}
        type='outline'
        iconRight
        containerStyle={styles.container}
        icon={
          <Icon name='expand-more' size={20} color={theme.colors.greyLighter} />
        }
        buttonStyle={styles.button}
        titleStyle={styles.buttonTitle}
        disabled={disabled}
      />
      <ErrorMessage errorMessage={errorMessage} />
      {!isEmpty(props.hint) && <Hint inputHint content={props.hint} />}
    </View>
  );
};

const getStyle = ({ value, errorMessage, disabled }) =>
  StyleSheet.create({
    root: {
      marginTop: theme.spacing.middle,
      marginBottom: theme.spacing.smallest,
    },
    label: {
      fontWeight: theme.fontWeights.normal,
      fontSize: theme.fontSize.h5,
      marginBottom: 3,
      color: theme.colors.secondary,
    },
    container: {
      borderRadius: 0,
      borderWidth: 1,
      justifyContent: 'space-between',
      borderColor: isEmpty(errorMessage)
        ? theme.colors.greyLighter
        : theme.colors.error,
      marginBottom: isEmpty(errorMessage) ? theme.spacing.small : 0,
      paddingLeft: theme.spacing.small,
      backgroundColor: disabled ? theme.colors.greyLighter : null,
    },
    button: {
      borderWidth: 0,
      justifyContent: 'space-between',
    },
    buttonTitle: {
      textAlign: 'left',
      fontSize: theme.fontSize.h4,
      color: isEmpty(value) ? theme.colors.grey : theme.colors.black,
    },
  });

export default SelectButton;
