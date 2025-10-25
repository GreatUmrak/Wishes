import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    constructor() {
      super({
        log: ['query', 'info', 'warn', 'error'],
      });
    }
    // Соединение с БД
    await this.$connect();
  }

  async onModuleDestroy() {
    // Закрытие соединения с БД
    await this.$disconnect();
  }
}
