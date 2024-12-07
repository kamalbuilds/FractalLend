'use client';

import React from 'react';
import Link from 'next/link';
import { useWallet } from '../contexts/WalletContext';

export default function LandingPage() {
  const { address, connect } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6">
            P2P Lending on
            <span className="text-blue-500"> Fractal Chain</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Borrow against your inscriptions or earn yield by providing liquidity
          </p>
          <div className="flex justify-center gap-4">
            {address ? (
              <Link
                href="/lending"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
              >
                Launch App
              </Link>
            ) : (
              <button
                onClick={connect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Borrow</h3>
            <p className="text-gray-400">
              Use your inscriptions as collateral to borrow CAT20 tokens
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Lend</h3>
            <p className="text-gray-400">
              Provide liquidity to earn interest on your CAT20 tokens
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Liquidate</h3>
            <p className="text-gray-400">
              Participate in liquidation auctions to earn discounted inscriptions
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-500 mb-2">$1M+</div>
            <div className="text-gray-400">Total Value Locked</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-500 mb-2">1000+</div>
            <div className="text-gray-400">Active Loans</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-500 mb-2">5%</div>
            <div className="text-gray-400">Average APY</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-500 mb-2">0</div>
            <div className="text-gray-400">Defaults</div>
          </div>
        </div>
      </div>
    </div>
  );
}