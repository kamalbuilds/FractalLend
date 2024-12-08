'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { NFTCollection } from '@/types/lending';
import { getNFTCollections } from '@/lib/nftApi';
import { ConnectButton } from '@/components/ConnectButton';
import { CreateLoanModal } from '@/components/CreateLoanModal';

export default function LendingPage() {
  const { address } = useWallet();
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const collectionsData = await getNFTCollections();
        setCollections(collectionsData);
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const formatBTC = (sats: number) => {
    return (sats / 100_000_000).toFixed(8);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Borrow CAT20 Coins with your Ordinals</h1>
        {!address ? (
          <ConnectButton />
        ) : null}
      </div>

      {address ? (
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-6">Available Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <div 
                  key={collection.inscriptionId}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative aspect-square">
                    <img
                      src={collection.imageUrl}
                      alt={collection.name}
                      className="w-full h-full object-cover"
                    />
                    {collection.verification && (
                      <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                        Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{collection.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {collection.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Floor Price</p>
                        <p className="font-semibold">{formatBTC(collection.floorPrice)} BTC</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Listed/Total</p>
                        <p className="font-semibold">{collection.totalListed}/{collection.supply}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                      {collection.socialLinks.twitter && (
                        <a href={collection.socialLinks.twitter} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-500 hover:text-blue-600">
                          Twitter
                        </a>
                      )}
                      {collection.socialLinks.discord && (
                        <a href={collection.socialLinks.discord} target="_blank" rel="noopener noreferrer"
                           className="text-indigo-500 hover:text-indigo-600">
                          Discord
                        </a>
                      )}
                      {collection.socialLinks.website && (
                        <a href={collection.socialLinks.website} target="_blank" rel="noopener noreferrer"
                           className="text-gray-500 hover:text-gray-600">
                          Website
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCollection(collection);
                        setShowCreateModal(true);
                      }}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Create Loan Offer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            Connect your wallet to start lending or borrowing against NFT collections
          </p>
          <ConnectButton />
        </div>
      )}

      {selectedCollection && showCreateModal && (
        <CreateLoanModal
          collection={selectedCollection}
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedCollection(null);
          }}
        />
      )}
    </div>
  );
} 