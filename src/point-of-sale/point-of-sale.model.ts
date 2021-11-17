import * as mongoose from 'mongoose';
import { ApiModelProperty } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsEmail,
	IsEmpty,
	IsUrl,
	IsEnum,
	IsNumber,
	Length,
	IsOptional,
	IsPositive,
	Min,
	Equals,
	IsArray,
	ValidateNested,
	IsString, Max, IsBoolean, IsInt
} from 'class-validator';

export const PointOfSaleSchema = new mongoose.Schema({
	TransactionDetID: { type: Number },
	ProductID: { type: Number},
	ProductCode: { type: String, required: true, default: ""},
	RefCode: { type: String,required: true, default: ""},
	BarCodeFull: { type: Number, required: true, default:0 },
	Descrip: { type: String,required: true, default: "" },
	BatchNo: { type: String,required: true, default: "" },
	SerialNo: { type: String,required: true, default: "" },
	ExpiryDate: { type: Date },
	Cost: { type: Number, default : 0, required: true },
	AvgCost: { type: Number, default : 0,required: true },
	Price: { type: Number, default : 0,required: true },
	Qty: { type: Number, default : 0,required: true },
	BalanceQty: { type: Number, default : 0 },
	Amount: { type: Number, required: true },
	UnitOfMeasureID: { type: Number },
	UnitOfMeasureName: { type: String },
	ConvertFactor: { type: Number, required: true, default:0 },
	IDI1: { type: Number, required: true, default:0 },
	IDis1: { type: Number, required: true, default:0 },
	IDiscount1: { type: Number, required: true, default:0},
	IDI1CashierID: { type: Number, default:0 },
	IDI2: { type: Number, required: true, default:0},
	IDis2: { type: Number, required: true, default:0},
	IDiscount2: { type: Number, required: true, default:0 },
	IDI2CashierID: { type: Number, default:0 },
	IDI3: { type: Number, required: true, default:0  },
	IDis3: { type: Number, required: true, default:0  },
	IDiscount3: { type: Number, required: true, default:0  },
	IDI3CashierID: { type: Number, default:0 },
	IDI4: { type: Number, required: true, default:0  },
	IDis4: { type: Number, required: true, default:0  },
	IDiscount4: { type: Number, required: true, default:0  },
	IDI4CashierID: { type: Number, default:0 },
	IDI5: { type: Number, required: true, default:0  },
	IDis5: { type: Number, required: true, default:0  },
	IDiscount5: { type: Number, required: true, default:0  },
	IDI5CashierID: { type: Number, default:0 },
	Rate: { type: Number, required: true, default:0  },
	IsSDis: { type: Boolean, required: true },
	SDNo: { type: Number, default: 0 },
	SDID: { type: Number, default: 0 },
	SDIs: { type: Number, default: 0, required: true },
	SDiscount: { type: Number, default: 0, required: true },
	DDisCashierID: { type: Number, default: 0 },
	Nett: { type: Number, default: 0, required: true  },
	LocationID: { type: Number, default: 0, required: true },
	DocumentID: { type: Number, default: 0, required: true },
	BillTypeID: { type: Number, default: 0, required: true },
	SaleTypeID: { type: Number, default: 0, required: true },
	Receipt: { type: String, required: true },
	SalesmanID: { type: Number },
	Salesman: { type: String,default: "" },
	CustomerID: { type: Number, default: 0, required: true },
	Customer: { type: String },
	CashierID: { type: Number, default: 0 },
	Cashier: { type: String, default : "" },
	StartTime: { type: Date, required: true },
	EndTime: { type: Date,required: true },
	RecDate: { type: Date, required: true },
	BaseUnitID: { type: Number, default: 0, required: true },
	UnitNo: { type: Number, default: 0, required: true },
	RowNo: { type: Number, default: 0, required: true },
	IsRecall: { type: Boolean, required: true },
	RecallNO: { type: String },
	RecallAdv: { type: Boolean },
	TaxAmount: { type: Number, default: 0, required: true},
	IsTax: { type: Boolean, required: true  },
	TaxPercentage: { type: Number, default: 0, required: true },
	IsStock: { type: Boolean, required: true },
	UpdateBy: { type: Number, default: 0, required: true },
	Status: { type: Number, default: 0, required: true },
	ZNo: { type: Number, default: 0, required: true },
	GroupOfCompanyID: { type: Number, default: 0 },
	DataTransfer: { type: Number, default: 0 },
	CustomerType: { type: Number },
	TransStatus: { type: Number },
	ZDate: { type: Date },
	IsPromotionApplied: { type: Boolean },
	PromotionID: { type: Number, default: 0 },
	IsPromotion: { type: Number, default: 0  },
	LocationIDBilling: { type: Number, default: 0  },
	TableID: { type: Number, default: 0  },
	OrderTerminalID: { type: Number, default: 0  },
	TicketID: { type: Number, default: 0  },
	OrderNo: { type: Number, default: 0  },
	IsPrinted: { type: Boolean },
	ItemComment: { type: String,default:"" },
	Packs: { type: Number, default:0 },
	IsCancelKOT: { type: Boolean },
	StewardID: { type: Number, default:0 },
	StewardName: { type: String, default: "" },
	ServiceCharge: { type: Number, default:0 },
	ServiceChargeAmount: { type: Number, default:0 },
	ShiftNo: { type: Number, default:0 },
	IsDayEnd: { type: Boolean },
	UpdateUnitNo: { type: Number, default:0  },
	InvPriceLevelID: { type: Number, default:0  },
	TourAgentCode: { type: String, default: "" },
	TourAgentId: { type: Number, default:0  },
	TourAmount: { type: Number, default:0  },
	TourPrecent: { type: Number, default:0  },
	TourCommition: { type: Number, default:0  },
	TourCommitionPaidAmount: { type: Number, default:0  },
	Online: { type: Number, default:0  },
	Deliverdate: { type: Date },
	PackSize: { type: Number, default:0  },
	TourAgentCompanyCode: { type: String, default: "" },
	TourAgentCompanyId: { type: Number, default:0  },
	TourCompanyAmount: { type: Number, default:0  },
	TourCompanyPrecent: { type: Number, default:0  },
	TourCompanyCommition: { type: Number, default:0  },
	TourCompanyCommitionPaidAmount: { type: Number, default:0  },
	DelvryBalQty: { type: Number, default:0 },
	warranty: { type: Number, default:0, required: true },
	ItemSerial: { type: String, default:"" },
	CreditPeriod: { type: Number, default:0 },
	PrinterType: { type: Number, default:0 },
	IsGLTransfer: {  type: Number, default:0, required: true },
	FreeQty: { type: Number, default:0, required: true },
	Payments: [
		{
			PaymentDetID: { type: Number},
			RowNo: { type: Number, default: 0, required: true},
			PayTypeID: { type: Number, default: 0, required: true},
			Amount: { type: Number, default: 0, required: true},
			Balance: { type: Number, default: 0, required: true},
			SDate: { type: Date, required: true},
			Receipt: { type: String, default: "", required: true},
			LocationID: { type: Number, default: 0, required: true},
			CashierID: { type: Number, default: 0, required: true},
			UnitNo: { type: Number, default: 0, required: true},
			BillTypeID: { type: Number, default: 0, required: true},
			SaleTypeID: { type: Number, default: 0, required: true},
			RefNo: { type: String, default: "", required: true},
			BankId: { type: Number, default: 0, required: true},
			ChequeDate: { type: Date},
			IsRecallAdv: { type: Boolean},
			RecallNo: { type: String, default: "", required: true},
			Descrip: { type: String, default: "", required: true},
			EnCodeName: { type: String, default: "", required: true},
			UpdatedBy: { type: Number, default: 0, required: true},
			Status: { type: Number, default: 0, required: true},
			ZNo: { type: Number, default: 0, required: true},
			CustomerId: { type: Number},
			CustomerType: { type: Number},
			CustomerCode: { type: String, default: "", required: true},
			GroupOfCompanyID: { type: Number, default: 0 },
			Datatransfer: { type: Number, default: 0 },
			ZDate: { type: Date },
			TerminalID: { type: Number, default: 0 },
			LoyaltyType: { type: Number, default: 0 },
			IsUploadToGL: { type: Number, default: 0 },
			LocationIDBilling: { type: Number, default: 0 },
			TableID: { type: Number, default: 0 },
			TicketID: { type: Number, default: 0 },
			OrderNo: { type: Number, default: 0 },
			ShiftNo: { type: Number, default: 0 },
			IsDayEnd: { type: Boolean },
			UpdateUnitNo: { type: Number, default: 0 },
			Online: { type: Number, default: 0 },
			SerialNo: { type: String, default: "" },
			CurrencyCode: { type: String },
			CurrencyRate: { type: Number },
			AcountNumber: { type: String, default: "" },
			PrinterType: { type: Number, default: 0 },
			IsGLTransfer: { type: Number, default: 0, required: true}
		}
	]
})

