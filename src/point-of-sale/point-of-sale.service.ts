import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types, Mongoose } from 'mongoose';
import { PointOfSalesDTO } from './point-of-sale.model';
import { ProductsDTO, VariantDTO } from '../products/products.model';

const DefaultValues = {
    longValue: { $literal: 0 },
    intValue: { $literal: 0 },
    doubleValue: { $literal: 0.00 },
    stringValue: "NOTMAPPED",
    boolValue: { $literal: false },
    decimalValue: { $literal: 0.00 }
};

const PrinterType = {
    KOT: { $literal: 0 },
    BOT: { $literal: 1 }
}

@Injectable()
export class PointOfSaleService {
    constructor(
        @InjectModel('PointOfSale') private readonly pointOfSaleModel: Model<any>,
        @InjectModel('Product') private readonly productModel: Model<any>,
        @InjectModel('Category') private readonly categoryModel: Model<any>,
        @InjectModel('SubCategory') private readonly subCategoryModel: Model<any>
    ) {
    }

    //get all producs stock details
    public async getAllProductsStock(): Promise<Array<any>> {
        //const products = await this.productModel.find({}, {productDetail: "$",});
        const products = await this.productModel.aggregate([
            {
                "$project": {
                    "_id": 0,
                    "productId": "$_id",
                    "productDetail": "$variant"
                }
            }
        ])
        return products;
    }

    //get product by Id with stock details
    public async getProductStock(productId): Promise<any> {
        const products = await this.productModel.aggregate([
            {
                "$project": {
                    "_id": 0,
                    "productId": "$_id",
                    "productDetail": "$variant"
                }
            },
            {
                "$match": { productId: Types.ObjectId(productId) }
            }
        ])
        return products;
    }

