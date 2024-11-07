import React from 'react';
import { StyleSheet, View } from 'react-native';
import propTypes from 'prop-types';
import { Image, ListItem as BasicListItem } from 'react-native-elements';
import preventDoubleClickHOC from '~/utils/preventDoubleClickHOC';
import colors from '~/theme/color';
import spacing from '~/theme/spacing';
import Text from '~/components/Text';

const ListItem = ({
  icon = null,
  isVisible = true,
  title = '',
  rightTitle = '',
  onPress = () => false,
  ...props
}) => {
  if (!isVisible) return null;

  return (
    <BasicListItem
      bottomDivider
      key={`${title}`}
      isVisible={isVisible}
      pad={spacing.middle}
      activeOpacity={0.5}
      underlayColor={colors.transparent}
      containerStyle={styles.container}
      onPress={onPress}
      {...props}>
      <Image style={styles.iconStyle} source={icon} />
      <BasicListItem.Content>
        <View style={styles.content}>
          <Text h4 color='secondary'>
            {title}
          </Text>
          <Text style={styles.statusText}>{rightTitle}</Text>
        </View>
      </BasicListItem.Content>
      <BasicListItem.Chevron color={colors.grey} />
    </BasicListItem>
  );
};

export default preventDoubleClickHOC(ListItem);

ListItem.propTypes = {
  isVisible: propTypes.bool,
  onPress: propTypes.func,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: spacing.middle,
    paddingHorizontal: spacing.big,
  },
  iconStyle: {
    width: 52,
    height: 52,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: spacing.small,
    backgroundColor: colors.transparent,
  },
  statusText: {
    paddingLeft: '50%',
  },
});
