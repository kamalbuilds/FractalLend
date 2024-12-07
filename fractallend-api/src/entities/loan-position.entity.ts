import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LendingPool } from './lending-pool.entity';

@Entity('loan_positions')
export class LoanPosition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  borrower: string;

  @ManyToOne(() => LendingPool, pool => pool.positions)
  @JoinColumn({ name: 'pool_id' })
  pool: LendingPool;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  collateralAmount: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  borrowedAmount: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  interestAccrued: string;

  @Column({ type: 'bigint' })
  lastUpdateTime: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  healthFactor: number;

  @Column({ type: 'enum', enum: ['active', 'liquidated', 'closed'] })
  status: 'active' | 'liquidated' | 'closed';

  @Column({ type: 'varchar', length: 200 })
  collateralInscriptionId: string;
} 