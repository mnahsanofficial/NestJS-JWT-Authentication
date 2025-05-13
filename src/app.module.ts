import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {User} from "./user.entity";
import { JwtModule } from '@nestjs/jwt';
import { OpenAiService } from './openai.service';
import { UserRequest } from './user-request.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'nest-auth',
      entities: [User,UserRequest],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User,UserRequest]),
    JwtModule.register({
      secret: 'secret',
      signOptions: {expiresIn: '1d'}
  })

  ],
  controllers: [AppController],
  providers: [AppService,
     OpenAiService,],
})
export class AppModule {}
