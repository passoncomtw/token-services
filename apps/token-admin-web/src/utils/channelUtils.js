import cloneDeep from 'lodash/cloneDeep';
import { formatMoney } from './format';

export const addPointNumber = prevAmount => {
  const floatNumber = parseFloat(prevAmount);
  return formatMoney(floatNumber + 0.01, 2);
};

const getFloatNumber = (amount, add = 0) => {
  const num = (parseFloat(amount) + add).toFixed(2);
  return parseFloat(num);
};

const updateLastAmount = steps => {
  const cloneSteps = cloneDeep(steps);
  const last = cloneSteps.pop();
  const secondToLast = cloneSteps.pop();
  return [
    ...cloneSteps,
    secondToLast,
    { ...last, amount: getFloatNumber(secondToLast.amount, 0.01) },
  ];
};

const addMinLimitToVerify = stepsLength => (result, step, index) => {
  if (result.length === 0) return [{ ...step, min: 0 }];
  const cloneResult = cloneDeep(result);
  const originLast = cloneResult.pop();

  const min =
    stepsLength === index + 1
      ? getFloatNumber(originLast.amount)
      : getFloatNumber(originLast.amount, 0.01);

  return [
    ...cloneResult,
    originLast,
    {
      min,
      amount: Number(step.amount),
      feePercent: Number(step.feePercent),
    },
  ];
};

export const getRequiredFormData = (formData, isPercentType = false) => {
  const { channelStatus, feePercent, minFee, maxFee, steps } = formData;
  if (isPercentType) return { channelStatus, feePercent, minFee, maxFee };
  const newSteps = updateLastAmount(steps);
  return {
    channelStatus,
    steps: newSteps,
    stepsToVerify: newSteps.reduce(addMinLimitToVerify(steps.length), []),
  };
};
