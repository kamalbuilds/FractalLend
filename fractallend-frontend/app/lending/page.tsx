'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { LoanPosition } from '@/types/lending';
import { getLoanPositions } from '@/lib/api';
import { BorrowModal } from '@/components/BorrowModal';
import { PositionCard } from '@/components/PositionCard';
import { ConnectButton } from '@/components/ConnectButton';

export default function LendingPage() {
  const { address } = useWallet();
  const [positions, setPositions] = useState<LoanPosition[]>([]);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (address) {
          const positionsData = await getLoanPositions(address);
          setPositions(positionsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  const myBorrowedLoans = positions.filter(p => p.borrower === address);
  const myLentLoans = positions.filter(p => p.lender === address);
  const availableLoans = positions.filter(p => p.status === 'pending' && p.borrower !== address);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">P2P Lending</h1>
        
        {!address ? (
          <ConnectButton />
        ) : (
          <button
            onClick={() => setShowBorrowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4"
          >
            Create Loan Request
          </button>
        )}
      </div>
      
      {address ? (
        <div className="space-y-8">
          {myBorrowedLoans.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">My Borrowed Loans</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myBorrowedLoans.map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
              </div>
            </section>
          )}

          {myLentLoans.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">My Lent Loans</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myLentLoans.map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-semibold mb-4">Available Loan Requests</h2>
            {availableLoans.length === 0 ? (
              <p className="text-gray-500">No loan requests available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableLoans.map((loan) => (
                  <PositionCard key={loan.id} position={loan} />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">Connect your wallet to start lending or borrowing</p>
          <ConnectButton />
        </div>
      )}

      {showBorrowModal && (
        <BorrowModal onClose={() => setShowBorrowModal(false)} />
      )}
    </div>
  );
} 