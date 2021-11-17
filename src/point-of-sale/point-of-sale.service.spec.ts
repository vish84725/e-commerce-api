import { Test, TestingModule } from '@nestjs/testing';
import { PointOfSaleService } from './point-of-sale.service';

describe('PointOfSaleService', () => {
  let service: PointOfSaleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointOfSaleService],
    }).compile();

    service = module.get<PointOfSaleService>(PointOfSaleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
