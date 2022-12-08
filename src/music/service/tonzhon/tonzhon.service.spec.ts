import { Test, TestingModule } from '@nestjs/testing';
import { TonzhonService } from './tonzhon.service';

describe('TonzhonService', () => {
  let service: TonzhonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TonzhonService],
    }).compile();

    service = module.get<TonzhonService>(TonzhonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
