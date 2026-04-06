// Realistic Solana devnet addresses (base58, 44 chars)
const WALLETS = {
  seller1: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  seller2: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  fraudSeller: '3Hk7Rz5Kf2qo6P4kNwBYvU8eJmV8cQxST1nGhdR7wXeP',
  buyer1: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
  buyer2: '6YGhk9FiKJWxSTvXHCdqBnLsP2oEPs9yZRNxekYyh8m3',
  buyer3: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
};

// Property images (Unsplash free license)
const PROPERTY_IMAGES = {
  apartment1: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop',
  apartment2: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop',
  commercial: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
};

export const DEMO_PROPERTIES = [
  {
    propertyId: 'prop_almaty_001',
    address: 'Almaty, Abay ave. 50, apt 12',
    areaSqm: 65,
    rooms: 2,
    floor: 5,
    totalFloors: 9,
    cadastralId: '20:01:234567:012',
    priceLamports: 24_750_000_000,
    propertyType: 'Apartment',
    isVerified: true,
    aiScore: 92,
    fraudFlags: 0,
    isListed: true,
    owner: WALLETS.seller1,
    status: 'verified',
    imageUrl: PROPERTY_IMAGES.apartment1,
  },
  {
    propertyId: 'prop_astana_002',
    address: 'Astana, Mangilik El 55/1, apt 203',
    areaSqm: 84,
    rooms: 3,
    floor: 12,
    totalFloors: 25,
    cadastralId: '20:02:345678:456',
    priceLamports: 44_820_000_000,
    propertyType: 'Apartment',
    isVerified: true,
    aiScore: 88,
    fraudFlags: 0,
    isListed: true,
    owner: WALLETS.seller2,
    status: 'verified',
    imageUrl: PROPERTY_IMAGES.apartment2,
  },
  {
    propertyId: 'prop_almaty_003',
    address: 'Almaty, Tole Bi 99, office 15',
    areaSqm: 120,
    rooms: 4,
    floor: 1,
    totalFloors: 5,
    cadastralId: '20:01:111222:333',
    priceLamports: 59_500_000_000,
    propertyType: 'Commercial',
    isVerified: false,
    aiScore: 34,
    fraudFlags: 6,
    isListed: false,
    owner: WALLETS.fraudSeller,
    status: 'pending_verification',
    imageUrl: PROPERTY_IMAGES.commercial,
  },
];

export const DEMO_DEALS = [
  // Fresh deal — judges can walk through the full lifecycle
  {
    dealId: 'deal_004_new',
    propertyId: 'prop_almaty_001',
    seller: WALLETS.seller1,
    buyer: WALLETS.buyer1,
    price: 24_750_000_000,
    status: 'created',
    aiRiskScore: 0,
    aiFlags: [],
    createdAt: Date.now() - 300000, // 5 minutes ago
  },
  {
    dealId: 'deal_001',
    propertyId: 'prop_almaty_001',
    seller: WALLETS.seller1,
    buyer: WALLETS.buyer2,
    price: 24_750_000_000,
    status: 'completed',
    aiRiskScore: 12,
    aiFlags: [],
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    dealId: 'deal_002',
    propertyId: 'prop_astana_002',
    seller: WALLETS.seller2,
    buyer: WALLETS.buyer1,
    price: 43_500_000_000,
    status: 'ai_approved',
    aiRiskScore: 28,
    aiFlags: [],
    createdAt: Date.now() - 86400000,
  },
  {
    dealId: 'deal_003_fraud',
    propertyId: 'prop_almaty_003',
    seller: WALLETS.fraudSeller,
    buyer: WALLETS.buyer3,
    price: 15_200_000_000,
    status: 'blocked',
    aiRiskScore: 91,
    aiFlags: ['DUPLICATE_LISTING', 'PRICE_ANOMALY', 'SUSPICIOUS_SELLER'],
    createdAt: Date.now() - 3600000,
  },
];

export const DEMO_STATS = {
  totalProperties: 3,
  totalDeals: 4,
  totalFraudBlocked: 1,
};
