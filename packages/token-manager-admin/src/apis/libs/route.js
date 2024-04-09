const { REACT_APP_BASE_PATH } = process.env;

export const localDomain = endpoint => `${REACT_APP_BASE_PATH}${endpoint}`;