export class PointOfSalesDTO {
	@ApiModelProperty()
	_id: string;

	@ApiModelProperty()
	TransactionDetID: number;

	@ApiModelProperty()
	ProductID: number;

	@ApiModelProperty()
	ProductCode: string;

	@ApiModelProperty()
	RefCode: string;

	@ApiModelProperty()
	BarCodeFull: number;

	@ApiModelProperty()
	Descrip: string;

	@ApiModelProperty()
	BatchNo: string;

	@ApiModelProperty()
	SerialNo: string;

	@ApiModelProperty()
	ExpiryDate: string;

	@ApiModelProperty()
	Cost: number;

	@ApiModelProperty()
	AvgCost: number;

	@ApiModelProperty()
	Price: number;

	@ApiModelProperty()
	Qty: number;

	@ApiModelProperty()
	BalanceQty: number;

	@ApiModelProperty()
	Amount: number;

	@ApiModelProperty()
	UnitOfMeasureID: number;

	@ApiModelProperty()
	UnitOfMeasureName: string;

	@ApiModelProperty()
	ConvertFactor: number;

	@ApiModelProperty()
	IDI1: number;

	@ApiModelProperty()
	IDis1: number;

	@ApiModelProperty()
	IDiscount1: number;

	@ApiModelProperty()
	IDI1CashierID: number;

