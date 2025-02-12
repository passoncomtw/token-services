export const onChangeHandler = setter => ({ name, value }) => {
  setter(payload => ({
    ...payload,
    [name]: value,
  }));
};