    //get All Products
    public async getAllProducts(page, limit, lastModifiedDate?): Promise<Array<any>> {
        let predicate = {};
        if (lastModifiedDate) {
            predicate = {
                "$match": {
                    $and: [
                        { isSyncedWithPOS: true },
                        { updatedAt: { $gt: new Date(lastModifiedDate) } }
                    ]
                }
            }
        } else {
            predicate = { "$match": { isSyncedWithPOS: false } }
        }

        const skip = page * limit;
        const products = await this.productModel.aggregate([
            predicate,
            {
                "$project": {
                    "_id": 0,
                    "InvProductMasterID": DefaultValues.longValue,
                    "ProductCode": "_id",
                    "BarCode": "$barcode",
                    "BarCode2": DefaultValues.stringValue,
                    "ReferenceCode1": "$_id",
                    "ReferenceCode2": DefaultValues.stringValue,
                    "ReferenceCode3": DefaultValues.stringValue,
                    "ProductName": "$title",
                    "NameOnInvoice": "$title",
                    "DepartmentID": "$categoryId",
                    "CategoryID": "$subCategoryId",
                    "SubCategory2ID": DefaultValues.longValue,
                    "InvProductTypeID": DefaultValues.longValue,
                    "InvKitchenBarID": DefaultValues.intValue,
                    "SupplierID": DefaultValues.longValue,
                    "UnitOfMeasureID": "$sku", //mapped value instead of id 
                    "PackSize": DefaultValues.stringValue,
                    "ProductImage": "$imageUrl", //mapped url instead of byte array
                    "CostPrice": DefaultValues.decimalValue,
                    "OrderPrice": DefaultValues.decimalValue,
                    "AverageCost": DefaultValues.decimalValue,
                    "SellingPrice": { $arrayElemAt: ["$variant.price", 0] },
                    "WholesalePrice": DefaultValues.decimalValue,
                    "MinimumPrice": DefaultValues.decimalValue,
                    "FixedDiscount": DefaultValues.decimalValue,
                    "MaximumDiscount": DefaultValues.decimalValue,
                    "MaximumPrice": DefaultValues.decimalValue,
                    "FixedDiscountPercentage": "$dealPercent",
                    "MaximumDiscountPercentage": DefaultValues.decimalValue,
                    "ReOrderLevel": DefaultValues.decimalValue,
                    "ReOrderQty": DefaultValues.decimalValue,
                    "ReOrderPeriod": DefaultValues.decimalValue,
                    "IsActive": "$status",
                    "IsBatch": DefaultValues.boolValue,
                    "IsPromotion": DefaultValues.boolValue,
                    "IsBundle": DefaultValues.boolValue,
                    "IsFreeIssue": DefaultValues.boolValue,
                    "IsDrayage": DefaultValues.boolValue,
                    "DrayagePercentage": DefaultValues.decimalValue,
                    "IsExpiry": DefaultValues.boolValue,
                    "IsConsignment": DefaultValues.boolValue,
                    "IsCountable": DefaultValues.boolValue,
                    "IsDCS": DefaultValues.boolValue,
                    "DcsID": DefaultValues.boolValue,
                    "IsTax": DefaultValues.boolValue,
                    "IsSerial": DefaultValues.boolValue,
                    "IsNonExchangeable": DefaultValues.boolValue,
                    "IsDelete": DefaultValues.boolValue,
                    "IsTaxIncludePrice": DefaultValues.boolValue,
                    "PackSizeUnitOfMeasureID": DefaultValues.longValue,
                    "Margin": DefaultValues.decimalValue,
                    "WholesaleMargin": DefaultValues.decimalValue,
                    "FixedGP": DefaultValues.decimalValue,
                    "PurchaseLedgerID": DefaultValues.longValue,
                    "SalesLedgerID": DefaultValues.longValue,
                    "OtherPurchaseLedgerID": DefaultValues.longValue,
                    "OtherSalesLedgerID": DefaultValues.longValue,
                    "Remark": DefaultValues.stringValue,
                    "IsWeighted": DefaultValues.boolValue,
                    "WeightPerUnit": DefaultValues.decimalValue,
                    "SeqNo": DefaultValues.intValue,
                    "ReferenceCode4": DefaultValues.stringValue,
                    "ReferenceCode5": DefaultValues.stringValue,
                    "Ispacksize": DefaultValues.boolValue,
                    "Iscommission": "$isCommission",
                    "Isdecimal": DefaultValues.boolValue,
                    "ReferenceCode6": DefaultValues.stringValue,
                    "PackPrice": DefaultValues.decimalValue,
                    "UnderCost": DefaultValues.boolValue,
                    "NameInSinhala": DefaultValues.stringValue,
                    "IsSerialItem": DefaultValues.boolValue,
                    "IsLoyalty": DefaultValues.boolValue,
                    "FixedDiscountPercentageCredit": DefaultValues.decimalValue,
                    "FixedDiscountAmountCredit": DefaultValues.decimalValue,
                    "corporatePrice": DefaultValues.decimalValue,
                    "corporateFixDisAmt": DefaultValues.decimalValue,
                    "corporateFixDisPrec": DefaultValues.decimalValue,
                    "IsWholesale": DefaultValues.boolValue,
                    "PrinterType": PrinterType.BOT,
                    "CommisionAmounts": DefaultValues.decimalValue,
                    "CommisionPct": DefaultValues.decimalValue
                },
            }, {
                "$sort": { "createdAt": 1 },
            }, {
                "$limit": limit + skip,
            }, {
                "$skip": skip
            }
        ]);

        return products;
    }

    //get All Categories
    public async getAllCategories(page, limit, lastModifiedDate?): Promise<Array<any>> {
        const skip = page * limit;
        let predicate = {};
        if (lastModifiedDate) {
            predicate = {
                "$match": {
                    $and: [
                        { isSyncedWithPOS: true },
                        { updatedAt: { $gt: new Date(lastModifiedDate) } }
                    ]
                }
            }
        } else {
            predicate = { "$match": { isSyncedWithPOS: false } }
        }

        const categories = await this.categoryModel.aggregate([
            predicate,
            {
                "$project": {
                    "_id": 0,
                    "InvDepartmentID": DefaultValues.longValue,
                    "DepartmentCode": "$_id",
                    "DepartmentName": "$title",
                    "Remark": "$description",
                    "IsDelete": { $cond: { if: { $eq: ['$status', false] }, then: true, else: false } }//mapped status to is delete
                },
            }, {
                "$sort": { "createdAt": 1 },
            }, {
                "$limit": limit + skip,
            }, {
                "$skip": skip
            }
        ]);

        return categories;
    }

