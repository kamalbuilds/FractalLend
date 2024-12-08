import { NFTCollection } from '@/types/lending';

const UNISAT_API_KEY = process.env.NEXT_PUBLIC_UNISAT_API_KEY;
console.log(UNISAT_API_KEY, "unisat api key");
const UNISAT_BASE_URL = 'https://open-api-fractal.unisat.io';

// Static list of collection IDs we want to support
const SUPPORTED_COLLECTIONS = [
  'Frazuki',
  'Fractal_Satoshis',
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

// Add interface for collection inscriptions response
interface UnisatInscriptionsResponse {
  code: number;
  msg: string;
  data: {
    list: Array<{
      collectionId: string;
      collectionName: string;
      collectionItemName: string;
      collectionHighResImgUrl: string;
      inscriptionId: string;
      inscriptionNumber: number;
      contentType: string;
      listed: boolean;
    }>;
    total: number;
  };
}

async function unisatFetch<T>(endpoint: string, body: any): Promise<T> {
    console.log(`${UNISAT_BASE_URL}${endpoint}`, "url is here>>>" , JSON.stringify(body));
  const response = await fetch(`${UNISAT_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${UNISAT_API_KEY}`
    },
    body: JSON.stringify(body)
  });


  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const getCollectionDetails = async (collectionId: string): Promise<NFTCollection> => {
  try {
    const response = await unisatFetch<UnisatCollectionResponse>(
      '/v3/market/collection/auction/collection_statistic',
      { collectionId }
    );

    console.log(response, "response from the nft api");
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
    const response = await unisatFetch<UnisatInscriptionsResponse>(
      '/v3/market/collection/auction/collection_inscriptions',
      {
        collectionId,
        address,
        start,
        limit
      }
    );

    console.log(response, "response from the nft api");
    if (response.code !== 0) {
      throw new Error(response.msg);
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching collection inscriptions:', error);
    throw error;
  }
};