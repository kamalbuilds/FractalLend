import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { LendingController } from './lending.controller';
import { LendingService } from './lending.service';
import { LendingPool } from '../entities/lending-pool.entity';
import { LoanPosition } from '../entities/loan-position.entity';
import { VaultConfigService } from '../services/config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LendingPool, LoanPosition]),
    HttpModule,
  ],
  controllers: [LendingController],
  providers: [LendingService, VaultConfigService],
  exports: [LendingService],
})
export class LendingModule {} 