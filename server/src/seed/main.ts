import dataSource from '../config/typeorm.datasource';
import seedCategory from './category';
import seedMessage from './message';
import seedSetting from './setting';
import seedUser from './user';
import seedScenarioTemplate from './scenario-template';
import { Logger } from '@nestjs/common';

const main = async () => {
  const isInitialized = dataSource.isInitialized;
  if (!isInitialized) {
    await dataSource.initialize();
  }
  const logger = new Logger('Seed');
  logger.log('Start seeding...');
  await seedCategory(dataSource, logger);
  await seedMessage(dataSource, logger);
  await seedSetting(dataSource, logger);
  await seedUser(dataSource, logger);
  await seedScenarioTemplate(dataSource, logger);
  logger.log('Seeding completed.');

  if (!isInitialized) {
    await dataSource.destroy();
  }
};

main().catch(console.error);
