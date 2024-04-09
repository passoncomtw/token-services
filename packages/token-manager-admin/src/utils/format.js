import pick from 'lodash/pick';
import reduce from 'lodash/reduce';
import isFunction from 'lodash/isFunction';
import { isValidNumber } from './numberUtils';
import { toTimestamp } from './dateUtils';

export const formatMoney = number => {
  return new Intl.NumberFormat('nu').format(number);
};

const filterNullOrEmpty = ({ name, value }) =>
  [null, ''].includes(value) ? {} : { [name]: value };

const convertToTimeStamp = ({ name, value }) => ({
  [name]: toTimestamp(value),
});

export const handleSearchPayload = payload => {
  return reduce(
    payload,
    (result, value, name) => {
      const isDataTimeFormat = [
        'endDatetime',
        'startDatetime',
        'sendDateTime',
      ].includes(name);
      const newPayload = isDataTimeFormat
        ? convertToTimeStamp({ name, value })
        : filterNullOrEmpty({ name, value });

      return {
        ...result,
        ...newPayload,
      };
    },
    {}
  );
};

export const getListFormat = data =>
  pick(data, ['records', 'current', 'size', 'total', 'pages']);

export const toHashText = (originText, options = {}) => {
  //  ex:Key123456 -> Key******456
  const {
    prefixLength = 4,
    suffixLength = 4,
    replaceWord = '******',
  } = options;

  return originText.replace(
    new RegExp(`^(.{${prefixLength}}).*(.{${suffixLength}})$`),
    (_, prefix, suffix) => `${prefix}${replaceWord}${suffix}`
  );
};

export const toRadioItems = options => toSearchItems(options, []);

export const toSearchItems = (
  options,
  defaultValue = [{ value: '', name: '全部' }]
) =>
  reduce(
    options,
    (result, name, value) => [
      ...result,
      {
        value: isValidNumber(value) ? Number(value) : value,
        name,
      },
    ],
    defaultValue
  );

export const listToMap = (list, key, value) => {
  const listJS = isFunction(list.toJS) ? list.toJS() : list;

  return listJS.reduce((result, item) => {
    return { ...result, [item[key]]: item[value] };
  }, {});
};

export const toCamelStyle = actionType =>
  actionType.toLowerCase().replace(/[^a-z]{1}(\w)/g, function (all, matched) {
    return matched.toUpperCase();
  });
