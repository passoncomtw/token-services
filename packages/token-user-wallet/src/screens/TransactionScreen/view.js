import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import ViewBox from '~/components/ViewBox';
import TypeTabs from './components/TypeTabs';
import TransactionList from './components/TransactionList';
import { ORDER_TYPE } from '~/constants/status.config';

const searchDialogOptions = {
  type: 'ask',
  label: '數量',
  placeholder: '輸入想交易的e幣數量',
  cancelText: '重置',
  confirmText: '篩選',
  schema: yup.number().typeError('請輸入數字').required('請輸入數量'),
};

const getSearchedList = (searchType, sellerList, buyerList) => {
  return searchType === ORDER_TYPE.SALE ? sellerList : buyerList;
};

const TransactionScreen = (props) => {
  const {
    buyerList,
    navigation,
    sellerList,
    handleGetSellerList,
    handleGetBuyerList,
    route,
  } = props;
  const { params = { searchType: ORDER_TYPE.BUY } } = route;
  const [searchType, setSearchType] = useState(params.searchType);
  const [searchAmount, setSearchAmount] = useState(null);

  useEffect(() => {
    handleGetSellerList();
    handleGetBuyerList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ViewBox flex fill>
      <TypeTabs value={searchType} setSearchType={setSearchType} />
      <TransactionList
        navigation={navigation}
        searchType={searchType}
        searchAmount={searchAmount}
        handleGetBuyerList={handleGetBuyerList}
        handleGetSellerList={handleGetSellerList}
        data={getSearchedList(searchType, sellerList, buyerList)}
      />
    </ViewBox>
  );
};

export default TransactionScreen;
