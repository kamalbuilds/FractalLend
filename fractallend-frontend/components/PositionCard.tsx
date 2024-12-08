'use client';

import { useState } from 'react';
import { LoanPosition } from '@/types/lending';
import { RepayModal } from './RepayModal';

interface PositionCardProps {
  position: LoanPosition;
}

export function PositionCard({ position }: PositionCardProps) {
  const [showRepayModal, setShowRepayModal] = useState(false);

  const healthColor = position.healthFactor >= 2 
    ? 'text-green-500' 
    : position.healthFactor >= 1.5 
    ? 'text-yellow-500' 
    : 'text-red-500';

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Loan Position</h3>
        <div className={`px-2 py-1 rounded ${
          position.status === 'active' ? 'bg-green-900 text-green-300' :
          position.status === 'liquidated' ? 'bg-red-900 text-red-300' :
          'bg-gray-900 text-gray-300'
        }`}>
          {position.status}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">Collateral</div>
            <div className="text-lg font-medium">
              {parseFloat(position.collateralAmount).toFixed(8)} BTC
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Borrowed</div>
            <div className="text-lg font-medium">
              {parseFloat(position.borrowedAmount).toFixed(2)} FUSD
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400">Health Factor</div>
          <div className={`text-lg font-medium ${healthColor}`}>
            {position.healthFactor.toFixed(2)}x
          </div>
          <div className="text-sm text-gray-400">
            {position.healthFactor < 1.5 && "At risk of liquidation"}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400">Interest Accrued</div>
          <div className="text-lg font-medium">
            {parseFloat(position.interestAccrued).toFixed(2)} FUSD
          </div>
        </div>

        {position.status === 'active' && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShowRepayModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 transition-colors"
            >
              Repay
            </button>
            <button
              onClick={() => {/* TODO: Add collateral */}}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 px-4 transition-colors"
            >
              Add Collateral
            </button>
          </div>
        )}
      </div>

      {showRepayModal && (
        <RepayModal
          position={position}
          onClose={() => setShowRepayModal(false)}
        />
      )}
    </div>
  );
} 