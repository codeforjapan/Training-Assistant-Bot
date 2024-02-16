import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface RedisConfig {
  host: string;
  port: number;
}

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
}));

export const validationSchema = {
  REDIS_HOST: Joi.string().exist(),
  REDIS_PORT: Joi.number().default(6379),
};
