import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Home, FileText, AlertTriangle, TrendingUp, CheckCircle, ExternalLink, Loader2, Wifi, WifiOff, Brain, Database } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTrustEstate } from '../hooks/useTrustEstate';
import { useWallet } from '@solana/wallet-adapter-react';
import TransactionHistory from '../components/TransactionHistory';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const PROGRAM_ID = '8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY';

function StatCard({ icon: Icon, label, value, color, onChain }: { icon: any; label: string; value: number; color: string; onChain?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6"
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
  const { initializePlatform, fetchPlatformState, loading, programId } = useTrustEstate();

  const [onChainStats, setOnChainStats] = useState<{
    authority: string;
    totalProperties: number;
    totalDeals: number;
    totalFraudBlocked: number;
  } | null>(null);
  const [platformInitialized, setPlatformInitialized] = useState<boolean | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [aiProvider, setAiProvider] = useState<string | null>(null);

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
          <p className="font-semibold">Platform initialized!</p>
          <a
            href={`https://explorer.solana.com/tx/${sig}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-400 underline"
          >
            View on Solana Explorer
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
        toast.error('Platform already initialized on this network');
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
              {onChainStats ? 'On-Chain Data' : 'Demo Data'}
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
                <CheckCircle className="w-3 h-3" /> Platform Active
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
        />
        <StatCard
          icon={FileText}
          label={t('dashboard.total_deals')}
          value={onChainStats?.totalDeals ?? stats.totalDeals}
          color="bg-blue-600/20 text-blue-400"
          onChain={!!onChainStats}
        />
        <StatCard
          icon={AlertTriangle}
          label={t('dashboard.fraud_blocked')}
          value={onChainStats?.totalFraudBlocked ?? stats.totalFraudBlocked}
          color="bg-red-600/20 text-red-400"
          onChain={!!onChainStats}
        />
        <StatCard
          icon={CheckCircle}
          label={t('dashboard.verified')}
          value={verifiedCount}
          color="bg-green-600/20 text-green-400"
        />
      </div>

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
                    <p className="text-xs text-gray-500">{deal.status}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    deal.status === 'blocked' ? 'bg-red-500/20 text-red-400'
                    : deal.status === 'completed' ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {deal.aiRiskScore > 0 ? `${t('deals.risk_score')}: ${deal.aiRiskScore}` : deal.status}
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
