export const isValidNumber = value => {
  const formatted = Number(value);
  return !isNaN(formatted);
};
