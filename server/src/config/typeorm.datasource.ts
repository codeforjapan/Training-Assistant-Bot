import * as dotenv from 'dotenv';

dotenv.config();
import { DataSource } from 'typeorm';
import { typeOrmConfig } from './orm.config';

export default new DataSource({
  ...typeOrmConfig(),
  migrationsTableName: 'migrations',
  migrations: ['src/migrations/*.ts'],
});
