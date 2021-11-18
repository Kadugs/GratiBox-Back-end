import joi from "joi";

function isSignUpValid(object) {
  const signUpSchema = joi
    .object({
      name: joi.string().min(3).max(50).required(),
      email: joi.string().email().max(100).required(),
      password: joi.string().min(5).max(32).required(),
      confirmPassword: joi.ref("password")
    })

  const { error } = signUpSchema.validate(object);
  
  return !joi.isError(error);
}

export { isSignUpValid };
