'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { LoanPosition } from '@/types/lending';
import { fundLoan, broadcastTransaction } from '@/lib/api';

interface FundLoanModalProps {
  loan: LoanPosition;
  onClose: () => void;
}

export function FundLoanModal({ loan, onClose }: FundLoanModalProps) {
  const { address, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleFund = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      
      // Get funding transaction
      const { unsignedTx } = await fundLoan(loan.id, { lender: address });

      // Sign transaction with wallet
      const signedTx = await signTransaction(unsignedTx);

      // Broadcast signed transaction
      await broadcastTransaction(signedTx);

      onClose();
    } catch (error) {
      console.error('Error funding loan:', error);
      // TODO: Show error message
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    return `${days} days`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Fund Loan Request</h3>
        
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-400">Borrower</div>
            <div className="font-medium">
              {loan.borrower.slice(0, 6)}...{loan.borrower.slice(-4)}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400">Collateral</div>
            <div className="font-medium">
              {loan.collateralAmount} (Inscription #{loan.collateralInscriptionId})
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400">Borrow Amount</div>
            <div className="font-medium">
              {loan.borrowedAmount} CAT20
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400">Interest Rate</div>
            <div className="font-medium">
              {loan.interestRate}% APR
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400">Duration</div>
            <div className="font-medium">
              {formatDuration(loan.duration)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 px-4"
            >
              Cancel
            </button>
            <button
              onClick={handleFund}
              disabled={loading || !address}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg py-2 px-4"
            >
              {loading ? 'Processing...' : 'Fund Loan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 