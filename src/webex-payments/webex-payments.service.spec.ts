import { Test, TestingModule } from '@nestjs/testing';
import { WebexPaymentsService } from './webex-payments.service';

describe('WebexPaymentsService', () => {
  let service: WebexPaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebexPaymentsService],
    }).compile();

    service = module.get<WebexPaymentsService>(WebexPaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
