import { Test, TestingModule } from '@nestjs/testing';
import { LapsController } from './laps.controller';
import { LapsService } from './laps.service';

describe('LapsController', () => {
  let controller: LapsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LapsController],
      providers: [LapsService],
    }).compile();

    controller = module.get<LapsController>(LapsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
