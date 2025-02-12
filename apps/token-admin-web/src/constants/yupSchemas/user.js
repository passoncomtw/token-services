import * as yup from 'yup';
import isEmpty from 'lodash/isEmpty';

const mixedStringAndNumber = /^(?=.{6,20}$)([a-zA-Z]+\d+|\d+[a-zA-Z]+)\w*$/;
const mixedWordAndStringAndNumber = /^[\u4e00-\u9fa5a-zA-Z0-9]{1,20}$/;

export const loginAccountSchema = yup
  .string('不是正確的文字格式')
  .required('帳號不可為空');

export const accountSchema = yup
  .string('不是正確的文字格式')
  .matches(mixedStringAndNumber, '請輸入6-20碼英數組合')
  .required('帳號不可為空');

export const passwordSchema = yup
  .string('不是正確的文字格式')
  .matches(mixedStringAndNumber, '請輸入6-20碼英數組合，倂注意英文有分大小寫')
  .required('請輸入6-20碼英數組合，倂注意英文有分大小寫');

export const transactionCodeSchema = yup
  .string()
  .when({
    is: value => !isEmpty(value),
    then: yup
      .string()
      .notOneOf([yup.ref('password')], '交易密碼不可與登錄密碼相同')
      .matches(
        mixedStringAndNumber,
        '請輸入6-20碼英數組合，倂注意英文有分大小寫'
      ),
  })
  .required('請輸入6-20碼英數組合，倂注意英文有分大小寫');

export const userNameSchema = yup
  .string()
  .matches(mixedWordAndStringAndNumber, '請輸入1-20碼，且不可有特殊符號');

export const contactorSchema = yup
  .string()
  .matches(mixedWordAndStringAndNumber, '請輸入1-20碼，且不可有特殊符號');

export const emailSchema = yup
  .string()
  .email('郵箱格式不正確')
  .required('請輸入郵箱');

export const phoneSchema = yup
  .string()
  .matches(/^\d{9,11}$/, '請輸入9~11數字')
  .required('請輸入手機號');

export const telegramSchema = yup
  .string()
  .matches(
    /^(?=.{5,20}$)([a-zA-Z]+\d+|\d+[a-zA-Z]+|-+)\w*$/,
    '請輸入5-20碼英數及底線'
  );
