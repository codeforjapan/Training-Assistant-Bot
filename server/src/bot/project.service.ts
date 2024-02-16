import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ProjectMember } from '../entities/project-member.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectMember)
    private readonly projectMembersRepository: Repository<ProjectMember>,
  ) {}

  async joinProject(projectId: number, user: User): Promise<boolean> {
    const alreadyJoined = await this.projectMembersRepository.findOne({
      where: { projectId: projectId, userId: user.id },
    });
    if (alreadyJoined) {
      return true;
    }

    const projectMember = this.projectMembersRepository.create({
      projectId: projectId,
      userId: user.id,
    });
    await this.projectMembersRepository.save(projectMember);
    return true;
  }
}
