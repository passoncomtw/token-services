import React from 'react';
import propTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import preventDoubleClickHOC from '~/utils/preventDoubleClickHOC';
import Text from '~/components/Text';
import ImageIcon from '~/components/ImageIcon';
import theme from '~/theme';

const PendingListItem = ({ isVisible, title, icon, action, disabled }) => {
  if (!isVisible) return null;

  const titleColor = disabled ? 'greyLight' : 'secondary';

  const chevronColor = disabled
    ? theme.colors.greyLighter
    : theme.colors.greyLight;

  return (
    <ListItem
      bottomDivider
      onPress={action}
      isVisible={isVisible}
      disabled={disabled}
      pad={theme.spacing.middle}
      activeOpacity={0.85}
      underlayColor={theme.colors.primary}
      containerStyle={styles.container}>
      <ImageIcon source={icon} size={52} />
      <ListItem.Content>
        <View style={styles.titleContainer}>
          <Text h3 color={titleColor}>
            {title}
          </Text>
          <Text isVisible={disabled} h6 color={titleColor}>
            已掛單
          </Text>
        </View>
      </ListItem.Content>
      <ListItem.Chevron color={chevronColor} />
    </ListItem>
  );
};

PendingListItem.propTypes = {
  isVisible: propTypes.bool,
  title: propTypes.string,
  disabled: propTypes.bool,
};

PendingListItem.defaultProps = {
  isVisible: true,
  title: '-',
  action: () => false,
  disabled: false,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.transparent,
    paddingVertical: theme.spacing.middle,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default preventDoubleClickHOC(PendingListItem);
