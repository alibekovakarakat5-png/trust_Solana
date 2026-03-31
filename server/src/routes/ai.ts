import { Router } from 'express';
import { verifyProperty, checkDeal, checkDuplicate } from '../ai/fraudDetector';
import { submitAiVerificationOnChain, submitDealAiCheckOnChain } from '../solana/onchainOracle';

export const aiRoutes = Router();

aiRoutes.post('/verify-property', async (req, res) => {
  try {
    const result = await verifyProperty(req.body);

    // Submit AI verdict on-chain asynchronously (non-blocking)
    const propertyId = req.body.propertyId;
    let onChainTx: string | null = null;
    if (propertyId) {
      onChainTx = await submitAiVerificationOnChain({
        propertyId,
        verificationScore: result.verificationScore,
        isVerified: result.isVerified,
        fraudFlags: result.fraudFlags,
        fraudDetails: result.fraudDetails,
        marketPriceEstimate: result.marketPriceEstimate,
      });
    }

    res.json({ ...result, onChainTx });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

aiRoutes.post('/check-deal', async (req, res) => {
  try {
    const result = await checkDeal(req.body);

    // Submit deal AI check on-chain
    const dealId = req.body.dealId;
    let onChainTx: string | null = null;
    if (dealId) {
      onChainTx = await submitDealAiCheckOnChain({
        dealId,
        riskScore: result.riskScore,
        flags: result.flags,
        recommendation: result.recommendation,
      });
    }

    res.json({ ...result, onChainTx });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

aiRoutes.post('/check-duplicate', async (req, res) => {
  const { cadastralId, existingProperties } = req.body;
  const result = checkDuplicate(cadastralId, existingProperties || []);
  res.json(result);
});
