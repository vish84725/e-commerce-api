import { ApiBearerAuth, ApiUseTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeviceSettingsService } from './device-settings.service';
import { UtilService } from '../utils/util.service';
import { Controller, Headers, UseGuards, Post, Body, Delete, Param, Get, Put, Res } from '@nestjs/common';
import { ResponseDeviceSettingsDetails, DeviceSettingsDTO } from './device-settings.model';
import { ResponseErrorMessage, CommonResponseModel } from '../utils/app.model';
import { UsersDTO } from '../users/users.model';
import { GetUser } from '../utils/jwt.strategy';

@Controller('device-settings')
@ApiUseTags('device-settings')
export class DeviceSettingsController {
    constructor(
		private deviceSettingService: DeviceSettingsService,
		private utilService: UtilService
	) {
    }
    
    @Get('/:deviceId')
	@ApiOperation({ title: 'Get device settings detail for device' })
	@ApiResponse({ status: 200, description: 'Return device settings detail', type: ResponseDeviceSettingsDetails })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	public async getDeviceSettings(@GetUser() user: UsersDTO, @Param('deviceId') deviceId: string): Promise<CommonResponseModel> {
		try {
			console.log('hit');
			const resData = await this.deviceSettingService.getSettingsForDevice(deviceId);
			return this.utilService.successResponseData(resData);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}
}
