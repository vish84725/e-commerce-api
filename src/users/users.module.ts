import { Module, } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './users.controller';
import { UserSchema } from './users.model';
import { UserService } from './users.service';
import { AuthService } from '../utils/auth.service';
import { EmailService } from '../utils/email.service';
import { OtpService } from '../utils/otp.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])
	],
	controllers: [UserController],
	providers: [UserService, AuthService, EmailService, OtpService],
	exports: [UserService, MongooseModule]
})

export class UsersModule {
}
