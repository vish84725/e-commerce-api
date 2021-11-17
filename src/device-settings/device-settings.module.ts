import { Module } from '@nestjs/common';
import { DeviceSettingsController } from './device-settings.controller';
import { DeviceSettingsService } from './device-settings.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceSettingsSchema } from './device-settings.model';

@Module({
  controllers: [DeviceSettingsController],
  providers: [DeviceSettingsService],
  imports: [
		MongooseModule.forFeature([{ name: 'DeviceSettings', schema: DeviceSettingsSchema }]),
	],
	exports: [DeviceSettingsService, MongooseModule]
})
export class DeviceSettingsModule {}
