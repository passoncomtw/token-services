import QS from 'query-string';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { localDomain } from './route';

const UNEXPECT_ERROR_MSG = '服务异常，请重新再试或与客服联系';
const SERVER_ERROR_MSG = '服务异常，请稍后再试或与客服联系';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

const getErrorFormat = (code, message) => ({
  code,
  data: { message },
});

const getResponseCode = (responseOK, statusCode, bodyResult) => {
  if (responseOK && statusCode >= 200 && statusCode < 300) {
    return bodyResult.code;
  }
  return '101';
};

const validateCode = code => {
  if (isUndefined(code)) return true;
  if (code === 100) return true;
  return false;
};

const parseInternetError = error => {
  // Unexpect error，不會過 parseResponse;
  if (error.message === 'Failed to fetch') {
    throw getErrorFormat(500, UNEXPECT_ERROR_MSG);
    return;
  }
  throw error;
};

const parseResponse = response => {
  const { status: statusCode, ok: responseOK } = response;
  // 先把 500, 404 拉到更上層就丟出，避免不需要的 parse 造成錯誤
  if ([500, 404].includes(statusCode)) {
    throw getErrorFormat(statusCode, SERVER_ERROR_MSG);
  }

  return response.text().then(body => {
    const bodyResult = isEmpty(body) ? {} : JSON.parse(body);
    const code = getResponseCode(responseOK, statusCode, bodyResult);
    const ok = validateCode(code);
    const result = { ...bodyResult, code };
    if (!ok) throw result;

    return {
      statusCode,
      ok,
      result,
    };
  });
};

export const fetchGet = (url, customHeaders) => {
  return fetch(localDomain(url), {})
    .then(parseResponse)
    .catch(parseInternetError);
};

export const fetchGetWithToken = (url, customHeaders, payload = {}) => {
  const realUrl =
    Object.keys(payload).length === 0 ? url : `${url}?${QS.stringify(payload)}`;

  return fetch(localDomain(realUrl), {
    method: 'GET',
    headers: {
      ...customHeaders,
    },
  })
    .then(parseResponse)
    .catch(parseInternetError);
};

export const fetchPost = (url, payload) => {
  return fetch(localDomain(url), {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  })
    .then(parseResponse)
    .catch(parseInternetError);
};

export const fetchPostWithToken = (
  url,
  customHeaders,
  payload = {},
  method = 'POST'
) => {
  return fetch(localDomain(url), {
    method,
    headers: { ...defaultHeaders, ...customHeaders },
    body: JSON.stringify(payload),
  })
    .then(parseResponse)
    .catch(parseInternetError);
};

export const fetchPostFormDataWithToken = (
  url,
  customHeaders,
  payload = {},
  method = 'POST'
) => {
  const formData = new FormData();
  formData.append('file', payload);
  return fetch(localDomain(url), {
    method,
    headers: { ...customHeaders },
    body: formData,
  })
    .then(parseResponse)
    .catch(parseInternetError);
};

export const fetchPostWithTokenAndQS = (
  url,
  customHeaders,
  payload = {},
  qs = {},
  method = 'POST'
) => {
  const realUrl =
    Object.keys(qs).length === 0 ? url : `${url}?${QS.stringify(qs)}`;

  return fetch(localDomain(realUrl), {
    method,
    headers: { ...defaultHeaders, ...customHeaders },
    body: JSON.stringify(payload),
  })
    .then(parseResponse)
    .catch(parseInternetError);
};
