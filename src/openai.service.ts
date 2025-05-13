import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import OpenAI from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRequest } from './user-request.entity';

@Injectable()
export class OpenAiService {
  private readonly DAILY_LIMIT = 5;
  private openai: OpenAI;

  constructor(
    @InjectRepository(UserRequest)
    private readonly userRequestRepository: Repository<UserRequest>,
  ) {
    this.openai = new OpenAI({
      apiKey: '', // Move to environment variables
    });
  }

  async getResponseFromOpenAi(userId: number, message: string): Promise<string> {
    if (!message) {
      throw new BadRequestException('Message is required');
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const requestCount = await this.userRequestRepository.count({
      where: {
        user: { id: userId },
        createdAt: MoreThanOrEqual(today)
      }
    });

    if (requestCount >= this.DAILY_LIMIT) {
      throw new ForbiddenException(
        `You've reached your daily limit of ${this.DAILY_LIMIT} requests. Please try again tomorrow.`
      );
    }

    try {
      // Record the request
      await this.userRequestRepository.save({
        user: { id: userId }
      });

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
      });

      return completion.choices[0]?.message?.content || 'No response from AI';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async getRemainingRequests(userId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const requestCount = await this.userRequestRepository.count({
      where: {
        user: { id: userId },
        createdAt: MoreThanOrEqual(today)
      }
    });

    return this.DAILY_LIMIT - requestCount;
  }
}