import axios from 'axios';
import { NFTCollection } from '@/types/lending';

const UNISAT_API_KEY = process.env.NEXT_PUBLIC_UNISAT_API_KEY;
const unisatApi = axios.create({
  baseURL: 'https://open-api.unisat.io',
  headers: {
    'Authorization': `Bearer ${UNISAT_API_KEY}`
  }
});

// Static list of collection IDs we want to support
const SUPPORTED_COLLECTIONS = [
  'Frazuki',
  'fractal_raffle',
  // Add more collection IDs here
];

interface UnisatCollectionResponse {
  code: number;
  msg: string;
  data: {
    collectionId: string;
    name: string;
    desc: string;
    icon: string;
    btcValue: number;
    btcValuePercent: number;
    floorPrice: number;
    listed: number;
    total: number;
    supply: number | null;
    twitter: string;
    discord: string;
    website: string;
    pricePercent: number;
    verification: boolean;
  };
}

export const getCollectionDetails = async (collectionId: string): Promise<NFTCollection> => {
  try {
    const { data: response } = await unisatApi.post<UnisatCollectionResponse>(
      '/v3/market/collection/auction/collection_statistic',
      { collectionId }
    );

    if (response.code !== 0) {
      throw new Error(response.msg);
    }

    return {
      inscriptionId: response.data.collectionId,
      name: response.data.name,
      description: response.data.desc,
      supply: response.data.total,
      floorPrice: response.data.floorPrice,
      imageUrl: response.data.icon,
      totalListed: response.data.listed,
      verification: response.data.verification,
      btcValue: response.data.btcValue,
      socialLinks: {
        twitter: response.data.twitter,
        discord: response.data.discord,
        website: response.data.website
      }
    };
  } catch (error) {
    console.error('Error fetching collection details:', error);
    throw error;
  }
};

export const getNFTCollections = async (): Promise<NFTCollection[]> => {
  try {
    // Fetch all supported collections in parallel
    const collections = await Promise.all(
      SUPPORTED_COLLECTIONS.map(collectionId => getCollectionDetails(collectionId))
    );

    return collections;
  } catch (error) {
    console.error('Error fetching NFT collections:', error);
    throw error;
  }
};

// Get inscriptions for a specific collection
export const getCollectionInscriptions = async (
  collectionId: string,
  address?: string,
  start = 0,
  limit = 20
) => {
  try {
    const { data: response } = await unisatApi.post(
      '/v3/market/collection/auction/collection_inscriptions',
      {
        collectionId,
        address,
        start,
        limit
      }
    );

    if (response.code !== 0) {
      throw new Error(response.msg);
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching collection inscriptions:', error);
    throw error;
  }
};