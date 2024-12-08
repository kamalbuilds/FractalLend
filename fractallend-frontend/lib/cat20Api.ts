import { CAT20Token, TokenPrice } from '@/types/cat20';

export const SUPPORTED_CAT20_TOKENS: CAT20Token[] = [
  {
    id: '45ee725c2c5993b3e4d308842d87e973bf1951f5f7a804b21e4dd964ecd12d6b_0',
    name: 'OPCAT',
    symbol: 'OPCAT',
    description: 'OPCAT Token'
  },
  {
    id: 'd1594975888bbd2a0935f0228a0634439436c1a5273690d73f555dc2b0df6a10_0',
    name: 'PSYOPCAT',
    symbol: 'PSYOPCAT',
    description: 'PSYOPCAT Token'
  },
  {
    id: 'ecf8ac3ea80ad1e96509ea4d7228bece1c02cae4ff7d423ab2df2a91ee899db7_0',
    name: 'SASHA',
    symbol: 'SASHA',
    description: 'SASHA Token'
  }
];

export const getTokenPrice = async (tokenId: string): Promise<TokenPrice> => {
  const response = await fetch(
    `https://api.catmarket.io/getTokenPrice?tokenId=${tokenId}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch token price');
  }

  const data = await response.json();
  if (data.code !== 0) {
    throw new Error('Invalid response from API');
  }

  return data.data;
}; 