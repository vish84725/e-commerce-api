import { Controller, UseGuards, Get, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiImplicitQuery, ApiOperation, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { UsersDTO } from '../users/users.model';
import { CommonResponseModel, ResponseErrorMessage, UserQuery } from '../utils/app.model';
import { WalletService } from './wallet.service';
import { ResponseWalletHistory } from './wallet.model';
import { UtilService } from '../utils/util.service';
import { GetUser } from '../utils/jwt.strategy';

@Controller('wallets')
@ApiUseTags('Wallets')
export class WalletController {
	constructor(
		private walletService: WalletService,
		private utilService: UtilService
	) {
	}

	@Get('/history')
	@ApiImplicitQuery({ name: "page", description: "page", required: false, type: Number })
	@ApiImplicitQuery({ name: "limit", description: "limit", required: false, type: Number })
	@ApiOperation({ title: 'Get wallet transaction history' })
	@ApiResponse({ status: 200, description: 'Return list wallet transaction', type: ResponseWalletHistory })
	@ApiResponse({ status: 404, description: 'Unauthorized or Not found', type: ResponseErrorMessage })
	@UseGuards(AuthGuard('jwt'))
	@ApiBearerAuth()
	public async walletHistory(@GetUser() user: UsersDTO, @Query() userQuery: UserQuery): Promise<CommonResponseModel> {
		this.utilService.validateUserRole(user);
		try {
			let pagination = this.utilService.getUserPagination(userQuery);
			const wallets = await Promise.all([
				this.walletService.walletHistory(user._id, pagination.page, pagination.limit),
				this.walletService.countWalletHistory(user._id)
			]);
			return this.utilService.successResponseData(wallets[0], { total: wallets[1] });
		} catch (e) {
			this.utilService.errorResponse(e);
		}
	}
}