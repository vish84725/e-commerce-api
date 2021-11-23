import * as mongoose from 'mongoose';
import { ArrayMinSize, IsBoolean, IsEmpty, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, Max, Min, ValidateNested, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer/decorators';

export const UnitSchema = new mongoose.Schema({
	name: { type: String,required:true },
	description: { type: String },
    numberOfBaseUnits : {type: Number, required:true},
    enable: { type: Boolean, default: true }
}, {
	timestamps: true
});

export class UnitsSaveDTO {

	@IsString()
	@ApiModelProperty()
	name: string;

    @IsString()
	@ApiModelProperty()
	@IsOptional()
	description: string;

    @IsNumber()
	@ApiModelProperty()
	numberOfBaseUnits: number;

}

export class UnitsDTO {

	@IsOptional()
	_id: string;


	@IsString()
	@ApiModelProperty()
	name: string;

    @IsString()
	@ApiModelProperty()
	@IsOptional()
	description: string;

    @IsNumber()
	@ApiModelProperty()
	numberOfBaseUnits: number;
}


//This is For Units List 
export class UnitsResponseDTO {
	@ApiModelProperty()
	@IsString()
	response_code: string;

	@ApiModelProperty({ isArray: true })
	response_data: UnitsDTO;

}

