import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeviceSettingsDTO } from './device-settings.model';

@Injectable()
export class DeviceSettingsService {
    constructor(
		@InjectModel('DeviceSettings') private readonly deviceSettingsModel: Model<any>
	) {
    }
    
    // get device settings for details
	public async getSettingsForDevice(deviceId: String): Promise<DeviceSettingsDTO> {
        console.log(deviceId);
		const deviceSetting = await this.deviceSettingsModel.findById(deviceId);
		return deviceSetting;
	}
}
