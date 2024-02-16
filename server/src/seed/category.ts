import { DataSource } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Logger } from '@nestjs/common';

export default async (datasource: DataSource, logger: Logger) => {
  const categoriesRepository = datasource.getRepository<Category>('Category');
  const count = await categoriesRepository.count();
  if (count !== 0) {
    logger.log('Category table is not empty. Skip seeding.');
    return;
  }
  await categoriesRepository.save([
    {
      name: '防犯',
      available: true,
    },
    {
      name: '防災',
      available: true,
    },
    {
      name: '美化環境',
      available: true,
    },
    {
      name: '児童安全',
      available: true,
    },
    {
      name: '構造上（道路・側溝）',
      available: true,
    },
    {
      name: '災害',
      available: true,
    },
    {
      name: 'その他',
      available: true,
    },
  ]);
};
