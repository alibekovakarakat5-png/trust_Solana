import { Router } from 'express';

export const propertyRoutes = Router();

const properties: Map<string, any> = new Map();

propertyRoutes.get('/', (_, res) => {
  res.json(Array.from(properties.values()));
});

propertyRoutes.get('/:id', (req, res) => {
  const prop = properties.get(req.params.id);
  if (!prop) return res.status(404).json({ error: 'Not found' });
  res.json(prop);
});

propertyRoutes.post('/', (req, res) => {
  const data = req.body;
  properties.set(data.propertyId, {
    ...data,
    createdAt: Date.now(),
    status: 'pending_verification',
  });
  res.json({ success: true, propertyId: data.propertyId });
});

propertyRoutes.get('/cadastral/:cadastralId', (req, res) => {
  const existing = Array.from(properties.values()).filter(
    p => p.cadastralId === req.params.cadastralId
  );
  res.json({ exists: existing.length > 0, properties: existing });
});
