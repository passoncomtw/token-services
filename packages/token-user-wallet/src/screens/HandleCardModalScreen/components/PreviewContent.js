import React from 'react';
import LabelText from '~/components/LabelText';
import Section from '~/components/Section';
import ConfirmButton from '~/components/Button/ConfirmButton';
import Hint from '~/components/Hint';

const PreviewContent = ({
  show,
  username,
  bank,
  branchName,
  cardNumber,
  onConfirm,
  onGoBack,
}) => {
  if (!show) return null;
  return (
    <>
      <Section title='賬户信息' hideBottomDivider>
        <Hint content={['請務必確認賬户信息填寫準確無誤']} />
        <LabelText label='姓名' text={username} />
        <LabelText label='開户行' text={bank.bankName} />
        <LabelText label='開户支行' text={branchName} />
        <LabelText label='銀行卡卡號' text={cardNumber} />
      </Section>
      <Section hideBottomDivider>
        <ConfirmButton type='secondary' title='確認' onPress={onConfirm} />
        <ConfirmButton type='light' title='返回' onPress={onGoBack} />
      </Section>
    </>
  );
};

export default PreviewContent;
