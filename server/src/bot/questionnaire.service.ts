import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ProjectMember } from '../entities/project-member.entity';
import { PostbackData } from '../core/util/line.service';

@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectRepository(ProjectMember)
    private readonly projectMembersRepository: Repository<ProjectMember>,
  ) {}

  async handleQuestionnaire(
    postbackData: PostbackData,
    user: User,
  ): Promise<boolean> {
    const projectMember = await this.projectMembersRepository.findOne({
      where: { projectId: postbackData.projectId, userId: user.id },
    });
    if (!projectMember) {
      throw new Error('Not joined');
    }
    if (!projectMember.profile) {
      projectMember.profile = {};
    }

    const data = postbackData.data;
    if (data.startsWith('group=')) {
      projectMember.profile.group = data.replace('group=', '');
    } else if (data.startsWith('gender=')) {
      projectMember.profile.gender = data.replace('gender=', '');
    } else if (data.startsWith('generation=')) {
      projectMember.profile.generation = data.replace('generation=', '');
    } else if (data.startsWith('confirmed=')) {
      projectMember.profile.confirmed = data === 'confirmed=ok';
    }

    await this.projectMembersRepository.save(projectMember);
    return true;
  }
}
