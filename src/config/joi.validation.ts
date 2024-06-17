import * as Joi from 'joi';
//   enviornment: process.env.NODE_EN || 'development',
//   mongodbUri:
//     process.env.MONGODB_URI || 'mongodb://root:rootpassword@localhost:27017',
//   mongodbName: process.env.MONGODB_NAME || 'nestjsdb',
//   port: process.env.PORT || 3000,

export const JoiValidationSchema = Joi.object({
  MONGODB_URI: Joi.string().required(),
  MONGODB_NAME: Joi.string().required(),
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_SECRET: Joi.string().required(),
});
