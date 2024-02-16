import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'line_users' })
export class LineUser {
  @PrimaryColumn('text')
  id!: string;

  @Column('text', { nullable: true })
  name: string | null = null;

  @Column('text', { nullable: true })
  pictureUrl: string | null = null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  readonly updatedAt!: Date;

  @Column('integer', { name: 'user_id', nullable: false })
  readonly userId!: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
