import React from 'react';
import Tabs from '~/components/Tabs';
import { ORDER_TYPE } from '~/constants/status.config';

const TYPE_MAPPING = [
  {
    text: '我要買',
    selectedIndex: 0,
    type: ORDER_TYPE.BUY,
  },
  {
    text: '我要賣',
    selectedIndex: 1,
    type: ORDER_TYPE.SALE,
  },
];

const tabTexts = TYPE_MAPPING.map((item) => item.text);

const handleSetSearchType = (setSearchType) => (index) => {
  setSearchType(TYPE_MAPPING[index].type);
};

const TypeTabs = ({ value, setSearchType }) => {
  return (
    <Tabs
      list={tabTexts}
      value={value}
      onChange={handleSetSearchType(setSearchType)}
    />
  );
};

export default TypeTabs;
