import React from 'react';
import propTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import themeSet from '~/theme';

const SelectItem = ({ label, value, onPress, selected }) => {
  const styles = getStyle(themeSet, selected);

  return (
    <TouchableOpacity onPress={() => onPress({ label, value })}>
      <View style={styles.root}>
        <Text style={styles.text}>{label}</Text>
        {selected && (
          <Icon name='check' size={25} color={themeSet.colors.success} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const getStyle = (theme) => {
  return StyleSheet.create({
    root: {
      borderBottomWidth: 1,
      borderColor: theme.colors.greyLighter,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 60,
    },
    text: {
      color: theme.colors.text,
      fontSize: theme.fontSize.h4,
    },
  });
};

SelectItem.propTypes = {
  label: propTypes.string,
  selected: propTypes.bool,
};

SelectItem.defaultProps = {
  label: '',
  selected: false,
};

export default SelectItem;
