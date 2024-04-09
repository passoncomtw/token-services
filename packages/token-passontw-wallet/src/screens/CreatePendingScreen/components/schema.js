import * as yup from 'yup';

export const schema = (balance, typeText) => {
  return  yup.object().shape({
    isSplit: yup.boolean(),
    minAmount: yup
      .number()
      .typeError('请设置整数金额')
      .integer('请设置整数金额')
      .when('isSplit', {
        is: true,
        then: yup
          .number()
          .typeError('请设置整数金额')
          .min(100, `最少${typeText}数量为100`),
          // .max(balance, `最多${typeText}数量为${balance}`),
      }),
    amount: yup
      .number()
      .typeError('请设置整数金额')
      .integer('请设置整数金额')
      .min(100, `最少${typeText}数量为100`),
      // .max(balance, `最多${typeText}数量为${balance}`),
    bankcardId: yup
      .number()
      .typeError('交易账户不可为空')
      .required('交易账户不可为空'),
    transactionCode: yup.string().required('交易密码不可为空'),
  });
}
 
