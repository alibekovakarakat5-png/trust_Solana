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
import ProfileCard from '../components/ProfileCard';
import toast from 'react-hot-toast';

// Matches on-chain DealStatus flow: Created → Funded → AwaitingAI → AiApproved → Completed
const PIPELINE = ['created', 'funded', 'ai_approved', 'completed'] as const;
const BLOCKED_STATUSES = ['blocked', 'cancelled', 'under_review', 'awaiting_ai'];

function DealPipeline({ status }: { status: string }) {
  const { t } = useTranslation();
  if (BLOCKED_STATUSES.includes(status)) {
    const color = status === 'blocked' ? 'bg-red-500' : status === 'cancelled' ? 'bg-gray-500' : 'bg-yellow-500';
    return (
      <div className="flex items-center gap-1 mb-3">
        <div className={`h-1.5 flex-1 rounded ${color}`} />
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${color}/20 ${color.replace('bg-', 'text-')}`}>{t(`status.${status}`)}</span>
      </div>
    );
  }
  const idx = PIPELINE.indexOf(status as any);
  return (
    <div className="flex items-center gap-1 mb-3">
      {PIPELINE.map((step, i) => (
        <div key={step} className="flex items-center flex-1 gap-1">
          <div className={`h-1.5 flex-1 rounded ${i <= idx ? 'bg-primary-500' : 'bg-gray-800'}`} />
          {i === PIPELINE.length - 1 && (
            <span className="text-[10px] text-gray-500 whitespace-nowrap">{t(`pipeline.${step}`)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Deals() {
  const { t } = useTranslation();
  const { publicKey } = useWallet();
  const { deals, properties, addDeal, updateDeal, incrementFraudBlocked } = useStore();
  const addTx = useTxStore((s) => s.addTx);
  const [creating, setCreating] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [viewProfile, setViewProfile] = useState<string | null>(null);

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
    await ensureDealOnBackend(dealId);

    const prop = properties.find(p => p.propertyId === deal.propertyId);

    try {
      // For fraud properties: signal high seller activity + low verification + price deviation
      const sellerProps = properties.filter(p => p.owner === deal.seller);
      const sellerHasFraud = sellerProps.some(p => p.fraudFlags > 0 || p.aiScore < 50);
      const isSuspicious = (prop && (prop.fraudFlags > 0 || prop.aiScore < 50)) || sellerHasFraud;
      const result = await api.checkDeal({
        dealId: deal.dealId,
        propertyId: deal.propertyId,
        propertyAddress: prop?.address || 'Unknown',
        sellerWallet: deal.seller,
        buyerWallet: deal.buyer,
        price: deal.price,
        marketEstimate: isSuspicious ? Math.round(deal.price * 0.4) : (prop ? prop.priceLamports : deal.price),
        propertyVerificationScore: prop?.aiScore || 50,
        sellerDealCount: isSuspicious ? 12 : 1,
        buyerAccountAge: isSuspicious ? 3 : 30,
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
            <p className="font-semibold">{t('common.deal_ai_onchain')}</p>
            <a href={`https://explorer.solana.com/tx/${result.onChainTx}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 underline">{t('common.view_oracle_tx')}</a>
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

  async function ensureDealOnBackend(dealId: string) {
    const deal = deals.find(d => d.dealId === dealId);
    if (!deal) return;
    try {
      await api.getDeal(dealId);
    } catch {
      await api.createDeal(deal);
    }
  }

  async function handleStatusChange(dealId: string, newStatus: string, toastKey: string) {
    if (!publicKey) { toast.error(t('common.connect_wallet')); return; }
    setProcessing(dealId);
    try {
      await ensureDealOnBackend(dealId);
      // Simulate blockchain confirmation delay
      await new Promise(r => setTimeout(r, 1500));
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
    if (!publicKey) { toast.error(t('common.connect_wallet')); return; }
    setProcessing(dealId);
    try {
      await ensureDealOnBackend(dealId);
      // Simulate seller confirmation delay
      await new Promise(r => setTimeout(r, 1500));
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
            <button type="button" onClick={() => setCreating(false)} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm">{t('common.cancel')}</button>
          </div>
        </motion.form>
      )}

      <div className="flex items-center gap-2 mb-6 p-3 bg-gray-900/50 border border-gray-800 rounded-lg overflow-x-auto">
        {PIPELINE.map((step, i) => (
          <div key={step} className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center text-xs font-bold">{i + 1}</div>
            <span className="text-xs text-gray-400">{t(`pipeline.${step}`)}</span>
            {i < PIPELINE.length - 1 && <div className="w-8 h-px bg-gray-700" />}
          </div>
        ))}
        <div className="ml-auto flex gap-2 shrink-0">
          <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">{t('deals_extra.blocked_fraud')}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">{t('deals_extra.review_manual')}</span>
        </div>
      </div>

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
              <DealPipeline status={deal.status} />
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
                  <p className="font-mono text-xs truncate cursor-pointer hover:text-primary-400 transition-colors" onClick={() => setViewProfile(deal.seller)}>{deal.seller}</p>
                </div>
                <div className="text-center">
                  <ArrowRight className="w-4 h-4 text-gray-600 mx-auto" />
                  <p className="font-bold">{(deal.price / 1e9).toFixed(2)} SOL</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-500">{t('deals.buyer_wallet')}</span>
                  <p className="font-mono text-xs truncate cursor-pointer hover:text-primary-400 transition-colors" onClick={() => setViewProfile(deal.buyer)}>{deal.buyer}</p>
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
                  <span>{t('common.ai_verdict_onchain').replace('!', ':')}</span>
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
                {/* created: Fund Escrow + Cancel (matches contract: Created → fund_escrow → Funded) */}
                {deal.status === 'created' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(deal.dealId, 'funded', 'deals.funded_success')}
                      disabled={processing === deal.dealId}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                      {processing === deal.dealId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                      {t('deals.fund_escrow')}
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

                {/* funded: Confirm + AI Check (matches contract: Funded → confirm_deal → AwaitingAI → AI check) */}
                {deal.status === 'funded' && (
                  <>
                    <button
                      onClick={() => handleConfirmDeal(deal.dealId)}
                      disabled={processing === deal.dealId}
                      className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                      {processing === deal.dealId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                      {processing === deal.dealId ? t('deals.checking') : t('deals.confirm_deal')}
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

                {/* ai_approved: Execute Deal + Cancel (matches contract: AiApproved → execute_deal → Completed) */}
                {deal.status === 'ai_approved' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(deal.dealId, 'completed', 'deals.executed_success')}
                      disabled={processing === deal.dealId}
                      className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                      {processing === deal.dealId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
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

      {viewProfile && (
        <ProfileCard
          address={viewProfile}
          onClose={() => setViewProfile(null)}
          isSelf={publicKey?.toBase58() === viewProfile}
        />
      )}
    </div>
  );
}
