import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinTable,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { ScenarioTask } from './scenario-task.entity';

@Entity({ name: 'scenarios' })
export class Scenario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: false })
  name!: string;

  @Column('boolean', { name: 'disable_report', default: false })
  disableReport: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  readonly updatedAt!: Date;

  @Column('integer', { name: 'project_id', nullable: false })
  projectId!: number;

  @OneToOne(() => Project, (project) => project.scenario, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project?: Project;

  @OneToMany(() => ScenarioTask, (scenarioTask) => scenarioTask.scenario)
  scenarioTasks?: ScenarioTask[];
}
