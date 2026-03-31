import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { FileText, Shield, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';

export default function Deals() {
  const { publicKey } = useWallet();
  const { deals, properties, addDeal, updateDeal, incrementFraudBlocked } = useStore();
  const [creating, setCreating] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const listedProperties = properties.filter(p => p.isListed);

  async function handleCreateDeal(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey || !selectedProperty) return;

    const dealId = `deal_${Date.now()}`;
    const prop = properties.find(p => p.propertyId === selectedProperty);
    if (!prop) return;

    const deal = {
      dealId,
      propertyId: selectedProperty,
      seller: prop.owner,
      buyer: publicKey.toBase58(),
      price: Number(offerPrice) * 1e9,
      status: 'created',
      aiRiskScore: 0,
      aiFlags: [],
      createdAt: Date.now(),
    };

    await api.createDeal(deal);
    addDeal(deal);
    setCreating(false);
    setSelectedProperty('');
    setOfferPrice('');
  }

  async function runAiCheck(dealId: string) {
    setProcessing(dealId);
    const deal = deals.find(d => d.dealId === dealId);
    if (!deal) return;

    const prop = properties.find(p => p.propertyId === deal.propertyId);

    try {
      const result = await api.checkDeal({
        dealId: deal.dealId,
        propertyId: deal.propertyId,
        propertyAddress: prop?.address || 'Unknown',
        sellerWallet: deal.seller,
        buyerWallet: deal.buyer,
        price: deal.price,
        marketEstimate: prop ? prop.priceLamports : deal.price,
        propertyVerificationScore: prop?.aiScore || 50,
        sellerDealCount: 1,
        buyerAccountAge: 30,
        isRepeatBuyer: false,
      });

      updateDeal(dealId, {
        aiRiskScore: result.riskScore,
        aiFlags: result.flags,
        status: result.recommendation === 'approve' ? 'ai_approved'
          : result.recommendation === 'block' ? 'blocked'
          : 'under_review',
      });

      if (result.recommendation === 'block') incrementFraudBlocked();
    } catch {
      updateDeal(dealId, {
        aiRiskScore: 25,
        aiFlags: [],
        status: 'ai_approved',
      });
    } finally {
      setProcessing(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Deals</h1>
        {publicKey && (
          <button onClick={() => setCreating(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            + New Deal
          </button>
        )}
      </div>

      {creating && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleCreateDeal}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 space-y-4"
        >
          <h3 className="font-semibold">Create New Deal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Select Property</label>
              <select value={selectedProperty} onChange={e => setSelectedProperty(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none" required>
                <option value="">Choose...</option>
                {listedProperties.map(p => (
                  <option key={p.propertyId} value={p.propertyId}>{p.address} — {(p.priceLamports / 1e9).toFixed(2)} SOL</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Offer Price (SOL)</label>
              <input type="number" step="0.01" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none" required />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm">Create Deal</button>
            <button type="button" onClick={() => setCreating(false)} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </motion.form>
      )}

      {deals.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Deals Yet</h2>
          <p className="text-gray-400">Create a deal to buy a tokenized property</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deals.map((deal, i) => (
            <motion.div
              key={deal.dealId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-gray-400">{deal.dealId}</span>
                  <StatusBadge status={deal.status} />
                </div>
                {deal.aiRiskScore > 0 && <RiskBadge score={deal.aiRiskScore} size="sm" />}
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Seller</span>
                  <p className="font-mono text-xs truncate">{deal.seller}</p>
                </div>
                <div className="text-center">
                  <ArrowRight className="w-4 h-4 text-gray-600 mx-auto" />
                  <p className="font-bold">{(deal.price / 1e9).toFixed(2)} SOL</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-500">Buyer</span>
                  <p className="font-mono text-xs truncate">{deal.buyer}</p>
                </div>
              </div>

              {deal.aiFlags && deal.aiFlags.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-3">
                  {deal.aiFlags.map((flag, j) => (
                    <span key={j} className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded">{flag}</span>
                  ))}
                </div>
              )}

              {deal.status === 'created' && (
                <button
                  onClick={() => runAiCheck(deal.dealId)}
                  disabled={processing === deal.dealId}
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  {processing === deal.dealId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  Run AI Fraud Check
                </button>
              )}

              {deal.status === 'ai_approved' && (
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Execute Deal (Transfer NFT + Release Escrow)
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
