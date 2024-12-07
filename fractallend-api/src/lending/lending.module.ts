import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LendingController } from './lending.controller';
import { LendingService } from './lending.service';
import { LendingPool } from '../entities/lending-pool.entity';
import { LoanPosition } from '../entities/loan-position.entity';
import { VaultConfigService } from '../services/config.service';
import { InscriptionModule } from '../services/inscription.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LendingPool, LoanPosition]),
    HttpModule,
    InscriptionModule,
    ConfigModule,
  ],
  controllers: [LendingController],
  providers: [LendingService, VaultConfigService],
  exports: [LendingService],
})
export class LendingModule {} 