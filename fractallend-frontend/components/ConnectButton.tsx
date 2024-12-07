'use client';

import React from 'react';
import { useWallet } from '../contexts/WalletContext';

export function ConnectButton() {
  const { connect } = useWallet();
  
  return (
    <button
      onClick={connect}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
    >
      Connect Wallet
    </button>
  );
} 