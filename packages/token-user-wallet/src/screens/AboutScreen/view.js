import React, { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Avatar } from 'react-native-elements';
import { FlatList, StyleSheet, View } from 'react-native';
import Text from '~/components/Text';
import ViewBox from '~/components/ViewBox';
import ConfirmButton from '~/components/Button/ConfirmButton';
import ListItem from './components/ListItem';
import packageConfig from '../../../package.json';
import { showToast } from '~/helper/toastHelper';
import { getFirstText } from '~/utils/formatHelper';
import colors from '~/theme/color';
import spacing from '~/theme/spacing';
import DialogBox from '~/components/DialogBox';

const AboutScreen = (props) => {
  const [open, setOpen] = useState(false);
  const { navigation, username, referralCode, handleLogout } = props;

  const ITEM_LIST = [
    {
      title: '個人資料',
      iconName: 'account-box-outline',
      action: () => false,
      // action: () => push('User'),
    },
    {
      title: '修改密碼',
      iconName: 'lock-outline',
      action: () => false,
      action: () => navigation.navigate('Setting-Update-Password'),
    },
    // {
    //   title: '聯繫客服',
    //   iconName: 'message-processing-outline',
    //   action: () => false,
    //   // action: () => showModal('About'),
    // },
    {
      title: '推薦碼',
      rightElement: <Text h4>{referralCode}</Text>,
      action: async () => {
        await Clipboard.setStringAsync(referralCode);
        showToast({ type: 'success', message: '已複製' });
      },
    },
    {
      title: '版本',
      rightElement: <Text h4>V {packageConfig.version}</Text>,
      disabled: true,
    },
  ];

  return (
    <ViewBox fill containerStyle={styles.containerStyle}>
      <DialogBox
        open={open}
        type="ask"
        descript='您確定退出登錄嗎？?'
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          handleLogout();
          setOpen(false);
        }}
      />
      <View style={styles.infoArea}>
        <Avatar
          rounded
          size='medium'
          title={getFirstText(username)}
          activeOpacity={0.9}
          titleStyle={styles.avatarTitle}
          containerStyle={styles.avatarContainer}
          overlayContainerStyle={styles.avatarOverlay}
        />
        <Text h4 color='secondary' fontWeight='bold'>
          {username}
        </Text>
      </View>
      <FlatList
        keyExtractor={(item, index) => `${index}`}
        data={ITEM_LIST}
        renderItem={({ item }) => <ListItem item={item} />}
      />
      <ConfirmButton
        type='light'
        title='退出登錄'
        onPress={() => setOpen(true)}
        containerStyle={styles.button}
      />
    </ViewBox>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  infoArea: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: colors.primary,
    paddingLeft: spacing.middle,
    height: '25%',
  },
  avatarContainer: {
    marginVertical: spacing.middle,
    marginRight: spacing.middle,
  },
  avatarOverlay: {
    backgroundColor: colors.white,
  },
  avatarTitle: {
    color: colors.secondary,
  },
  button: {
    paddingHorizontal: spacing.big,
  },
});

export default AboutScreen;
