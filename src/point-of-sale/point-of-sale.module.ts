import { Module,forwardRef } from '@nestjs/common';
import { PointOfSaleController } from './point-of-sale.controller';
import { PointOfSaleService } from './point-of-sale.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PointOfSaleSchema } from './point-of-sale.model';
import { ProductModule } from '../products/products.module';
import { CategoryModule } from '../categories/categories.module';
import { SubCategoryModule } from '../sub-categories/sub-categories.module';

@Module({
  controllers: [PointOfSaleController],
  providers: [PointOfSaleService],
  imports: [
        MongooseModule.forFeature([{ name: 'PointOfSale', schema: PointOfSaleSchema }]),
        forwardRef(() => ProductModule),
        forwardRef(() => CategoryModule),
        forwardRef(() => SubCategoryModule),
	],
	exports: [PointOfSaleService, MongooseModule]
})


@Module({})
export class PointOfSaleModule {}
