import { Test, TestingModule } from '@nestjs/testing';
import { OccurrenceCategoriesController } from './occurrence-categories.controller';

describe('OccurrenceCategoriesController', () => {
  let controller: OccurrenceCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OccurrenceCategoriesController],
    }).compile();

    controller = module.get<OccurrenceCategoriesController>(
      OccurrenceCategoriesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
