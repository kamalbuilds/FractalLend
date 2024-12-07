'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { LoanPosition } from '@/types/lending';
import { repayLoan, broadcastTransaction } from '@/lib/api';

interface RepayModalProps {
  position: LoanPosition;
  onClose: () => void;
}

export function RepayModal({ position, onClose }: RepayModalProps) {
  const { address, signTransaction } = useWallet();
  const [repayAmount, setRepayAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const totalOwed = parseFloat(position.borrowedAmount) + parseFloat(position.interestAccrued);

  const handleRepay = async () => {
    if (!address || !repayAmount) return;
    
    try {
      setLoading(true);
      
      // Get repay transaction
      const { unsignedTx } = await repayLoan(position.id, { amount: repayAmount });

      // Sign transaction with wallet
      const signedTx = await signTransaction(unsignedTx);

      // Broadcast signed transaction
      await broadcastTransaction(signedTx);

      onClose();
    } catch (error) {
      console.error('Error repaying loan:', error);
      // TODO: Show error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Repay Loan</h3>
        
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-400 mb-2">
              Total Owed: {totalOwed.toFixed(2)} CAT20
            </div>
            <input
              type="number"
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-2"
              placeholder="Amount to repay"
              max={totalOwed}
            />
            <button
              onClick={() => setRepayAmount(totalOwed.toString())}
              className="text-sm text-blue-400 mt-1 hover:text-blue-300"
            >
              Max
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 px-4"
            >
              Cancel
            </button>
            <button
              onClick={handleRepay}
              disabled={loading || !repayAmount || parseFloat(repayAmount) <= 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg py-2 px-4"
            >
              {loading ? 'Processing...' : 'Repay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 