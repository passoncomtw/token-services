import React, { useEffect, useState } from "react";
import {Alert} from "react-native";
import * as yup from "yup";
import ScrollViewBox from "~/components/ScrollViewBox";
import { validate } from "~/utils/yupCheck";
import InputContent from "./components/InputContent";
import KeyboardAvoidingView from "~/components/KeyboardAvoidingView";
import {
  usernameSchema,
  branchScheme,
  cardNumberSchema,
} from "~/utils/yupSchema";
import PreviewContent from "./components/PreviewContent";
import { showDialog } from "~/helper/dialogHelper";

const cardSchema = yup.object().shape({
  name: usernameSchema.required("請輸入開户人姓名，且不可有特殊符號"),
  bankName: yup.string().required("請選擇開户行"),
  branchName: branchScheme.required("請輸入開户支行，且不可有特殊符號"),
  cardNumber: cardNumberSchema.required("請輸入16-20碼數字"),
});

const getTitle = (editMode, step) => {
  if (step === 1) return "再次確認";
  return editMode === "edit" ? "編輯銀行卡" : "新增銀行卡";
};

const HandleCardModalScreen = (props) => {
  const {
    route,
    banks,
    navigation,
    handleAddCard,
    handleGetCards,
    handleUpdateCard,
    handleDeleteCard,
    handleGetBanks,
  } = props;
  const { cardInfo = {}, editMode } = route.params;
  const [bank, setBank] = useState({
    bankId: cardInfo.bankId,
    bankName: cardInfo.bankName,
  });
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(cardInfo.name);
  const [branchName, setBranchName] = useState(cardInfo.branchName);
  const [cardNumber, setCardNumber] = useState(cardInfo.cardNumber);
  const [errors, setErrors] = useState({});

  const title = getTitle(editMode, step);

  const payload = {
    id: cardInfo.id,
    name: username,
    cardNumber,
    bankId: bank.bankId,
    bankName: bank.bankName,
    branchName,
    status: 1,
    onSuccess: () => navigation.navigate("Wallet-Bank-Card-Modal"),
  };

  const onNextStep = () => {
    const { isValid, errors: currentError } = validate(cardSchema, payload);
    if (isValid) setStep(1);
    setErrors(currentError);
  };

  const onConfirm = () => {
    editMode === "edit" ? handleUpdateCard(payload) : handleAddCard(payload);
    setErrors({});
  };

  const onDelete = () => {
    Alert.alert(
      '刪除銀行卡',
      '確定要刪除銀行卡嗎？',
      [
        {
          text: 'Ok',
          onPress: () => handleDeleteCard({
            id: cardInfo.id,
            onSuccess: () => {
              handleGetCards();
              navigation.navigate("Wallet-Bank-Card-Modal");
            },
          }),
          style: 'cancel',
        },
        {
          text: 'Cancel',
          onPress: () => false,
          style: 'cancel',
        },
      ],
    );
  };

  useEffect(() => {
    handleGetBanks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <KeyboardAvoidingView offset={100}>
      <ScrollViewBox fill>
        <InputContent
          show={step === 0}
          editMode={editMode}
          title={title}
          bank={bank}
          banks={banks}
          errors={errors}
          username={username}
          branchName={branchName}
          cardNumber={cardNumber}
          onDelete={onDelete}
          onConfirm={onNextStep}
          setBank={selectedBank => {
            setBank({
              bankId: selectedBank.id,
              bankName: selectedBank.bankName,
            });
          }}
          setUsername={setUsername}
          setCardNumber={setCardNumber}
          setBranchName={setBranchName}
        />
        <PreviewContent
          bank={bank}
          navigation={navigation}
          show={step === 1}
          onConfirm={onConfirm}
          cardNumber={cardNumber}
          branchName={branchName}
          username={username}
          onGoBack={() => setStep(0)}
        />
      </ScrollViewBox>
    </KeyboardAvoidingView>
  );
};          

export default HandleCardModalScreen;
