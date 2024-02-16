import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Scenario } from './scenario.entity';
import { Report } from './report.entity';
import { ProjectMember } from './project-member.entity';

interface ProjectSetting {
  groups: string[];
  disableGender: boolean;
  disableGeneration: boolean;
}
@Entity({ name: 'projects' })
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text', { nullable: false })
  name!: string;

  @Column('text', { nullable: true })
  description: string | null = null;

  @Column('date', { name: 'event_date_start', nullable: true })
  eventDateStart: Date | null;

  @Column('date', {
    name: 'event_date_end',
    nullable: true,
    default: 'now()',
  })
  eventDateEnd: Date | null;

  @Column('jsonb', { default: {} })
  setting: ProjectSetting;

  @Column('boolean', { name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column('boolean', {
    name: 'is_disaster_training',
    nullable: false,
    default: false,
  })
  isDisasterTraining: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  readonly updatedAt!: Date;

  @OneToOne(() => Scenario, (scenario) => scenario.project)
  scenario?: Scenario;

  @OneToMany(() => Report, (report) => report.project)
  reports?: Report[];

  @OneToMany(() => ProjectMember, (projectMember) => projectMember.project)
  projectMembers?: ProjectMember[];
}
