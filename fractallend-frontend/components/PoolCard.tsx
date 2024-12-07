'use client';

import { useState } from 'react';
import { LendingPool } from '@/types/lending';
import { useWallet } from '@/contexts/WalletContext';
import { BorrowModal } from './BorrowModal';

interface PoolCardProps {
  pool: LendingPool;
}

export function PoolCard({ pool }: PoolCardProps) {
  const { address } = useWallet();
  const [showBorrowModal, setShowBorrowModal] = useState(false);

  const utilizationRate = parseFloat(pool.totalBorrowed) / parseFloat(pool.totalDeposited) * 100;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">
          {pool.collateralTokenSymbol} → {pool.lendingTokenSymbol}
        </h3>
        <div className="text-sm text-gray-400">Pool #{pool.id.slice(0, 6)}</div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">Total Deposited</div>
            <div className="text-lg font-medium">
              {parseFloat(pool.totalDeposited).toFixed(2)} {pool.lendingTokenSymbol}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Total Borrowed</div>
            <div className="text-lg font-medium">
              {parseFloat(pool.totalBorrowed).toFixed(2)} {pool.lendingTokenSymbol}
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400 mb-1">Utilization Rate</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${Math.min(utilizationRate, 100)}%` }}
            />
          </div>
          <div className="text-sm text-right mt-1">{utilizationRate.toFixed(1)}%</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">Interest Rate</div>
            <div>{pool.interestRate}% APR</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Min Collateral Ratio</div>
            <div>{pool.minimumCollateralRatio}%</div>
          </div>
        </div>

        <button
          onClick={() => setShowBorrowModal(true)}
          disabled={!address}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg py-2 px-4 transition-colors"
        >
          {address ? 'Borrow' : 'Connect Wallet to Borrow'}
        </button>
      </div>

      {showBorrowModal && (
        <BorrowModal
          pool={pool}
          onClose={() => setShowBorrowModal(false)}
        />
      )}
    </div>
  );
} 