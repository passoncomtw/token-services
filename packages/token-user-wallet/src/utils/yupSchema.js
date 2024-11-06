import * as yup from 'yup';
import isEmpty from 'lodash/isEmpty';
import {
  numberLengthBetween,
  enAndChTypeRegexBetween,
  enAndChTypeAndNumberRegexBetween,
  requireMixedStringAtoZAndNumberLengthBetween,
} from '~/utils/regexHelper';

const accountRegex = requireMixedStringAtoZAndNumberLengthBetween(6, 20);
const passwordRegex = requireMixedStringAtoZAndNumberLengthBetween(6, 20);
const transactionCodeRegex = requireMixedStringAtoZAndNumberLengthBetween(
  6,
  20
);
const cardNumberRegex = numberLengthBetween(16, 20);
const enAndChRegex = enAndChTypeRegexBetween(1, 20);
const usernameRegex = enAndChTypeAndNumberRegexBetween(1, 20);

export const usernameSchema = yup
  .string()
  .matches(usernameRegex, '請輸入1-20碼，且不可有特殊符號');

export const email = yup
  .string()
  .email('郵箱格式不正確')
  .required('請輸入郵箱');

export const account = yup
  .string()
  .matches(accountRegex, '請輸入6-20碼英數組合');

export const referrerCode = yup.string().when({
  is: (value) => value.length > 0,
  then: yup.string().matches(accountRegex, '請輸入6-20碼英數組合'),
});

export const password = yup
  .string()
  .matches(passwordRegex, '請輸入6-20碼英數組合，倂注意英文有分大小寫');

export const confirmPassword = yup
  .string()
  .when({
    is: (value) => !isEmpty(value),
    then: yup
      .string()
      .oneOf([yup.ref('password')], '與登錄密碼不一致')
      .matches(passwordRegex, '請輸入6-20碼英數組合，倂注意英文有分大小寫'),
  })
  .required('請再次輸入登錄密碼');

export const transactionCode = yup
  .string()
  .when({
    is: (value) => !isEmpty(value),
    then: yup
      .string()
      .notOneOf([yup.ref('password')], '交易密碼不可與登錄密碼相同')
      .matches(
        transactionCodeRegex,
        '請輸入6-20碼英數組合，倂注意英文有分大小寫'
      ),
  })
  .required('請輸入6-20碼英數組合，倂注意英文有分大小寫');

export const confirmTransactionCode = yup
  .string()
  .when({
    is: (value) => !isEmpty(value),
    then: yup
      .string()
      .oneOf([yup.ref('transactionCode')], '與交易密碼不一致')
      .matches(
        transactionCodeRegex,
        '請輸入6-20碼英數組合，倂注意英文有分大小寫'
      ),
  })
  .required('請再次輸入交易密碼');

export const branchScheme = yup
  .string()
  .matches(enAndChRegex, '請輸入開户支行，且不可有特殊符號');

export const cardNumberSchema = yup
  .string()
  .matches(cardNumberRegex, '請輸入16-20碼數字');
