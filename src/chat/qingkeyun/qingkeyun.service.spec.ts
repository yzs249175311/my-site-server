import { Test, TestingModule } from '@nestjs/testing';
import { QingkeyunService } from './qingkeyun.service';

describe('QingkeyunService', () => {
  let service: QingkeyunService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QingkeyunService],
    }).compile();

    service = module.get<QingkeyunService>(QingkeyunService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
