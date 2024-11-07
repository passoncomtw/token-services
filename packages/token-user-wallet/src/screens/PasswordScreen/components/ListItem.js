import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem as BasicListItem } from 'react-native-elements';
import preventDoubleClickHOC from '~/utils/preventDoubleClickHOC';
import Text from '~/components/Text';
import colors from '~/theme/color';
import spacing from '~/theme/spacing';

const ListItem = ({ item }) => {
  const { isVisible = true, title, action = () => {} } = item;

  if (!isVisible) return null;

  return (
    <BasicListItem
      bottomDivider
      onPress={action}
      isVisible={isVisible}
      pad={spacing.middle}
      activeOpacity={0.85}
      underlayColor={colors.primary}
      containerStyle={styles.container}>
      <BasicListItem.Content>
        <Text h4 color='secondary'>
          {title}
        </Text>
      </BasicListItem.Content>
      <BasicListItem.Chevron color={colors.greyLight} />
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
