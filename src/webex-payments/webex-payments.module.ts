import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebexPaymentsController } from './webex-payments.controller';
import { WebexPaymentsSchema } from './webex-payments.model';
import { WebexPaymentsService } from './webex-payments.service';

@Module({
  imports: [
		MongooseModule.forFeature([{ name: 'WebexPayments', schema: WebexPaymentsSchema }]),
  ],
  controllers: [WebexPaymentsController],
  providers: [WebexPaymentsService],
  exports: [WebexPaymentsService, MongooseModule]
})
export class WebexPaymentsModule {}