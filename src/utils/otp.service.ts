import { Injectable } from '@nestjs/common';
import { TwilioResponseDTO, ResponseMessage } from './app.model';

const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiInstance = new SibApiV3Sdk.TransactionalSMSApi();
let sendTransacSms = new SibApiV3Sdk.SendTransacSms();

const request = require('request');
var client;
@Injectable()
export class OtpService {
	constructor() {
		if (process.env.USE_SENDINBLUE == 'false') {
			if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
			else console.log("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN is not set");
		} else {
			if (process.env.SENDINBLUE_API_KEY_FOR_OTP === '')
				console.log(`SENDINBLUE_API_KEY_FOR_OTP is not set`);

			let apiKey = defaultClient.authentications['api-key'];
			apiKey.apiKey = process.env.SENDINBLUE_API_KEY_FOR_OTP;
		}
	}

	public async sendOTP(mobileNumber: string, otp?: string): Promise<TwilioResponseDTO> {
		try {
			otp = `${otp} is secret otp for verification. Please don't share it with anyone.`

			if (process.env.USE_SENDINBLUE === 'true') {

				if(mobileNumber.substring(0, 1) == "0"){
					mobileNumber=mobileNumber.substring(1);
				}
				sendTransacSms = {
					"sender":"TeaTalkProd",
					"recipient":mobileNumber,
					"content":otp
				};
				
				try{
					let response = await apiInstance.sendTransacSms(sendTransacSms);
					console.log('API called successfully. Returned data: ' + JSON.stringify(response));
					if(response){
						let res = { isError: false, data: response };
						return res;
					}
				}catch(error){
					console.error(error);
					let res = { isError: true, data: error };
				  	return res;
				}
			} else {
				let otpData = await client.verify.services(process.env.TWILIO_SID).verifications.create({ to: mobileNumber, channel: 'sms' });
				if (otpData && otpData.sid) {
					return {
						isError: false,
						data: otpData.sid
					}
				} else {
					return {
						isError: true,
						data: ResponseMessage.SOMETHING_WENT_WRONG
					}
				}
			}
		}
		catch (e) {
			console.log("Otp Catch Error", e)
			return {
				isError: true,
				data: e.message
			}
		}
	}

	public async verifyOTP(otp: string, verificationSid: string): Promise<TwilioResponseDTO> {
		try {
			let otpData = await client.verify.services(process.env.TWILIO_SID).verificationChecks.create({ verificationSid: verificationSid, code: otp });
			if (otpData && otpData.status == 'approved') {
				return {
					isError: false,
					data: otpData.sid
				}
			} else {
				return {
					isError: true,
					data: "Invalid otp"
				}
			}
		} catch (e) {
			console.log("Twilio Verify Otp Catch Error", e)
			return {
				isError: true,
				data: e.message
			}
		}
	}
}