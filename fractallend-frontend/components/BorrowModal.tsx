'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { LendingPool } from '@/types/lending';
import { createLoanPosition } from '@/lib/api';

interface BorrowModalProps {
  pool: LendingPool;
  onClose: () => void;
}

export function BorrowModal({ pool, onClose }: BorrowModalProps) {
  const { address, signTransaction } = useWallet();
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBorrow = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      
      // Create loan position and get unsigned transaction
      const { unsignedTx } = await createLoanPosition(
        address,
        pool.id,
        collateralAmount,
        borrowAmount
      );

      // Sign transaction with wallet
      const signedTx = await signTransaction(unsignedTx);

      // TODO: Submit signed transaction to network
      console.log('Signed transaction:', signedTx);

      onClose();
    } catch (error) {
      console.error('Error borrowing:', error);
      // TODO: Show error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Borrow {pool.lendingTokenSymbol}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Collateral Amount ({pool.collateralTokenSymbol})
            </label>
            <input
              type="number"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
              placeholder="0.0"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Borrow Amount ({pool.lendingTokenSymbol})
            </label>
            <input
              type="number"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
              placeholder="0.0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 px-4"
            >
              Cancel
            </button>
            <button
              onClick={handleBorrow}
              disabled={loading || !collateralAmount || !borrowAmount}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg py-2 px-4"
            >
              {loading ? 'Processing...' : 'Borrow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 