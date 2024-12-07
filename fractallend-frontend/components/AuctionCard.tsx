'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Auction } from '@/types/auction';
import { placeBid } from '@/lib/api';

interface AuctionCardProps {
  auction: Auction;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const { address, signTransaction } = useWallet();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = auction.endTime - now;
      
      if (remaining <= 0) {
        setTimeLeft('Ended');
        clearInterval(timer);
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [auction.endTime]);

  const handleBid = async () => {
    if (!address || !bidAmount) return;
    
    try {
      setLoading(true);
      
      const { unsignedTx } = await placeBid(auction.id, bidAmount);
      const signedTx = await signTransaction(unsignedTx);

      // TODO: Submit signed transaction to network
      console.log('Signed transaction:', signedTx);
    } catch (error) {
      console.error('Error placing bid:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Liquidation Auction</h3>
        <div className="text-sm text-gray-400">{timeLeft}</div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-400">Collateral Amount</div>
          <div className="text-lg font-medium">
            {parseFloat(auction.collateralAmount).toFixed(8)} BTC
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-400">Current Price</div>
          <div className="text-lg font-medium">
            {parseFloat(auction.currentPrice).toFixed(2)} FUSD
          </div>
        </div>

        {auction.status === 'active' && (
          <div>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 mb-2"
              placeholder="Bid Amount (FUSD)"
            />
            <button
              onClick={handleBid}
              disabled={loading || !bidAmount || !address}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg py-2 px-4"
            >
              {loading ? 'Processing...' : 'Place Bid'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 