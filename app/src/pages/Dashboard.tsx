import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Home, FileText, AlertTriangle, TrendingUp, CheckCircle, ExternalLink, Loader2, Wifi, WifiOff, Brain, Database, BarChart3, Layers, Users, ArrowRight, Percent, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useTrustEstate } from '../hooks/useTrustEstate';
import { useWallet } from '@solana/wallet-adapter-react';
import TransactionHistory from '../components/TransactionHistory';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const PROGRAM_ID = '8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY';

function StatCard({ icon: Icon, label, value, color, onChain, to }: { icon: any; label: string; value: number; color: string; onChain?: boolean; to?: string }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => to && navigate(to)}
      className={`bg-gray-900 border border-gray-800 rounded-xl p-6 ${to ? 'cursor-pointer hover:border-gray-600 hover:bg-gray-800/50 transition-all' : ''}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">{label}</span>
          {onChain && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">on-chain</span>
          )}
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { stats, properties, deals } = useStore();
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const { initializePlatform, fetchPlatformState, loading, programId } = useTrustEstate();

  const { buyShares: buySharesOnChain } = useTrustEstate();
  const { addProperty, updateProperty } = useStore();

  const [onChainStats, setOnChainStats] = useState<{
    authority: string;
    totalProperties: number;
    totalDeals: number;
    totalFraudBlocked: number;
  } | null>(null);
  const [platformInitialized, setPlatformInitialized] = useState<boolean | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [aiProvider, setAiProvider] = useState<string | null>(null);

  // Fractional demo state
  const [fracSharesToBuy, setFracSharesToBuy] = useState(40);
  const [fracOwned, setFracOwned] = useState(0);
  const [fracBuying, setFracBuying] = useState(false);
  const [fracTxSig, setFracTxSig] = useState<string | null>(null);

  const DEMO_PROP_ID = 'demo_frac_almaty_001';

  // Seed demo fractionalized property if not present
  useEffect(() => {
    const exists = properties.find(p => p.propertyId === DEMO_PROP_ID);
    if (!exists) {
      addProperty({
        propertyId: DEMO_PROP_ID,
        address: 'Алматы, пр. Абая 50, кв. 12',
        areaSqm: 75,
        rooms: 3,
        floor: 7,
        totalFloors: 16,
        cadastralId: 'KZ-ALM-2024-50-12',
        priceLamports: 100_000_000_000,
        propertyType: 'Apartment',
        isVerified: true,
        aiScore: 92,
        fraudFlags: 0,
        isListed: true,
        owner: publicKey?.toBase58() || 'demo_owner',
        status: 'verified',
        isFractionalized: true,
        totalShares: 100,
        pricePerShare: 1,
        availableShares: 60,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifiedCount = properties.filter(p => p.isVerified).length;

  // Fetch on-chain platform state
  useEffect(() => {
    if (!publicKey) return;
    fetchPlatformState().then((state) => {
      if (state) {
        setOnChainStats(state);
        setPlatformInitialized(true);
      } else {
        setPlatformInitialized(false);
      }
    });
  }, [publicKey, fetchPlatformState]);

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(d => {
      setAiProvider(d.aiProvider || 'mock');
    }).catch(() => setAiProvider(null));
  }, []);

  async function handleInitPlatform() {
    setInitializing(true);
    try {
      const sig = await initializePlatform();
      toast.success(
        <div>
          <p className="font-semibold">{t('common.platform_initialized')}</p>
          <a
            href={`https://explorer.solana.com/tx/${sig}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-400 underline"
          >
            {t('common.view_on_explorer')}
          </a>
        </div>,
        { duration: 8000 }
      );
      setPlatformInitialized(true);
      const state = await fetchPlatformState();
      if (state) setOnChainStats(state);
    } catch (err: any) {
      const msg = err?.message || 'Failed';
      if (msg.includes('already in use')) {
        toast.error(t('common.platform_already_init'));
        setPlatformInitialized(true);
        const state = await fetchPlatformState();
        if (state) setOnChainStats(state);
      } else {
        toast.error(`Error: ${msg.slice(0, 100)}`);
      }
    } finally {
      setInitializing(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900/60 via-gray-900 to-purple-900/40 border border-primary-800/30 p-8 mb-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">TrustEstate</h1>
              <p className="text-primary-300/80 text-sm">{t('dashboard.subtitle')}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1.5">
              {platformInitialized ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              Solana Devnet
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
              <Brain className="w-3 h-3" />
              {aiProvider ? `AI: ${aiProvider.toUpperCase()}` : 'AI Fraud Detection'}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${onChainStats ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
              <Database className="w-3 h-3" />
              {onChainStats ? t('common.on_chain_data') : t('common.demo_data')}
            </span>
            <a
              href={`https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors inline-flex items-center gap-1"
            >
              {PROGRAM_ID.slice(0, 8)}... <ExternalLink className="w-3 h-3" />
            </a>
            {platformInitialized === true && (
              <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> {t('common.platform_active')}
              </span>
            )}
          </div>

          {/* Initialize Platform Button */}
          {publicKey && platformInitialized === false && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5"
            >
              <button
                onClick={handleInitPlatform}
                disabled={initializing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all hover:scale-105"
              >
                {initializing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {initializing ? t('dashboard.initializing') : t('dashboard.init_platform')}
              </button>
              <p className="text-xs text-gray-500 mt-2">{t('dashboard.init_desc')}</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid — show on-chain data if available */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Home}
          label={t('dashboard.total_properties')}
          value={onChainStats?.totalProperties ?? stats.totalProperties}
          color="bg-primary-600/20 text-primary-400"
          onChain={!!onChainStats}
          to="/properties"
        />
        <StatCard
          icon={FileText}
          label={t('dashboard.total_deals')}
          value={onChainStats?.totalDeals ?? stats.totalDeals}
          color="bg-blue-600/20 text-blue-400"
          onChain={!!onChainStats}
          to="/deals"
        />
        <StatCard
          icon={AlertTriangle}
          label={t('dashboard.fraud_blocked')}
          value={onChainStats?.totalFraudBlocked ?? stats.totalFraudBlocked}
          color="bg-red-600/20 text-red-400"
          onChain={!!onChainStats}
          to="/deals"
        />
        <StatCard
          icon={CheckCircle}
          label={t('dashboard.verified')}
          value={verifiedCount}
          color="bg-green-600/20 text-green-400"
          to="/properties"
        />
      </div>

      {/* AI Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-950/30 via-gray-900 to-green-950/30 border border-gray-800 rounded-xl p-6 mb-6"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI Fraud Analytics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-950/50 rounded-lg p-4 border border-red-500/10">
            <div className="text-2xl font-bold text-red-400">{stats.totalFraudBlocked}</div>
            <div className="text-xs text-gray-500 mt-1">{t('dashboard.activity_blocked')}</div>
          </div>
          <div className="bg-gray-950/50 rounded-lg p-4 border border-green-500/10">
            <div className="text-2xl font-bold text-green-400">{deals.filter(d => d.status === 'completed').length}</div>
            <div className="text-xs text-gray-500 mt-1">{t('dashboard.activity_completed')}</div>
          </div>
          <div className="bg-gray-950/50 rounded-lg p-4 border border-purple-500/10">
            <div className="text-2xl font-bold text-purple-400">{verifiedCount}</div>
            <div className="text-xs text-gray-500 mt-1">{t('dashboard.activity_verified')}</div>
          </div>
          <div className="bg-gray-950/50 rounded-lg p-4 border border-yellow-500/10">
            <div className="text-2xl font-bold text-yellow-400">
              {deals.length > 0 ? Math.round(deals.reduce((sum, d) => sum + (d.aiRiskScore || 0), 0) / deals.length) : 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Avg. Risk Score</div>
          </div>
        </div>
      </motion.div>

      {/* ── FRACTIONAL DEMO WIDGET ── */}
      {(() => {
        const demoProp = properties.find(p => p.propertyId === DEMO_PROP_ID);
        if (!demoProp) return null;
        const totalShares = demoProp.totalShares || 100;
        const availShares = demoProp.availableShares || 0;
        const soldShares = totalShares - availShares;
        const ownedPct = Math.round((fracOwned / totalShares) * 100);
        const soldPct = Math.round((soldShares / totalShares) * 100);
        const availPct = 100 - soldPct - ownedPct;
        const canBuy = fracSharesToBuy > 0 && fracSharesToBuy <= availShares && !fracOwned;

        async function handleFracDemo() {
          if (!canBuy) return;
          setFracBuying(true);
          // Step 1: AI check simulation (1.5s)
          await new Promise(r => setTimeout(r, 1500));
          // Step 2: Try on-chain, fallback to local
          try {
            if (demoProp?.shareMintPubkey && publicKey) {
              const tx = await buySharesOnChain({
                propertyId: DEMO_PROP_ID,
                propertyOwner: demoProp.owner,
                shareMintPubkey: demoProp.shareMintPubkey,
                numShares: fracSharesToBuy,
              });
              setFracTxSig(tx as string);
            }
          } catch {
            setFracTxSig('demo_tx_' + Date.now());
          }
          updateProperty(DEMO_PROP_ID, { availableShares: availShares - fracSharesToBuy });
          setFracOwned(fracSharesToBuy);
          setFracBuying(false);
        }

        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-950/50 via-gray-900 to-purple-950/40 border border-indigo-500/30 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                {t('landing.frac_deep_title')} — Demo
              </h2>
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {t('landing.frac_on_chain')}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: property info */}
              <div>
                <div className="bg-gray-950 rounded-xl p-4 border border-gray-800 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-sm">{demoProp.address}</span>
                    <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> AI Score: {demoProp.aiScore}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{demoProp.areaSqm} м²</span>
                    <span>{demoProp.rooms} комн.</span>
                    <span>{demoProp.floor} этаж</span>
                    <span className="text-white font-mono">100 SOL</span>
                  </div>
                </div>

                {/* Share distribution bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>{t('properties.total_shares')}: {totalShares}</span>
                    <span>{availShares} {t('properties.shares_available')}</span>
                  </div>
                  <div className="h-4 rounded-full overflow-hidden flex gap-0.5 bg-gray-800">
                    {soldPct > 0 && (
                      <div className="bg-gray-600 h-full transition-all duration-700" style={{ width: `${soldPct}%` }} title={`Sold: ${soldPct}%`} />
                    )}
                    {ownedPct > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ownedPct}%` }}
                        transition={{ duration: 0.8 }}
                        className="bg-indigo-500 h-full"
                        title={`You: ${ownedPct}%`}
                      />
                    )}
                    <div className="bg-green-600/40 h-full flex-1" title={`Available: ${availPct}%`} />
                  </div>
                  <div className="flex gap-3 mt-1.5 text-[10px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-600 inline-block" /> Sold {soldPct}%</span>
                    {ownedPct > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> You {ownedPct}%</span>}
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600/60 inline-block" /> Available {availPct}%</span>
                  </div>
                </div>
              </div>

              {/* Right: buy or result */}
              <div className="flex flex-col justify-center">
                {fracOwned > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-5 text-center"
                  >
                    <div className="text-5xl font-black text-indigo-400 mb-1">{ownedPct}%</div>
                    <div className="text-sm text-indigo-300 mb-2">{t('landing.frac_rental_income')}</div>
                    <div className="text-xs text-gray-400 mb-3">{fracOwned} / {totalShares} {t('landing.frac_share')}</div>
                    {fracTxSig && (
                      <a
                        href={fracTxSig.startsWith('demo_') ? '#' : `https://explorer.solana.com/tx/${fracTxSig}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 flex items-center justify-center gap-1 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {fracTxSig.startsWith('demo_') ? 'Demo transaction' : 'View on Solana Explorer'}
                      </a>
                    )}
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">{t('landing.frac_shares_to_buy')} (из {availShares} доступных)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={1}
                          max={availShares}
                          value={fracSharesToBuy}
                          onChange={e => setFracSharesToBuy(Number(e.target.value))}
                          className="flex-1 accent-indigo-500"
                        />
                        <span className="w-10 text-center text-white font-bold text-sm">{fracSharesToBuy}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{Math.round(fracSharesToBuy / totalShares * 100)}% объекта</span>
                        <span className="text-indigo-300 font-mono">{(fracSharesToBuy * (demoProp.pricePerShare || 1)).toFixed(0)} SOL</span>
                      </div>
                    </div>

                    <button
                      onClick={handleFracDemo}
                      disabled={!canBuy || fracBuying}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {fracBuying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          AI проверяет сделку...
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4" />
                          Купить {fracSharesToBuy} долей ({Math.round(fracSharesToBuy / totalShares * 100)}%) за {(fracSharesToBuy * (demoProp.pricePerShare || 1)).toFixed(0)} SOL
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Fractional Ownership Panel */}
      {(() => {
        const fracProps = properties.filter(p => p.isFractionalized);
        const totalShares = fracProps.reduce((s, p) => s + (p.totalShares || 0), 0);
        const availShares = fracProps.reduce((s, p) => s + (p.availableShares || 0), 0);
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-950/40 via-gray-900 to-purple-950/30 border border-indigo-500/20 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                {t('landing.frac_deep_title')}
              </h2>
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {t('landing.frac_on_chain')}
              </span>
            </div>
            {fracProps.length === 0 ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{t('properties.no_properties')}</p>
                <button
                  onClick={() => navigate('/properties')}
                  className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {t('properties.fractionalize')} <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-950/50 rounded-lg p-4 border border-indigo-500/10">
                  <div className="text-2xl font-bold text-indigo-400">{fracProps.length}</div>
                  <div className="text-xs text-gray-500 mt-1">{t('properties.fractionalized')}</div>
                </div>
                <div className="bg-gray-950/50 rounded-lg p-4 border border-purple-500/10">
                  <div className="text-2xl font-bold text-purple-400">{totalShares}</div>
                  <div className="text-xs text-gray-500 mt-1">{t('properties.total_shares')}</div>
                </div>
                <div className="bg-gray-950/50 rounded-lg p-4 border border-cyan-500/10">
                  <div className="text-2xl font-bold text-cyan-400">{availShares}</div>
                  <div className="text-xs text-gray-500 mt-1">{t('properties.shares_available')}</div>
                </div>
                <div className="bg-gray-950/50 rounded-lg p-4 border border-green-500/10">
                  <div className="text-2xl font-bold text-green-400">
                    {fracProps.reduce((s, p) => s + (p.pricePerShare || 0), 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">SOL / {t('landing.frac_share')}</div>
                </div>
              </div>
            )}
            {fracProps.length > 0 && (
              <div className="mt-4 space-y-2">
                {fracProps.map(p => (
                  <div key={p.propertyId} className="flex items-center justify-between bg-gray-950/40 rounded-lg px-3 py-2 border border-gray-800">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-sm text-gray-300 truncate max-w-[200px]">{p.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{p.availableShares}/{p.totalShares} {t('landing.frac_share')}</span>
                      <span className="text-indigo-300 font-mono">{p.pricePerShare} SOL</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-400" />
            {t('dashboard.how_it_works')}
          </h2>
          <div className="space-y-3">
            {[
              t('dashboard.step1'),
              t('dashboard.step2'),
              t('dashboard.step3'),
              t('dashboard.step4'),
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            {t('dashboard.recent_activity')}
          </h2>
          {deals.length === 0 ? (
            <p className="text-gray-500 text-sm">{t('deals.no_deals')}</p>
          ) : (
            <div className="space-y-2">
              {deals.slice(-5).reverse().map((deal) => (
                <div key={deal.dealId} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{deal.dealId}</p>
                    <p className="text-xs text-gray-500">{t(`status.${deal.status}`)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    deal.status === 'blocked' ? 'bg-red-500/20 text-red-400'
                    : deal.status === 'completed' ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {deal.aiRiskScore > 0 ? `${t('deals.risk_score')}: ${deal.aiRiskScore}` : t(`status.${deal.status}`)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Solana Transaction History */}
      <TransactionHistory />
    </div>
  );
}
