import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { propertyRoutes } from './routes/property';
import { dealRoutes } from './routes/deal';
import { aiRoutes } from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/property', propertyRoutes);
app.use('/api/deal', dealRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', service: 'trustestate-server' });
});

app.listen(PORT, () => {
  console.log(`TrustEstate server running on port ${PORT}`);
});
