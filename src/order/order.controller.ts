import { Body, Controller, Query, Get, Param, Post, UseGuards, Put, Res } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiUseTags, ApiResponse, ApiOperation, ApiImplicitQuery } from '@nestjs/swagger';
import { UsersDTO } from '../users/users.model';
import { OrderStatusDTO, AssignOrderDTO, PaymentType, OrderStatusType, PaymentFrom, OrderFilterQuery, OrderCreateDTO, StripePaymentStatus, DBStatusUpdateDTO, ResponseOrderDTOPagination, ResponseDataOfOrder, ResponseOrderAdminListDTO, ResponseOrderForAdmin, ResponseOrderDetailsOrderId, ResponseStatusList, ResponseChardOrderDTO, ResponseDeiveryBoyPagination, ResponseDeliveredOrderPagination, PaymentStatusType, ResponseAdminOrderDetailsOrderId, WebexPaymentStatus } from './order.model';
import { ResponseMessage, AdminSettings, CommonResponseModel, ResponseErrorMessage, ResponseBadRequestMessage, ResponseSuccessMessage, UserQuery } from '../utils/app.model';
import { UtilService } from '../utils/util.service';
import { WalletService } from '../wallet/wallet.service';
import { WalletSaveDTO, WalletTransactionType } from '../wallet/wallet.model';
import { AppGateway } from '../app.gateway';
import { ProductService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import { AddressService } from '../address/address.service';
import { SettingService } from '../settings/settings.service';
import { SequenceService } from '../sequence/sequence.service';
import { UserService } from '../users/users.service';
import { PaymentMethod } from '../settings/settings.model';
import { NotificationSaveDTO, NotificationType } from '../notifications/notifications.model';
import { NotificationService } from '../notifications/notifications.service';
import { PushService } from '../utils/push.service';
import { StripeService } from '../utils/stripe.service';
import { CategoryService } from '../categories/categories.service';
import { GetUser } from '../utils/jwt.strategy';
import { EmailService } from '../utils/email.service';
import { BusinessService } from '../business/business.service';
import { ProductOutOfStockService } from '../product-out-of-stock/product-out-of-stock.service';
import { DeliveryBoyRatingsService } from '../delivery-boy-ratings/delivery-boy-ratings.service'
import { WebexPaymentsService } from '../webex-payments/webex-payments.service';

@Controller('orders')
@ApiUseTags('Orders')
export class OrderController {
	constructor(
		private orderService: OrderService,
		private utilService: UtilService,
		private cartService: CartService,
		private walletService: WalletService,
		private addressService: AddressService,
		private settingService: SettingService,
		private productService: ProductService,
		private categoryService: CategoryService,
		private sequenceService: SequenceService,
		private userService: UserService,
		private notificationService: NotificationService,
		private pushService: PushService,
		private stripeService: StripeService,
		private emailService: EmailService,
		private socketService: AppGateway,
		private businessService: BusinessService,
		private productOutOfStockService: ProductOutOfStockService,
		private deliveryBoyRatingsService: DeliveryBoyRatingsService,
		private webexPaymentsService: WebexPaymentsService
	) {
	}

	// ########################################################### USER ###########################################################
	@Get('/list')
	@ApiOperation({ title: 'Get all order for user' })
	@ApiImplicitQuery({ name: "page", description: "page", required: false, type: Number })
	@ApiImplicitQuery({ name: "limit", description: "limit", required: false, type: Number })
	@ApiResponse({ status: 200, description: 'Return list of order for user', type: ResponseOrderDTOPagination })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async GetOrderListForUser(@GetUser() user: UsersDTO, @Query() userQuery: UserQuery): Promise<CommonResponseModel> {
		this.utilService.validateUserRole(user);
		try {
			let pagination = this.utilService.getUserPagination(userQuery);
			const orders = await Promise.all([
				this.orderService.getAllOrderForUser(user._id, pagination.page, pagination.limit),
				this.orderService.countAllOrderForUser(user._id)
			])
			return this.utilService.successResponseData(orders[0], { total: orders[1] });
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Get('/detail/:orderId')
	@ApiOperation({ title: 'Get order detail by orderId for user' })
	@ApiResponse({ status: 200, description: 'Success message', type: ResponseDataOfOrder })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async getOrderDetailForUser(@GetUser() user: UsersDTO, @Param('orderId') orderId: string): Promise<CommonResponseModel> {
		this.utilService.validateUserRole(user);
		try {
			let order = await this.orderService.getOrderDetailForUser(user._id, orderId);
			if (!order) this.utilService.pageNotFound();
			let cart = await this.cartService.getCartById(order.cartId);

			const ratings = await this.cartService.findProductsById(user._id, cart.productIds);
			cart = JSON.parse(JSON.stringify(cart));
			cart.products.map(p => {
				const pro = ratings.find(r => r.productId == p.productId)
				if (pro) { p.isRated = pro.isRated; p.rating = pro.rating; }
			});
			delete order.cartId;
			return this.utilService.successResponseData({ order: order, cart: cart });
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Post('/create')
	@ApiOperation({ title: 'Create order' })
	@ApiResponse({ status: 200, description: 'Success message', type: ResponseSuccessMessage })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async placeOrder(@GetUser() userData: UsersDTO, @Body() orderData: OrderCreateDTO) {
		this.utilService.validateUserRole(userData);
		try {
			if (!(orderData.paymentType == PaymentType.STRIPE || orderData.paymentType == PaymentType.WEBEX || orderData.paymentType == PaymentType.COD)) orderData.paymentType = PaymentType.COD;

			if (orderData.paymentType === PaymentType.STRIPE && !orderData.paymentId) this.utilService.badRequest(ResponseMessage.PAYMENT_ID_NOT_FOUND);
			const userCart = await this.cartService.getCartByUserId(userData._id);
			if (!userCart) this.utilService.badRequest(ResponseMessage.CART_ITEM_NOT_FOUND);
			if (!userCart.deliveryAddress) this.utilService.badRequest(ResponseMessage.ADDRESS_NOT_FOUND);

			const settings = await this.settingService.getDeliveryTaxSettings();
			const userAdress = await this.addressService.getAddressDetail(userData._id, userCart.deliveryAddress);
			const storeLocation = { latitude: settings.location.latitude, longitude: settings.location.longitude };
			const userLocation = { latitude: userAdress.location.latitude, longitude: userAdress.location.longitude };
			const preciseDistance = this.utilService.calculateDistance(userLocation, storeLocation);
			if (preciseDistance > settings.deliveryCoverage) this.utilService.badRequest(ResponseMessage.ADDDRESS_DELIVERY_LOCATION_NOT_AVAILABLE);
			console.log("User Cart",userCart);
			if (settings && userCart.subTotal < settings.minimumOrderAmountToPlaceOrder) {
				const resMsg = await this.utilService.getTranslatedMessageByKey(ResponseMessage.ORDER_MINIMUM_AMOUNT_PLACE_ORDER);
				this.utilService.badRequest(`${resMsg}` + settings.minimumOrderAmountToPlaceOrder);
			}

			const products = await this.productService.getProductByIds(userCart.productIds);
			const cartVerifyData = await this.cartService.verifyCart(products, userCart);

			if (cartVerifyData.cartArr.length > 0) this.utilService.badRequest(cartVerifyData.cartArr);

			if (userCart.walletAmount > 0) {
				if (userData.walletAmount < userCart.walletAmount) this.utilService.badRequest(ResponseMessage.WALLET_INSUFFICENT_AMOUNT);
			}

			let order = {
				subTotal: 0,
				tax: 0,
				product: {
					title: '',
					imageUrl: ''
				},
				totalProduct: 0,
				grandTotal: 0,
				deliveryCharges: 0,
				couponCode: 0,
				couponAmount: 0,
				transactionDetails: {
					transactionStatus: '',
					receiptUrl: '',
					transactionId: '',
					currency: ''
				},
				address: null,
				user: null,
				userId: '',
				paymentType: '',
				orderStatus: '',
				paymentStatus: PaymentStatusType.PENDING,
				cartId: '',
				orderID: 0,
				deliveryDate: '',
				deliveryTime: '',
				isWalletUsed: false,
				usedWalletAmount: 0,
				amountRefunded: 0,
				currencySymbol: "",
				currencyCode: "",
				invoiceToken: '',
				orderFrom: orderData.orderFrom
			};

			if (!orderData.deliverySlotId) this.utilService.badRequest(ResponseMessage.DELIEVRY_SLOT_NOT_SELECTED);

			const deliveryTimeSlots = await this.settingService.getDeliveryTimeSlots();
			const availableSlots = await this.settingService.getAvailableTimeSlot(deliveryTimeSlots['deliveryTimeSlots']);
			let openSlots = [];
			availableSlots.map(day => {
				day.timings.map(time => { openSlots[time._id] = { date: day.date, slot: time.slot }; })
			})

			const selectedTimeslot = openSlots[orderData.deliverySlotId];
			if (!selectedTimeslot) this.utilService.badRequest(ResponseMessage.DELIEVRY_SLOT_NOT_AVAILABLE);

			order.deliveryDate = selectedTimeslot.date;
			order.deliveryTime = selectedTimeslot.slot;
			order.subTotal = userCart.subTotal;
			order.tax = userCart.tax;
			order.grandTotal = userCart.grandTotal;
			order.deliveryCharges = userCart.deliveryCharges;
			order.currencyCode = settings.currencyCode;
			order.currencySymbol = settings.currencySymbol;
			order.transactionDetails = {
				transactionStatus: null,
				receiptUrl: null,
				transactionId: null,
				currency: null
			};
			order.couponCode = userCart.couponCode;
			order.couponAmount = userCart.couponAmount;

			if (userCart.walletAmount) {
				order.usedWalletAmount = userCart.walletAmount;
				order.isWalletUsed = true;
				if (order.grandTotal === 0) {
					order.paymentStatus = PaymentStatusType.SUCCESS;
				}
			}

			if (orderData.paymentType === PaymentType.STRIPE) {
				const amount = Math.round(Number(Number(order.grandTotal.toFixed(2)) * 100));
				if (orderData.orderFrom == PaymentFrom.WEB_APP) {
					const charge = await this.stripeService.createChargePayment({
						amount: amount,
						currency: settings.currencyCode || "USD",
						description: PaymentFrom.WEB_APP,
						source: orderData.paymentId
					});
					if (charge && charge.status == StripePaymentStatus.SUCCESS) {
						order.transactionDetails.transactionStatus = charge.status;
						order.transactionDetails.receiptUrl = charge.receipt_url;
						order.transactionDetails.transactionId = charge.id;
						order.transactionDetails.currency = charge.currency;
						order.paymentStatus = PaymentStatusType.SUCCESS;
					}
					else this.utilService.badRequest(ResponseMessage.ORDER_PAYMENT_ERROR);
				} else if (orderData.orderFrom == PaymentFrom.USER_APP) {
					let paymentIntent = await this.stripeService.createPaymentIntents({
						amount: amount,
						currency: settings.currencyCode || "USD",
						payment_method: orderData.paymentId,
						capture_method: StripePaymentStatus.MANUAL,
						confirm: true
					});
					if (paymentIntent && paymentIntent.id && paymentIntent.status == StripePaymentStatus.REQUIRES_CAPTURE) {
						let capturedPay = await this.stripeService.capturePaymentIntents(paymentIntent.id, { amount_to_capture: amount });
						if (capturedPay && capturedPay.status == StripePaymentStatus.SUCCESS) {
							order.transactionDetails.transactionStatus = capturedPay.status;
							order.transactionDetails.receiptUrl = capturedPay.charges.data[0].receipt_url;
							order.transactionDetails.transactionId = capturedPay.charges.data[0].id;
							order.transactionDetails.currency = capturedPay.currency;
							order.paymentStatus = PaymentStatusType.SUCCESS;
						}
						else this.utilService.badRequest(ResponseMessage.ORDER_PAYMENT_ERROR);
					}
					else this.utilService.badRequest(ResponseMessage.ORDER_PAYMENT_ERROR);
				}
			}
			if (orderData.paymentType === PaymentType.WEBEX) {
				 console.log("WEBEX",orderData,order);
				 //order.grandTotal=120;
				const amount = Math.round(Number(Number(order.grandTotal.toFixed(2)) * 100));
				if ((orderData.orderFrom == PaymentFrom.USER_APP) || (orderData.orderFrom == PaymentFrom.WEB_APP)) {
					let paymentIntent =  await this.webexPaymentsService.findPaymentTransaction(orderData.paymentId);
					order.transactionDetails.transactionStatus = PaymentStatusType.SUCCESS;
					order.transactionDetails.receiptUrl = "";
					order.transactionDetails.transactionId = orderData.paymentId;
					order.transactionDetails.currency = settings.currencyCode || "USD";
					order.paymentStatus = PaymentStatusType.SUCCESS;

				}
			}

			order.address = {
				address: userAdress.address,
				flatNo: userAdress.flatNo,
				postalCode: userAdress.postalCode,
				addressType: userAdress.addressType,
				apartmentName: userAdress.apartmentName,
				landmark: userAdress.landmark,
				location: userAdress.location
			}

			order.user = {
				firstName: userData.firstName,
				lastName: userData.lastName,
				mobileNumber: userData.mobileNumber,
				email: userData.email,
				countryCode: userData.countryCode,
				countryName: userData.countryName
			}

			order.userId = userData._id;
			order.paymentType = orderData.paymentType;
			order.orderStatus = OrderStatusType.PENDING;
			order.cartId = userCart._id;
			order.totalProduct = userCart.products.length;
			order.product = {
				title: userCart.products[0].productName,
				imageUrl: userCart.products[0].imageUrl
			}
			order.invoiceToken = await this.utilService.getUUID();
			let sequence = await this.sequenceService.getSequence()
			order.orderID = sequence ? sequence.sequenceNo : Math.floor(900000 * Math.random()) + 100000;
			const orderRes = await this.orderService.createOrder(order);

			if (orderRes) {

				if (cartVerifyData && cartVerifyData.productArr.length) {
					for (let prods of cartVerifyData.productArr) {
						await this.productService.updateProductStock(prods._id, prods.variant);
					}
				}
				if (cartVerifyData.productOutOfStock && cartVerifyData.productOutOfStock.length) {
					const productStockData = await Promise.all([
						this.notificationService.createForProductOutOfStock(cartVerifyData.productOutOfStock),
						this.productOutOfStockService.createProductStock(cartVerifyData.productOutOfStock),

					]);
				}
				const walletPayment: WalletSaveDTO = {
					userId: userData._id,
					orderId: orderRes._id,
					orderID: orderRes.orderID,
					amount: orderRes.usedWalletAmount
				}

				const notification: NotificationSaveDTO = {
					notifyType: NotificationType.ORDER_PLACED,
					orderId: orderRes._id,
					orderID: orderRes.orderID,
				}

				if (walletPayment.amount > 0) await this.walletService.madeOrder(walletPayment);

				const placed = await Promise.all([
					this.userService.updateWallet(userData._id, -orderRes.usedWalletAmount),
					this.cartService.cartOrderUnlink(userCart._id),
					this.notificationService.createForOrderPlaced(notification),

				]);
				if (userData && userData.playerId) {
					const title = await this.utilService.getTranslatedMessageByKey(ResponseMessage.USER_NOTIFY_ORDER_PLACED_TITLE);
					let desc = await this.utilService.getTranslatedMessageByKey(ResponseMessage.USER_NOTIFY_ORDER_PLACED_DESC);
					desc = desc.replace('${orderID}', orderRes.orderID);
					this.pushService.sendNotificationToUser(userData.playerId, title, desc);
				}

				this.emailService.sendEmailForPlacedOrder(orderRes, userCart);
				this.socketService.sendOrderStatusNotificationToAdmin(notification);
				this.socketService.sendProductOutOfStocksNotificationToAdmin(cartVerifyData.productOutOfStock)
				return this.utilService.successResponseMsg(ResponseMessage.ORDER_PLACED);
			}
		} catch (e) {
			if (e && e.type && e.type === 'StripeInvalidRequestError') this.utilService.badRequest(e.raw.message);
			else this.utilService.errorResponse(e);
		}
	}

	@Put('/cancel/:orderId')
	@ApiOperation({ title: 'Cancel order' })
	@ApiResponse({ status: 200, description: 'Success message', type: ResponseSuccessMessage })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async orderCancelledByUser(@GetUser() user: UsersDTO, @Param('orderId') orderId: string): Promise<CommonResponseModel> {
		this.utilService.validateUserRole(user);
		try {
			const order = await this.orderService.getOrderDetailForCancel(user._id, orderId);
			if (!order) this.utilService.badRequest(ResponseMessage.ORDER_NOT_FOUND);
			if (order.orderStatus === OrderStatusType.DELIVERED) this.utilService.badRequest(ResponseMessage.ORDER_ALREADY_DELIVERED);
			let amountRefund = 0;
			if (order.paymentType === PaymentMethod.COD && order.isWalletUsed && order.usedWalletAmount) amountRefund = order.usedWalletAmount;
			else if (order.paymentStatus === PaymentStatusType.SUCCESS && order.paymentType === PaymentMethod.STRIPE) amountRefund = order.grandTotal + order.usedWalletAmount;

			await this.orderService.orderCancelByUser(user._id, orderId, amountRefund);
			const userCart = await this.cartService.getCartById(order.cartId);
			const products = await this.productService.getProductByIds(userCart.productIds);

			for (let prods of userCart.products) {
				const productIndex = await products.findIndex(val => val._id.toString() == prods.productId.toString());
				const varientIndex = await products[productIndex].variant.findIndex(val => val.unit == prods.unit);
				if (products[productIndex].variant[varientIndex].productStock === 0) {
					await this.productOutOfStockService.deleteOutOfStock(products[productIndex]._id);
				}
				products[productIndex].variant[varientIndex].productStock += prods.quantity;
				await this.productService.updateProductStock(products[productIndex]._id, products[productIndex].variant[varientIndex]);
			}

			if (amountRefund !== 0) {
				let wallet: WalletSaveDTO = {
					userId: user._id,
					amount: amountRefund,
					transactionType: WalletTransactionType.ORDER_CANCELLED,
					orderId: order._id,
					orderID: order.orderID
				}
				this.walletService.cancelOrder(wallet);
			}
			const notification: NotificationSaveDTO = {
				notifyType: NotificationType.ORDER_CANCELLED,
				orderId: order._id,
				orderID: order.orderID,
			}

			const placed = await Promise.all([
				this.userService.updateWallet(user._id, amountRefund),
				this.notificationService.createForOrderCancel(notification)
			])
			let title = await this.utilService.getTranslatedMessageByKey(ResponseMessage.USER_NOTIFY_ORDER_CANCELLED_TITLE);
			let desc = await this.utilService.getTranslatedMessageByKey(ResponseMessage.USER_NOTIFY_ORDER_CANCELLED_DESC);
			desc = desc.replace('${orderID}', order.orderID);
			this.userService.descreaseOrderPurchased(user._id);
			this.pushService.sendNotificationToUser(user.playerId, title, desc);
			this.socketService.sendOrderStatusNotificationToAdmin(notification);
			return this.utilService.successResponseMsg(ResponseMessage.ORDER_CANCELLED);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	// ########################################################### DELIVERY BOY ###########################################################
	@Get('/delivery-boy/assigned/list')
	@ApiImplicitQuery({ name: "page", description: "page", required: false, type: Number })
	@ApiImplicitQuery({ name: "limit", description: "limit", required: false, type: Number })
	@ApiOperation({ title: 'Get all assigned order for delivery boy' })
	@ApiResponse({ status: 200, description: 'Return list of assigned order for delivery boy', type: ResponseDeiveryBoyPagination })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async assignedOrderListForDeliveryBoy(@GetUser() user: UsersDTO, @Query() userQuery: UserQuery): Promise<CommonResponseModel> {
		this.utilService.validateDeliveryBoyRole(user);
		try {
			let pagination = this.utilService.getUserPagination(userQuery);
			const orders = await Promise.all([
				this.orderService.getAllAssginedOrderForDeliveryBoy(user._id, pagination.page, pagination.limit),
				this.orderService.countAllAssginedOrderForDeliveryBoy(user._id)
			])
			return this.utilService.successResponseData(orders[0], { total: orders[1] });
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Get('/delivery-boy/delivered/list')
	@ApiOperation({ title: 'Get all delivered order for delivery boy' })
	@ApiImplicitQuery({ name: "page", description: "page", required: false, type: Number })
	@ApiImplicitQuery({ name: "limit", description: "limit", required: false, type: Number })
	@ApiResponse({ status: 200, description: 'Return list of delivered order for delivery boy', type: ResponseDeliveredOrderPagination })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async deliveredOrderListForDeliveryBoy(@GetUser() user: UsersDTO, @Query() userQuery: UserQuery): Promise<CommonResponseModel> {
		this.utilService.validateDeliveryBoyRole(user);
		try {
			let pagination = this.utilService.getUserPagination(userQuery);
			const orders = await Promise.all([
				this.orderService.getAllDeliveredOrderForDeliveryBoy(user._id, pagination.page, pagination.limit),
				this.orderService.countAllDeliveredOrderForDeliveryBoy(user._id)
			])
			return this.utilService.successResponseData(orders[0], { total: orders[1] });
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Get('/delivery-boy/detail/:orderId')
	@ApiOperation({ title: 'Get order detail by orderId for delivery boy' })
	@ApiResponse({ status: 200, description: 'Return order detail by orderId', type: ResponseDataOfOrder })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async getOrderDetailForDeliveryBoy(@GetUser() user: UsersDTO, @Param('orderId') orderId: string): Promise<CommonResponseModel> {
		this.utilService.validateDeliveryBoyRole(user);
		try {
			let order = await this.orderService.getOrderDetailForBoy(user._id, orderId);
			if (!order) this.utilService.badRequest(ResponseMessage.ORDER_NOT_FOUND);

			let cart = await this.cartService.getCartById(order.cartId);
			delete order.cartId;
			return this.utilService.successResponseData({ order: order, cart: cart });
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Put('/delivery-boy/accept/:orderId')
	@ApiOperation({ title: 'Accept order by delivery boy' })
	@ApiResponse({ status: 200, description: 'Success message', type: ResponseSuccessMessage })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async orderAcceptByDeliveryBoy(@GetUser() user: UsersDTO, @Param('orderId') orderId: string): Promise<CommonResponseModel> {
		this.utilService.validateDeliveryBoyRole(user);
		try {
			const orderDetail = await this.orderService.getOrderDetail(orderId);
			if (!orderDetail) this.utilService.badRequest(ResponseMessage.ORDER_NOT_FOUND);

			if (orderDetail.assignedToId != user._id) this.utilService.badRequest(ResponseMessage.ORDER_NOT_FOUND);
			if (orderDetail.isAcceptedByDeliveryBoy) this.utilService.badRequest(ResponseMessage.DELIVERY_BOY_ALREADY_ACCEPTED_ORDER);

			const orderAccept = await this.orderService.orderAcceptByDelivery(orderId);
			if (orderAccept) {
				const notification: NotificationSaveDTO = {
					notifyType: NotificationType.ORDER_ACCEPTED_BY_DELIVERY_BOY,
					orderId: orderDetail._id,
					orderID: orderDetail.orderID,
					deliveryBoyId: user._id,
					deliveryBoyName: user.firstName + ' ' + user.lastName
				}
				this.socketService.sendOrderStatusNotificationToAdmin(notification);
				this.notificationService.createForAcceptedByBoy(notification);
				return this.utilService.successResponseMsg(ResponseMessage.ORDER_ACCEPTED_BY_DELIVERY_BOY);
			}
			else this.utilService.badRequest(ResponseMessage.SOMETHING_WENT_WRONG);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Put('/delivery-boy/reject/:orderId')
	@ApiOperation({ title: 'Reject order by delivery boy' })
	@ApiResponse({ status: 200, description: 'Success message', type: ResponseSuccessMessage })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async orderRejectedByDeliveryBoy(@GetUser() user: UsersDTO, @Param('orderId') orderId: string): Promise<CommonResponseModel> {
		this.utilService.validateDeliveryBoyRole(user);
		try {
			const orderDetail = await this.orderService.getOrderDetail(orderId);
			if (!orderDetail) this.utilService.badRequest(ResponseMessage.ORDER_NOT_FOUND);

			if (orderDetail.assignedToId != user._id) this.utilService.badRequest(ResponseMessage.ORDER_NOT_FOUND);
			if (orderDetail.isAcceptedByDeliveryBoy) this.utilService.badRequest(ResponseMessage.DELIVERY_BOY_ALREADY_ACCEPTED_ORDER);

			const orderRejected = await this.orderService.orderRejectedByDelivery(orderId, user._id, user.firstName);
			if (orderRejected) {
				const notification: NotificationSaveDTO = {
					notifyType: NotificationType.ORDER_REJECTED_BY_DELIVERY_BOY,
					orderId: orderDetail._id,
					orderID: orderDetail.orderID,
					deliveryBoyId: user._id,
					deliveryBoyName: user.firstName + ' ' + user.lastName
				}
				this.socketService.sendOrderStatusNotificationToAdmin(notification);
				this.notificationService.createForRejectedByBoy(notification);
				return this.utilService.successResponseMsg(ResponseMessage.ORDER_REJECTED_BY_DELIVERY_BOY);
			}
			this.utilService.badRequest(ResponseMessage.SOMETHING_WENT_WRONG);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Put('/delivery-boy/status-update/:orderId')
	@ApiOperation({ title: 'Update order status by delivery boy' })
	@ApiResponse({ status: 200, description: 'Success message', type: ResponseSuccessMessage })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async orderStatusUpdateByDeliveryBoy(@GetUser() user: UsersDTO, @Param('orderId') orderId: string, @Body() statusUpdate: DBStatusUpdateDTO): Promise<CommonResponseModel> {
		this.utilService.validateDeliveryBoyRole(user);
		try {
			const orderDetail = await this.orderService.getOrderDetail(orderId);
			if (!orderDetail) this.utilService.badRequest(ResponseMessage.ORDER_NOT_FOUND);
			if (orderDetail.assignedToId != user._id) this.utilService.badRequest(ResponseMessage.ORDER_NOT_FOUND);
			let orderStatusUpdate;
			console.log("status update", statusUpdate);
			if (statusUpdate.status === OrderStatusType.DELIVERED) {
				orderStatusUpdate = await this.orderService.orderStatusUpdateByDelivery(orderId, statusUpdate.status, PaymentStatusType.SUCCESS);
			} else {
				orderStatusUpdate = await this.orderService.orderStatusUpdateByDelivery(orderId, statusUpdate.status);
			}
			console.log("orderstatus updatae", orderStatusUpdate);
			if (orderStatusUpdate) {
				const userDetail = await this.userService.getUserById(orderDetail.userId);
				if (userDetail) {
					let title = '', desc = '';
					if (statusUpdate.status === OrderStatusType.OUT_FOR_DELIVERY) {
						title = await this.utilService.getTranslatedMessageByKey(ResponseMessage.USER_NOTIFY_ORDER_OUT_OF_DELIVERY_TITLE);
						desc = await this.utilService.getTranslatedMessageByKey(ResponseMessage.USER_NOTIFY_ORDER_OUT_OF_DELIVERY_DESC);
						desc = desc.replace('${orderID}', orderDetail.orderID);
					} else if (statusUpdate.status === OrderStatusType.DELIVERED) {
						title = await this.utilService.getTranslatedMessageByKey(ResponseMessage.USER_NOTIFY_ORDER_DELIVERED_TITLE);
						desc = await this.utilService.getTranslatedMessageByKey(ResponseMessage.USER_NOTIFY_ORDER_DELIVERED_DESC);
						desc = desc.replace('${orderID}', orderDetail.orderID);
						const orders = await Promise.all([
							this.cartService.getCartById(orderStatusUpdate.cartId),
							this.businessService.getBusinessDetail()
						]);
						this.userService.increaseOrderDelivered(user._id);
						this.userService.increaseOrderPurchased(orderDetail.userId);
						this.emailService.sendEmailOrderDelivered(orderDetail, orders[0], orders[1]);
					}
					if (userDetail && userDetail.playerId) this.pushService.sendNotificationToUser(userDetail.playerId, title, desc);
				}
				let products = await this.cartService.getCartByIdOnlyProducts(orderDetail.cartId);
				products.productIds.map(async c =>
					await this.cartService.addProductInOrdersForRating({ userId: userDetail._id, productId: c })
				);
				return this.utilService.successResponseMsg(ResponseMessage.ORDER_STATUS_UPDATED);
			}
			this.utilService.badRequest(ResponseMessage.SOMETHING_WENT_WRONG);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	// ########################################################### ADMIN ###########################################################
	@Get('/admin/list')
	@ApiOperation({ title: 'Get all order' })
	@ApiImplicitQuery({ name: "orderStatus", description: "Get order details By Order status", required: false, type: String })
	@ApiImplicitQuery({ name: "assignedToId", description: "Get order details By Delivery-Boy Id", required: false, type: String })
	@ApiImplicitQuery({ name: "page", description: "page", required: false, type: Number })
	@ApiImplicitQuery({ name: "limit", description: "limit", required: false, type: Number })
	@ApiResponse({ status: 200, description: 'Return list of order ', type: ResponseOrderForAdmin })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async index(@GetUser() user: UsersDTO, @Query() query: OrderFilterQuery): Promise<CommonResponseModel> {
		this.utilService.validateAdminRole(user);
		try {
			const page = Number(query.page) || AdminSettings.DEFAULT_PAGE_NUMBER;
			const limit = Number(query.limit) || AdminSettings.DEFAULT_PAGE_LIMIT;
			let orderFilter = {};
			if (query.orderStatus) orderFilter["orderStatus"] = query.orderStatus;
			if (query.assignedToId) orderFilter["assignedToId"] = query.assignedToId;
			const orders = await Promise.all([
				this.orderService.getAllOrder(orderFilter, page - 1, limit),
				this.orderService.countAllOrder(orderFilter)
			])
			return this.utilService.successResponseData(orders[0], { total: orders[1] });
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Get('/admin/detail/:orderId')
	@ApiOperation({ title: 'Get order detail by orderId' })
	@ApiResponse({ status: 200, description: 'Success message', type: ResponseAdminOrderDetailsOrderId })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async getOrderDetails(@GetUser() user: UsersDTO, @Param('orderId') orderId: string) {
		this.utilService.validateAdminRole(user);
		try {
			const order = await this.orderService.getOrderDetail(orderId);
			if (!order) this.utilService.pageNotFound();
			let cart = await this.cartService.getCartById(order.cartId);
			let deliveryBoyRating = await this.deliveryBoyRatingsService.getDeliveryBoyRating(orderId)
			delete order.cartId;
			return this.utilService.successResponseData({ order: order, cart: cart, deliveryBoyRating: deliveryBoyRating });
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Put('/admin/status-update/:orderId')
	@ApiOperation({ title: 'Update order status' })
	@ApiResponse({ status: 200, description: 'Success message', type: ResponseSuccessMessage })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async updateOrderStatus(@GetUser() user: UsersDTO, @Param('orderId') orderId: string, @Body() orderData: OrderStatusDTO): Promise<CommonResponseModel> {
		this.utilService.validateAdminRole(user);
		try {
			const order = await this.orderService.getOrderDetail(orderId);
			if (!order) this.utilService.badRequest(ResponseMessage.ORDER_NOT_FOUND);

			if (!(orderData.status == OrderStatusType.CONFIRMED || orderData.status == OrderStatusType.CANCELLED))
				this.utilService.badRequest(ResponseMessage.ORDER_STATUS_INVALID);

			if (orderData.status == OrderStatusType.CONFIRMED) {
				await this.orderService.orderStatusUpdate(orderId, orderData.status);
			} else if (orderData.status == OrderStatusType.CANCELLED) {
				let amountRefund = order.grandTotal;
				if (order.paymentType === PaymentMethod.COD && order.isWalletUsed && order.usedWalletAmount) amountRefund = order.usedWalletAmount;
				else if (order.paymentType === PaymentMethod.STRIPE) amountRefund = order.grandTotal + order.usedWalletAmount;

				await this.orderService.orderCancelByAdmin(orderId, amountRefund);
				if (amountRefund !== 0) {
					let wallet: WalletSaveDTO = {
						userId: order.userId,
						amount: amountRefund,
						transactionType: WalletTransactionType.ORDER_CANCELLED,
						orderId: order._id,
						orderID: order.orderID
					}

					await Promise.all([
						this.walletService.cancelOrder(wallet),
						this.userService.updateWallet(order.userId, amountRefund)
					]);
				}
				const userCart = await this.cartService.getCartById(order.cartId);
				const products = await this.productService.getProductByIds(userCart.productIds);

				for (let prods of userCart.products) {
					const productIndex = await products.findIndex(val => val._id.toString() == prods.productId.toString());
					const varientIndex = await products[productIndex].variant.findIndex(val => val.unit == prods.unit);
					if (products[productIndex].variant[varientIndex].productStock === 0) {
						await this.productOutOfStockService.deleteOutOfStock(products[productIndex]._id);
					}
					products[productIndex].variant[varientIndex].productStock += prods.quantity;
					await this.productService.updateProductStock(products[productIndex]._id, products[productIndex].variant[varientIndex]);
				}
				this.userService.descreaseOrderPurchased(order.userId);
			}

			const userDetail = await this.userService.getUserById(order.userId);
			if (userDetail && userDetail.playerId) {
				let title = '', desc = '';
				if (orderData.status === OrderStatusType.CONFIRMED) {
					title = await this.utilService.getTranslatedMessageByKey(ResponseMessage.USER_NOTIFY_ORDER_CONFIRMED_TITLE);
					desc = await this.utilService.getTranslatedMessageByKey(ResponseMessage.USER_NOTIFY_ORDER_CONFIRMED_DESC);
					desc = desc.replace('${orderID}', order.orderID);
				} else if (orderData.status === OrderStatusType.CANCELLED) {
					title = await this.utilService.getTranslatedMessageByKey(ResponseMessage.USER_NOTIFY_ORDER_CANCELLED_TITLE);
					desc = await this.utilService.getTranslatedMessageByKey(ResponseMessage.USER_NOTIFY_ORDER_CANCELLED_DESC);
					desc = desc.replace('${orderID}', order.orderID);
				}
				this.pushService.sendNotificationToUser(userDetail.playerId, title, desc);
			}
			let products = await this.cartService.getCartByIdOnlyProducts(order.cartId);
			products.productIds.map(async c =>
				await this.cartService.addProductInOrdersForRating({ userId: userDetail._id, productId: c })
			);
			return this.utilService.successResponseMsg(ResponseMessage.ORDER_UPDATED);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Put('/admin/assign/delivery-boy/:orderId')
	@ApiOperation({ title: 'Order assign to delivery boy' })
	@ApiResponse({ status: 200, description: 'Success message', type: ResponseSuccessMessage })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async assignOrder(@GetUser() user: UsersDTO, @Param('orderId') orderId: string, @Body() assignData: AssignOrderDTO): Promise<CommonResponseModel> {
		this.utilService.validateAdminRole(user);
		try {
			const orderDetail = await this.orderService.getOrderDetail(orderId);
			if (!orderDetail) this.utilService.badRequest(ResponseMessage.ORDER_NOT_FOUND);
			if (orderDetail.isOrderAssigned) this.utilService.badRequest(ResponseMessage.ORDER_ALREADY_ASSIGNED);

			const boyDetail = await this.userService.getUserById(assignData.deliveryBoyId);
			if (!boyDetail) this.utilService.badRequest(ResponseMessage.DELIVERY_BOY_NOT_FOUND);

			const assignedToName = `${boyDetail.firstName} ${boyDetail.lastName}`;
			let assignOrderUpdate = { isOrderAssigned: true, isAcceptedByDeliveryBoy: false, assignedToId: boyDetail._id, assignedToName: assignedToName };

			await this.orderService.orderAssignToDelivery(orderId, assignOrderUpdate);
			if (boyDetail && boyDetail.playerId) {
				let title = '', desc = '';
				if (orderDetail.orderStatus === OrderStatusType.CONFIRMED) {
					title = await this.utilService.getTranslatedMessageByKey(ResponseMessage.DELIVERY_BOY_NOTIFY_ORDER_ASSIGNED_TITLE);
					desc = await this.utilService.getTranslatedMessageByKey(ResponseMessage.DELIVERY_BOY_NOTIFY_ORDER_ASSIGNED_DESC);
					desc = desc.replace('${orderID}', orderDetail.orderID);
					this.pushService.sendNotificationToDeliveryBoy(boyDetail.playerId, title, desc);

				}
			}
			let deliveryBoyNotification = {
				deliveryBoyId: boyDetail._id,
				orderId: orderDetail._id,
				orderID: orderDetail.orderID,
				user: orderDetail.user,
				address: orderDetail.address,
				deliveryDate: orderDetail.deliveryDate,
				deliveryTime: orderDetail.deliveryTime
			}
			this.socketService.newOrderForDeliveryBoy(deliveryBoyNotification);
			return this.utilService.successResponseMsg(ResponseMessage.ORDER_ASSIGNED_TO_DELIVERY_BOY);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Get('/admin/order-status-type/list')
	@ApiOperation({ title: 'Get all order status type for dropdown' })
	@ApiResponse({ status: 200, description: 'Return list of order status type', type: ResponseStatusList })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async getOrderStatusTypeList(@GetUser() user: UsersDTO): Promise<CommonResponseModel> {
		this.utilService.validateAdminRole(user);
		try {
			const orderStatusTypeList = await this.orderService.getOrderStatusTypeList();
			return this.utilService.successResponseData(orderStatusTypeList);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Get('/admin/charts')
	@ApiOperation({ title: 'Get chart data for graph' })
	@ApiResponse({ status: 200, description: 'Return chart data', type: ResponseChardOrderDTO })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async oderGraph(@GetUser() user: UsersDTO,): Promise<CommonResponseModel> {
		this.utilService.validateAdminRole(user);
		try {
			const list = await Promise.all([
				this.orderService.getOrdersPriceInLast7Days(),
				this.orderService.getTotalOrderAmdSum(),
				this.productService.countAllProduct(),
				this.categoryService.countAllCategory(null)
			])
			let chartData = list[0];
			const labels = chartData.map(c => { return c._id.date + '-' + c._id.month + '-' + c._id.year });
			const data = chartData.map(c => c.data);
			const result = {
				graph: { labels: labels, data: data },
				totalOrder: list[1].totalOrder,
				totalPrice: list[1].totalPrice,
				totalProduct: list[2],
				totalCategory: list[3]
			}
			return this.utilService.successResponseData(result);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

	@Get('/admin/invoice/:orderId')
	@ApiOperation({ title: 'Get pdf invoice' })
	@ApiResponse({ status: 200, description: 'Return pdf invoice' })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	public async invoiceDownload(@GetUser() user: UsersDTO, @Res() res, @Param('orderId') orderId: string, @Query('token') token: string) {
		try {
			const order = await this.orderService.getOrderDetailByToken(orderId, token);
			if (!order) this.utilService.pageNotFound();
			const cartBusiness = await Promise.all([
				this.cartService.getCartById(order.cartId),
				this.businessService.getBusinessDetail()
			]);
			let cart = cartBusiness[0];
			let business = cartBusiness[1];
			delete order.cartId;
			return res.sendFile(await this.emailService.createInvoice(order, cart, business));
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}
}
