import React, { useState } from 'react';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import ScrollViewBox from '../../ScrollViewBox';
import { validate } from '~/utils/yupCheck';
import InputContent from './components/InputContent';
import KeyboardAvoidingView from '~/components/KeyboardAvoidingView';
import {
  addCardAction,
  updateCardAction,
  deleteCardAction,
} from '~/actions/cardActions';
import {
  usernameSchema,
  branchScheme,
  cardNumberSchema,
} from '~/utils/yupSchema';
import PreviewContent from './components/PreviewContent';
import { showDialog } from '~/helper/dialogHelper';

const cardSchema = yup.object().shape({
  name: usernameSchema.required('請輸入開户人姓名，且不可有特殊符號'),
  bankName: yup.string().required('請選擇開户行'),
  branchName: branchScheme.required('請輸入開户支行，且不可有特殊符號'),
  cardNumber: cardNumberSchema.required('請輸入16-20碼數字'),
});

const getTitle = (editMode, step) => {
  if (step === 1) return '再次確認';
  return editMode === 'edit' ? '編輯銀行卡' : '新增銀行卡';
};

const UpdateCardModal = ({ cardInfo, editMode }) => {
  const [bank, setBank] = useState({
    bankId: cardInfo.bankId,
    bankName: cardInfo.bankName,
  });
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(cardInfo.name);
  const [branchName, setBranchName] = useState(cardInfo.branchName);
  const [cardNumber, setCardNumber] = useState(cardInfo.cardNumber);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const onSubmitAction = editMode === 'edit' ? updateCardAction : addCardAction;
  const title = getTitle(editMode, step);

  const onCallback = (item) => {
    setBank({ bankName: item.label, bankId: item.value });
  };

  const payload = {
    id: cardInfo.id,
    name: username,
    cardNumber,
    bankId: bank.bankId,
    bankName: bank.bankName,
    branchName,
    status: 1,
  };

  const onNextStep = () => {
    const { isValid, errors: currentError } = validate(cardSchema, payload);
    if (isValid) setStep(1);
    setErrors(currentError);
  };

  const onConfirm = () => {
    dispatch(onSubmitAction(payload));
    setErrors({});
    // dismiss();
  };

  const onDelete = () => {
    showDialog({
      type: 'ask',
      text: '確定要刪除銀行卡嗎？',
      action: () => {
        dispatch(deleteCardAction(payload));
        // dismiss();
      },
    });
  };

  return (
    <KeyboardAvoidingView offset={100}>
      <ScrollViewBox fill>
        <InputContent
          show={step === 0}
          editMode={editMode}
          title={title}
          bank={bank}
          errors={errors}
          username={username}
          branchName={branchName}
          cardNumber={cardNumber}
          onDelete={onDelete}
          onConfirm={onNextStep}
          onCallback={onCallback}
          setUsername={setUsername}
          setCardNumber={setCardNumber}
          setBranchName={setBranchName}
        />
        <PreviewContent
          show={step === 1}
          onConfirm={onConfirm}
          bank={bank}
          cardNumber={cardNumber}
          branchName={branchName}
          username={username}
          onGoBack={() => setStep(0)}
        />
      </ScrollViewBox>
    </KeyboardAvoidingView>
  );
};

export default UpdateCardModal;
