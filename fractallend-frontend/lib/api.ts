import axios from 'axios';
import { LoanPosition, TokenPrice, Inscription, CreateLoanRequest, FundLoanRequest, RepayLoanRequest } from '@/types/lending';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Loan Management
export const createLoanRequest = async (request: CreateLoanRequest): Promise<LoanPosition> => {
  const { data } = await api.post('/lending/request', request);
  return data;
};

export const fundLoan = async (loanId: string, request: FundLoanRequest): Promise<{ unsignedTx: string }> => {
  const { data } = await api.post(`/lending/fund/${loanId}`, request);
  return data;
};

export const depositCollateral = async (loanId: string, borrower: string): Promise<{ unsignedTx: string }> => {
  const { data } = await api.post(`/lending/deposit/${loanId}`, { borrower });
  return data;
};

export const repayLoan = async (loanId: string, request: RepayLoanRequest): Promise<{ unsignedTx: string }> => {
  const { data } = await api.post(`/lending/repay/${loanId}`, request);
  return data;
};

export const getLoanPosition = async (id: string): Promise<LoanPosition> => {
  const { data } = await api.get(`/lending/position/${id}`);
  return data;
};

export const getLoanPositions = async (address: string): Promise<LoanPosition[]> => {
  const { data } = await api.get(`/lending/positions/${address}`);
  return data;
};

export const getPositionHealth = async (id: string): Promise<number> => {
  const { data } = await api.get(`/lending/health/${id}`);
  return data;
};

// UniSat API Integration
export const getInscriptions = async (address: string): Promise<Inscription[]> => {
  const { data } = await api.get(`/unisat/inscriptions/${address}`);
  return data;
};

export const getTokenPrice = async (tokenId: string): Promise<TokenPrice> => {
  const { data } = await api.get(`/unisat/price/${tokenId}`);
  return data;
};

export const broadcastTransaction = async (signedTx: string): Promise<string> => {
  const { data } = await api.post('/unisat/broadcast', { tx: signedTx });
  return data.txId;
}; 