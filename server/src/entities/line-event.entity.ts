import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WebhookEvent } from '@line/bot-sdk/lib/types';

@Entity()
export class LineEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  destination!: string;

  @Column('jsonb')
  event!: WebhookEvent;

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;
}
