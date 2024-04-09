export const handleYupSchema = (schema, payload) => {
  return schema.validateSync(payload, { abortEarly: false });
};

export const handleYupErrors = (errors) => {
  return errors.inner.reduce((currentError, nextError) => {
    const name = nextError.path;
    const message = nextError.message;
    return { ...currentError, [name]: message };
  }, {});
};

export const validate = (schema, payload) => {
  try {
    handleYupSchema(schema, payload);
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = handleYupErrors(error);
    return { isValid: false, errors };
  }
};
