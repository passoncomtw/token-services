import QS from 'query-string';
import isEmpty from 'lodash/isEmpty';
import defaultFetch from './fetchManager';

const TIMEOUT_SETTING = 15 * 1000;

const defaultHeaders = {
  'Content-Type': 'application/json',
  'cache-control': 'no-cache',
};

const getUrlWithQueryString = (url, queryString) =>
  isEmpty(queryString) ? url : `${url}?${QS.stringify(queryString)}`;

const getRequestOptions = (method, customHeaders, body) => ({
  method,
  headers: { ...defaultHeaders, ...customHeaders },
  body,
  timeout: TIMEOUT_SETTING,
});

const fetchGetBase = ({ url, qs, customHeaders = {} }) => {
  const realUrl = getUrlWithQueryString(url, qs);
  const requestOptions = getRequestOptions('GET', customHeaders, null);
  return defaultFetch(realUrl, requestOptions);
};

const fetchPostBase = ({ url, qs, method, body, customHeaders = {} }) => {
  const realUrl = getUrlWithQueryString(url, qs);
  const requestOptions = getRequestOptions(method, customHeaders, body);
  return defaultFetch(realUrl, requestOptions);
};

export const fetchGet = (url, qs = {}) => fetchGetBase({ url, qs });

export const fetchGetWithToken = (url, customHeaders, qs = {}) =>
  fetchGetBase({ url, qs, customHeaders });

export const fetchPost = (url, payload = {}, qs = {}, method = 'POST') =>
  fetchPostBase({
    method,
    url,
    qs,
    body: JSON.stringify(payload),
  });

export const fetchPostWithToken = (
  url,
  customHeaders,
  payload = {},
  qs = {},
  method = 'POST'
) =>
  fetchPostBase({
    method,
    url,
    qs,
    body: JSON.stringify(payload),
    customHeaders,
  });

export const fetchPostFormDataWithToken = (
  url,
  customHeaders,
  payload = {},
  qs = {},
  method = 'POST'
) =>
  fetchPostBase({
    method,
    url,
    qs,
    body: payload.formData,
    customHeaders,
  });

export const fetchPutWithToken = (
  url,
  customHeaders,
  payload = {},
  qs = {},
  method = 'PUT'
) => {
  const realUrl = isEmpty(qs) ? url : `${url}?${QS.stringify(qs)}`;

  return defaultFetch(realUrl, {
    method,
    headers: { ...defaultHeaders, ...customHeaders },
    body: JSON.stringify(payload),
    timeout: TIMEOUT_SETTING,
  });
};
