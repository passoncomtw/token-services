import { useEffect, useRef } from 'react';
import isEmpty from 'lodash/isEmpty';
import omitBy from 'lodash/omitBy';
import isNumber from 'lodash/isNumber';

export const compactObject = payload =>
  omitBy(payload, (value, key) => {
    if (key === 'page' || key === 'size') return false;
    if (isNumber(value)) return true;
    return isEmpty(value);
  });

export const getCustomerHeader = (authorization, others = {}) => {
  const { access_token } = authorization;
  return {
    ...others,
    Authorization: `bearer ${access_token}`,
  };
};

export const menuActiveHelper = path => {
  const pathArray = path.split('/').filter(str => !isEmpty(str));
  const [first, second] = pathArray;

  const selectedKeys = isEmpty(second) ? [first] : [second];
  return {
    openKeys: [first],
    selectedKeys,
  };
};

export function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
