import { DataSource } from 'typeorm';
import * as bcrypt from 'phc-bcrypt';
import { User } from '../entities/user.entity';
import { Logger } from '@nestjs/common';

export default async (datasource: DataSource, logger: Logger) => {
  const usersRepository = datasource.getRepository<User>('User');
  const count = await usersRepository.count();
  if (count !== 0) {
    logger.log('User table is not empty. Skip seeding.');
    return;
  }
  const hashedPassword = await bcrypt.hash('botlab', 10);
  await usersRepository.save([
    {
      username: 'admin',
      password: hashedPassword,
      isAdmin: true,
      isConfirmed: true,
      isBlocked: false,
    },
  ]);
};
