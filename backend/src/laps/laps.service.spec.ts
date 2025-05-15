import { Test, TestingModule } from '@nestjs/testing';
import { LapsService } from './laps.service';

describe('LapsService', () => {
  let service: LapsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LapsService],
    }).compile();

    service = module.get<LapsService>(LapsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
