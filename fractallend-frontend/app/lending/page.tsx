'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { LendingPool, LoanPosition } from '@/types/lending';
import { getLendingPools, getLoanPositions } from '@/lib/api';
import { PoolCard } from '@/components/PoolCard';
import { PositionCard } from '@/components/PositionCard';
import { ConnectButton } from '../../components/ConnectButton';

export default function LendingPage() {
  const { address } = useWallet();
  const [pools, setPools] = useState<LendingPool[]>([]);
  const [positions, setPositions] = useState<LoanPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [poolsData, positionsData] = await Promise.all([
          getLendingPools(),
          address ? getLoanPositions(address) : Promise.resolve([]),
        ]);
        setPools(poolsData);
        setPositions(positionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">FractalLend</h1>
      
      {!address ? (
        <div className="text-center">
          <p className="mb-4">Connect your wallet to start lending</p>
          <ConnectButton />
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Positions</h2>
            {positions.length === 0 ? (
              <p>No active positions</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {positions.map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Available Pools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pools.map((pool) => (
                <PoolCard key={pool.id} pool={pool} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
} 