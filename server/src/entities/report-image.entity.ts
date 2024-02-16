import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Report } from './report.entity';

@Entity()
export class ReportImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  file!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  @Column('integer')
  readonly reportId!: number;

  @ManyToOne(() => Report, (report) => report.reportImages)
  @JoinColumn()
  report?: Report;
}
