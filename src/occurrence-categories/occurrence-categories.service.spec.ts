import { Test, TestingModule } from '@nestjs/testing';
import { OccurrenceCategoriesService } from './occurrence-categories.service';

describe('OccurrenceCategoriesService', () => {
  let service: OccurrenceCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OccurrenceCategoriesService],
    }).compile();

    service = module.get<OccurrenceCategoriesService>(
      OccurrenceCategoriesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
