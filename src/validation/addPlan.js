import joi from 'joi';

function isNewPlanValid(object) {
  const planSchema = joi.object({
    signPlan: {
      plan: joi.string().required(),
      products: joi.object({
        tea: joi.boolean().required(),
        incense: joi.boolean().required(),
        organics: joi.boolean().required()
      }),
      shipment: joi.string().required()
    },
    shipment: {
      address: joi.string().required(),
      cep: joi.string().min(8).max(8).required(),
      city: joi.string().required(),
      name: joi.string().required(),
      state: joi.string().required()
    }
  });
  const { error } = planSchema.validate(object);
  return !joi.isError(error);
}

export { isNewPlanValid };
