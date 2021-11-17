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

export const DeviceSettingsSchema = new mongoose.Schema({
	deviceType: { type: String },
	version: { type: String }
})

export class DeviceSettingsDTO {
	@ApiModelProperty()
	_id: string;

	@ApiModelProperty()
	deviceType: string;

	@ApiModelProperty()
	version: string;
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