	@ApiModelProperty()
	IDI2: number;

	@ApiModelProperty()
	IDis2: number;

	@ApiModelProperty()
	IDiscount2: number;

	@ApiModelProperty()
	IDI2CashierID: number;

	@ApiModelProperty()
	IDI3: number;

	@ApiModelProperty()
	IDis3: number;

	@ApiModelProperty()
	IDiscount3: number;

	@ApiModelProperty()
	IDI3CashierID: number;

	@ApiModelProperty()
	IDI4: number;

	@ApiModelProperty()
	IDis4: number;

	@ApiModelProperty()
	IDiscount4: number;

	@ApiModelProperty()
	IDI4CashierID: number;

	@ApiModelProperty()
	IDI5: number;

	@ApiModelProperty()
	IDis5: number;

	@ApiModelProperty()
	IDiscount5: number;

	@ApiModelProperty()
	IDI5CashierID: number;

	@ApiModelProperty()
	Rate: number;

	@ApiModelProperty()
	IsSDis: boolean;

	@ApiModelProperty()
	SDNo: number;

	@ApiModelProperty()
	SDID: number;
	
	@ApiModelProperty()
	SDIs: number;

	@ApiModelProperty()
	SDiscount: number;

	@ApiModelProperty()
	DDisCashierID: number;

	@ApiModelProperty()
	Nett: number;

	@ApiModelProperty()
	LocationID: number;

	@ApiModelProperty()
	DocumentID: number;

	@ApiModelProperty()
	BillTypeID: number;

	@ApiModelProperty()
	SaleTypeID: number;

