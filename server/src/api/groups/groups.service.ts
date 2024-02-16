import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '../../entities/group.entity';
import { User } from '../../entities/user.entity';
import { In, Repository } from 'typeorm';
import { CreateDto, UpdateDto } from './group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async list(): Promise<Group[]> {
    return await this.groupsRepository.find({});
  }

  async show(
    id: number,
  ): Promise<Omit<Group, 'users'> & { users: Partial<User>[] }> {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: ['users'],
    });
    if (!group) {
      throw new NotFoundException();
    }
    const { users, ...rest } = group;
    return {
      ...rest,
      users: users.map((user) => {
        const { id, name } = user;
        return { id, name };
      }),
    };
  }

  async create(data: CreateDto): Promise<Group> {
    const lastGroup = await this.groupsRepository.find({
      order: { id: 'DESC' },
      select: ['id'],
      take: 1,
    });
    const lastId = lastGroup[0]?.id || 0;
    const name = data.name || `新しいグループ(${lastId + 1})`;
    const group = this.groupsRepository.create({ name });
    await this.groupsRepository.save(group);
    return group;
  }

  async update(id: number, data: UpdateDto): Promise<Group> {
    const group = await this.findGroup(id);
    if (data.name) {
      group.name = data.name;
    }
    if (data.members.length === 0) {
      group.users = [];
    } else {
      group.users = await this.usersRepository.find({
        where: { id: In(data.members) },
      });
    }
    await this.groupsRepository.save(group);
    return group;
  }

  async delete(id: number): Promise<void> {
    const group = await this.findGroup(id);
    await this.groupsRepository.remove(group);
  }

  private async findGroup(id: number): Promise<Group> {
    const group = await this.groupsRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException();
    }
    return group;
  }
}
