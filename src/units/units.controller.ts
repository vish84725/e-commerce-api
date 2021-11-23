import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { UsersDTO } from "../users/users.model";
import { CommonResponseModel, ResponseBadRequestMessage, ResponseErrorMessage, ResponseMessage, ResponseSuccessMessage } from "src/utils/app.model";
import { GetUser } from "../utils/jwt.strategy";
import { UtilService } from '../utils/util.service';
import { UnitsResponseDTO, UnitsSaveDTO } from "./units.model";
import { UnitService } from "./units.service";

@Controller('units')
@ApiUseTags('units')
export class UnitController {
	constructor(
		private unitsService: UnitService,
        private utilService: UtilService,
	) {
	}

    @Post('/admin/create')
	@ApiOperation({ title: 'Create unit' })
	@ApiResponse({ status: 200, description: 'Success message', type: ResponseSuccessMessage })
	@ApiResponse({ status: 400, description: 'Bad request message', type: ResponseBadRequestMessage })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async createUnit(@GetUser() user: UsersDTO, @Body() unitData: UnitsSaveDTO): Promise<CommonResponseModel> {
		this.utilService.validateAdminRole(user);
		try {
			const unitExist = await this.unitsService.findUnitByName(unitData.name);
			if (unitExist) this.utilService.badRequest(ResponseMessage.UNIT_ALREADY_EXIST);

			const unit = await this.unitsService.createUnit(unitData);
			if (unit) return this.utilService.successResponseMsg(ResponseMessage.UNIT_SAVED);
			else this.utilService.badRequest(ResponseMessage.SOMETHING_WENT_WRONG);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

    @Get('/admin/list')
	@ApiOperation({ title: 'Get all enabled units' })
	@ApiResponse({ status: 200, description: 'Return list of enabled units', type: UnitsResponseDTO })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async getDropdownListProduct(@GetUser() user: UsersDTO): Promise<CommonResponseModel> {
		this.utilService.validateAdminRole(user);
		try {
			const units = await this.unitsService.getAllUnits();
			return this.utilService.successResponseData(units);
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}

}