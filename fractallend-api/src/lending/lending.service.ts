import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LendingPool } from '../entities/lending-pool.entity';
import { LoanPosition } from '../entities/loan-position.entity';
import { InscriptionService } from '../services/inscription.service';
import { VaultConfigService } from '../services/config.service';

@Injectable()
export class LendingService {
  constructor(
    @InjectRepository(LendingPool)
    private readonly lendingPoolRepository: Repository<LendingPool>,
    @InjectRepository(LoanPosition)
    private readonly loanPositionRepository: Repository<LoanPosition>,
    private readonly inscriptionService: InscriptionService,
    private readonly vaultConfigService: VaultConfigService,
  ) {}

  private getVaultAddress(): string {
    return this.vaultConfigService.getVaultAddress();
  }

  async getLoanPosition(id: string): Promise<LoanPosition> {
    const position = await this.loanPositionRepository.findOne({ 
      where: { id }, 
      relations: ['pool'] 
    });
    if (!position) throw new NotFoundException(`Position ${id} not found`);
    return position;
  }

  async calculateHealthFactor(positionOrId: string | LoanPosition): Promise<number> {
    const position = typeof positionOrId === 'string' 
      ? await this.getLoanPosition(positionOrId)
      : positionOrId;

    const pool = position.pool;
    
    // Get current prices
    const collateralPrice = await this.inscriptionService.getInscriptionPrice(pool.collateralTokenId);
    const lendingTokenPrice = await this.inscriptionService.getInscriptionPrice(pool.lendingTokenId);

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
    // Implementation here
    return null;
  }
} 