import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { OccurrenceCategoriesModule } from './occurrence-categories/occurrence-categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    OccurrenceCategoriesModule,
  ],
})
export class AppModule {}
