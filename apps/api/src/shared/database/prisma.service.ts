import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../prisma/client';
import type { PrismaClient as PrismaClientType } from '../../prisma/client';

type PrismaConstructor = new () => PrismaClientType;

@Injectable()
export class PrismaService
  extends (PrismaClient as unknown as PrismaConstructor)
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
