import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { registerAs } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const typeOrmConfig = (): PostgresConnectionOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  applicationName: 'KobeBotLAB',
  schema: 'public',
  entities: [__dirname + '/../**/entities/*.entity.{ts,js}'],
  synchronize: false,
});

export const typeOrmModuleOptions = (): TypeOrmModuleOptions => ({
  ...typeOrmConfig(),
  autoLoadEntities: true,
});

export const ormConfig = registerAs('db', () => {
  return { ...typeOrmModuleOptions() };
});

export const validationSchema = {
  DATABASE_HOST: Joi.string().exist(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_NAME: Joi.string().exist(),
  DATABASE_PASSWORD: Joi.string().exist(),
  DATABASE_USER: Joi.string().exist(),
};
