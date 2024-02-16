import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Scenario } from './scenario.entity';

@Entity({ name: 'scenario_tasks' })
export class ScenarioTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: false })
  name!: string;

  @Column('jsonb', { nullable: false })
  tasks!: Record<string, any>[];

  @Column('integer', { nullable: false })
  order!: number;

  @Column('boolean', { default: true })
  removable: boolean;

  @Column('boolean', { name: 'is_initial', default: false })
  isInitial: boolean;

  @Column('timestamptz', { name: 'finished_at', nullable: true })
  finishedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  readonly updatedAt!: Date;

  @Column('integer', { name: 'scenario_id', nullable: false })
  scenarioId!: number;

  @ManyToOne(() => Scenario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scenario_id' })
  scenario?: Scenario;
}
