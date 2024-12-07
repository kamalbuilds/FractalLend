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
  lender?: string;
  collateralInscriptionId: string;
  borrowedTokenId: string;
  collateralAmount: string;
  borrowedAmount: string;
  interestRate: number;
  duration: number;
  startTime?: number;
  interestAccrued: string;
  lastUpdateTime: number;
  healthFactor: number;
  liquidationThreshold: number;
  status: 'pending' | 'active' | 'repaid' | 'liquidated' | 'closed';
}

export interface TokenPrice {
  askPrice: number;
  bidPrice: number;
  latestTradePrice: number;
  timestamp: string;
  height: number;
}

export interface Inscription {
  id: string;
  number: number;
  address: string;
  content: string;
  contentType: string;
  contentLength: number;
  timestamp: string;
  genesisHeight: number;
  genesisFee: number;
  genesisTransaction: string;
  location: string;
  output: string;
  offset: number;
}

export interface CreateLoanRequest {
  borrower: string;
  collateralInscriptionId: string;
  borrowedTokenId: string;
  collateralAmount: string;
  borrowAmount: string;
  interestRate: number;
  duration: number;
}

export interface FundLoanRequest {
  lender: string;
}

export interface RepayLoanRequest {
  amount: string;
} 