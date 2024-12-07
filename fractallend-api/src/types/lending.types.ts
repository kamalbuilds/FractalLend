export interface LendingPool {
  id: string;
  collateralTokenId: string;  // Inscription ID
  lendingTokenId: string;     // CAT20 token ID
  totalDeposited: string;     // Total CAT20 tokens deposited
  totalBorrowed: string;      // Total CAT20 tokens borrowed
  liquidationThreshold: number; // e.g. 0.75 means liquidate if collateral value falls below 75%
  interestRate: number;       // Annual interest rate
  minimumCollateralRatio: number; // Minimum collateral ratio required
}

export interface LoanPosition {
  id: string;
  borrower: string;
  poolId: string;
  collateralAmount: string;   // Amount of inscriptions locked
  borrowedAmount: string;     // Amount of CAT20 tokens borrowed
  interestAccrued: string;
  lastUpdateTime: number;
  healthFactor: number;       // Current collateral ratio
  status: 'active' | 'liquidated' | 'closed';
}

export interface PriceData {
  askPrice: number;
  bidPrice: number;
  latestTradePrice: number;
  timestamp: string;
  height: number;
} 