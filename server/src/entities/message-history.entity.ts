import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Project } from './project.entity';

@Entity({ name: 'message_histories' })
export class MessageHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('jsonb')
  message: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  readonly updatedAt!: Date;

  @Column('integer', { name: 'project_id', nullable: false })
  projectId!: number;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project?: Project;
}
