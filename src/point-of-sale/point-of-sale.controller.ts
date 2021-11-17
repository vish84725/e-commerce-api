import { ApiBearerAuth, ApiUseTags, ApiOperation, ApiResponse, ApiImplicitQuery } from '@nestjs/swagger';
import { UtilService } from '../utils/util.service';
import { Controller, Headers, UseGuards, Post, Body, Delete, Param, Get, Put, Res, Query } from '@nestjs/common';
import { ResponseDeviceSettingsDetails, PointOfSalesDTO, InsertUpdateQuery, PaymentQuery, CategoriesUpdateDTO, SubCategoriesUpdateDTO, ProductUpdateDTO } from './point-of-sale.model';
import { ResponseErrorMessage, CommonResponseModel, ResponseSuccessMessage, ResponseBadRequestMessage, ResponseMessage, UserQuery } from '../utils/app.model';
import { UsersDTO } from '../users/users.model';
import { PointOfSaleService } from './point-of-sale.service';
import { GetUser } from '../utils/jwt.strategy';
import * as NodeRSA from 'node-rsa';

@Controller('point-of-sale')
@ApiUseTags('point-of-sale')
export class PointOfSaleController {
	constructor(
		private pointOfSaleService: PointOfSaleService,
		private utilService: UtilService
	) {
	}

