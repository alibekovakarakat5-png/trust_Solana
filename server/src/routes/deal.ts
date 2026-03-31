import { Router } from 'express';

export const dealRoutes = Router();

const deals: Map<string, any> = new Map();

dealRoutes.get('/', (_, res) => {
  res.json(Array.from(deals.values()));
});

dealRoutes.get('/:id', (req, res) => {
  const deal = deals.get(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Not found' });
  res.json(deal);
});

dealRoutes.post('/', (req, res) => {
  const data = req.body;
  deals.set(data.dealId, {
    ...data,
    createdAt: Date.now(),
    status: 'created',
  });
  res.json({ success: true, dealId: data.dealId });
});

dealRoutes.patch('/:id/status', (req, res) => {
  const deal = deals.get(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Not found' });
  deal.status = req.body.status;
  deal.aiRiskScore = req.body.aiRiskScore;
  deal.aiFlags = req.body.aiFlags;
  res.json(deal);
});
