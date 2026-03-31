const BASE = '/api';

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  getProperties: () => request('/property'),
  getProperty: (id: string) => request(`/property/${id}`),
  createProperty: (data: any) => request('/property', { method: 'POST', body: JSON.stringify(data) }),
  checkCadastral: (cadastralId: string) => request(`/property/cadastral/${cadastralId}`),

  getDeals: () => request('/deal'),
  getDeal: (id: string) => request(`/deal/${id}`),
  createDeal: (data: any) => request('/deal', { method: 'POST', body: JSON.stringify(data) }),
  updateDealStatus: (id: string, data: any) => request(`/deal/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),

  verifyProperty: (data: any) => request('/ai/verify-property', { method: 'POST', body: JSON.stringify(data) }),
  checkDeal: (data: any) => request('/ai/check-deal', { method: 'POST', body: JSON.stringify(data) }),
  checkDuplicate: (data: any) => request('/ai/check-duplicate', { method: 'POST', body: JSON.stringify(data) }),
};
