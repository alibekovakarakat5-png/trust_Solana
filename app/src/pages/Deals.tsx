import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { FileText, Shield, Loader2, ArrowRight, ExternalLink, Wallet, CheckCheck, Zap, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';
import { useTxStore } from '../store/useTxStore';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import toast from 'react-hot-toast';

export default function Deals() {
  const { t } = useTranslation();
  const { publicKey } = useWallet();
  const { deals, properties, addDeal, updateDeal, incrementFraudBlocked } = useStore();
  const addTx = useTxStore((s) => s.addTx);
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

      const newStatus = result.recommendation === 'approve' ? 'ai_approved'
        : result.recommendation === 'block' ? 'blocked'
        : 'under_review';

      updateDeal(dealId, {
        aiRiskScore: result.riskScore,
        aiFlags: result.flags,
        status: newStatus,
        onChainTx: result.onChainTx || undefined,
      });

      if (result.onChainTx) {
        addTx({
          signature: result.onChainTx,
          type: 'deal_ai_check',
          description: `Deal AI check on-chain: risk ${result.riskScore}/100 — ${result.recommendation}`,
          timestamp: Date.now(),
        });
        toast.success(
          <div>
            <p className="font-semibold">Deal AI verdict recorded on-chain!</p>
            <a href={`https://explorer.solana.com/tx/${result.onChainTx}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 underline">View oracle transaction</a>
          </div>,
          { duration: 8000 }
        );
      }

      if (result.recommendation === 'block') incrementFraudBlocked();
    } catch (err: any) {
      console.error(err);
      toast.error(t('deals.ai_check_failed') || 'AI check failed. Please try again.');
    } finally {
      setProcessing(null);
    }
  }

  async function handleStatusChange(dealId: string, newStatus: string, toastKey: string) {
    setProcessing(dealId);
    try {
      await api.updateDealStatus(dealId, { status: newStatus });
      updateDeal(dealId, { status: newStatus });
      toast.success(t(toastKey));
    } catch (err: any) {
      console.error(err);
      toast.error(t('common.error'));
    } finally {
      setProcessing(null);
    }
  }

  async function handleConfirmDeal(dealId: string) {
    setProcessing(dealId);
    try {
      // First set to awaiting_ai, then auto-run AI check
      await api.updateDealStatus(dealId, { status: 'awaiting_ai' });
      updateDeal(dealId, { status: 'awaiting_ai' });
      toast.success(t('deals.confirmed_success'));
      // Auto-run AI check after confirmation
      setProcessing(null);
      await runAiCheck(dealId);
    } catch (err: any) {
      console.error(err);
      toast.error(t('common.error'));
      setProcessing(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('deals.title')}</h1>
          <p className="text-sm text-gray-500">{t('deals.subtitle')}</p>
        </div>
        {publicKey && (
          <button onClick={() => setCreating(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            + {t('deals.create')}
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
          <h3 className="font-semibold">{t('deals.create')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('deals.property_id')}</label>
              <select value={selectedProperty} onChange={e => setSelectedProperty(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none" required>
                <option value="">...</option>
                {listedProperties.map(p => (
                  <option key={p.propertyId} value={p.propertyId}>{p.address} — {(p.priceLamports / 1e9).toFixed(2)} SOL</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('deals.price')}</label>
              <input type="number" step="0.01" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none" required />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm">{t('deals.submit')}</button>
            <button type="button" onClick={() => setCreating(false)} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </motion.form>
      )}

      {deals.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('deals.no_deals')}</h2>
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
                  <span className="text-gray-500">{t('deals.seller_wallet')}</span>
                  <p className="font-mono text-xs truncate">{deal.seller}</p>
                </div>
                <div className="text-center">
                  <ArrowRight className="w-4 h-4 text-gray-600 mx-auto" />
                  <p className="font-bold">{(deal.price / 1e9).toFixed(2)} SOL</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-500">{t('deals.buyer_wallet')}</span>
                  <p className="font-mono text-xs truncate">{deal.buyer}</p>
                </div>
              </div>

              {deal.aiFlags && deal.aiFlags.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-3">
                  {deal.aiFlags.map((flag: string, j: number) => (
                    <span key={j} className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded">{flag}</span>
                  ))}
                </div>
              )}

              {deal.onChainTx && (
                <div className="mb-3 flex items-center gap-2 text-xs text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  <span>AI verdict on-chain:</span>
                  <a
                    href={`https://explorer.solana.com/tx/${deal.onChainTx}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono hover:text-green-300 flex items-center gap-1"
                  >
                    {deal.onChainTx.slice(0, 16)}... <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Escrow lifecycle buttons */}
              <div className="flex gap-2 flex-wrap">
                {/* created: AI Check + Cancel */}
                {deal.status === 'created' && (
                  <>
                    <button
                      onClick={() => runAiCheck(deal.dealId)}
                      disabled={processing === deal.dealId}
                      className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                      {processing === deal.dealId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                      {processing === deal.dealId ? t('deals.checking') : t('deals.check_ai')}
                    </button>
                    <button
                      onClick={() => handleStatusChange(deal.dealId, 'cancelled', 'deals.cancelled_success')}
                      disabled={processing === deal.dealId}
                      className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      {t('deals.cancel_deal')}
                    </button>
                  </>
                )}

                {/* ai_approved: Fund Escrow + Execute Deal + Cancel */}
                {deal.status === 'ai_approved' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(deal.dealId, 'funded', 'deals.funded_success')}
                      disabled={processing === deal.dealId}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      {t('deals.fund_escrow')}
                    </button>
                    <button
                      onClick={() => handleStatusChange(deal.dealId, 'completed', 'deals.executed_success')}
                      disabled={processing === deal.dealId}
                      className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      {t('deals.execute_deal')}
                    </button>
                    <button
                      onClick={() => handleStatusChange(deal.dealId, 'cancelled', 'deals.cancelled_success')}
                      disabled={processing === deal.dealId}
                      className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      {t('deals.cancel_deal')}
                    </button>
                  </>
                )}

                {/* funded: Confirm Deal + Cancel */}
                {deal.status === 'funded' && (
                  <>
                    <button
                      onClick={() => handleConfirmDeal(deal.dealId)}
                      disabled={processing === deal.dealId}
                      className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                      {processing === deal.dealId ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                      {t('deals.confirm_deal')}
                    </button>
                    <button
                      onClick={() => handleStatusChange(deal.dealId, 'cancelled', 'deals.cancelled_success')}
                      disabled={processing === deal.dealId}
                      className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      {t('deals.cancel_deal')}
                    </button>
                  </>
                )}

                {/* under_review: Cancel only */}
                {deal.status === 'under_review' && (
                  <button
                    onClick={() => handleStatusChange(deal.dealId, 'cancelled', 'deals.cancelled_success')}
                    disabled={processing === deal.dealId}
                    className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    {t('deals.cancel_deal')}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
