import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { FollowBonusModule } from './follow-bonus/follow-bonus.module';
import { EventsModule } from './events/events.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // requests per ttl
      },
    ]),

    // Queue system
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Database
    DatabaseModule,

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': false,
      },
      context: ({ req, res }) => ({ req, res }),
      cors: false, // Handled by main.ts
      formatError: (error) => {
        // Log internal errors but don't expose them in production
        if (process.env.NODE_ENV === 'production' && error.extensions?.code !== 'BAD_USER_INPUT') {
          console.error('GraphQL Error:', error);
          return {
            message: 'Internal server error',
            extensions: { code: 'INTERNAL_ERROR' },
          };
        }
        return error;
      },
    }),

    // Feature modules
    AuthModule,
    AdminModule,
    FollowBonusModule,
    EventsModule,
    AuditModule,
    HealthModule,
    WebsocketModule,
  ],
})
export class AppModule {}
