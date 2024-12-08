'use client';

import { useState, useEffect } from 'react';
import { NFTCollection } from '@/types/lending';
import { CAT20Token, TokenPrice } from '@/types/cat20';
import { SUPPORTED_CAT20_TOKENS, getTokenPrice } from '@/lib/cat20Api';

interface BorrowModalProps {
  collection: NFTCollection;
  isOpen: boolean;
  onClose: () => void;
}

export function BorrowModal({ collection, isOpen, onClose }: BorrowModalProps) {
  const [selectedToken, setSelectedToken] = useState<CAT20Token | null>(null);
  const [tokenPrices, setTokenPrices] = useState<Record<string, TokenPrice>>({});
  const [borrowAmount, setBorrowAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [duration] = useState(7); // Fixed 7-day duration
  const [step, setStep] = useState<'select' | 'transfer' | 'confirm'>('select');

  // Calculate max borrow amount (70% of collateral value)
  const maxBorrowRatio = 0.7;
  const liquidationRatio = 0.8;

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const prices = await Promise.all(
          SUPPORTED_CAT20_TOKENS.map(async (token) => {
            const price = await getTokenPrice(token.id);
            return [token.id, price];
          })
        );
        setTokenPrices(Object.fromEntries(prices));
      } catch (error) {
        console.error('Error fetching token prices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  const calculateMaxBorrow = (tokenPrice: number) => {
    const collateralValueInBTC = collection.floorPrice / 100_000_000;
    return collateralValueInBTC * maxBorrowRatio;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken) return;

    if (step === 'select') {
      setStep('transfer');
      return;
    }

    if (step === 'transfer') {
      // TODO: Implement ordinal transfer logic
      setStep('confirm');
      return;
    }

    // Final confirmation
    const tokenPrice = tokenPrices[selectedToken.id];
    console.log('Creating borrow position:', {
      collectionId: collection.inscriptionId,
      tokenId: selectedToken.id,
      borrowAmount: parseFloat(borrowAmount),
      duration,
      collateralValue: collection.floorPrice,
      tokenPrice: tokenPrice.latestTradePrice
    });
    
    onClose();
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (step) {
      case 'select':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select CAT20 Token
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={selectedToken?.id || ''}
                onChange={(e) => {
                  const token = SUPPORTED_CAT20_TOKENS.find(t => t.id === e.target.value);
                  setSelectedToken(token || null);
                }}
                required
              >
                <option value="">Select a token</option>
                {SUPPORTED_CAT20_TOKENS.map((token) => (
                  <option key={token.id} value={token.id}>
                    {token.symbol} - {tokenPrices[token.id]?.latestTradePrice / 100_000_000 || 'N/A'} FBTC
                  </option>
                ))}
              </select>
            </div>

            {selectedToken && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Borrow Amount (max {calculateMaxBorrow(tokenPrices[selectedToken.id]?.latestTradePrice || 0)} FBTC)
                </label>
                <input
                  type="number"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  max={calculateMaxBorrow(tokenPrices[selectedToken.id]?.latestTradePrice || 0)}
                  step="0.000001"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Liquidation at {(liquidationRatio * 100).toFixed(0)}% of collateral value
                </p>
              </div>
            )}
          </>
        );

      case 'transfer':
        return (
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Transfer Ordinal</h3>
            <p className="mb-4">
              Please transfer your {collection.name} Ordinal to the smart contract.
            </p>
            {/* TODO: Add transfer UI components */}
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                Make sure to verify the contract address before transferring.
              </p>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Confirm Borrow Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-2">
                <li>Token: {selectedToken?.symbol}</li>
                <li>Amount: {borrowAmount} FBTC</li>
                <li>Duration: {duration} days</li>
                <li>Collateral: {collection.name}</li>
                <li>Liquidation Price: {(collection.floorPrice * liquidationRatio / 100_000_000).toFixed(6)} FBTC</li>
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Borrow CAT20 Tokens</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-lg">{collection.name}</h3>
          <p className="text-gray-600">Collateral Value: {collection.floorPrice / 100_000_000} FBTC</p>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading token prices...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderStepContent()}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                disabled={!selectedToken || !borrowAmount}
              >
                {step === 'select' ? 'Continue' : step === 'transfer' ? 'Next' : 'Confirm Borrow'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 