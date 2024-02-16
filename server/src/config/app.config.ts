import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface AppConfig {
  fileStorePath: string;
  tmpFilePath: string;
}

export default registerAs('app', () => ({
  fileStorePath: process.env.FILE_STORE_PATH || '',
  tmpFilePath: process.env.TMP_FILE_PATH || '/tmp/app',
}));

export const validationSchema = {
  FILE_STORE_PATH: Joi.string().exist(),
  TMP_FILE_PATH: Joi.string().empty(''),
};
