import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('loan_positions')
export class LoanPosition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  borrower: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  lender: string;

  @Column({ type: 'varchar', length: 200 })
  collateralInscriptionId: string;

  @Column({ type: 'varchar', length: 200 })
  borrowedTokenId: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  collateralAmount: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  borrowedAmount: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  interestAccrued: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number;

  @Column({ type: 'integer' })
  duration: number; // Loan duration in seconds

  @Column({ type: 'bigint', nullable: true })
  startTime: number;

  @Column({ type: 'bigint' })
  lastUpdateTime: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  healthFactor: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  liquidationThreshold: number;

  @Column({ type: 'enum', enum: ['pending', 'active', 'repaid', 'liquidated', 'closed'] })
  status: 'pending' | 'active' | 'repaid' | 'liquidated' | 'closed';
} 