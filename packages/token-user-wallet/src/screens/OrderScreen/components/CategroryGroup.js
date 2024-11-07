import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ButtonGroup } from 'react-native-elements';
import colors from '~/theme/color';
import { fontSize } from '~/theme/font';
import { ORDER_CATEGRORY_TEXT } from '~/constants/status.config';

const CategroryGroup = ({ selectedIndex, onPressCategrory }) => {
  return (
    <View style={styles.containerStyle}>
      <ButtonGroup
        containerStyle={styles.groupContainerStyle}
        textStyle={styles.textStyle}
        selectedTextStyle={styles.selectedTextStyle}
        selectedButtonStyle={styles.selectedButtonStyle}
        buttons={ORDER_CATEGRORY_TEXT}
        selectedIndex={selectedIndex}
        onPress={onPressCategrory}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: colors.primary,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupContainerStyle: {
    borderWidth: 1,
    borderRadius: 8,
    width: '70%',
    borderColor: colors.black,
  },
  textStyle: {
    fontSize: fontSize.h5,
    color: colors.secondary,
  },
  selectedButtonStyle: {
    backgroundColor: colors.secondary,
  },
  selectedTextStyle: {
    color: colors.white,
  },
});

export default CategroryGroup;
