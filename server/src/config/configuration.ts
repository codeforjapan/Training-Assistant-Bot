import * as Joi from 'joi';

export default () => ({
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || '3000', 10),
  sessionSecret: process.env.SESSION_SECRET,
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '1800', 10),
  sessionNamePrefix: process.env.SESSION_NAME_PREFIX || 'connect',
  tokenSecret: process.env.TOKEN_SECRET,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isTest: process.env.NODE_ENV === 'test',
});

export const validationSchema = {
  NODE_ENV: Joi.string().valid('development', 'production', 'test'),
  PORT: Joi.number().empty(''),
  SESSION_SECRET: Joi.string().exist(),
  SESSION_TIMEOUT: Joi.number().empty(''),
  SESSION_NAME_PREFIX: Joi.string().empty(''),
  TOKEN_SECRET: Joi.string().exist(),
};
