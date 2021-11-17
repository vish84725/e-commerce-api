

import * as mongoose from 'mongoose';
import { ApiModelProperty } from '@nestjs/swagger';


export const WebexPaymentsSchema = new mongoose.Schema({
	OrderId: { type: String },
	OrderRefferenceNumber: { type: String },
	DateTimeTransaction: { type: String },
	PaymentGatewayUsed: { type: String },
	StatusCode: { type: String },
	Comment: { type: String },
	FirstName: { type: String },
	LastName: { type: String },
	Email: { type: String },
	ContactNumber: { type: String },
	AddressLineOne: { type: String }
}, {
	timestamps: true
});

export class WebexResponseDTO {
	@ApiModelProperty()
	OrderId: string;

	@ApiModelProperty()
	OrderRefferenceNumber: string;

	@ApiModelProperty()
	DateTimeTransaction: string;

	@ApiModelProperty()
	PaymentGatewayUsed: string;

	@ApiModelProperty()
	StatusCode: string;

	@ApiModelProperty()
	Comment: string;

	@ApiModelProperty()
	FirstName: string;

	@ApiModelProperty()
	LastName: string;

	@ApiModelProperty()
	Email: string;

	@ApiModelProperty()
	ContactNumber: string;

	@ApiModelProperty()
	AddressLineOne: string;

}
