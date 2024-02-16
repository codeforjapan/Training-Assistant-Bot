import { DataSource } from 'typeorm';
import { Setting } from '../entities/setting.entity';
import { Logger } from '@nestjs/common';

export default async (datasource: DataSource, logger: Logger) => {
  const settingsRepository = datasource.getRepository<Setting>('Setting');
  const count = await settingsRepository.count();
  if (count !== 0) {
    logger.log('Setting table is not empty. Skip seeding.');
    return;
  }
  await settingsRepository.save([{ key: 'is_emergency', value: 'false' }]);
};
