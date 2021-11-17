import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartDataModel, UserCartDTO } from './cart.model';
import { UtilService } from '../utils/util.service';
import { ResponseMessage } from '../utils/app.model';
import { DeliveryType } from '../settings/settings.model';
import { NotificationType } from '../notifications/notifications.model';
import { CouponService } from '../coupons/coupons.service';
import { CouponType } from '../coupons/coupons.model';


@Injectable()
export class CartService {
	constructor(
		@InjectModel('Cart') private readonly cartModel: Model<any>,
		@InjectModel('OrderProducts') private readonly orderProductModel: Model<any>,
		private utilService: UtilService,
		private couponService: CouponService,
	) {
	}

	public async getMyCart(userId: string): Promise<UserCartDTO> {
		const cart = await this.cartModel.findOne({ userId: userId, isOrderLinked: false }, '-_id -userId -createdAt -updatedAt -__v');
		return cart;
	}

	public async getCartByUserId(id: string): Promise<any> {
		const cartInfo = await this.cartModel.findOne({ userId: id, isOrderLinked: false });
		return cartInfo;
	}

	public async getCartById(id: string): Promise<UserCartDTO> {
		const cart = await this.cartModel.findOne({ _id: id }, '-_id -userId -createdAt -updatedAt -__v');
		return cart;
	}

	public async getCartByIdOnlyProducts(id: string): Promise<UserCartDTO> {
		const cart = await this.cartModel.findOne({ _id: id }, 'productIds');
		return cart;
	}

	public async addProductInOrdersForRating(productOrderData): Promise<any> {
		return await this.orderProductModel.updateOne({ userId: productOrderData.userId, productId: productOrderData.productId }, productOrderData, { upsert: true });
	}

	public async isUserBoughtProduct(userId: string, productId: string): Promise<number> {
		return await this.orderProductModel.findOne({ userId: userId, productId: productId });
	}

	public async findProductsById(userId: string, productIds): Promise<any> {
		return await this.orderProductModel.find({ userId: userId, productId: { $in: productIds } });
	}

	public async updateRating(userId: string, productId: string, rating: number): Promise<any> {
		return await this.orderProductModel.updateOne({ userId: userId, productId: productId }, { isRated: true, rating: rating });
	}

	public async checkOutOfStockOrLeft(product, cart): Promise<any> {
		let errArr;
		if (product && product.variant && product.variant.length) {
			const variant = product.variant.find(val => val.unit == cart["unit"]);
			if (variant) {
				if (variant.enable && variant.productStock < cart.quantity) {
					const resMsg = await this.utilService.getTranslatedMessageByKey(ResponseMessage.CART_ITEM_LEFT);
					errArr = `${product.title} - ${variant.unit} - ${variant.productStock} ${resMsg}`;
				}
			} else {
				const resMsg = await this.utilService.getTranslatedMessageByKey(ResponseMessage.CART_ITEM_OUT_OF_STOCK);
				errArr = `${product.title}  ${resMsg}`;
			}
		} else {
			const resMsg = await this.utilService.getTranslatedMessageByKey(ResponseMessage.CART_ITEM_OUT_OF_STOCK);
			errArr = `${product.title}  ${resMsg}`;
		}
		return errArr;
	}

	public async verifyCart(products, carts): Promise<any> {
		let cartArr = [], productArr = [], productOutOfStock = [];
		for (let cartItem of carts.products) {
			const productIndex = await products.findIndex(val => val._id.toString() == cartItem.productId.toString());
			if (productIndex !== -1) {
				if (products[productIndex].variant.length) {
					if (products[productIndex].status == false) {
						const resMsg = await this.utilService.getTranslatedMessageByKey(ResponseMessage.PRODUCT_DISABLED_NOT_AVAILABLE_FOR_DELIVERY);
						let errMsg = `${products[productIndex].title}  ${resMsg}`
						cartArr.push(errMsg);
					} else {
						const varientIndex = await products[productIndex].variant.findIndex(val => val.unit == cartItem.unit);
						if (varientIndex !== -1) {
							if (products[productIndex].variant[varientIndex].enable && products[productIndex].variant[varientIndex].productStock < cartItem.quantity) {
								if (products[productIndex].variant[varientIndex].productStock < 1) {
									const resMsg = await this.utilService.getTranslatedMessageByKey(ResponseMessage.CART_ITEM_OUT_OF_STOCK);
									let errMsg = `${products[productIndex].title} - ${products[productIndex].variant[varientIndex].unit} ${resMsg}`
									cartArr.push(errMsg);
								}
								const resMsg = await this.utilService.getTranslatedMessageByKey(ResponseMessage.CART_ITEM_LEFT);
								let errMsg = `${products[productIndex].title} - ${products[productIndex].variant[varientIndex].unit} - ${products[productIndex].variant[varientIndex].productStock} ${resMsg}`;
								cartArr.push(errMsg);
							} else {
								products[productIndex].variant[varientIndex].productStock = products[productIndex].variant[varientIndex].productStock - cartItem.quantity;
								productArr.push(products[productIndex])
								if (products[productIndex].variant[varientIndex].productStock === 0) {
									productOutOfStock.push({ productId: products[productIndex]._id, title: products[productIndex].title, unit: products[productIndex].variant[varientIndex].unit, notifyType: NotificationType.PRODUCT_OUT_OF_STOCK });
								}
							}
						}
					}
				}
			}
		}
		return { cartArr, productArr, productOutOfStock }
	}

