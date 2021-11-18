import joi from "joi";

function isSignUpValid(object) {
  const signUpSchema = joi
    .object({
      name: joi.string().min(3).max(50).required(),
      email: joi.string().email().max(50).required(),
      password: joi.string().alphanum().min(5).max(16).required(),
      repeatPassword: joi.ref("password"),
    })

  const { error } = signUpSchema.validate(object);

  return !joi.isError(error);
}

export { isSignUpValid };
