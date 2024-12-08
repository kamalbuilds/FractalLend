import axios from 'axios';
import { LendingPool, LoanPosition, TokenPrice } from '@/types/lending';
import { Auction } from '@/types/auction';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getLendingPools = async (): Promise<LendingPool[]> => {
  const { data } = await api.get('/lending/pools');
  return data;
};

export const getLoanPositions = async (address: string): Promise<LoanPosition[]> => {
  const { data } = await api.get(`/lending/positions/${address}`);
  return data;
};

export const getTokenPrice = async (tokenId: string): Promise<TokenPrice> => {
  const { data } = await api.get(`/price/${tokenId}`);
  return data;
};

export const createLoanPosition = async (
  borrower: string,
  poolId: string,
  collateralAmount: string,
  borrowAmount: string,
): Promise<{ unsignedTx: string }> => {
  const { data } = await api.post('/lending/borrow', {
    borrower,
    poolId,
    collateralAmount,
    borrowAmount,
  });
  return data;
};

export const repayLoan = async (
  loanId: string,
  amount: string,
): Promise<{ unsignedTx: string }> => {
  const { data } = await api.post(`/lending/repay/${loanId}`, { amount });
  return data;
};

export const getActiveAuctions = async (): Promise<Auction[]> => {
  const { data } = await api.get('/auctions/active');
  return data;
};

export const getAuctionById = async (id: string): Promise<Auction> => {
  const { data } = await api.get(`/auctions/${id}`);
  return data;
};

export const placeBid = async (
  auctionId: string,
  amount: string,
): Promise<{ unsignedTx: string }> => {
  const { data } = await api.post(`/auctions/${auctionId}/bid`, { amount });
  return data;
}; 