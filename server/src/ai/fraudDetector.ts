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

const AI_PROVIDER = process.env.AI_PROVIDER || 'mock'; // 'alemllm' | 'openai' | 'anthropic' | 'mock'

// =========================================
// AI через AlemLLM (Alem Plus — Kazakhstan AI)
// OpenAI-совместимый API
// =========================================
async function callAlemLLM(prompt: string): Promise<string> {
  const res = await fetch(process.env.ALEM_API_URL || 'https://llm.alem.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ALEM_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'alemllm',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data: any = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// =========================================
// AI через OpenAI
// =========================================
async function callOpenAI(prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    }),
  });
  const data: any = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// =========================================
// AI через Anthropic
// =========================================
async function callAnthropic(prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data: any = await res.json();
  return data.content?.[0]?.text || '';
}

// =========================================
// Универсальный вызов AI
// =========================================
async function callAI(prompt: string): Promise<string> {
  if (AI_PROVIDER === 'alemllm') return callAlemLLM(prompt);
  if (AI_PROVIDER === 'openai') return callOpenAI(prompt);
  if (AI_PROVIDER === 'anthropic') return callAnthropic(prompt);
  return '';
}

function parseJSON(text: string): any {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in AI response');
  return JSON.parse(match[0]);
}

// =========================================
// MOCK AI — работает без API ключа
// Анализирует данные по правилам
// =========================================
function mockVerifyProperty(data: PropertyData): VerificationResult {
  let score = 85;
  let flags = 0;
  const details: string[] = [];
  const pricePerSqm = data.priceLamports / data.areaSqm;

  // Слишком много листингов за месяц
  if (data.sellerHistory && data.sellerHistory.recentListings30Days > 5) {
    score -= 30;
    flags |= 4;
    details.push(`Продавец выставил ${data.sellerHistory.recentListings30Days} объектов за 30 дней — подозрительная активность`);
  }

  // Предыдущие флаги
  if (data.sellerHistory && data.sellerHistory.previousFraudFlags > 0) {
    score -= 20;
    flags |= 4;
    details.push(`У продавца ${data.sellerHistory.previousFraudFlags} предыдущих fraud-флагов`);
  }

  // Площадь слишком маленькая или большая
  if (data.areaSqm < 10 || data.areaSqm > 500) {
    score -= 15;
    flags |= 16;
    details.push(`Необычная площадь: ${data.areaSqm} м²`);
  }

  // Этаж больше чем всего этажей
  if (data.floor > data.totalFloors) {
    score -= 25;
    flags |= 8;
    details.push(`Этаж ${data.floor} больше общего количества ${data.totalFloors} — ошибка в документах`);
  }

  // Нет кадастрового номера
  if (!data.cadastralId || data.cadastralId.length < 5) {
    score -= 20;
    flags |= 8;
    details.push('Кадастровый номер отсутствует или некорректный');
  }

  score = Math.max(0, Math.min(100, score));

  const marketEstimate = data.priceLamports * (0.9 + Math.random() * 0.2);

  return {
    verificationScore: score,
    isVerified: score >= 60 && flags === 0,
    fraudFlags: flags,
    fraudDetails: details.length > 0 ? details.join('. ') : 'Проверка пройдена. Документы соответствуют формату, данные корректны.',
    marketPriceEstimate: Math.round(marketEstimate),
  };
}

