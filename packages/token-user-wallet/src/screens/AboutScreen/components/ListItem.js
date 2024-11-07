import React from 'react';
import { StyleSheet } from 'react-native';
import { Icon, ListItem as BasicListItem } from 'react-native-elements';
import preventDoubleClickHOC from '~/utils/preventDoubleClickHOC';
import colors from '~/theme/color';
import spacing from '~/theme/spacing';
import Text from '~/components/Text';

const ListItem = ({ item }) => {
  const {
    isVisible = true,
    title,
    iconName,
    action = () => {},
    disabled = false,
    rightElement = null,
  } = item;

  if (!isVisible) return null;

  return (
    <BasicListItem
      bottomDivider
      onPress={action}
      isVisible={isVisible}
      disabled={disabled}
      pad={spacing.middle}
      activeOpacity={0.85}
      underlayColor={colors.primary}
      containerStyle={styles.container}>
      {iconName && (
        <Icon
          size={30}
          name={iconName}
          type='material-community'
          color={colors.secondary}
        />
      )}
      <BasicListItem.Content>
        <Text h4 color='secondary'>
          {title}
        </Text>
      </BasicListItem.Content>
      {rightElement ? (
        rightElement
      ) : (
        <BasicListItem.Chevron color={colors.greyLight} />
      )}
    </BasicListItem>
  );
};

export default preventDoubleClickHOC(ListItem);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: spacing.middle,
  },
});