	public calculateProductPrice(product, cart) {
		let price = 0, unit, dealAmount = 0, productTotal = 0;
		const variant = product.variant.find(val => val.unit == cart["unit"]);
		if (variant) {
			price = variant['price'];
			unit = variant['unit'];
		}
		productTotal = Number(price) * Number(cart.quantity);
		if (product.isDealAvailable) {
			dealAmount = Number(product.dealPercent * price) / 100;
			productTotal = (price - dealAmount) * cart.quantity;
		}
		let cartInfo;
		if (product.productImages.length > 0) {
			cartInfo = {
				productId: product._id.toString(),
				productName: product.title,
				unit: unit,
				price: price,
				quantity: cart.quantity,
				productTotal: productTotal,
				imageUrl: product.productImages[0].imageUrl,
				filePath: product.productImages[0].filePath,
				dealAmount: dealAmount,
				dealPercent: product.dealPercent,
				dealTotalAmount: dealAmount * cart.quantity,
				isDealAvailable: product.isDealAvailable,
				productImages: product.productImages
			};
		} else {
			cartInfo = {
				productId: product._id.toString(),
				productName: product.title,
				unit: unit,
				price: price,
				quantity: cart.quantity,
				productTotal: productTotal,
				imageUrl: product.imageUrl,
				filePath: product.filePath,
				dealAmount: dealAmount,
				dealPercent: product.dealPercent,
				dealTotalAmount: dealAmount * cart.quantity,
				isDealAvailable: product.isDealAvailable,
				productImages: []
			};
		}
		return cartInfo;
	}

	public async calculateTotal(cartInfo, deliveryTax?, address?) {
		cartInfo.subTotal = 0;
		cartInfo.products.forEach(cart => { cartInfo.subTotal += Number((cart.productTotal).toFixed(2)); });

		if (deliveryTax) {
			cartInfo.tax = this.taxCalculation(cartInfo, deliveryTax);
			cartInfo.taxInfo = { taxName: deliveryTax.taxName, amount: deliveryTax.taxAmount };
		}

		if (address) {
			cartInfo.deliveryCharges = await this.calculateDeliveryCharge(deliveryTax, cartInfo.subTotal, address);
		}

		let couponDiscount = 0;
		if (cartInfo.couponCode) {
			const coupon = await this.couponService.getCouponDetailByCode(cartInfo.couponCode);
			if (!coupon) this.utilService.badRequest(ResponseMessage.COUPON_NOT_FOUND);
			const currentDate = Date.now();

			if (coupon.startDate < currentDate && coupon.expiryDate > currentDate) {
				if (coupon.couponType === CouponType.PERCENTAGE) couponDiscount = Number((cartInfo.subTotal * (coupon.offerValue / 100)).toFixed(2));
				else if (coupon.couponType === CouponType.AMOUNT) couponDiscount = Number(coupon.offerValue);
			}
		}
		cartInfo.couponAmount = couponDiscount || 0;
		cartInfo.walletAmount = cartInfo.walletAmount || 0;
		cartInfo.grandTotal = Number((cartInfo.subTotal + cartInfo.deliveryCharges + cartInfo.tax - cartInfo.couponAmount - cartInfo.walletAmount).toFixed(2));
		return cartInfo;
	}

	public async getCartDetail(cartId: string): Promise<UserCartDTO> {
		const cartInfo = await this.cartModel.findById(cartId);
		return cartInfo;
	}

	public async saveCart(cartInfo): Promise<UserCartDTO> {
		const cart = await this.cartModel.create(cartInfo);
		return cart;
	}

	public async updateCart(cartId, cartInfo): Promise<UserCartDTO> {
		const cart = await this.cartModel.findByIdAndUpdate(cartId, cartInfo, { new: true });
		return cart;
	}

	public async updateAddressInCart(cartId, cartInfo): Promise<UserCartDTO> {
		const cart = await this.cartModel.findByIdAndUpdate(cartId, cartInfo, { fields: { deliveryCharges: 1, grandTotal: 1, deliveryAddress: 1 }, new: true });
		return cart;
	}

	public taxCalculation(cart: CartDataModel, deliveryAndTaxSetting) {
		let tax = Number((cart.subTotal * deliveryAndTaxSetting.taxAmount / 100).toFixed(2));
		return tax;
	}

	public async deleteCart(cartId): Promise<UserCartDTO> {
		const cart = await this.cartModel.findByIdAndDelete(cartId);
		return cart;
	}

	public async cartOrderUnlink(cartId: string): Promise<Boolean> {
		await this.cartModel.findByIdAndUpdate(cartId, { isOrderLinked: true });
		return true;
	}

	public async calculateDeliveryCharge(deliveryTax, subTotal, address) {
		let deliveryCharges = 0;
		if (deliveryTax.deliveryType === DeliveryType.FLEXIBLE) {
			const storeLocation = { latitude: deliveryTax.location.latitude, longitude: deliveryTax.location.longitude };
			const userLocation = { latitude: address.location.latitude, longitude: address.location.longitude }
			const preciseDistance = this.utilService.calculateDistance(userLocation, storeLocation);
			deliveryCharges = Number((deliveryTax.deliveryChargePerKm * preciseDistance).toFixed(2));
			if (deliveryTax.minOrderAmountForFree && subTotal >= deliveryTax.minOrderAmountForFree) deliveryCharges = 0;
			deliveryCharges = Number(deliveryCharges);
		} else if (deliveryTax.deliveryType === DeliveryType.FIXED) {
			deliveryCharges = Number((deliveryTax.fixedDeliveryCharges).toFixed(2));
			if (deliveryTax.minOrderAmountForFree && subTotal >= deliveryTax.minOrderAmountForFree) deliveryCharges = 0;
		}
		return deliveryCharges;
	}
}