import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Report } from './report.entity';

export const VALID_USERNAME_PASSWORD_CHARACTERS = /^[a-zA-Z0-9_-]+$/;

export enum UserRoles {
  Admin = 'admin',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text', { nullable: true })
  name: string | null = null;

  @Column('text', { nullable: false, unique: true })
  username!: string;

  @Exclude()
  @Column('text', { nullable: false })
  password!: string;

  @Exclude()
  @Column('text', { name: 'remember_me_token', nullable: true })
  rememberMeToken: string | null = null;

  @Column('boolean', { name: 'is_confirmed', default: false, nullable: false })
  isConfirmed = false;

  @Column('boolean', { name: 'is_blocked', default: false, nullable: false })
  isBlocked = false;

  @Column('boolean', { name: 'is_admin', default: false, nullable: false })
  isAdmin = false;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  readonly updatedAt!: Date;

  @OneToMany(() => Report, (report) => report.user)
  reports?: Report[];
}