function mockCheckDeal(data: DealData): DealCheckResult {
  const flags: string[] = [];
  let risk = 15;

  // Цена сильно отличается от рынка
  if (data.marketEstimate > 0) {
    const deviation = Math.abs(data.price - data.marketEstimate) / data.marketEstimate;
    if (deviation > 0.4) {
      risk += 35;
      flags.push('PRICE_MANIPULATION');
    } else if (deviation > 0.2) {
      risk += 15;
      flags.push('PRICE_ANOMALY');
    }
  }

  // Новый покупатель — крупная покупка
  if (data.buyerAccountAge < 7) {
    risk += 20;
    flags.push('SUSPICIOUS_BUYER');
  }

  // Повторяющаяся пара buyer-seller
  if (data.isRepeatBuyer) {
    risk += 15;
    flags.push('REPEAT_PATTERN');
  }

  // Низкий verification score объекта
  if (data.propertyVerificationScore < 50) {
    risk += 25;
    flags.push('LOW_VERIFICATION');
  }

  risk = Math.min(100, risk);

  let recommendation: 'approve' | 'review' | 'block';
  if (risk > 75) recommendation = 'block';
  else if (risk > 40) recommendation = 'review';
  else recommendation = 'approve';

  return { riskScore: risk, flags, recommendation };
}

// =========================================
// EXPORTED FUNCTIONS
// =========================================

export async function verifyProperty(data: PropertyData): Promise<VerificationResult> {
  if (AI_PROVIDER === 'mock') return mockVerifyProperty(data);

  const pricePerSqm = data.priceLamports / data.areaSqm;
  const prompt = `You are a real estate fraud detection AI for Kazakhstan market.
Analyze this property and detect potential fraud.

Property: ${data.address}, ${data.areaSqm}sqm, ${data.rooms} rooms, floor ${data.floor}/${data.totalFloors}
Cadastral: ${data.cadastralId}, Price: ${data.priceLamports} lamports (${pricePerSqm.toFixed(0)}/sqm)
Type: ${data.propertyType}
Seller: ${data.sellerHistory?.totalPropertiesListed || 0} total listings, ${data.sellerHistory?.recentListings30Days || 0} in 30 days, ${data.sellerHistory?.previousFraudFlags || 0} fraud flags

Check: DUPLICATE_LISTING, PRICE_ANOMALY, SUSPICIOUS_SELLER, DOCUMENT_ISSUES, FAKE_ADDRESS, RAPID_RESALE

Respond JSON only:
{"verificationScore":<0-100>,"isVerified":<bool>,"fraudFlags":<bitmask:1=dup,2=price,4=seller,8=docs,16=addr,32=resale>,"fraudDetails":"<russian>","marketPriceEstimate":<number>}`;

  try {
    const text = await callAI(prompt);
    return parseJSON(text);
  } catch {
    return mockVerifyProperty(data);
  }
}

export async function checkDeal(data: DealData): Promise<DealCheckResult> {
  if (AI_PROVIDER === 'mock') return mockCheckDeal(data);

  const priceDiff = data.marketEstimate > 0
    ? ((data.price - data.marketEstimate) / data.marketEstimate * 100).toFixed(1)
    : '0';

  const prompt = `You are a real estate transaction fraud detection AI for Kazakhstan.
Analyze this deal:

Property: ${data.propertyAddress}, verification: ${data.propertyVerificationScore}/100
Price: ${data.price}, market: ${data.marketEstimate}, deviation: ${priceDiff}%
Seller deals: ${data.sellerDealCount}, Buyer age: ${data.buyerAccountAge} days, repeat: ${data.isRepeatBuyer}

Check: PRICE_MANIPULATION, SUSPICIOUS_BUYER, REPEAT_PATTERN, LOW_VERIFICATION, RUSH_DEAL

Respond JSON only:
{"riskScore":<0-100>,"flags":["flag1"],"recommendation":"<approve|review|block>"}`;

  try {
    const text = await callAI(prompt);
    return parseJSON(text);
  } catch {
    return mockCheckDeal(data);
  }
}

export function checkDuplicate(
  cadastralId: string,
  existingProperties: { cadastralId: string; propertyId: string }[]
): { isDuplicate: boolean; existingPropertyId?: string } {
  const match = existingProperties.find(p => p.cadastralId === cadastralId);
  return match
    ? { isDuplicate: true, existingPropertyId: match.propertyId }
    : { isDuplicate: false };
}
