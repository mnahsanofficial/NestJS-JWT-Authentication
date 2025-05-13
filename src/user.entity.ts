import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRequest } from './user-request.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({unique: true})
    email: string;

    @Column()
    password?: string;

    @Column({ nullable: false, type: "varchar", default: "01815532283" })
    phoneNumber!: number;

    @OneToMany(() => UserRequest, request => request.user)
    requests: UserRequest[];
}