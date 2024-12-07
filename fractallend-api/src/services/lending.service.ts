import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LendingPool } from '../entities/lending-pool.entity';
import { LoanPosition } from '../entities/loan-position.entity';
import { PriceData } from '../types/lending.types';
import { InscriptionService } from './inscription.service';
import { VaultConfigService } from './config.service';

@Injectable()
export class LendingService {
  private readonly unisatApiKey: string;

  constructor(
    @InjectRepository(LendingPool)
    private readonly lendingPoolRepository: Repository<LendingPool>,
    @InjectRepository(LoanPosition)
    private readonly loanPositionRepository: Repository<LoanPosition>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly inscriptionService: InscriptionService,
    private readonly vaultConfigService: VaultConfigService,
  ) {
    this.unisatApiKey = this.configService.get<string>('UNISAT_API_KEY');
  }

  private getVaultAddress(): string {
    return this.vaultConfigService.getVaultAddress();
  }

  async getInscriptionPrice(tokenId: string): Promise<PriceData> {
    const url = `https://open-api-fractal.unisat.io/v1/cat20-dex/getTokenPrice?tokenId=${tokenId}`;
    
    const { data } = await this.httpService.get(url, {
      headers: {
        Authorization: `Bearer ${this.unisatApiKey}`,
      },
    }).toPromise();

    return data.data;
  }

  async getLoanPosition(id: string): Promise<LoanPosition> {
    const position = await this.loanPositionRepository.findOne({
      where: { id },
      relations: ['pool']
    });

    if (!position) {
      throw new NotFoundException(`Loan position ${id} not found`);
    }

    return position;
  }

  async calculateHealthFactor(positionOrId: string | LoanPosition): Promise<number> {
    const position = typeof positionOrId === 'string' 
      ? await this.getLoanPosition(positionOrId)
      : positionOrId;

    const pool = position.pool;
    
    // Get current prices
    const collateralPrice = await this.getInscriptionPrice(pool.collateralTokenId);
    const lendingTokenPrice = await this.getInscriptionPrice(pool.lendingTokenId);

    const collateralValue = parseFloat(position.collateralAmount) * collateralPrice.latestTradePrice;
    const borrowedValue = parseFloat(position.borrowedAmount) * lendingTokenPrice.latestTradePrice;

    return collateralValue / borrowedValue;
  }

  async createLoanPosition(
    borrower: string,
    poolId: string,
    collateralAmount: string,
    borrowAmount: string,
  ): Promise<LoanPosition> {
    const pool = await this.lendingPoolRepository.findOneBy({ id: poolId });
    if (!pool) {
      throw new NotFoundException(`Lending pool ${poolId} not found`);
    }
    
    // Check if pool has enough liquidity
    const availableLiquidity = parseFloat(pool.totalDeposited) - parseFloat(pool.totalBorrowed);
    if (availableLiquidity < parseFloat(borrowAmount)) {
      throw new Error('Insufficient liquidity in pool');
    }

    // Create position
    const position = this.loanPositionRepository.create({
      borrower,
      pool,
      collateralAmount,
      borrowedAmount: borrowAmount,
      interestAccrued: '0',
      lastUpdateTime: Date.now(),
      status: 'active',
    });

    // Calculate health factor
    position.healthFactor = await this.calculateHealthFactor(position);
    if (position.healthFactor < pool.minimumCollateralRatio) {
      throw new Error('Insufficient collateral ratio');
    }

    // Save position
    await this.loanPositionRepository.save(position);

    // Update pool state
    pool.totalBorrowed = (parseFloat(pool.totalBorrowed) + parseFloat(borrowAmount)).toString();
    await this.lendingPoolRepository.save(pool);

    return position;
  }

  async getActivePositions(): Promise<LoanPosition[]> {
    return this.loanPositionRepository.find({
      where: { status: 'active' },
      relations: ['pool']
    });
  }


  async checkLiquidations(): Promise<void> {
    const activePositions = await this.getActivePositions();

    for (const position of activePositions) {
      const healthFactor = await this.calculateHealthFactor(position);
      
      if (healthFactor < position.pool.liquidationThreshold) {
        await this.liquidatePosition(position);
      }
    }
  }

  private async liquidatePosition(position: LoanPosition): Promise<void> {
    position.status = 'liquidated';
    await this.loanPositionRepository.save(position);
    
    // TODO: Implement auction creation logic
    // This will involve creating a new auction entity and
    // transferring the collateral to the auction contract
  }

  async depositCollateral(
    borrower: string,
    poolId: string,
    inscriptionId: string,
  ): Promise<void> {
    // Verify inscription ownership
    const isOwner = await this.inscriptionService.verifyInscriptionOwnership(
      inscriptionId,
      borrower
    );

    if (!isOwner) {
      throw new Error('Borrower does not own the inscription');
    }

    // Create transfer transaction
    const { unsignedTx } = await this.inscriptionService.createTransferInscription(
      inscriptionId,
      borrower,
      this.getVaultAddress() // todo need to implement this
    );

    // Return unsigned transaction for wallet to sign
    return unsignedTx;
  }

  async releaseCollateral(
    loanId: string,
    borrower: string,
  ): Promise<void> {
    const loan = await this.getLoanPosition(loanId);
    
    if (loan.borrower !== borrower) {
      throw new Error('Not the loan owner');
    }

    if (loan.status !== 'active') {
      throw new Error('Loan is not active');
    }

    // Check if loan is fully repaid
    if (parseFloat(loan.borrowedAmount) > 0) {
      throw new Error('Loan not fully repaid');
    }

    // Create transfer transaction back to borrower
    const { unsignedTx } = await this.inscriptionService.createTransferInscription(
      loan.collateralInscriptionId,
      this.getVaultAddress(),
      borrower
    );

    return unsignedTx;
  }
} 