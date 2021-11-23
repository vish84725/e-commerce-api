import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UnitsDTO, UnitsSaveDTO } from './units.model';

@Injectable()
export class UnitService {
	constructor(
		@InjectModel('Unit') private readonly unitModel: Model<any>
	) { }

    // creates unit
	public async createUnit(unitData: UnitsSaveDTO): Promise<UnitsDTO> {
		const product = await this.unitModel.create(unitData);
		return product;
	}

    // find unit by name
	public async findUnitByName(name: String) {
		const response = await this.unitModel.findOne({ name: name });
		return response;
	}

    // get all units
    public async getAllUnits(): Promise<Array<any>> {
		const units = await this.unitModel.find({enable:true});
		return units;
	}
}