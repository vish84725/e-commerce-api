import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class WebexPaymentsService {
    constructor(
		@InjectModel('WebexPayments') private readonly WebexPaymentsModel: Model<any>
	) {
	}
    
    public async createPaymentTransaction(transactionPayment){
       return await this.WebexPaymentsModel.create(transactionPayment);
    }

    public async findPaymentTransaction(transactionId){
        return await this.WebexPaymentsModel.findById(transactionId)
     }
 

}
