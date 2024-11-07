import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tab } from 'react-native-elements';
import colors from '~/theme/color';
import { fontSize, fontWeight } from '~/theme/font';

const Tabs = ({ list, value, onChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.groupContainer}>
        <Tab
          variant='primary'
          value={value}
          onChange={onChange}
          indicatorStyle={styles.indicatorStyle}>
          {list.map((text, index) => {
            const activeStyle = value === index ? styles.activeStyle : {};
            return (
              <Tab.Item
                key={`tab-${index}`}
                title={text}
                buttonStyle={styles.itemStyle}
                titleStyle={[styles.titleStyle, activeStyle]}
              />
            );
          })}
        </Tab>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  groupContainer: {
    flex: 1,
  },
  titleStyle: {
    fontSize: fontSize.h4,
    color: colors.brownGrey,
    fontWeight: fontWeight.bold,
  },
  itemStyle: {
    height: 56,
    backgroundColor: colors.white,
  },
  activeStyle: {
    color: colors.secondary,
  },
  indicatorStyle: {
    backgroundColor: colors.primary,
    color: colors.brownGrey,
  },
});

export default Tabs;
