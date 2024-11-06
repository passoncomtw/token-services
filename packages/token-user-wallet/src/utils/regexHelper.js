// 純字數
export const stringLengthBetween = (min, max) =>
  new RegExp(`^\\S{${min},${max}}$`);

// 純數字
export const numberLengthBetween = (min, max) =>
  new RegExp(`^[0-9]{${min},${max}}$`);

// 必須英數混合
export const requireMixedStringAtoZAndNumberLengthBetween = (min, max) =>
  new RegExp(`^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z0-9]{${min},${max}}$`);

// 純英or數混合
export const mixedStringAtoZAndNumberLengthBetween = (min, max) =>
  new RegExp(`^[a-zA-Z0-9]{${min},${max}}$`);

// 純英or數or空白混合
export const mixedStringAtoZAndNumberAndSpaceLengthBetween = (min, max) =>
  new RegExp(`^[a-zA-Z0-9 ]{${min},${max}}$`);

// 純英and中文混合
export const enAndChTypeRegexBetween = (min, max) =>
  new RegExp(`^[\u4e00-\u9fa5a-zA-Z]{${min},${max}}$`, 'u');

// 純英and中and數字混合
export const enAndChTypeAndNumberRegexBetween = (min, max) =>
  new RegExp(`^[\u4e00-\u9fa5a-zA-Z0-9]{${min},${max}}$`, 'u');
