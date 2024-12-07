'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Inscription } from '@/types/lending';
import { createLoanRequest, getInscriptions, depositCollateral } from '@/lib/api';

interface CreateLoanModalProps {
  onClose: () => void;
}

export function CreateLoanModal({ onClose }: CreateLoanModalProps) {
  const { address, signTransaction } = useWallet();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [selectedInscription, setSelectedInscription] = useState<string>('');
  const [borrowedTokenId, setBorrowedTokenId] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'create' | 'deposit'>('create');

  useEffect(() => {
    const fetchInscriptions = async () => {
      if (address) {
        const data = await getInscriptions(address);
        setInscriptions(data);
      }
    };
    fetchInscriptions();
  }, [address]);

  const handleCreateLoan = async () => {
    if (!address || !selectedInscription) return;
    
    try {
      setLoading(true);
      
      // Create loan request
      const loan = await createLoanRequest({
        borrower: address,
        collateralInscriptionId: selectedInscription,
        borrowedTokenId,
        collateralAmount,
        borrowAmount,
        interestRate: parseFloat(interestRate),
        duration: parseInt(duration) * 86400, // Convert days to seconds
      });

      // Move to deposit step
      setStep('deposit');

      // Get deposit transaction
      const { unsignedTx } = await depositCollateral(loan.id, address);

      // Sign transaction with wallet
      const signedTx = await signTransaction(unsignedTx);

      // TODO: Submit signed transaction to network
      console.log('Signed transaction:', signedTx);

      onClose();
    } catch (error) {
      console.error('Error creating loan:', error);
      // TODO: Show error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Create Loan Request</h3>
        
        <div className="space-y-4">
          {step === 'create' ? (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Select Inscription
                </label>
                <select
                  value={selectedInscription}
                  onChange={(e) => setSelectedInscription(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2"
                >
                  <option value="">Select an inscription</option>
                  {inscriptions.map((inscription) => (
                    <option key={inscription.id} value={inscription.id}>
                      #{inscription.number} - {inscription.contentType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  CAT20 Token ID
                </label>
                <input
                  type="text"
                  value={borrowedTokenId}
                  onChange={(e) => setBorrowedTokenId(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2"
                  placeholder="Token ID to borrow"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Collateral Amount
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
                  Borrow Amount
                </label>
                <input
                  type="number"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Interest Rate (% APR)
                </label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2"
                  placeholder="5.0"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2"
                  placeholder="30"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Waiting for inscription transfer confirmation...</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 px-4"
            >
              Cancel
            </button>
            {step === 'create' && (
              <button
                onClick={handleCreateLoan}
                disabled={loading || !selectedInscription || !borrowedTokenId || !collateralAmount || !borrowAmount || !interestRate || !duration}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg py-2 px-4"
              >
                {loading ? 'Creating...' : 'Create Request'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 