import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface PropertyData {
  propertyId: string;
  address: string;
  areaSqm: number;
  rooms: number;
  floor: number;
  totalFloors: number;
  cadastralId: string;
  priceLamports: number;
  propertyType: string;
  documentHash: string;
  sellerHistory?: {
    totalPropertiesListed: number;
    recentListings30Days: number;
    previousFraudFlags: number;
  };
}

export interface DealData {
  dealId: string;
  propertyId: string;
  propertyAddress: string;
  sellerWallet: string;
  buyerWallet: string;
  price: number;
  marketEstimate: number;
  propertyVerificationScore: number;
  sellerDealCount: number;
  buyerAccountAge: number;
  isRepeatBuyer: boolean;
}

export interface VerificationResult {
  verificationScore: number;
  isVerified: boolean;
  fraudFlags: number;
  fraudDetails: string;
  marketPriceEstimate: number;
}

export interface DealCheckResult {
  riskScore: number;
  flags: string[];
  recommendation: 'approve' | 'review' | 'block';
}

// AI верификация объекта недвижимости
export async function verifyProperty(data: PropertyData): Promise<VerificationResult> {
  const pricePerSqm = data.priceLamports / data.areaSqm;

  const prompt = `You are a real estate fraud detection AI for Kazakhstan market.
Analyze this property listing and detect potential fraud.

Property:
- Address: ${data.address}
- Area: ${data.areaSqm} sqm
- Rooms: ${data.rooms}
- Floor: ${data.floor}/${data.totalFloors}
- Cadastral ID: ${data.cadastralId}
- Listed price: ${data.priceLamports} lamports (${pricePerSqm.toFixed(0)} per sqm)
- Type: ${data.propertyType}
- Document hash: ${data.documentHash}

Seller history:
- Total properties listed: ${data.sellerHistory?.totalPropertiesListed || 0}
- Listed in last 30 days: ${data.sellerHistory?.recentListings30Days || 0}
- Previous fraud flags: ${data.sellerHistory?.previousFraudFlags || 0}

Check for these fraud patterns:
1. DUPLICATE_LISTING - same address/cadastral already exists
2. PRICE_ANOMALY - price significantly below or above market
3. SUSPICIOUS_SELLER - too many listings in short period
4. DOCUMENT_ISSUES - hash doesn't match expected format
5. FAKE_ADDRESS - address format inconsistencies
6. RAPID_RESALE - property being resold too quickly

Respond in JSON only:
{
  "verificationScore": <0-100>,
  "isVerified": <true/false>,
  "fraudFlags": <bitmask: 1=duplicate, 2=price, 4=seller, 8=docs, 16=address, 32=resale>,
  "fraudDetails": "<explanation in Russian>",
  "marketPriceEstimate": <estimated market price in lamports>
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AI verification failed:', error);
    return {
      verificationScore: 50,
      isVerified: false,
      fraudFlags: 0,
      fraudDetails: 'AI verification temporarily unavailable, manual review required',
      marketPriceEstimate: data.priceLamports,
    };
  }
}

// AI проверка сделки перед исполнением
export async function checkDeal(data: DealData): Promise<DealCheckResult> {
  const priceDiff = data.marketEstimate > 0
    ? ((data.price - data.marketEstimate) / data.marketEstimate * 100).toFixed(1)
    : '0';

  const prompt = `You are a real estate transaction fraud detection AI for Kazakhstan.
Analyze this deal and assess risk.

Deal:
- Property: ${data.propertyAddress}
- Seller wallet: ${data.sellerWallet}
- Buyer wallet: ${data.buyerWallet}
- Deal price: ${data.price} lamports
- Market estimate: ${data.marketEstimate} lamports
- Price deviation: ${priceDiff}%
- Property verification score: ${data.propertyVerificationScore}/100
- Seller total deals: ${data.sellerDealCount}
- Buyer account age: ${data.buyerAccountAge} days
- Is repeat buyer with this seller: ${data.isRepeatBuyer}

Check for:
1. PRICE_MANIPULATION - deal price significantly different from market
2. SUSPICIOUS_BUYER - new account, immediate large purchase
3. REPEAT_PATTERN - same buyer-seller pair too frequently
4. LOW_VERIFICATION - property has low AI verification score
5. RUSH_DEAL - deal created and funded too quickly

Respond in JSON only:
{
  "riskScore": <0-100>,
  "flags": ["flag1", "flag2"],
  "recommendation": "<approve|review|block>",
  "explanation": "<brief explanation in Russian>"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const result = JSON.parse(jsonMatch[0]);
    return {
      riskScore: result.riskScore,
      flags: result.flags || [],
      recommendation: result.recommendation,
    };
  } catch (error) {
    console.error('AI deal check failed:', error);
    return {
      riskScore: 50,
      flags: ['ai_unavailable'],
      recommendation: 'review',
    };
  }
}

// Проверка дубликатов по кадастровому номеру
export function checkDuplicate(
  cadastralId: string,
  existingProperties: { cadastralId: string; propertyId: string }[]
): { isDuplicate: boolean; existingPropertyId?: string } {
  const match = existingProperties.find(p => p.cadastralId === cadastralId);
  return match
    ? { isDuplicate: true, existingPropertyId: match.propertyId }
    : { isDuplicate: false };
}
