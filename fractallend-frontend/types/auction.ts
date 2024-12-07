export interface Auction {
  id: string;
  loanPositionId: string;
  collateralAmount: string;
  startPrice: string;
  currentPrice: string;
  endTime: number;
  status: 'active' | 'completed' | 'cancelled';
  winner?: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidder: string;
  amount: string;
  timestamp: number;
} 