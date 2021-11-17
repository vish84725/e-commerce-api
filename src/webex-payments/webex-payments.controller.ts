import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { GetUser } from '../utils/jwt.strategy';
import { UsersDTO } from '../users/users.model';
import { CommonResponseModel, ResponseBadRequestMessage, ResponseErrorMessage, ResponseMessage, ResponseSuccessMessage } from '../utils/app.model';
import { WebexPaymentsService } from './webex-payments.service';
import { UtilService } from '../utils/util.service';
import { AppGateway } from '../app.gateway';
import { WebexResponseDTO } from './webex-payments.model';

@Controller('webex-payments')
@ApiUseTags('webex-payments')
export class WebexPaymentsController {

	constructor(private webexPaymentsService: WebexPaymentsService,
		private utilService: UtilService,
		private socketService: AppGateway) {
	}
	@Post('/payment-transaction-callback')
	@ApiOperation({ title: 'order-transaction-response' })
	@ApiResponse({ status: 200, description: 'Success message', type: ResponseSuccessMessage })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	public async createPaymentTransaction(@GetUser() user: UsersDTO, @Body() transactionPayment: WebexResponseDTO): Promise<CommonResponseModel> {
		try {
			if (transactionPayment) {

				let transaction: any = await this.webexPaymentsService.createPaymentTransaction(transactionPayment);

				let transactionDetails = {
					transactionId: transaction._id,
					status: false
				}
				//Transaction Approved
				if(transaction.StatusCode == "0" || transaction.StatusCode == "00"){
					transactionDetails.status=true;
				}
				//Transaction Decline
				else if(transaction.StatusCode =="15"){
					transactionDetails.status=false;
				}

				this.socketService.sendPaymentCompletionResponseToCustomer(transactionDetails);
				return this.utilService.successResponseData(transaction);

			} else {
				this.utilService.badRequest(ResponseMessage.SOMETHING_WENT_WRONG);
			}
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

}