	@Get('/products-stock')
	@ApiOperation({ title: 'Get all products with stock information' })
	@ApiResponse({ status: 200, description: 'Return all products with stock details', type: ResponseDeviceSettingsDetails })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	public async getAllProductsWithStock(@GetUser() user: UsersDTO): Promise<CommonResponseModel> {
		try {
			const resData = await this.pointOfSaleService.getAllProductsStock();
			return this.utilService.successResponseData(resData);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Get('/products-stock/:productId')
	@ApiOperation({ title: 'Get product with stock information' })
	@ApiResponse({ status: 200, description: 'Return all products with stock details', type: ResponseDeviceSettingsDetails })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	public async getProductWithStock(@GetUser() user: UsersDTO, @Param('productId') productId: string): Promise<CommonResponseModel> {
		try {
			const resData = await this.pointOfSaleService.getProductStock(productId);
			return this.utilService.successResponseData(resData);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Get('/products')
	@ApiOperation({ title: 'Get all products information' })
	@ApiImplicitQuery({ name: "page", description: "page", required: false, type: Number })
	@ApiImplicitQuery({ name: "limit", description: "limit", required: false, type: Number })
	@ApiImplicitQuery({ name: "isUpdate", description: "is update call", required: false, type: Boolean })
	@ApiImplicitQuery({ name: "lastModifiedDate", description: "last modified date", required: false, type: Date })
	@ApiImplicitQuery({ name: "id", description: "id of the record", required: false, type: String })
	@ApiResponse({ status: 200, description: 'Return all products with details', type: ResponseDeviceSettingsDetails })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	public async getAllProducts(@GetUser() user: UsersDTO, @Query() insertUpdateQuery: InsertUpdateQuery): Promise<CommonResponseModel> {
		try {
			let pagination = this.utilService.getPOSPagination(insertUpdateQuery);
			let resData;
			if (insertUpdateQuery.isUpdate) {
				if (insertUpdateQuery.lastModifiedDate) {
					resData = await this.pointOfSaleService.getAllProducts(pagination.page - 1, pagination.limit, insertUpdateQuery.lastModifiedDate);
				} else {
					this.utilService.badRequest(ResponseMessage.POS_MISSING_QUERY_PARAMETER);
				}
			} else {
				resData = await this.pointOfSaleService.getAllProducts(pagination.page - 1, pagination.limit);
			}


			return this.utilService.successResponseData(resData);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Get('/departments')
	@ApiOperation({ title: 'Get all categories information' })
	@ApiImplicitQuery({ name: "page", description: "page", required: false, type: Number })
	@ApiImplicitQuery({ name: "limit", description: "limit", required: false, type: Number })
	@ApiImplicitQuery({ name: "isUpdate", description: "is update call", required: false, type: Boolean })
	@ApiImplicitQuery({ name: "lastModified", description: "last modified date", required: false, type: Date })
	@ApiImplicitQuery({ name: "id", description: "id of the record", required: false, type: String })
	@ApiResponse({ status: 200, description: 'Return all categories with details', type: ResponseDeviceSettingsDetails })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	public async getAllCategories(@GetUser() user: UsersDTO, @Query() insertUpdateQuery: InsertUpdateQuery): Promise<CommonResponseModel> {
		try {
			let resData;
			let pagination = this.utilService.getPOSPagination(insertUpdateQuery);

			if (insertUpdateQuery.isUpdate) {
				if (insertUpdateQuery.lastModifiedDate) {
					resData = await this.pointOfSaleService.getAllCategories(pagination.page - 1, pagination.limit, insertUpdateQuery.lastModifiedDate);
				} else {
					this.utilService.badRequest(ResponseMessage.POS_MISSING_QUERY_PARAMETER);
				}
			} else {
				resData = await this.pointOfSaleService.getAllCategories(pagination.page - 1, pagination.limit);
			}

			return this.utilService.successResponseData(resData);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Get('/categories')
	@ApiOperation({ title: 'Get all sub categories information' })
	@ApiImplicitQuery({ name: "page", description: "page", required: false, type: Number })
	@ApiImplicitQuery({ name: "limit", description: "limit", required: false, type: Number })
	@ApiImplicitQuery({ name: "isUpdate", description: "is update call", required: false, type: Boolean })
	@ApiImplicitQuery({ name: "lastModified", description: "last modified date", required: false, type: Date })
	@ApiImplicitQuery({ name: "id", description: "id of the record", required: false, type: String })
	@ApiResponse({ status: 200, description: 'Return all sub category details', type: ResponseDeviceSettingsDetails })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	public async getAllSubCategories(@GetUser() user: UsersDTO, @Query() insertUpdateQuery: InsertUpdateQuery): Promise<CommonResponseModel> {
		try {
			let pagination = this.utilService.getPOSPagination(insertUpdateQuery);
			let resData;

			if (insertUpdateQuery.isUpdate) {
				if (insertUpdateQuery.lastModifiedDate) {
					resData = await this.pointOfSaleService.getAllSubCategories(pagination.page - 1, pagination.limit, insertUpdateQuery.lastModifiedDate);
				} else {
					this.utilService.badRequest(ResponseMessage.POS_MISSING_QUERY_PARAMETER);
				}
			} else {
				resData = await this.pointOfSaleService.getAllSubCategories(pagination.page - 1, pagination.limit);
			}

			return this.utilService.successResponseData(resData);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Put('/departments')
	@ApiOperation({ title: 'Update category by categoryId list' })
	@ApiResponse({ status: 200, description: 'Success message', type: ResponseSuccessMessage })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	public async updateCategories(@GetUser() user: UsersDTO, @Body() categoryIds: CategoriesUpdateDTO): Promise<CommonResponseModel> {
		try {
			if (categoryIds && categoryIds.categoryIds && categoryIds.categoryIds.length > 0) {
				let promiseList = [];
				let successCount = 0;
				categoryIds.categoryIds.forEach((catId) => {
					let res = this.pointOfSaleService.updateCategorySyncStatus(catId);
					promiseList.push(res);

				});
				await Promise.all(promiseList).then(response => {
					let successList = response.filter(res => res == true);
					if (successList.length > 0) {
						successCount = successList.length;
					}
				});

				return this.utilService.successResponseMsg(`${successCount} : ${ResponseMessage.CATEGORY_UPDATED}`);
			} else {
				this.utilService.badRequest(ResponseMessage.SOMETHING_WENT_WRONG);
			}
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Put('/categories')
	@ApiOperation({ title: 'Update sub categories by sub categoryId list' })
	@ApiResponse({ status: 200, description: 'Success message', type: ResponseSuccessMessage })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	public async updateSubCategories(@GetUser() user: UsersDTO, @Body() subCategoryIds: SubCategoriesUpdateDTO): Promise<CommonResponseModel> {
		try {
			if (subCategoryIds && subCategoryIds.subCategoryIds && subCategoryIds.subCategoryIds.length > 0) {
				let promiseList = [];
				let successCount = 0;
				subCategoryIds.subCategoryIds.forEach((subCatId) => {
					let res = this.pointOfSaleService.updateSubCategorySyncStatus(subCatId);
					promiseList.push(res);

				});
				await Promise.all(promiseList).then(response => {
					let successList = response.filter(res => res == true);
					if (successList.length > 0) {
						successCount = successList.length;
					}
				});

				return this.utilService.successResponseMsg(`${successCount} : ${ResponseMessage.SUB_CATEGORY_UPDATED}`);
			} else {
				this.utilService.badRequest(ResponseMessage.SOMETHING_WENT_WRONG);
			}
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Put('/products')
	@ApiOperation({ title: 'Update products by sub productId list' })
	@ApiResponse({ status: 200, description: 'Success message', type: ResponseSuccessMessage })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	public async updateSubProducts(@GetUser() user: UsersDTO, @Body() productIds: ProductUpdateDTO): Promise<CommonResponseModel> {
		try {
			if (productIds && productIds.productIds && productIds.productIds.length > 0) {
				let promiseList = [];
				let successCount = 0;
				productIds.productIds.forEach((prodId) => {
					let res = this.pointOfSaleService.updateProductSyncStatus(prodId);
					promiseList.push(res);

				});
				await Promise.all(promiseList).then(response => {
					let successList = response.filter(res => res == true);
					if (successList.length > 0) {
						successCount = successList.length;
					}
				});

				return this.utilService.successResponseMsg(`${successCount} : ${ResponseMessage.PRODUCT_UPDATED}`);
			} else {
				this.utilService.badRequest(ResponseMessage.SOMETHING_WENT_WRONG);
			}
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Post('/sale')
	@ApiOperation({ title: 'create point of sale' })
	@ApiResponse({ status: 200, description: 'Success message', type: ResponseSuccessMessage })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	public async createPointOfSale(@GetUser() user: UsersDTO, @Body() sale: PointOfSalesDTO): Promise<CommonResponseModel> {
		try {
			if (sale) {

				let savedSale = await this.pointOfSaleService.CreateSale(sale);
				if (savedSale) {
					return this.utilService.successResponseMsg(`${ResponseMessage.POS_SALE_CREATED}`);
				}
				this.utilService.badRequest(ResponseMessage.SOMETHING_WENT_WRONG);

			} else {
				this.utilService.badRequest(ResponseMessage.SOMETHING_WENT_WRONG);
			}
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}


	@Get('/sales')
	@ApiOperation({ title: 'Get all point of sale information' })
	@ApiImplicitQuery({ name: "page", description: "page", required: false, type: Number })
	@ApiImplicitQuery({ name: "limit", description: "limit", required: false, type: Number })
	@ApiResponse({ status: 200, description: 'Return all point of sales with details', type: ResponseDeviceSettingsDetails })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	public async getAllPointOfSales(@Query() userQuery: UserQuery): Promise<CommonResponseModel> {
		try {
			let pagination = this.utilService.getUserPagination(userQuery);
			const resData = await Promise.all([
				this.pointOfSaleService.getAllPointOfSales(pagination.page, pagination.limit),
				this.pointOfSaleService.countAllPointOfSales()
			])
			return this.utilService.successResponseData(resData[0], { total: resData[1] });
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}
	@Get('/sale-payment/:saleId')
	@ApiOperation({ title: 'Get point of sale payment information by ID' })
	@ApiImplicitQuery({ name: "page", description: "page", required: false, type: Number })
	@ApiImplicitQuery({ name: "limit", description: "limit", required: false, type: Number })
	@ApiResponse({ status: 200, description: 'Return point of sale payment information by ID', type: ResponseDeviceSettingsDetails })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	public async getPointOfSalePayementsById(@Param('saleId') saleId: string): Promise<CommonResponseModel> {
		try {
			const resData = await this.pointOfSaleService.getPointOfSalePayementsById(saleId);
			return this.utilService.successResponseData(resData.Payments);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Get('/payment-amount-encrypt')
	@ApiOperation({ title: 'Get encrypted payment amount' })
	@ApiImplicitQuery({ name: "amount", description: "amount", required: false, type: Number })
	@ApiImplicitQuery({ name: "orderNo", description: "orderNo", required: false, type: String })
	@ApiImplicitQuery({ name: "firstName", description: "firstName", required: false, type: String })
	@ApiImplicitQuery({ name: "lastName", description: "lastName", required: false, type: String })
	@ApiImplicitQuery({ name: "email", description: "email", required: false, type: String })
	@ApiImplicitQuery({ name: "contactNumber", description: "contactNumber", required: false, type: String })
	@ApiImplicitQuery({ name: "addressLineOne", description: "addressLineOne", required: false, type: String })
	@ApiResponse({ status: 200, description: 'Return the payment amount', type: ResponseDeviceSettingsDetails })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	public async getPaymentAmount(@GetUser() user: UsersDTO, @Query() paymentQuery: PaymentQuery): Promise<CommonResponseModel> {
		try {
			let resData;
			const key = new NodeRSA('-----BEGIN PUBLIC KEY-----\n' +
				'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDOwNw/fV5tB5xw40pOlVD49bSJ\n' +
				'i0mlLZqq1mf9/Qe7MLB9APt/+nui4xQFZSg1OrtnQ+p8UgTzB9pT8HJfuXemxQ8C\n' +
				'6yFcaSbgxeuQpyrk72ZczEV7ioU4kktoSVfk2xiR2W6by06uJoH8MPfof71o2Xfj\n' +
				'45F/6CXMu5U1KE0gVwIDAQAB\n' +
				'-----END PUBLIC KEY-----');

			if (paymentQuery) {
				let price = paymentQuery.amount;
				let order_id = paymentQuery.orderNo;
				let text = order_id + '|' + price;
				const encrypted = key.encrypt(text, 'base64');

				let customFields = `${paymentQuery.firstName}|${paymentQuery.lastName}|${paymentQuery.email}|${paymentQuery.contactNumber}|${paymentQuery.addressLineOne}`
				const encryptedCustomFields = key.encrypt(customFields, 'base64');

				resData = {
					paymentPayload: encrypted,
					customFields: encryptedCustomFields
				};
			}
			return this.utilService.successResponseData(resData);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

}
