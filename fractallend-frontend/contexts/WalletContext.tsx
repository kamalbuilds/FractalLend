'use client';
import React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (unsignedTx: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);

  const connect = async () => {
    try {
      // @ts-ignore
      const unisat = window.unisat;
      if (!unisat) {
        throw new Error('Unisat wallet not found');
      }

      const [addr] = await unisat.requestAccounts();
      setAddress(addr);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setAddress(null);
  };

  const signTransaction = async (unsignedTx: string): Promise<string> => {
    try {
      // @ts-ignore
      const unisat = window.unisat;
      if (!unisat) {
        throw new Error('Unisat wallet not found');
      }

      const signedTx = await unisat.signTransaction(unsignedTx);
      return signedTx;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider value={{ address, connect, disconnect, signTransaction }}>
      {children}
    </WalletContext.Provider>
  );
}; 