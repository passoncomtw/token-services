import React from 'react';
import Hint from '~/components/Hint';
import Section from '~/components/Section';
import ConfirmButton from '~/components/Button/ConfirmButton';
import SelectButton from '~/components/Inputs/SelectButton';
import TextInputField from '~/components/Inputs/TextInputField';

const UpdateCardModal = ({
  show,
  title,
  username,
  errors,
  bank,
  branchName,
  setBranchName,
  editMode,
  cardNumber,
  setUsername,
  setCardNumber,
  onDelete,
  onConfirm,
}) => {
  if (!show) return null;

  return (
    <>
      <Section title={title} hideBottomDivider>
        <Hint
          content={[
            '當您進行交易時，選擇的賬户將向對方展示，限建立本人賬户，並請確認信息填寫準確無誤',
          ]}
        />
        <TextInputField
          label='姓名'
          value={username}
          placeholder='請輸入姓名'
          hint={['新增後無法修改，且之後新增的賬户姓名必須相同']}
          maxLength={20}
          disabled={editMode === 'edit'}
          errorMessage={errors.name}
          onChangeText={(value) => setUsername(value)}
        />
        <SelectButton
          label='開户行'
          placeholder='請選擇開户行'
          value={bank.bankName}
          errorMessage={errors.bankName}
          onPress={() => false}
          // onPress={() =>
          //   showBankListModal({ onCallback, selectedValue: bank.bankId })
          // }
        />
        <TextInputField
          label='開户支行'
          placeholder='請輸入開户支行'
          value={branchName}
          maxLength={20}
          errorMessage={errors.branchName}
          onChangeText={(value) => setBranchName(value)}
        />
        <TextInputField
          label='銀行卡卡號'
          placeholder='請輸入銀行卡卡號'
          value={cardNumber}
          maxLength={20}
          errorMessage={errors.cardNumber}
          onChangeText={(value) => setCardNumber(value)}
        />
      </Section>
      <Section hideBottomDivider>
        <ConfirmButton title='完成' onPress={onConfirm} />
        <ConfirmButton
          type='light'
          title='刪除'
          isVisible={editMode === 'edit'}
          onPress={onDelete}
        />
      </Section>
    </>
  );
};

export default UpdateCardModal;
