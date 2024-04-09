import React from 'react';
import LabelText from '../LabelText';
import { formatMoney } from '~/utils/format';

const LabelAmount = ({ title, value }) => {
  return <LabelText title={title} value={formatMoney(value)} />;
};

export default LabelAmount;
