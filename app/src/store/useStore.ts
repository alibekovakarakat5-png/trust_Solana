import { create } from 'zustand';

interface Property {
  propertyId: string;
  address: string;
  areaSqm: number;
  rooms: number;
  floor: number;
  totalFloors: number;
  cadastralId: string;
  priceLamports: number;
  propertyType: string;
  isVerified: boolean;
  aiScore: number;
  fraudFlags: number;
  isListed: boolean;
  owner: string;
  status: string;
  imageUrl?: string;
  isFractionalized?: boolean;
  totalShares?: number;
  pricePerShare?: number;
  availableShares?: number;
  shareMintPubkey?: string;
}

interface Deal {
  dealId: string;
  propertyId: string;
  seller: string;
  buyer: string;
  price: number;
  status: string;
  aiRiskScore: number;
  aiFlags: string[];
  createdAt: number;
  onChainTx?: string;
}

interface PlatformStats {
  totalProperties: number;
  totalDeals: number;
  totalFraudBlocked: number;
}

interface AppState {
  properties: Property[];
  deals: Deal[];
  stats: PlatformStats;
  setProperties: (p: Property[]) => void;
  addProperty: (p: Property) => void;
  updateProperty: (id: string, update: Partial<Property>) => void;
  setDeals: (d: Deal[]) => void;
  addDeal: (d: Deal) => void;
  updateDeal: (id: string, update: Partial<Deal>) => void;
  setStats: (s: PlatformStats) => void;
  incrementFraudBlocked: () => void;
}

export const useStore = create<AppState>((set) => ({
  properties: [],
  deals: [],
  stats: { totalProperties: 0, totalDeals: 0, totalFraudBlocked: 0 },

  setProperties: (properties) => set({ properties }),
  addProperty: (p) => set((s) => ({
    properties: [...s.properties, p],
    stats: { ...s.stats, totalProperties: s.stats.totalProperties + 1 },
  })),
  updateProperty: (id, update) => set((s) => ({
    properties: s.properties.map((p) => (p.propertyId === id ? { ...p, ...update } : p)),
  })),
  setDeals: (deals) => set({ deals }),
  addDeal: (d) => set((s) => ({
    deals: [...s.deals, d],
    stats: { ...s.stats, totalDeals: s.stats.totalDeals + 1 },
  })),
  updateDeal: (id, update) => set((s) => ({
    deals: s.deals.map((d) => (d.dealId === id ? { ...d, ...update } : d)),
  })),
  setStats: (stats) => set({ stats }),
  incrementFraudBlocked: () => set((s) => ({
    stats: { ...s.stats, totalFraudBlocked: s.stats.totalFraudBlocked + 1 },
  })),
}));
