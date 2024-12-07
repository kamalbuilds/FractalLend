'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { Auction, Bid } from '@/types/auction';
import { getAuctionById, placeBid } from '@/lib/api';

export default function AuctionDetailsPage() {
  const { id } = useParams();
  const { address, signTransaction } = useWallet();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const data = await getAuctionById(id as string);
        setAuction(data);
      } catch (error) {
        console.error('Error fetching auction:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id]);

  const handleBid = async () => {
    if (!address || !bidAmount || !auction) return;
    
    try {
      setBidding(true);
      const { unsignedTx } = await placeBid(auction.id, bidAmount);
      const signedTx = await signTransaction(unsignedTx);
      
      // TODO: Submit signed transaction to network
      console.log('Signed transaction:', signedTx);
    } catch (error) {
      console.error('Error placing bid:', error);
    } finally {
      setBidding(false);
    }
  };

  if (loading || !auction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Auction Details</h1>
        
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Collateral</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Amount</div>
                  <div className="text-xl font-medium">
                    {parseFloat(auction.collateralAmount).toFixed(8)} BTC
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Start Price</div>
                  <div className="text-xl font-medium">
                    {parseFloat(auction.startPrice).toFixed(2)} FUSD
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Current Price</div>
                  <div className="text-xl font-medium">
                    {parseFloat(auction.currentPrice).toFixed(2)} FUSD
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Place Bid</h2>
              {auction.status === 'active' ? (
                <div className="space-y-4">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2"
                    placeholder="Bid Amount (FUSD)"
                  />
                  <button
                    onClick={handleBid}
                    disabled={bidding || !bidAmount || !address}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg py-3 px-4"
                  >
                    {bidding ? 'Processing...' : 'Place Bid'}
                  </button>
                </div>
              ) : (
                <div className="text-gray-400">
                  This auction has {auction.status === 'completed' ? 'ended' : 'been cancelled'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 