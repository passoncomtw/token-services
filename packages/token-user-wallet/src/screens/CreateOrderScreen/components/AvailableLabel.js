import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '~/components/Text';
import ImageIcon from '~/components/ImageIcon';
import coinIcon from '~/assets/images/icCoin.png';
import colors from '~/theme/color';

const AvailableLabel = ({ label, minAmount, maxAmount }) => {
  return (
    <View style={styles.inputRow}>
      <Text>{label}</Text>
      <ImageIcon source={coinIcon} size={16} />
      <Text style={styles.numberValue}>{`${minAmount} ~ ${maxAmount}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  inputRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  numberValue: {
    paddingLeft: 8,
    paddingRight: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
});

export default AvailableLabel;
