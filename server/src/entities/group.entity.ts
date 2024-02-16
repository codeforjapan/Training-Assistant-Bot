import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { unique: true })
  name!: string;

  @Column('text', { nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  readonly updatedAt!: Date;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'group_user',
    joinColumn: { name: 'group_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  users?: User[];
}
