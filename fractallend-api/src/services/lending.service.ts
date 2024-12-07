import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanPosition } from '../entities/loan-position.entity';
import { InscriptionService } from './inscription.service';
import { VaultConfigService } from './config.service';

@Injectable()
export class LendingService {
  constructor(
    @InjectRepository(LoanPosition)
    private readonly loanPositionRepository: Repository<LoanPosition>,
    private readonly inscriptionService: InscriptionService,
    private readonly vaultConfigService: VaultConfigService,
  ) {}

  async getLoanPosition(id: string): Promise<LoanPosition> {
    const position = await this.loanPositionRepository.findOne({
      where: { id }
    });

    if (!position) {
      throw new NotFoundException(`Loan position ${id} not found`);
    }

    return position;
  }

  async getLoanPositions(address: string): Promise<LoanPosition[]> {
    return this.loanPositionRepository.find({
      where: [
        { borrower: address },
        { lender: address }
      ]
    });
  }

  async calculateHealthFactor(position: LoanPosition): Promise<number> {
    // Get current prices from UniSat API
    const inscriptionPrice = await this.inscriptionService.getInscriptionPrice(position.collateralInscriptionId);
    const cat20Price = await this.inscriptionService.getTokenPrice(position.borrowedTokenId);

    const collateralValue = parseFloat(position.collateralAmount) * inscriptionPrice.latestTradePrice;
    const borrowedValue = parseFloat(position.borrowedAmount) * cat20Price.latestTradePrice;

    return collateralValue / borrowedValue;
  }

  async createLoanRequest(
    borrower: string,
    collateralInscriptionId: string,
    borrowedTokenId: string,
    collateralAmount: string,
    borrowAmount: string,
    interestRate: number,
    duration: number,
  ): Promise<LoanPosition> {
    // Verify inscription ownership
    const isOwner = await this.inscriptionService.verifyInscriptionOwnership(
      collateralInscriptionId,
      borrower
    );

    if (!isOwner) {
      throw new Error('Borrower does not own the inscription');
    }

    // Create loan position
    const position = this.loanPositionRepository.create({
      borrower,
      collateralInscriptionId,
      borrowedTokenId,
      collateralAmount,
      borrowedAmount: borrowAmount,
      interestRate,
      duration,
      startTime: null, // Will be set when loan is funded
      interestAccrued: '0',
      lastUpdateTime: Date.now(),
      status: 'pending',
      healthFactor: 0, // Will be calculated when funded
      liquidationThreshold: 1.5, // Default threshold
    });

    // Save position
    await this.loanPositionRepository.save(position);

    return position;
  }

  async fundLoan(
    lender: string,
    loanId: string,
  ): Promise<{ unsignedTx: string }> {
    const loan = await this.getLoanPosition(loanId);
    
    if (loan.status !== 'pending') {
      throw new Error('Loan is not in pending status');
    }

    // Create CAT20 transfer transaction from lender to borrower
    const unsignedTx = await this.inscriptionService.createCat20Transfer(
      loan.borrowedTokenId,
      lender,
      loan.borrower,
      loan.borrowedAmount
    );

    // Update loan status
    loan.status = 'active';
    loan.startTime = Date.now();
    loan.lender = lender;
    await this.loanPositionRepository.save(loan);

    return { unsignedTx };
  }

  async depositCollateral(
    loanId: string,
    borrower: string,
  ): Promise<{ unsignedTx: string }> {
    const loan = await this.getLoanPosition(loanId);
    
    if (loan.borrower !== borrower) {
      throw new Error('Not the loan owner');
    }

    if (loan.status !== 'pending') {
      throw new Error('Loan is not in pending status');
    }

    // Create inscription transfer transaction to vault
    const { unsignedTx } = await this.inscriptionService.createTransferInscription(
      loan.collateralInscriptionId,
      borrower,
      this.vaultConfigService.getVaultAddress()
    );

    return { unsignedTx };
  }

  async repayLoan(
    loanId: string,
    amount: string,
  ): Promise<{ unsignedTx: string }> {
    const loan = await this.getLoanPosition(loanId);
    
    if (loan.status !== 'active') {
      throw new Error('Loan is not active');
    }

    const totalOwed = parseFloat(loan.borrowedAmount) + parseFloat(loan.interestAccrued);
    if (parseFloat(amount) > totalOwed) {
      throw new Error('Repayment amount exceeds total owed');
    }

    // Create CAT20 transfer transaction from borrower to lender
    const unsignedTx = await this.inscriptionService.createCat20Transfer(
      loan.borrowedTokenId,
      loan.borrower,
      loan.lender,
      amount
    );

    // Update loan state after repayment confirmation
    const newBorrowedAmount = totalOwed - parseFloat(amount);
    loan.borrowedAmount = newBorrowedAmount.toString();
    
    if (newBorrowedAmount === 0) {
      loan.status = 'repaid';
      // Trigger collateral release
      await this.releaseCollateral(loanId);
    }

    await this.loanPositionRepository.save(loan);

    return { unsignedTx };
  }

  async releaseCollateral(loanId: string): Promise<{ unsignedTx: string }> {
    const loan = await this.getLoanPosition(loanId);
    
    if (loan.status !== 'repaid') {
      throw new Error('Loan must be fully repaid');
    }

    // Create inscription transfer transaction back to borrower
    const { unsignedTx } = await this.inscriptionService.createTransferInscription(
      loan.collateralInscriptionId,
      this.vaultConfigService.getVaultAddress(),
      loan.borrower
    );

    return { unsignedTx };
  }

  async checkLiquidations(): Promise<void> {
    const activeLoans = await this.loanPositionRepository.find({
      where: { status: 'active' }
    });

    for (const loan of activeLoans) {
      const healthFactor = await this.calculateHealthFactor(loan);
      
      if (healthFactor < loan.liquidationThreshold) {
        await this.liquidatePosition(loan);
      }
    }
  }

  private async liquidatePosition(loan: LoanPosition): Promise<void> {
    loan.status = 'liquidated';
    await this.loanPositionRepository.save(loan);
    
    // Create auction for the collateral
    // TODO: Implement auction creation
  }
} 