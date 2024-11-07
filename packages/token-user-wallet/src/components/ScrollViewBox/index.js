import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ViewBox from '~/components/ViewBox';
import colors from '~/theme/color';

const ScrollViewBox = ({ scrollViewProps, ...viewBoxProps }) => {
  return (
    <ScrollView style={styles.container} {...scrollViewProps}>
      <ViewBox {...viewBoxProps} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
});

export default ScrollViewBox;
