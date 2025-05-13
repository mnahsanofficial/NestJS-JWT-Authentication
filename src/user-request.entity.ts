import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.requests)
  user: User;

  @Column({ nullable: false,type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}