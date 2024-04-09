import React, { useState } from 'react';
import { ButtonGroup as BasicButtonGroup } from 'react-native-elements';

const ButtonGroup = ({ setSearchType }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const buttons = ['我要買', '我要賣'];

  const onPress = (updatedIndex) => {
    const searchTypes = ['seller', 'buyer'];
    setSelectedIndex(updatedIndex);
    setSearchType(searchTypes[updatedIndex]);
  };

  return (
    <BasicButtonGroup
      buttons={buttons}
      onPress={onPress}
      selectedIndex={selectedIndex}
      containerStyle={{ height: 40 }}
    />
  );
};

export default ButtonGroup;
