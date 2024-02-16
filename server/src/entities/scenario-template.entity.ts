import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'scenario_templates' })
export class ScenarioTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: false })
  name!: string;

  @Column('jsonb', { nullable: false })
  tasks!: Record<string, any>[];

  @Column('boolean', { name: 'disable_report', default: false })
  disableReport: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  readonly updatedAt!: Date;
}
