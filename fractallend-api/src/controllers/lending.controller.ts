import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { LendingService } from '../services/lending.service';
import { LoanPosition } from '../entities/loan-position.entity';

@Controller('lending')
export class LendingController {
  constructor(private readonly lendingService: LendingService) {}

  @Post('request')
  async createLoanRequest(
    @Body() createLoanDto: {
      borrower: string;
      collateralInscriptionId: string;
      borrowedTokenId: string;
      collateralAmount: string;
      borrowAmount: string;
      interestRate: number;
      duration: number;
    }
  ) {
    return this.lendingService.createLoanRequest(
      createLoanDto.borrower,
      createLoanDto.collateralInscriptionId,
      createLoanDto.borrowedTokenId,
      createLoanDto.collateralAmount,
      createLoanDto.borrowAmount,
      createLoanDto.interestRate,
      createLoanDto.duration
    );
  }

  @Post('fund/:id')
  async fundLoan(
    @Param('id') id: string,
    @Body() fundDto: { lender: string }
  ) {
    return this.lendingService.fundLoan(fundDto.lender, id);
  }

  @Post('deposit/:id')
  async depositCollateral(
    @Param('id') id: string,
    @Body() depositDto: { borrower: string }
  ) {
    return this.lendingService.depositCollateral(id, depositDto.borrower);
  }

  @Post('repay/:id')
  async repayLoan(
    @Param('id') id: string,
    @Body() repayDto: { amount: string }
  ) {
    return this.lendingService.repayLoan(id, repayDto.amount);
  }

  @Get('position/:id')
  async getLoanPosition(@Param('id') id: string): Promise<LoanPosition> {
    return this.lendingService.getLoanPosition(id);
  }

  @Get('positions/:address')
  async getLoanPositions(@Param('address') address: string): Promise<LoanPosition[]> {
    return this.lendingService.getLoanPositions(address);
  }

  @Get('health/:id')
  async getPositionHealth(@Param('id') id: string): Promise<number> {
    const position = await this.lendingService.getLoanPosition(id);
    return this.lendingService.calculateHealthFactor(position);
  }
} 