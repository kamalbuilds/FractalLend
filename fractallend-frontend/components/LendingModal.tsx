import { useState, useEffect } from 'react';
import { NFTCollection } from '@/types/lending';
import { CAT20Token, TokenPrice } from '@/types/cat20';
import { SUPPORTED_CAT20_TOKENS, getTokenPrice } from '@/lib/cat20Api';

interface LendingModalProps {
  collection: NFTCollection;
  isOpen: boolean;
  onClose: () => void;
}

export function LendingModal({ collection, isOpen, onClose }: LendingModalProps) {
  const [selectedToken, setSelectedToken] = useState<CAT20Token | null>(null);
  const [tokenPrices, setTokenPrices] = useState<Record<string, TokenPrice>>({});
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [duration] = useState(7); // Fixed 7-day duration
  const minLoanAmount = 0.1; // 0.1 BTC minimum

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken) return;

    const tokenPrice = tokenPrices[selectedToken.id];
    console.log('Creating lending offer:', {
      collectionId: collection.inscriptionId,
      tokenId: selectedToken.id,
      amount: parseFloat(amount),
      duration,
      collateralValue: collection.floorPrice,
      tokenPrice: tokenPrice.latestTradePrice
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-green-400 font-bold">Lend CAT20 Tokens</h2>
          <button onClick={onClose} className="text-blue-500 hover:text-blue-700">✕</button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-lg">{collection.name}</h3>
          <p className="text-blue-600">Collateral Value: {collection.floorPrice / 100_000_000} BTC</p>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading token prices...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">
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

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">
                Amount (min {minLoanAmount} BTC worth)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded-lg"
                min={minLoanAmount}
                step="0.01"
                required
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-black">
              <h4 className="font-medium mb-2 ">Loan Terms</h4>
              <ul className="space-y-2 text-sm">
                <li>Duration: {duration} days</li>
                <li>Collateral: {collection.name}</li>
                <li>Floor Price: {collection.floorPrice / 100_000_000} BTC</li>
                {selectedToken && (
                  <li>Token Price: ${tokenPrices[selectedToken.id]?.latestTradePrice / 100_000_000}</li>
                )}
              </ul>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                disabled={!selectedToken}
              >
                Create Lending Offer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 