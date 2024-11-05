import * as yup from 'yup';

const feePercent = yup
  .number()
  .min(0, '手續費不得小於0')
  .max(100, '手續費率不得大於100%')
  .typeError('請輸入手續費率')
  .required('請輸入手續費率');

const minFee = yup
  .number()
  .when('feePercent', {
    is: val => val === 0,
    then: yup.number().moreThan(0, '手續費不得小於等於0'),
  })
  .typeError('請輸入最低手續費')
  .required('請輸入最低手續費');

const maxFee = yup
  .number()
  .min(yup.ref('minFee'), '手續費不得小於等於最低手續費')
  .typeError('請輸入最高手續費')
  .required('請輸入最高手續費');

const feeSchema = validSchema => {
  return yup.number().when('feeType', {
    is: 0,
    then: validSchema,
  });
};

const stepsToVerify = yup.array().of(
  yup.object().shape({
    feePercent,
    amount: yup
      .number()
      // .moreThan(yup.ref('minFee'), '金額不得小於最小金額')
      .typeError('請輸入金額')
      .required('請輸入金額'),
  })
);

export const commissionSchema = yup.object().shape({
  feeType: yup.mixed().oneOf([0, 1]).required('請輸入手續費類型'),
  feePercent: feeSchema(feePercent),
  minFee: feeSchema(minFee),
  maxFee: feeSchema(maxFee),
  steps: stepsToVerify,
});
