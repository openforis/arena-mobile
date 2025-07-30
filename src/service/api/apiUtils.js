const objectToFormData = (obj) =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    const formDataValue = Array.isArray(value) ? JSON.stringify(value) : value;
    acc.append(key, formDataValue);
    return acc;
  }, new FormData());

export const APIUtils = {
  objectToFormData,
};
