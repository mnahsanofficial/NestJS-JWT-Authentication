import { Body, Controller, Get, Post,BadRequestException,Res, UnauthorizedException, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { OpenAiService } from './openai.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly openAiService: OpenAiService,
    private jwtService: JwtService
  ) {}

  @Post('register')
    async register(
        @Body('name') name: string,
        @Body('email') email: string,
        @Body('password') password: string
    ) {
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await this.appService.create({
            name,
            email,
            password: hashedPassword
        });

        delete user.password;

        return user;
    }

    @Post('login')
    async login(
        @Body('email') email: string,
        @Body('password') password: string,
        @Res({passthrough: true}) response: Response
    ) {
        const user = await this.appService.findOne({email});

        if (!user) {
            throw new BadRequestException('invalid credentials');
        }

        if (!await bcrypt.compare(password, user.password)) {
            throw new BadRequestException('invalid credentials');
        }

        const jwt = await this.jwtService.signAsync({id: user.id});

        response.cookie('jwt', jwt, {httpOnly: true});

        return {
            message: 'success'
        };
    }

    @Get('user')
    async user(@Req() request: Request) {
        try {
            const cookie = request.cookies['jwt'];

            const data = await this.jwtService.verifyAsync(cookie);

            if (!data) {
              throw new UnauthorizedException();
          }

           const user = await this.appService.findOne({id: data['id']});
            if (!user) {
              throw new UnauthorizedException();
          }

            const {password, ...result} = user;

            return result;
        } catch (e) {
            throw new UnauthorizedException();
        }
    }

    @Post('logout')
    async logout(@Res({passthrough: true}) response: Response) {
        response.clearCookie('jwt');

        return {
            message: 'success'
        }
    }

    @Post('text-converter')
async textConverter(
  @Req() request: Request,
  @Body('message') message: string
) {
  if (!message) {
    throw new BadRequestException('Message is required');
  }

  try {
    const cookie = request.cookies['jwt'];
    const data = await this.jwtService.verifyAsync(cookie);
    
    if (!data) {
      throw new UnauthorizedException();
    }

    const result = await this.openAiService.getResponseFromOpenAi(data.id, message);
    const remaining = await this.openAiService.getRemainingRequests(data.id);
      
    return { success: true, data: result,remaining };
  } catch (error) {
    throw error;
  }
}

@Get('remaining-requests')
async getRemainingRequests(@Req() request: Request) {
  try {
    const cookie = request.cookies['jwt'];
    const data = await this.jwtService.verifyAsync(cookie);
    
    if (!data) {
      throw new UnauthorizedException();
    }

    const remaining = await this.openAiService.getRemainingRequests(data.id);
    return { remaining };
  } catch (error) {
    throw new UnauthorizedException();
  }
}
   




}
