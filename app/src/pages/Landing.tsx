import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Brain, Zap, Lock, ExternalLink, CheckCircle,
  Globe, XCircle, AlertTriangle, RotateCcw,
  Database, Eye, Cpu, TrendingDown, TrendingUp,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const PROGRAM_ID = '8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const langs = [
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KZ' },
  { code: 'en', label: 'EN' },
];

export default function Landing() {
  const { t, i18n } = useTranslation();

  const cleanChecks = [
    { label: t('landing.chk1_label'), status: 'pass' as const, detail: t('landing.chk1_pass') },
    { label: t('landing.chk2_label'), status: 'pass' as const, detail: t('landing.chk2_pass') },
    { label: t('landing.chk3_label'), status: 'pass' as const, detail: t('landing.chk3_pass') },
    { label: t('landing.chk4_label'), status: 'pass' as const, detail: t('landing.chk4_pass') },
    { label: t('landing.chk5_label'), status: 'pass' as const, detail: t('landing.chk5_pass') },
    { label: t('landing.chk6_label'), status: 'pass' as const, detail: t('landing.chk6_pass') },
  ];

  const fraudChecks = [
    { label: t('landing.chk1_label'), status: 'fail' as const, detail: t('landing.chk1_fail') },
    { label: t('landing.chk2_label'), status: 'fail' as const, detail: t('landing.chk2_fail') },
    { label: t('landing.chk3_label'), status: 'fail' as const, detail: t('landing.chk3_fail') },
    { label: t('landing.chk4_label'), status: 'warn' as const, detail: t('landing.chk4_warn') },
    { label: t('landing.chk5_label'), status: 'fail' as const, detail: t('landing.chk5_fail') },
    { label: t('landing.chk6_label'), status: 'fail' as const, detail: t('landing.chk6_fail') },
  ];
  const [showLangs, setShowLangs] = useState(false);

  // AI Demo state
  const [demoType, setDemoType] = useState<'clean' | 'fraud' | null>(null);
  const [visibleChecks, setVisibleChecks] = useState(0);
  const [demoComplete, setDemoComplete] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);

  const runDemo = async (type: 'clean' | 'fraud') => {
    setDemoType(type);
    setDemoRunning(true);
    setVisibleChecks(0);
    setDemoComplete(false);
    for (let i = 1; i <= 6; i++) {
      await new Promise<void>(r => setTimeout(r, 550));
      setVisibleChecks(i);
    }
    await new Promise<void>(r => setTimeout(r, 400));
    setDemoComplete(true);
    setDemoRunning(false);
  };

  const resetDemo = () => {
    setDemoType(null);
    setVisibleChecks(0);
    setDemoComplete(false);
    setDemoRunning(false);
  };

  const currentChecks = demoType === 'clean' ? cleanChecks : fraudChecks;
  const finalScore = demoType === 'clean' ? 91 : 22;
  const isApproved = demoType === 'clean';

  // Escrow animation
  const [escrowStep, setEscrowStep] = useState(0);
  const [escrowType, setEscrowType] = useState<'ok' | 'fail'>('ok');

  useEffect(() => {
    const interval = setInterval(() => {
      setEscrowStep(s => {
        if (s >= 3) {
          setTimeout(() => {
            setEscrowType(prev => prev === 'ok' ? 'fail' : 'ok');
            setEscrowStep(0);
          }, 1200);
          return 3;
        }
        return s + 1;
      });
    }, 1300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">

      {/* ── Navbar ── */}
      <div className="flex justify-between items-center max-w-6xl mx-auto px-4 pt-4 pb-2">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary-400" />
          <span className="text-lg font-bold">TrustEstate</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/guide" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
            {t('guide.title')}
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowLangs(!showLangs)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors border border-gray-800"
            >
              <Globe className="w-4 h-4" />
              {langs.find(l => l.code === i18n.language)?.label || 'RU'}
            </button>
            {showLangs && (
              <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-xl z-50">
                {langs.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { i18n.changeLanguage(l.code); setShowLangs(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                      i18n.language === l.code ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {t(`lang.${l.code}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative pt-6 pb-12 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/40 via-gray-950 to-gray-950" />
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          {/* Centered text block */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-300 text-xs mb-5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {t('landing.badge')}
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-4 leading-tight bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent">
              {t('landing.title')}
            </motion.h1>

            <motion.p variants={fadeUp} className="text-base text-gray-400 mb-6 leading-relaxed max-w-2xl mx-auto">
              {t('landing.subtitle')}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-8 justify-center">
              <Link
                to="/properties"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary-500/20"
              >
                <Shield className="w-4 h-4" />
                {t('landing.cta_demo')}
              </Link>
              <a
                href={`https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-700 hover:border-primary-500/50 rounded-xl font-semibold transition-all hover:bg-gray-900"
              >
                <ExternalLink className="w-4 h-4" />
                {t('landing.cta_explorer')}
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-12">
              {[
                { num: '12,000+', text: t('landing.stat_fraud') },
                { num: '15M ₸', text: t('landing.stat_loss') },
                { num: '8–14', text: t('landing.stat_time') },
              ].map((s, i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <div className="text-xl font-bold text-red-400">{s.num}</div>
                  <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{s.text}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Product Panel — full width below text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
              <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-950 border-b border-gray-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-xs text-gray-500 font-mono ml-2">TrustEstate · {t('landing.product_panel_title')}</span>
                </div>

                {/* Status rows */}
                <div className="p-4 space-y-2.5 border-b border-gray-800">
                  {[
                    { label: 'Network', value: 'Solana Devnet', color: 'text-green-400', live: true },
                    { label: 'Contract', value: `${PROGRAM_ID.slice(0, 8)}...${PROGRAM_ID.slice(-6)}`, color: 'text-primary-400', live: false },
                    { label: 'AI Provider', value: 'AlemLLM · Active', color: 'text-purple-400', live: true },
                    { label: 'Escrow', value: 'Smart Contract · Ready', color: 'text-cyan-400', live: true },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-600 font-mono text-xs">{row.label}</span>
                      <span className={`flex items-center gap-1.5 font-mono text-xs ${row.color}`}>
                        {row.live && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Activity cards */}
                <div className="p-4 space-y-2">
                  <div className="text-[10px] text-gray-600 mb-2 font-mono uppercase tracking-wider">Latest activity</div>
                  {[
                    {
                      address: 'Almaty, Abay ave. 50',
                      score: '92/100', detail: '6/6 checks passed', status: 'Completed',
                      sc: 'text-green-400', st: 'text-green-400 bg-green-500/10', border: 'border-green-500/20',
                    },
                    {
                      address: 'Shymkent, Al-Farabi 120',
                      score: '22/100', detail: 'Duplicate + Price anomaly', status: 'Blocked',
                      sc: 'text-red-400', st: 'text-red-400 bg-red-500/10', border: 'border-red-500/20',
                    },
                    {
                      address: 'Astana, Mangilik El 55',
                      score: '🔒 Escrow', detail: '44.82 SOL locked', status: 'AI Approved',
                      sc: 'text-primary-400', st: 'text-primary-400 bg-primary-500/10', border: 'border-primary-500/20',
                    },
                  ].map((card, i) => (
                    <div key={i} className={`border ${card.border} rounded-lg p-2.5 bg-gray-950`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white font-medium truncate mr-2">{card.address}</span>
                        <span className={`text-xs font-bold shrink-0 ${card.sc}`}>{card.score}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">{card.detail}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${card.st}`}>{card.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          {/* Contract proof card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-4 bg-gray-900/80 border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold">{t('landing.deployed')}</h3>
                <p className="text-xs text-gray-500">Solana Devnet</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live
              </div>
            </div>

            <div className="bg-gray-950 rounded-lg p-3 mb-4 font-mono text-xs text-primary-300 text-center border border-gray-800 break-all">
              {PROGRAM_ID}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: t('landing.proof_contract'), value: '12 instructions' },
                { label: t('landing.proof_ai'), value: 'AlemLLM' },
                { label: 'Fraud Checks', value: '7 automated' },
                { label: 'On-Chain', value: '6 account types' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-950 rounded-lg p-3 border border-gray-800 text-center">
                  <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                  <div className="text-sm font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>

            <a
              href={`https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/20 rounded-lg text-sm text-green-400 font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {t('landing.deployed_desc')}
            </a>
          </motion.div>
          </div>
      </section>

      {/* ── PROBLEM vs SOLUTION ── */}
      <section className="py-16 px-4 bg-gray-900/40">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('landing.prob_title')}
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Without */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="font-bold text-red-400">{t('landing.prob_badge')}</span>
              </div>
              <div className="space-y-4">
                {[
                  { num: '12,000+', text: t('landing.prob1') },
                  { num: '15,000,000 ₸', text: t('landing.prob2') },
                  { num: '8–14 мес.', text: t('landing.prob3') },
                  { num: '0%', text: t('landing.prob4') },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <TrendingDown className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-red-400 text-lg leading-tight">{item.num}</div>
                      <div className="text-sm text-gray-400">{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* With */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-bold text-green-400">{t('landing.sol_badge')}</span>
              </div>
              <div className="space-y-4">
                {[
                  { num: '< 3 сек', text: t('landing.sol1') },
                  { num: '6', text: t('landing.sol2') },
                  { num: '100%', text: t('landing.sol3') },
                  { num: '0 ₸', text: t('landing.sol4') },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-green-400 text-lg leading-tight">{item.num}</div>
                      <div className="text-sm text-gray-400">{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW WE DO IT — 3 deep cards ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold">{t('landing.deep_title')}</h2>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* AI Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-900 border border-purple-500/20 rounded-2xl p-6 flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('landing.ai_deep_title')}</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">{t('landing.ai_deep_sub')}</p>
              <div className="space-y-2 mb-5 flex-1">
                {[
                  'Duplicate cadastral ID',
                  'Price anomaly vs market',
                  'Rapid resale pattern',
                  'Document integrity',
                  'Seller history',
                  'Market comparison',
                ].map((check, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-gray-300">{check}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-950 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">{t('landing.ai_score_label')}</span>
                  <span className="text-green-400 font-mono font-bold">91 / 100</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full" style={{ width: '91%' }} />
                </div>
                <div className="text-[10px] text-gray-500">{t('landing.ai_approve_rule')}</div>
                <div className="text-[10px] text-gray-500">{t('landing.ai_block_rule')}</div>
              </div>

              {/* Strong on-chain claim */}
              <div className="mt-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <p className="text-[11px] text-purple-300 leading-relaxed">
                  🔒 {t('landing.ai_onchain_claim')}
                </p>
              </div>
            </motion.div>

            {/* Solana Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('landing.sol_deep_title')}</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">{t('landing.sol_deep_sub')}</p>
              <div className="space-y-5">
                {[
                  { title: t('landing.sol_point1_title'), desc: t('landing.sol_point1_desc'), Icon: Database },
                  { title: t('landing.sol_point2_title'), desc: t('landing.sol_point2_desc'), Icon: Shield },
                  { title: t('landing.sol_point3_title'), desc: t('landing.sol_point3_desc'), Icon: Eye },
                  { title: t('landing.sol_point4_title'), desc: t('landing.sol_point4_desc'), Icon: Cpu },
                ].map((point, i) => (
                  <div key={i} className="flex gap-3">
                    <point.Icon className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold mb-0.5">{point.title}</div>
                      <div className="text-xs text-gray-500 leading-relaxed">{point.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Escrow Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900 border border-green-500/20 rounded-2xl p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('landing.escrow_deep_title')}</h3>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">{t('landing.escrow_deep_sub')}</p>

              {/* Animated escrow flow */}
              <div className="space-y-2">
                {[
                  { text: t('landing.flow_step1'), color: 'border-blue-500/30 text-blue-300', active: escrowStep >= 0 },
                  { text: t('landing.flow_step2'), color: 'border-yellow-500/30 text-yellow-300', active: escrowStep >= 1 },
                  { text: t('landing.flow_step3'), color: 'border-purple-500/30 text-purple-300', active: escrowStep >= 2 },
                  {
                    text: escrowType === 'ok' ? t('landing.flow_ok') : t('landing.flow_fail'),
                    color: escrowType === 'ok' ? 'border-green-500/30 text-green-300' : 'border-red-500/30 text-red-300',
                    active: escrowStep >= 3,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs transition-all duration-700 ${
                      item.active ? item.color + ' bg-gray-950' : 'border-gray-800 text-gray-600'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className={`mt-4 text-center text-xs font-semibold transition-all duration-700 min-h-[1.25rem] ${escrowType === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                {escrowStep >= 3
                  ? (escrowType === 'ok' ? '✓ Buyer gets NFT · Seller gets SOL' : '✓ Buyer gets full refund instantly')
                  : '🔒 Funds locked in smart contract'}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE AI DEMO ── */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('landing.demo_title')}</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">{t('landing.demo_sub')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden"
          >
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-5 py-3 bg-gray-950 border-b border-gray-800">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-mono text-gray-400">AlemLLM · Fraud Detector v2.1</span>
              {demoRunning && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-yellow-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  {t('landing.demo_analyzing')}
                </span>
              )}
            </div>

            <div className="p-6">
              {/* Initial selector */}
              {!demoType && !demoRunning && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-6">{t('landing.demo_sub')}</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => runDemo('clean')}
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 font-semibold transition-all hover:scale-105"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {t('landing.demo_clean_btn')}
                    </button>
                    <button
                      onClick={() => runDemo('fraud')}
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 font-semibold transition-all hover:scale-105"
                    >
                      <AlertTriangle className="w-5 h-5" />
                      {t('landing.demo_fraud_btn')}
                    </button>
                  </div>
                </div>
              )}

              {/* Running */}
              {demoType && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm">
                      <span className="text-gray-500">Checking: </span>
                      <span className="font-medium text-white">
                        {demoType === 'clean' ? 'Almaty, Abay ave. 50, apt 12' : 'Shymkent, Al-Farabi 120, apt 3'}
                      </span>
                    </div>
                    {!demoRunning && (
                      <button onClick={resetDemo} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
                        <RotateCcw className="w-3 h-3" />
                        {t('landing.demo_reset_btn')}
                      </button>
                    )}
                  </div>

                  {currentChecks.map((check, i) => (
                    <AnimatePresence key={i}>
                      {i < visibleChecks && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                            check.status === 'pass' ? 'bg-green-500/5 border-green-500/20' :
                            check.status === 'fail' ? 'bg-red-500/5 border-red-500/20' :
                            'bg-yellow-500/5 border-yellow-500/20'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {check.status === 'pass'
                              ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                              : check.status === 'fail'
                              ? <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                              : <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />}
                            <span className="text-gray-200">{check.label}</span>
                          </div>
                          <span className={`text-xs font-mono ${
                            check.status === 'pass' ? 'text-green-400' :
                            check.status === 'fail' ? 'text-red-400' : 'text-yellow-400'
                          }`}>{check.detail}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}

                  {demoRunning && visibleChecks < 6 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 p-3">
                      <span className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </span>
                      {t('landing.demo_analyzing')}
                    </div>
                  )}

                  {/* Final result */}
                  {demoComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`mt-3 p-5 rounded-xl border-2 ${isApproved ? 'bg-green-500/5 border-green-500/40' : 'bg-red-500/5 border-red-500/40'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`font-bold text-lg ${isApproved ? 'text-green-400' : 'text-red-400'}`}>
                          {isApproved ? t('landing.demo_approved') : t('landing.demo_blocked')}
                        </span>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-0.5">{t('landing.demo_score_label')}</div>
                          <div className={`text-3xl font-bold font-mono ${isApproved ? 'text-green-400' : 'text-red-400'}`}>
                            {finalScore}<span className="text-base text-gray-500">/100</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full bg-gray-800 rounded-full h-3 mb-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${finalScore}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          className={`h-3 rounded-full ${isApproved ? 'bg-gradient-to-r from-green-600 to-green-400' : 'bg-gradient-to-r from-red-600 to-red-400'}`}
                        />
                      </div>

                      <div className={`flex items-center gap-2 p-3 rounded-lg text-xs ${isApproved ? 'bg-green-500/5 border border-green-500/20' : 'bg-red-500/5 border border-red-500/20'}`}>
                        <Lock className={`w-4 h-4 shrink-0 ${isApproved ? 'text-green-400' : 'text-red-400'}`} />
                        <span className="text-gray-300">{isApproved ? t('landing.demo_escrow_ok') : t('landing.demo_escrow_fail')}</span>
                      </div>

                      <button
                        onClick={resetDemo}
                        className="mt-3 w-full text-xs text-gray-500 hover:text-white py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-3 h-3" />
                        {t('landing.demo_reset_btn')}
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── RWA EXPANSION LAYER ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900/60 border border-gray-700 rounded-2xl p-8"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 uppercase tracking-wider">
                {t('landing.rwa_badge')}
              </span>
              <h2 className="text-2xl font-bold">{t('landing.rwa_title')}</h2>
            </div>
            <p className="text-sm text-gray-400 mb-8 max-w-2xl">{t('landing.rwa_subtitle')}</p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Fractional Ownership */}
              <div className="bg-gray-950 border border-indigo-500/20 rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center mb-3">
                  <Database className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold mb-2 text-sm">Fractional Ownership</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  {t('landing.rwa_point1')}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-[10px] text-green-400 font-mono">on-chain ✓</span>
                </div>
              </div>

              {/* Share tokens */}
              <div className="bg-gray-950 border border-indigo-500/20 rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold mb-2 text-sm">SPL Share Tokens</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  {t('landing.rwa_point2')}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-[10px] text-green-400 font-mono">contract ready ✓</span>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="bg-gray-950 border border-yellow-500/20 rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="font-semibold mb-2 text-sm">{t('landing.rwa_phase')}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  {t('landing.rwa_phase_desc')}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-[10px] text-yellow-400 font-mono">UI in Phase 2</span>
                </div>
              </div>
            </div>

            {/* Bottom note */}
            <div className="flex items-start gap-3 p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
              <Shield className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="text-white font-medium">Core product today:</span> Tokenize → AI Verify → Secure Deal — fully live on Solana Devnet.{' '}
                <span className="text-indigo-300">RWA Expansion Layer</span> smart contract is deployed and audited; the UI module ships in Phase 2.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DEPLOYED PROOF ── */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold">{t('landing.deployed')}</h3>
                <p className="text-xs text-gray-500">Solana Devnet</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live
              </div>
            </div>

            <div className="bg-gray-950 rounded-lg p-3 mb-4 font-mono text-xs text-primary-300 text-center border border-gray-800 break-all">
              {PROGRAM_ID}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: t('landing.proof_contract'), value: '12 instructions' },
                { label: t('landing.proof_ai'), value: 'AlemLLM' },
                { label: 'Fraud Checks', value: '6 automated' },
                { label: 'On-Chain', value: '6 account types' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-950 rounded-lg p-3 border border-gray-800 text-center">
                  <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                  <div className="text-sm font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>

            <a
              href={`https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/20 rounded-lg text-sm text-green-400 font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {t('landing.cta_explorer')}
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800 text-center text-sm text-gray-600">
        {t('landing.footer')}
      </footer>
    </div>
  );
}
