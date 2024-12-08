'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '../contexts/WalletContext';

export function Navigation() {
  const pathname = usePathname();
  const { address, connect, disconnect } = useWallet();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-white">
              FractalLend
            </Link>
            
            <div className="flex space-x-4">
              <Link
                href="/lending"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/lending')
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Lending
              </Link>
              <Link
                href="/borrow"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/borrow')
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Borrow
              </Link>
              <Link
                href="/auctions"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/auctions')
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Auctions
              </Link>
            </div>
          </div>

          <div>
            {address ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => connect()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 