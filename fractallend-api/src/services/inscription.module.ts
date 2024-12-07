import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InscriptionService } from './inscription.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [InscriptionService],
  exports: [InscriptionService],
})
export class InscriptionModule {} 