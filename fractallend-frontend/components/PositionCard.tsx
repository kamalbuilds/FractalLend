'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { LoanPosition } from '@/types/lending';
import { repayLoan, broadcastTransaction } from '@/lib/api';

interface PositionCardProps {
  position: LoanPosition;
}

export function PositionCard({ position }: PositionCardProps) {
  const { address, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');

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

      setShowRepayModal(false);
    } catch (error) {
      console.error('Error repaying loan:', error);
      // TODO: Show error message
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    return `${days} days`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900 text-green-300';
      case 'pending':
        return 'bg-yellow-900 text-yellow-300';
      case 'repaid':
        return 'bg-blue-900 text-blue-300';
      case 'liquidated':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  const getHealthColor = (factor: number) => {
    if (factor >= 2) return 'text-green-500';
    if (factor >= 1.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const isBorrower = address === position.borrower;
  const isLender = address === position.lender;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">
          {isBorrower ? 'My Loan' : 'Funded Loan'}
        </h3>
        <div className={`px-2 py-1 rounded ${getStatusColor(position.status)}`}>
          {position.status}
        </div>
      </div>

      <div className="space-y-4">
        {!isBorrower && (
          <div>
            <div className="text-sm text-gray-400">Borrower</div>
            <div className="font-medium">
              {position.borrower.slice(0, 6)}...{position.borrower.slice(-4)}
            </div>
          </div>
        )}

        {!isLender && position.lender && (
          <div>
            <div className="text-sm text-gray-400">Lender</div>
            <div className="font-medium">
              {position.lender.slice(0, 6)}...{position.lender.slice(-4)}
            </div>
          </div>
        )}

        <div>
          <div className="text-sm text-gray-400">Collateral</div>
          <div className="font-medium">
            {position.collateralAmount} (Inscription #{position.collateralInscriptionId})
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400">Borrowed</div>
          <div className="font-medium">
            {position.borrowedAmount} CAT20
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400">Interest Rate</div>
          <div className="font-medium">{position.interestRate}% APR</div>
        </div>

        <div>
          <div className="text-sm text-gray-400">Duration</div>
          <div className="font-medium">{formatDuration(position.duration)}</div>
        </div>

        {position.status === 'active' && (
          <>
            <div>
              <div className="text-sm text-gray-400">Health Factor</div>
              <div className={`text-lg font-medium ${getHealthColor(position.healthFactor)}`}>
                {position.healthFactor.toFixed(2)}x
              </div>
              {position.healthFactor < 1.5 && (
                <div className="text-sm text-red-400">At risk of liquidation</div>
              )}
            </div>

            <div>
              <div className="text-sm text-gray-400">Interest Accrued</div>
              <div className="font-medium">
                {parseFloat(position.interestAccrued).toFixed(2)} CAT20
              </div>
            </div>

            {isBorrower && (
              <div className="pt-2">
                <button
                  onClick={() => setShowRepayModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4"
                >
                  Repay Loan
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showRepayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Repay Loan</h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-2">
                  Total Owed: {(parseFloat(position.borrowedAmount) + parseFloat(position.interestAccrued)).toFixed(2)} CAT20
                </div>
                <input
                  type="number"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2"
                  placeholder="Amount to repay"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowRepayModal(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRepay}
                  disabled={loading || !repayAmount}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg py-2 px-4"
                >
                  {loading ? 'Processing...' : 'Repay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 