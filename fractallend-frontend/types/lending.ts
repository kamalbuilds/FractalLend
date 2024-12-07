export interface LendingPool {
  id: string;
  collateralTokenId: string;
  lendingTokenId: string;
  totalDeposited: string;
  totalBorrowed: string;
  liquidationThreshold: number;
  interestRate: number;
  minimumCollateralRatio: number;
  collateralTokenSymbol: string;
  lendingTokenSymbol: string;
}

export interface LoanPosition {
  id: string;
  borrower: string;
  poolId: string;
  collateralAmount: string;
  borrowedAmount: string;
  interestAccrued: string;
  lastUpdateTime: number;
  healthFactor: number;
  status: 'active' | 'liquidated' | 'closed';
}

export interface TokenPrice {
  askPrice: number;
  bidPrice: number;
  latestTradePrice: number;
  timestamp: string;
  height: number;
} 