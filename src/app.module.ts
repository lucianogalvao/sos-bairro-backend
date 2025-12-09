import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { OccurrenceCategoriesModule } from './occurrence-categories/occurrence-categories.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    OccurrenceCategoriesModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