	@ApiModelProperty()
	Receipt: string;

	@ApiModelProperty()
	SalesmanID: number;

	@ApiModelProperty()
	Salesman: string;

	@ApiModelProperty()
	CustomerID: number;

	@ApiModelProperty()
	Customer: string;

	@ApiModelProperty()
	CashierID: number;

	@ApiModelProperty()
	Cashier: string;

	@ApiModelProperty()
	StartTime: string;

	@ApiModelProperty()
	EndTime: string;

	@ApiModelProperty()
	RecDate: string;

	@ApiModelProperty()
	BaseUnitID: number;

	@ApiModelProperty()
	UnitNo: number;

	@ApiModelProperty()
	RowNo: number;

	@ApiModelProperty()
	IsRecall: boolean;

	@ApiModelProperty()
	RecallNO: string;

	@ApiModelProperty()
	RecallAdv: boolean;

	@ApiModelProperty()
	TaxAmount: number;

	@ApiModelProperty()
	IsTax: boolean;

	@ApiModelProperty()
	TaxPercentage: number;

	@ApiModelProperty()
	IsStock: boolean;

	@ApiModelProperty()
	UpdateBy: number;

	@ApiModelProperty()
	Status: number;

	@ApiModelProperty()
	ZNo: number;

	@ApiModelProperty()
	GroupOfCompanyID: number;

	@ApiModelProperty()
	DataTransfer: number;

	@ApiModelProperty()
	CustomerType: number;

	@ApiModelProperty()
	TransStatus: number;

	@ApiModelProperty()
	ZDate: string;

	@ApiModelProperty()
	IsPromotionApplied: boolean;

	@ApiModelProperty()
	PromotionID: number;

	@ApiModelProperty()
	IsPromotion: number;

	@ApiModelProperty()
	LocationIDBilling: number;

	@ApiModelProperty()
	TableID: number;

	@ApiModelProperty()
	OrderTerminalID: number;

	@ApiModelProperty()
	TicketID: number;

	@ApiModelProperty()
	OrderNo: number;

	@ApiModelProperty()
	IsPrinted: boolean;

	@ApiModelProperty()
	ItemComment: string;

	@ApiModelProperty()
	Packs: number;

	@ApiModelProperty()
	IsCancelKOT: boolean;

	@ApiModelProperty()
	StewardID: number;

	@ApiModelProperty()
	StewardName: string;

	@ApiModelProperty()
	ServiceCharge: number;

	@ApiModelProperty()
	ServiceChargeAmount: number;

	@ApiModelProperty()
	ShiftNo: number;

	@ApiModelProperty()
	IsDayEnd: boolean;

	@ApiModelProperty()
	UpdateUnitNo: number;

	@ApiModelProperty()
	InvPriceLevelID: number;

	@ApiModelProperty()
	TourAgentCode: string;

	@ApiModelProperty()
	TourAgentId: number;

	@ApiModelProperty()
	TourAmount: number;

	@ApiModelProperty()
	TourPrecent: number;

	@ApiModelProperty()
	TourCommition: number;

	@ApiModelProperty()
	TourCommitionPaidAmount: number;

	@ApiModelProperty()
	Online: number;

	@ApiModelProperty()
	Deliverdate: string;

	@ApiModelProperty()
	PackSize: number;

	@ApiModelProperty()
	TourAgentCompanyCode: string;

	@ApiModelProperty()
	TourAgentCompanyId: number;

	@ApiModelProperty()
	TourCompanyAmount: number;

	@ApiModelProperty()
	TourCompanyPrecent: number;

	@ApiModelProperty()
	TourCompanyCommition: number;

	@ApiModelProperty()
	TourCompanyCommitionPaidAmount: number;

	@ApiModelProperty()
	DelvryBalQty: number;

	@ApiModelProperty()
	warranty: number;

	@ApiModelProperty()
	ItemSerial: string;

	@ApiModelProperty()
	CreditPeriod: number;

	@ApiModelProperty()
	PrinterType: number;

