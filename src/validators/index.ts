export const phoneValidator = (values: string, required = true) => {
  if (!values && !required) return Promise.resolve();
  if (!RegExp(/^\d+$/).test(values))
    return Promise.reject(new Error('Phone number is not valid'));
  if (values.length !== 10)
    return Promise.reject(new Error('Phone number should be 10 number'));
  return Promise.resolve();
};

export const validateMessages = {
  required: 'This is a required field',
  types: {
    email: '${label} is not a valid email!',
    phone: '${label} is not a mobile number!',
  },
};

export const EmailValidate = new RegExp(
  `^[^-\\s][\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$`,
);

export const URLValidate = new RegExp(
  /[(http(s)?):\\/\\/(www\\.)?a-zA-Z0-9@:%._\\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)/,
);
