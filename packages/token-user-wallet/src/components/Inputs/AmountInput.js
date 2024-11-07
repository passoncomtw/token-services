import React, { Fragment } from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '~/components/Button';
import Text from '~/components/Text';
import Hint from '~/components/Hint';
import TextInputField from '~/components/Inputs/TextInputField';
import theme from '~/theme';

const AmountInput = ({
  hide,
  onPress,
  selectAll,
  hint,
  disabled,
  ...props
}) => {
  if (hide) return <Fragment />;

  return (
    <View style={styles.containerStyle}>
      <View style={styles.root}>
        <TextInputField
          {...props}
          disabled={disabled}
          containerStyle={styles.textInputContainer}
          rightIcon={<Text style={styles.inputIcon}>e幣</Text>}
        />
        {selectAll && (
          <Button
            type='clear'
            title='全部'
            titleStyle={styles.button}
            onPress={onPress}
          />
        )}
      </View>
      {hint && (
        <View style={styles.hintStyle}>
          <Hint inputHint content={hint} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    marginTop: theme.spacing.middle,
    marginBottom: theme.spacing.middle,
  },
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  textInputContainer: {
    flex: 1,
  },
  inputIcon: {
    color: theme.colors.brownGrey,
    fontSize: 16,
    padding: 10,
  },
  button: {
    fontSize: theme.fontSize.h5,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  hintStyle: {
    marginTop: -theme.spacing.smallest,
  },
});

export default AmountInput;
