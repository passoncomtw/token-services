import React from "react";
import { StyleSheet } from "react-native";
import Hint from "~/components/Hint";
import Section from "~/components/Section";
import ConfirmButton from "~/components/Button/ConfirmButton";
import TextInputField from "~/components/Inputs/TextInputField";
import { Dropdown } from "react-native-element-dropdown";

const UpdateCardModal = (props) => {
  const {
    show,
    bank,
    title,
    username,
    errors,
    banks,
    branchName,
    setBranchName,
    editMode,
    cardNumber,
    setBank,
    setUsername,
    setCardNumber,
    onDelete,
    onConfirm,
  } = props;
  if (!show) return null;

  return (
    <>
      <Section title={title} hideBottomDivider>
        <Hint
          content={[
            "當您進行交易時，選擇的賬户將向對方展示，限建立本人賬户，並請確認信息填寫準確無誤",
          ]}
        />
        <TextInputField
          label="姓名"
          value={username}
          placeholder="請輸入姓名"
          hint={["新增後無法修改，且之後新增的賬户姓名必須相同"]}
          maxLength={20}
          disabled={editMode === "edit"}
          errorMessage={errors.name}
          onChangeText={(value) => setUsername(value)}
        />
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={banks}
          search={false}
          maxHeight={300}
          labelField="bankName"
          valueField="id"
          placeholder="Select item"
          value={bank.bankId}
          onChange={setBank}
        />
        <TextInputField
          label="開户支行"
          placeholder="請輸入開户支行"
          value={branchName}
          maxLength={20}
          errorMessage={errors.branchName}
          onChangeText={(value) => setBranchName(value)}
        />
        <TextInputField
          label="銀行卡卡號"
          placeholder="請輸入銀行卡卡號"
          value={cardNumber}
          maxLength={20}
          errorMessage={errors.cardNumber}
          onChangeText={(value) => setCardNumber(value)}
        />
      </Section>
      <Section hideBottomDivider>
        <ConfirmButton title="完成" onPress={onConfirm} />
        <ConfirmButton
          type="light"
          title="刪除"
          isVisible={editMode === "edit"}
          onPress={onDelete}
        />
      </Section>
    </>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default UpdateCardModal;
