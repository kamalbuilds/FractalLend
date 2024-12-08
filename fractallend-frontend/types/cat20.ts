export interface CAT20Token {
  id: string;
  name: string;
  symbol: string;
  description?: string;
}

export interface TokenPrice {
  askPrice: number;
  bidPrice: number;
  latestTradePrice: number;
  timestamp: string;
  height: number;
} 