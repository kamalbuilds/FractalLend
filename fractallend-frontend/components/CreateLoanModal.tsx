import { useState } from 'react';
import { NFTCollection } from '@/types/lending';

interface CreateLoanModalProps {
  collection: NFTCollection;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateLoanModal({ collection, isOpen, onClose }: CreateLoanModalProps) {
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration] = useState('');
  const maxLoanAmount = 0.75 * collection.floorPrice;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement loan offer creation
    console.log('Creating loan offer:', {
      collectionId: collection.inscriptionId,
      interestRate: parseFloat(interestRate),
      duration: parseInt(duration),
      maxLoanAmount: maxLoanAmount,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-green">Create Loan Offer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-lg">{collection.name}</h3>
          <p className="text-gray-600">Floor Price: {collection.floorPrice} sats</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (% APR)
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full p-2 border rounded-lg"
              min="0"
              max="100"
              step="0.1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (days)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2 border rounded-lg"
              min="1"
              max="365"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Loan Amount (sats)
            </label>
            <input
              type="number"
              value={maxLoanAmount}
              disabled={true}
              className="w-full p-2 border rounded-lg"
              min="1"
              max={collection.floorPrice}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Max: {collection.floorPrice} sats (Floor Price)
            </p>
          </div>

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
            >
              Create Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 