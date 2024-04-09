import React from 'react';
import propTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import SelectItem from './components/SelectItem';
import themeSet from '~/theme';

const SelectList = ({ items, value, onPress, ...props }) => {
  const styles = getStyle(themeSet);

  return (
    <View style={styles.root}>
      {items.map((item) => {
        return (
          <SelectItem
            key={`select_list_${item.value}`}
            label={item.label}
            value={item.value}
            selected={item.value === value}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
};

const getStyle = (theme, props) => {
  return StyleSheet.create({
    root: {
      marginBottom: theme.spacing.middle,
    },
  });
};

SelectList.propTypes = {
  items: propTypes.arrayOf(
    propTypes.shape({
      label: propTypes.string,
      value: propTypes.string,
    })
  ),
};

SelectList.defaultProps = {
  items: [],
};

export default SelectList;
