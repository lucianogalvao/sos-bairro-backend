import { Module } from '@nestjs/common';
import { OccurrenceCategoriesService } from './occurrence-categories.service';
import { OccurrenceCategoriesController } from './occurrence-categories.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OccurrenceCategoriesController],
  providers: [OccurrenceCategoriesService],
})
export class OccurrenceCategoriesModule {}
