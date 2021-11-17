import { Test, TestingModule } from '@nestjs/testing';
import { WebexPaymentsController } from './webex-payments.controller';

describe('WebexPaymentsController', () => {
  let controller: WebexPaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebexPaymentsController],
    }).compile();

    controller = module.get<WebexPaymentsController>(WebexPaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
