import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import theme from '~/theme';
import Text from '~/components/Text';
import icHomeBuy from '~/assets/images/order/icHomeBuy.png';
import icHomeSell from '~/assets/images/order/icHomeSell.png';
import {
  ORDER_STATUE_TEXT,
  ORDER_STATUS_COLOR,
} from '~/constants/status.config';
import colors from '~/theme/color';

const StatusText = ({ status }) => {
  return (
    <Text h4 style={{ color: ORDER_STATUS_COLOR[status] }}>
      {ORDER_STATUE_TEXT[status]}
    </Text>
  );
};

const TypeIcon = ({ type }) => {
  const icon = type === 0 ? icHomeBuy : icHomeSell;
  return <Image source={icon} />;
};

const StatusPanel = ({ type, status }) => {
  return (
    <View style={styles.root}>
      <View style={styles.background} />
      <View style={styles.panel}>
        <View style={styles.iconText}>
          <TypeIcon type={type} />
          <Text h3 style={{ color: colors.black }}>
            {type === 0 ? '購買' : '出售'}
          </Text>
        </View>
        <StatusText status={status} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  background: {
    height: 50,
    width: '100%',
    backgroundColor: theme.colors.primary,
  },
  iconText: {
    width: 95,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panel: {
    top: 20,
    height: 70,
    padding: 20,
    borderRadius: 10,
    width: '85%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    position: 'absolute',
    ...theme.shadowStyle.black,
    backgroundColor: theme.colors.white,
  },
});

export default StatusPanel;
