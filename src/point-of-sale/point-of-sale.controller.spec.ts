import { Test, TestingModule } from '@nestjs/testing';
import { PointOfSaleController } from './point-of-sale.controller';

describe('PointOfSaleController', () => {
  let controller: PointOfSaleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PointOfSaleController],
    }).compile();

    controller = module.get<PointOfSaleController>(PointOfSaleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
