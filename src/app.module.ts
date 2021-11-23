import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { CategoryModule } from './categories/categories.module';
import { DealModule } from './deals/deals.module';
import { ProductModule } from './products/products.module';
import { AddressModule } from './address/address.module';
import { FavouritesModule } from './favourites/favourites.module';
import { OrderModule } from './order/order.module';
import { CouponsModule } from './coupons/coupons.module';
import { CartModule } from './cart/cart.module';
import { RatingModule } from './rating/rating.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AppController } from './app.controller';
import { SettingModule } from './settings/settings.module';
import { BannerModule } from './banner/banner.module';
import { ChatModule } from './chat/chat.module';
import { BusinessModule } from './business/business.module';
import { SubCategoryModule } from './sub-categories/sub-categories.module';
import { SequenceModule } from './sequence/sequence.module';
import { LanguageModule } from './language/language.module';
import { RequestInterceptor } from './request.interceptor';
import { UtilService } from './utils/util.service';
import { CurrencyService } from './utils/currency.service'
import { WalletModule } from './wallet/wallet.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './exceptions.filter';
import { PageModule } from './pages/pages.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AppGateway } from './app.gateway';
import { JwtStrategy } from './utils/jwt.strategy';
import { UploadService } from './utils/upload.service';
import { ProductOutOfStockModule } from './product-out-of-stock/product-out-of-stock.module';
import { DeliveryBoyRatingsModule } from './delivery-boy-ratings/delivery-boy-ratings.module';
import { DeviceSettingsModule } from './device-settings/device-settings.module';
import { PointOfSaleController } from './point-of-sale/point-of-sale.controller';
import { PointOfSaleService } from './point-of-sale/point-of-sale.service';
import { PointOfSaleModule } from './point-of-sale/point-of-sale.module';
import { WebexPaymentsModule } from './webex-payments/webex-payments.module';
import * as dotenv from 'dotenv';
import { UnitModule } from './units/units.module';
dotenv.config();

@Global()
@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: () => ({
				uri: (process.env.NODE_ENV == 'production') ? process.env.MONGO_DB_URL_PRODUCTION : process.env.MONGO_DB_URL_STAGING,
				useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true
			}),
		}),
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.register({ secret: process.env.SECRET, signOptions: { expiresIn: '3h' } }),
		UsersModule,
		CategoryModule,
		DealModule,
		ProductModule,
		AddressModule,
		FavouritesModule,
		OrderModule,
		CouponsModule,
		CartModule,
		RatingModule,
		NotificationsModule,
		SettingModule,
		BannerModule,
		BusinessModule,
		SubCategoryModule,
		ChatModule,
		SequenceModule,
		LanguageModule,
		WalletModule,
		PageModule,
		ProductOutOfStockModule,
		DeliveryBoyRatingsModule,
		DeviceSettingsModule,
		PointOfSaleModule,
		UnitModule,
		WebexPaymentsModule
	],
	controllers: [AppController, PointOfSaleController],
	providers: [
		AppGateway,
		JwtStrategy,
		UploadService,
		UtilService,
		CurrencyService,
		{
			provide: APP_INTERCEPTOR,
			useClass: RequestInterceptor
		},
		{
			provide: APP_FILTER,
			useClass: AllExceptionsFilter,
		},
		PointOfSaleService
	],
	exports: [
		AppGateway,
		UsersModule,
		MongooseModule,
		PassportModule,
		JwtModule,
		JwtStrategy,
		UploadService,
		UtilService,
		CurrencyService
	]
})

export class AppModule {

}
