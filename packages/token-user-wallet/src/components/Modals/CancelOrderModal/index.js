import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import ConfirmButton from '~/components/Button/ConfirmButton';
import ScrollViewBox from '~/components/ScrollViewBox';
import Hint from '~/components/Hint';
import Section from '../../Section';
import SelectList from '../../SelectList';
import TextInputField from '~/components/Inputs/TextInputField';
import { cancelOrderAction } from '~/actions/transactionActions';

const items = [
  {
    label: '無交易需求',
    value: '無交易需求',
  },
  {
    label: '欲更改訂單內容',
    value: '欲更改訂單內容',
  },
  {
    label: '其他',
    value: 'others',
  },
];

const CancelOrderModal = ({ componentId, orderId }) => {
  const dispatch = useDispatch();
  const [selectedValue, setSelectedValue] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const getCancelReason = () => {
    return selectedValue === 'others' ? otherReason : selectedValue;
  };

  const handleCancelOrder = () => {
    const cancelReason = getCancelReason();
    dispatch(cancelOrderAction({ orderId, cancelReason }));
  };

  return (
    <ScrollViewBox fill>
      <Section title='取消付款' hideBottomDivider>
        <Hint content={['請選擇取消付款原因']} />
        <SelectList
          items={items}
          value={selectedValue}
          onPress={({ value }) => setSelectedValue(value)}
        />
        <TextInputField
          multiline
          hidden={selectedValue !== 'others'}
          maxLength={200}
          numberOfLines={4}
          placeholder='請輸入取消原因'
          hint={['非必填，限0-200碼']}
          onChangeText={(value) => setOtherReason(value)}
        />
        <ConfirmButton title='確認' onPress={handleCancelOrder} />
      </Section>
    </ScrollViewBox>
  );
};

export default CancelOrderModal;
