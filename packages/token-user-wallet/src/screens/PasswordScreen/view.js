import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import ViewBox from '~/components/ViewBox';
import ListItem from './components/ListItem';
import {PWD_TYPE} from '~/constants/status.config';

const PasswordScreen = (props) => {
  const {navigation} = props;
  const ITEM_LIST = [
    {
      title: '修改登錄密碼',
      iconName: 'user',
      action: () => navigation.navigate("Setting-Reset-Password", { type: PWD_TYPE.PWD } ),
    },
    {
      title: '修改交易密碼',
      iconName: 'key',
      action: () => navigation.navigate("Setting-Reset-Password", { type: PWD_TYPE.TRANS } ),
    },
  ];

  return (
    <ViewBox flex fill containerStyle={styles.containerStyle}>
      <FlatList
        keyExtractor={(item, index) => `${index}`}
        data={ITEM_LIST}
        renderItem={({ item }) => <ListItem item={item} />}
      />
    </ViewBox>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});

PasswordScreen.options = {
  topBar: {
    title: {
      text: '修改密碼',
    },
    backButton: {
      showTitle: false,
    },
  },
};

export default PasswordScreen;
