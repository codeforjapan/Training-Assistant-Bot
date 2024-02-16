import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface LineConfig {
  reportKeyword: string;
  token: boolean;
  secret: string;
  allowBroadcast: boolean;
}

export default registerAs('line', () => ({
  reportKeyword: process.env.LINE_REPORT_KEYWORD || '状況を報告する',
  token: process.env.LINE_TOKEN,
  secret: process.env.LINE_SECRET,
  allowBroadcast: process.env.LINE_ALLOW_BROADCAST === 'true' || false,
}));

export const validationSchema = {
  LINE_REPORT_KEYWORD: Joi.string().exist(),
  LINE_TOKEN: Joi.string().exist(),
  LINE_SECRET: Joi.string().exist(),
  LINE_ALLOW_BROADCAST: Joi.boolean().default(false),
};
