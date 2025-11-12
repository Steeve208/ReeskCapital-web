import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method for raw queries with error handling
  async executeRaw(query: string, ...params: any[]) {
    try {
      return await this.$executeRawUnsafe(query, ...params);
    } catch (error) {
      console.error('Prisma raw query error:', error);
      throw error;
    }
  }

  // Helper method for query with error handling
  async queryRaw<T = any>(query: string, ...params: any[]): Promise<T[]> {
    try {
      return await this.$queryRawUnsafe(query, ...params);
    } catch (error) {
      console.error('Prisma raw query error:', error);
      throw error;
    }
  }
}