	@ApiModelProperty()
	IsGLTransfer: number;

	@ApiModelProperty()
	FreeQty: number;

	@ApiModelProperty()
	Payments: Array<PointOfSalesPaymentsDTO>;
}

export class PointOfSalesPaymentsDTO {
         @ApiModelProperty()
         deviceType: string;

         @ApiModelProperty()
         PaymentDetID: number;

         @ApiModelProperty()
         RowNo: number;

		 @ApiModelProperty()
         PayTypeID: number;

		 @ApiModelProperty()
         Amount: number;

		 @ApiModelProperty()
         Balance: number;

		 @ApiModelProperty()
         SDate: string;

		 @ApiModelProperty()
         Receipt: string;

		 @ApiModelProperty()
         LocationID: number;

		 @ApiModelProperty()
         CashierID: number;

		 @ApiModelProperty()
         UnitNo: number;

		 @ApiModelProperty()
         BillTypeID: number;

		 @ApiModelProperty()
         SaleTypeID: number;

		 @ApiModelProperty()
         RefNo: string;

		 @ApiModelProperty()
         BankId: number;

		 @ApiModelProperty()
         ChequeDate: string;

		 @ApiModelProperty()
         IsRecallAdv: boolean;

		 @ApiModelProperty()
         RecallNo: string;

		 @ApiModelProperty()
         Descrip: string;

		 @ApiModelProperty()
         EnCodeName: string;

		 @ApiModelProperty()
         UpdatedBy: number;

		 @ApiModelProperty()
         Status: number;

		 @ApiModelProperty()
         ZNo: number;

		 @ApiModelProperty()
         CustomerId: number;

		 @ApiModelProperty()
         CustomerType: number;

		 @ApiModelProperty()
         CustomerCode: string;

		 @ApiModelProperty()
         GroupOfCompanyID: number;

		 @ApiModelProperty()
         Datatransfer: number;

		 @ApiModelProperty()
         ZDate: string;

		 @ApiModelProperty()
         TerminalID: number;

		 @ApiModelProperty()
         LoyaltyType: number;

		 @ApiModelProperty()
         IsUploadToGL: number;

		 @ApiModelProperty()
         LocationIDBilling: number;

		 @ApiModelProperty()
         TableID: number;

		 @ApiModelProperty()
         TicketID: number;

		 @ApiModelProperty()
         OrderNo: number;

		 @ApiModelProperty()
         ShiftNo: number;

		 @ApiModelProperty()
         IsDayEnd: boolean;

		 @ApiModelProperty()
         UpdateUnitNo: number;

		 @ApiModelProperty()
         Online: number;

		 @ApiModelProperty()
         SerialNo: string;

		 @ApiModelProperty()
         CurrencyCode: string;

		 @ApiModelProperty()
         CurrencyRate: number;

		 @ApiModelProperty()
         AcountNumber: string;

		 @ApiModelProperty()
         PrinterType: number;

		 @ApiModelProperty()
         IsGLTransfer: number;
}

export class ResponseDeviceSettingsDTO {
	@ApiModelProperty()
    deviceType: string
    
    @ApiModelProperty()
	version: string
}
export class ResponseDeviceSettingsDetails {
	@ApiModelProperty()
	response_code: string;

	@ApiModelProperty()
	response_data: ResponseDeviceSettingsDTO;
}

export class CategoriesUpdateDTO {
	@ApiModelProperty()
	categoryIds: string[];
}

export class SubCategoriesUpdateDTO {
	@ApiModelProperty()
	subCategoryIds: string[];
}

export class ProductUpdateDTO {
	@ApiModelProperty()
	productIds: string[];
}

export class InsertUpdateQuery {
	page?: number;
	limit?: number;
	isUpdate?: boolean;
	id?: string;
	lastModifiedDate?: Date
}

export class PaymentQuery {
	amount: number;
	orderNo: string;
	firstName: string;
	lastName: string;
	email: string;
	contactNumber: string;
	addressLineOne: string;
}