    //get All Sub Categories
    public async getAllSubCategories(page, limit, lastModifiedDate?): Promise<Array<any>> {
        const skip = page * limit;
        let predicate = {};
        if (lastModifiedDate) {
            predicate = {
                "$match": {
                    $and: [
                        { isSyncedWithPOS: true },
                        { updatedAt: { $gt: new Date(lastModifiedDate) } }
                    ]
                }
            }
        } else {
            predicate = { "$match": { isSyncedWithPOS: false } }
        }

        const subCategories = await this.subCategoryModel.aggregate([
            predicate,
            {
                "$project": {
                    "_id": 0,
                    "InvCategoryID": DefaultValues.longValue,
                    "InvDepartmentID": "$categoryId",
                    "CategoryCode": "$_id",
                    "CategoryName": "$title",
                    "Remark": "$description",
                    "IsNonExchangeable": DefaultValues.boolValue,
                    "IsDelete": { $cond: { if: { $eq: ['$status', false] }, then: true, else: false } }//mapped status to is delete
                },
            }, {
                "$sort": { "createdAt": 1 },
            }, {
                "$limit": limit + skip,
            }, {
                "$skip": skip
            }
        ]);

        return subCategories;
    }

    /////////////// SYNCHRONIZATION BUSINESS //////////////////////////

    // update category sync status
    public async updateCategorySyncStatus(categoryId: string): Promise<boolean> {
        try {
            const filter = { _id: Types.ObjectId(categoryId) };
            const update = { isSyncedWithPOS: true };

            const category = await this.categoryModel.findOneAndUpdate(filter, update);
            if (category) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }

    }

    // update sub category sync status
    public async updateSubCategorySyncStatus(subCategoryId: string): Promise<boolean> {
        try {
            const filter = { _id: Types.ObjectId(subCategoryId) };
            const update = { isSyncedWithPOS: true };

            const subCategory = await this.subCategoryModel.findOneAndUpdate(filter, update);
            if (subCategory) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }

    }

    // update product sync status
    public async updateProductSyncStatus(productId: string): Promise<boolean> {
        try {
            const filter = { _id: Types.ObjectId(productId) };
            const update = { isSyncedWithPOS: true };

            const product = await this.productModel.findOneAndUpdate(filter, update);
            if (product) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }

    }

    // creates point of sale
    public async CreateSale(pointOfSaleData: PointOfSalesDTO): Promise<any> {
        let saleType = null;
        let sale = null;
        sale = await this.pointOfSaleModel.create(pointOfSaleData);
        if (pointOfSaleData.Status == 1 && pointOfSaleData.TransStatus == 1 && pointOfSaleData.SaleTypeID == 1 && pointOfSaleData.BillTypeID == 1) {
            if (pointOfSaleData.DocumentID == 1 || pointOfSaleData.DocumentID == 3) {
                saleType = 'sale';
            } else if (pointOfSaleData.DocumentID == 2 || pointOfSaleData.DocumentID == 4) {
                saleType = 'return';
            }

            if (saleType && pointOfSaleData.ProductCode) {
                let productId = Types.ObjectId(pointOfSaleData.ProductCode);
                let product: ProductsDTO = await this.productModel.findById(productId);
                let variantData: VariantDTO[] = product.variant;



                if (variantData && variantData.length > 0) {
                    variantData.forEach(item => {
                        //ToDo: Have to check the ID from the variant for perticular stock product
                        if (saleType == 'sale') {
                            item.productStock = item.productStock - pointOfSaleData.Qty;
                        } else if (saleType == 'return') {
                            item.productStock = item.productStock + pointOfSaleData.Qty;
                        }
                    });

                    const products = await this.productModel.updateOne({ _id: productId }, { variant: variantData });
                }

            }
        }

        return sale;
    }

    //get all point of sales
    public async getAllPointOfSales(page: number, limit: number) {
        const skip = page * limit;
        const sales = await this.pointOfSaleModel.aggregate([
            {
                "$project": {
                    "_id": 1,
                    "Qty": "$Qty",
                    "Descrip": "$Descrip",
                    "BatchNo": "$BatchNo",
                    "Price": "$Price",
                    "Amount": "$Amount",
                    "RecDate": "$RecDate",
                    // "PaymentsReciept": { $arrayElemAt: ["$Payments.Receipt", 0] },
                    // "PaymentsAmount": { $arrayElemAt: ["$Payments.Amount", 0] },
                    // "PaymentsBalance": { $arrayElemAt: ["$Payments.Balance", 0] }
                }
            },
            {
                "$sort": { "RecDate": -1 },
            },
            {
                "$limit": limit + skip,
            },
            {
                "$skip": skip
            }
        ])
        return sales;
    }

    // Count all point of sales
    public async countAllPointOfSales(): Promise<number> {
        return await this.pointOfSaleModel.countDocuments();
    }

    //get payment details by point of sale id
    public async getPointOfSalePayementsById(saleId) {
        return await this.pointOfSaleModel.findOne({ "_id": saleId }, {_id:0, Payments: 1 })
    }
}
