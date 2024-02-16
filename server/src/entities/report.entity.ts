import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Point } from 'geojson';
import { ReportImage } from './report-image.entity';
import { User } from './user.entity';
import { Project } from './project.entity';
import { Category } from './category.entity';

@Entity({ name: 'reports' })
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text', { nullable: true })
  message: string | null = null;

  @Column('text', { nullable: true })
  img: string | null = null;

  @Column('geometry', {
    nullable: true,
    srid: 4326,
    spatialFeatureType: 'Point',
  })
  geom: Point | null = null;

  @Column({ name: 'checked_at', type: 'timestamptz', nullable: true })
  checkedAt: Date | null = null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  readonly updatedAt!: Date;

  @OneToMany(() => ReportImage, (reportImage) => reportImage.report)
  reportImages?: ReportImage[];

  @Column('integer', { name: 'user_id' })
  readonly userId: number;

  @ManyToOne(() => User, (user) => user.reports, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column('integer', { name: 'project_id', nullable: false })
  projectId!: number;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project?: Project;

  @Column('integer', { name: 'category_id', nullable: false })
  categoryId!: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category?: Category;
}
