import { Controller, Post, Get, Body, Param, NotFoundException } from '@nestjs/common';
import { LendingService } from './lending.service';

@Controller('lending')
export class LendingController {
  constructor(private readonly lendingService: LendingService) {}

  @Post('borrow')
  async createLoanPosition(
    @Body() createLoanDto: {
      borrower: string;
      poolId: string;
      collateralAmount: string;
      borrowAmount: string;
    }
  ) {
    return this.lendingService.createLoanPosition(
      createLoanDto.borrower,
      createLoanDto.poolId,
      createLoanDto.collateralAmount,
      createLoanDto.borrowAmount
    );
  }

  @Get('position/:id')
  async getLoanPosition(@Param('id') id: string) {
    return this.lendingService.getLoanPosition(id);
  }

  @Get('health/:id')
  async getPositionHealth(@Param('id') id: string) {
    return this.lendingService.calculateHealthFactor(id);
  }
} 