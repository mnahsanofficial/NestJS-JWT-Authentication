import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./user.entity";
import {Repository} from "typeorm";
import { response } from 'express';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
) {
}

async create(data: any): Promise<User> {
  
    return this.userRepository.save(data);
}

async findOne(condition: any): Promise<User | null> {
    return this.userRepository.findOne({ where: condition });
}

}
