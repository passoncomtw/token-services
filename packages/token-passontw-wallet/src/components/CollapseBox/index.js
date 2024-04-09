import React, { useState } from 'react';
import propTypes from 'prop-types';
import { View, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import Collapsible from 'react-native-collapsible';
import { StyleSheet } from 'react-native';
import theme from '~/theme';
import { TouchableWithoutFeedback } from 'react-native';

const CollapseBox = ({ title, children, ...props }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const styles = getStyle(theme, props);

  return (
    <View style={styles.root}>
      <TouchableWithoutFeedback
        onPress={() => setIsCollapsed((state) => !state)}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Icon name={isCollapsed ? 'expand-more' : 'expand-less'} size={25} />
        </View>
      </TouchableWithoutFeedback>
      <Collapsible collapsed={isCollapsed}>{children}</Collapsible>
    </View>
  );
};

const getStyle = (theme, props) =>
  StyleSheet.create({
    root: {
      width: '100%',
      padding: 30,
      borderColor: theme.colors.greyLighter,
      borderBottomWidth: props.hideBottomDivider ? 0 : 1,
    },
    title: {
      fontWeight: 'bold',
      color: theme.colors.black,
      fontSize: theme.fontSize.h3,
    },
    content: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.middle,
    },
  });

CollapseBox.propTypes = {
  title: propTypes.string,
  offsetHeight: propTypes.number,
};

CollapseBox.defaultProps = {
  title: '',
  offsetHeight: 0,
};

export default CollapseBox;
