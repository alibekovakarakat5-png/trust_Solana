import { Router } from 'express';
import { verifyProperty, checkDeal, checkDuplicate } from '../ai/fraudDetector';

export const aiRoutes = Router();

aiRoutes.post('/verify-property', async (req, res) => {
  try {
    const result = await verifyProperty(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

aiRoutes.post('/check-deal', async (req, res) => {
  try {
    const result = await checkDeal(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

aiRoutes.post('/check-duplicate', async (req, res) => {
  const { cadastralId, existingProperties } = req.body;
  const result = checkDuplicate(cadastralId, existingProperties || []);
  res.json(result);
});
