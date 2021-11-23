import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartModule } from '../cart/cart.module';
import { CategoryModule } from '../categories/categories.module';
import { BannerModule } from '../banner/banner.module';
import { DealModule } from '../deals/deals.module';
import { FavouritesModule } from '../favourites/favourites.module';
import { RatingModule } from '../rating/rating.module';
import { SubCategoryModule } from '../sub-categories/sub-categories.module';
import { UnitController } from './units.controller';
import { UnitSchema } from './units.model';
import { UnitService } from './units.service';
import { ExcelService } from '../utils/excel.service';
import { ProductOutOfStockModule } from '../product-out-of-stock/product-out-of-stock.module';
import { ProductModule } from '../products/products.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Unit', schema: UnitSchema }]),
		forwardRef(() => ProductModule),
		forwardRef(() => CartModule),
		forwardRef(() => CategoryModule),
		forwardRef(() => DealModule),
		FavouritesModule,
		forwardRef(() => RatingModule),
		forwardRef(() => SubCategoryModule),
		forwardRef(() => ProductOutOfStockModule)
	],
	controllers: [UnitController],
	providers: [UnitService, ExcelService],
	exports: [UnitService, MongooseModule]
})

export class UnitModule {
}
