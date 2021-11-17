import { Injectable, HttpStatus, HttpException, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as geoLib from 'geolib';
import * as uuid from 'uuid/v1';
import { UserRoles, ResponseMessage, AdminQuery, AdminSettings, UserQuery, UserSettings } from './app.model';
import { Promise, Mongoose, Types } from 'mongoose';
import { InsertUpdateQuery } from '../point-of-sale/point-of-sale.model';
let language = "en";
let languageList = [];

@Injectable()
export class UtilService {
	constructor() {
	}

	public validateUserRole(user) {
		if (user.role !== UserRoles.USER) {
			const msg = this.getTranslatedMessage('NOT_FOUND');
			throw new NotFoundException(msg);
		}
	}

	public validateAdminRole(user) {
		if (user.role !== UserRoles.ADMIN) {
			const msg = this.getTranslatedMessage('NOT_FOUND');
			throw new NotFoundException(msg);
		}
	}

	public validateDeliveryBoyRole(user) {
		if (user.role !== UserRoles.DELIVERY_BOY) {
			const msg = this.getTranslatedMessage('NOT_FOUND');
			throw new NotFoundException(msg);
		}
	}

	public validateAllRole(user) {
		if (!(user.role === UserRoles.USER || user.role === UserRoles.DELIVERY_BOY || user.role === UserRoles.ADMIN)) {
			const msg = this.getTranslatedMessage('NOT_FOUND');
			throw new NotFoundException(msg);
		}
	}

	public async successResponseData(responseData, extra?) {
		if (!extra) return await this.res(HttpStatus.OK, responseData);
		let res = await this.res(HttpStatus.OK, responseData);
		for (var key in extra) res[key] = extra[key];
		return res;
	}

	public async successResponseMsg(key) {
		return await this.res(HttpStatus.OK, "", key);
	}

	public async badRequestResponseData(responseData?, extra?) {
		if (!extra) return await this.res(HttpStatus.BAD_REQUEST, responseData);
		let res = await this.res(HttpStatus.BAD_REQUEST, responseData);
		for (var key in extra) res[key] = extra[key];
		return res;
	}

	public async resetContentResponseMsg(key?) {
		return await this.res(HttpStatus.RESET_CONTENT, "", key);
	}

	public errorResponse(e) {
		console.log(e);
		if (e.kind === 'ObjectId' && e.path === '_id') {
			throw new NotFoundException("NOT_FOUND")
		}
		if (e.message && e.message.statusCode == HttpStatus.BAD_REQUEST) {
			throw new BadRequestException(e.message);
		}
		if (e.message && e.message.statusCode == HttpStatus.NOT_FOUND) {
			throw new NotFoundException(e.message.message);
		}
		// if(e.kind === 'ObjectId' && e.path === '_id') {
		//     throw new NotFoundException('NOT_FOUND');
		// } else
		//     throw new NotFoundException("NOT_FOUND")
		//   throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		//return await this.res(HttpStatus.INTERNAL_SERVER_ERROR, "", key);
		//console.log(e.kind);
	}

	public unauthorized() {
		const msg = this.getTranslatedMessage('UNAUTHORIZED');
		throw new UnauthorizedException(msg);
	}

	public badRequest(key?) {
		const msg = this.getTranslatedMessage(key);
		throw new BadRequestException(msg);
	}

	public pageNotFound() {
		const msg = this.getTranslatedMessage('NOT_FOUND');
		throw new NotFoundException(msg);
	}

	public async notFoundResponseMsg(key?) {
		key = key || "NOT_FOUND";
		return await this.res(HttpStatus.NOT_FOUND, "", key);
	}

	public async notFoundResponse(responseData, key?) {
		return await this.res(HttpStatus.NOT_FOUND, responseData);
	}

	public async internalErrorResponseKey(key?) {
		key = key || "INTERNAL_SERVER_ERR";
		return await this.res(HttpStatus.INTERNAL_SERVER_ERROR, "", key);
	}

	public async resetContentResponseKey(key) {
		return await this.res(HttpStatus.RESET_CONTENT, "", key);
	}

	public async resetContentResponseData(responseData) {
		return await this.res(HttpStatus.RESET_CONTENT, responseData);
	}

	public getTranslatedMessage(key) {
		let message = "";
		if (languageList && languageList[language] && languageList[language][key]) {
			message = languageList[language][key];
		} else {
			message = languageList["en"][key];
		}
		return message ? message : key;
	}
	public async getTranslatedMessageByKey(key) {
		let message = "";
		if (languageList && languageList[language] && languageList[language][key]) {
			message = languageList[language][key];
		} else {
			message = languageList["en"][key];
		}
		message = message || key;
		return message;
	}

	private async res(responseCode, responseData?, key?) {
		let message = "";
		if (responseData) {
			message = responseData;
		} else {
			if (languageList && languageList[language] && languageList[language][key]) {
				message = languageList[language][key];
			} else {
				message = languageList["en"][key];
			}
		}

		message = message || key;
		return {
			response_code: responseCode,
			response_data: message
		}
	}

	public async response(responseCode, responseData) {
		return {
			response_code: responseCode,
			response_data: responseData
		}
	}

	public setLanguage(lang: string) {
		language = lang;
	}

	public getLanguage() { return language; }

	public setLanguageList(list) {
		list.forEach(l => { languageList[l.languageCode] = l.backendJson; });
	}

	public getLanguageData(code) {
		return languageList[code];
	}

	public async getUUID() {
		return uuid();
	}

	public async getArrayOfWeekdays() {
		return Promise.all([
			this.getTranslatedMessageByKey(ResponseMessage.DAYS_SUNDAY),
			this.getTranslatedMessageByKey(ResponseMessage.DAYS_MONDAY),
			this.getTranslatedMessageByKey(ResponseMessage.DAYS_TUESDAY),
			this.getTranslatedMessageByKey(ResponseMessage.DAYS_WEDNESDAY),
			this.getTranslatedMessageByKey(ResponseMessage.DAYS_THURSDAY),
			this.getTranslatedMessageByKey(ResponseMessage.DAYS_FRIDAY),
			this.getTranslatedMessageByKey(ResponseMessage.DAYS_SATURDAY),
		])
	}

	public async getXminutesAheadTime(minutes: number) {
		var d1 = new Date();
		var d2 = new Date(d1);
		d2.setMinutes(d1.getMinutes() + minutes);
		return d2.getTime();
	}

	public convertToDecimal(value) {
		return Number(value).toFixed(2);
	}

	public convertToNumber(input: string): number {
		var number = Number(input);
		if (!isNaN(number)) {
			return number;
		} else return 0;
	}

	// Calculates the Distance Between two Co-ordinates
	public calculateDistance(userLocation, storeLocation): number {
		const preciseDistance = geoLib.getPreciseDistance(storeLocation, userLocation);
		return preciseDistance / 1000;
	}

	// Return List of Time Interval of Half an Hour
	public async timeSlotsDropdown() {
		let timeInterval = 30;
		let timeSlots = [];
		let startTime = 0;
		let maxTime = 24 * 60;

		for (var i = 0; startTime < maxTime; i++) {
			timeSlots[i] = { time: this.minutesConversion(startTime), minutes: startTime };
			startTime += timeInterval;
		}
		return timeSlots;
	}

	public statusMessage(status, message) {
		return {
			status: status,
			data: message
		}
	}

	public minutesConversion(m: number): string {
		let a = 'AM';
		let h = m / 60 ^ 0;
		if (h >= 12) a = 'PM';
		if (h > 12) h = h - 12;
		return `0${h}`.slice(-2) + ':' + ('0' + m % 60).slice(-2) + " " + a;
	}

	public deliveryTimeSlotsValidation(deliveryTimeSlots) {
		for (let i = 0; i < 7; i++) {
			deliveryTimeSlots[i].timings.sort((a, b) => a.openTime > b.openTime);
			const selectedDate = deliveryTimeSlots[i].date;
			const timings = deliveryTimeSlots[i].timings;
			for (var j = 0; j < timings.length; j++) {
				if (timings[j].openTime < 0 || timings[j].openTime > 1410)
					return this.statusMessage(false, "Open time should be in range of 0 - 1410 for " + selectedDate);

				if (timings[j].closeTime < 0 || timings[j].closeTime > 1410)
					return this.statusMessage(false, "Close time should be in range of 0 - 1410 for " + selectedDate);

				if (timings[j].openTime === timings[j].closeTime)
					return this.statusMessage(false, "Open and close time must not be same " + this.minutesConversion(timings[j].openTime) + " for " + selectedDate);

				if (timings[j].openTime % 30 !== 0)
					return this.statusMessage(false, "Invalid time " + this.minutesConversion(timings[j].openTime) + ", must be in 30 minutes format" + " for " + selectedDate);
				if (timings[j].closeTime % 30 !== 0)
					return this.statusMessage(false, "Invalid time " + this.minutesConversion(timings[j].closeTime) + ", must be in 30 minutes format" + " for " + selectedDate);

				if (timings[j].openTime > timings[j].closeTime)
					return this.statusMessage(false, this.minutesConversion(timings[j].closeTime) + " must be greater than " + this.minutesConversion(timings[j].openTime) + " for " + selectedDate);

				if (j !== 0 && timings[j - 1].closeTime > timings[j].openTime)
					return this.statusMessage(false, this.minutesConversion(timings[j - 1].closeTime) + " is overlapping with slot " + this.minutesConversion(timings[j].openTime) + " for " + selectedDate + ", please add non overlapping time slots.");

				timings[j].slot = this.minutesConversion(timings[j].openTime) + " to " + this.minutesConversion(timings[j].closeTime);
			}
		};
		return { status: true, data: deliveryTimeSlots };
	}

	public getAdminPagination(query: AdminQuery) {
		return {
			page: Number(query.page) || AdminSettings.DEFAULT_PAGE_NUMBER,
			limit: Number(query.limit) || AdminSettings.DEFAULT_PAGE_LIMIT,
			q: query.q || ''
		}
	}

	public getUserPagination(query: UserQuery) {
		return {
			page: Number(query.page) || UserSettings.DEFAULT_PAGE_NUMBER,
			limit: Number(query.limit) || UserSettings.DEFAULT_PAGE_LIMIT
		}
	}

	public getPOSPagination(query: InsertUpdateQuery) {
		return {
			page: Number(query.page) || UserSettings.DEFAULT_PAGE_NUMBER,
			limit: Number(query.limit) || UserSettings.DEFAULT_PAGE_LIMIT
		}
	}

}