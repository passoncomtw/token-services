
const { NX_PUBLIC_BASE_PATH } = process.env;

export const localDomain = endpoint => `${NX_PUBLIC_BASE_PATH}${endpoint}`;
