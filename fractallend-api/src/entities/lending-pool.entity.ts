import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { LoanPosition } from './loan-position.entity';

@Entity('lending_pools')
export class LendingPool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  collateralTokenId: string;

  @Column({ type: 'varchar', length: 200 })
  lendingTokenId: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  totalDeposited: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  totalBorrowed: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  liquidationThreshold: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  minimumCollateralRatio: number;

  @OneToMany(() => LoanPosition, position => position.pool)
  positions: LoanPosition[];
} 