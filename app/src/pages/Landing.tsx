import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Brain, Zap, Lock, ArrowRight, ExternalLink, CheckCircle, Wallet, Eye, Terminal, Globe } from 'lucide-react';
import { useState } from 'react';

const PROGRAM_ID = '8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const langs = [
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KZ' },
  { code: 'en', label: 'EN' },
];

export default function Landing() {
  const { t, i18n } = useTranslation();
  const [showLangs, setShowLangs] = useState(false);

  const steps = [
    { icon: Shield, title: t('landing.step1_title'), desc: t('landing.step1_desc'), color: 'from-blue-500 to-cyan-500' },
    { icon: Brain, title: t('landing.step2_title'), desc: t('landing.step2_desc'), color: 'from-purple-500 to-pink-500' },
    { icon: Lock, title: t('landing.step3_title'), desc: t('landing.step3_desc'), color: 'from-green-500 to-emerald-500' },
  ];

  const features = [
    { icon: Brain, title: t('landing.feat_ai'), desc: t('landing.feat_ai_desc'), color: 'text-purple-400', border: 'border-purple-500/20' },
    { icon: Zap, title: t('landing.feat_sol'), desc: t('landing.feat_sol_desc'), color: 'text-cyan-400', border: 'border-cyan-500/20' },
    { icon: Lock, title: t('landing.feat_escrow'), desc: t('landing.feat_escrow_desc'), color: 'text-green-400', border: 'border-green-500/20' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Top bar with language switcher */}
      <div className="flex justify-between items-center max-w-6xl mx-auto px-4 pt-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary-400" />
          <span className="text-lg font-bold">TrustEstate</span>
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
                    i18n.language === l.code
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {t(`lang.${l.code}`)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hero — centered title + proof card below */}
      <section className="relative pt-8 pb-8 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/40 via-gray-950 to-gray-950" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />

        <motion.div
          className="relative max-w-5xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-300 text-xs mb-6">
            <Shield className="w-3.5 h-3.5" />
            {t('landing.badge')}
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold mb-5 bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent leading-tight">
            {t('landing.title')}
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            {t('landing.subtitle')}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 rounded-xl text-lg font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary-500/25"
            >
              <Shield className="w-5 h-5" />
              Try Live Demo
            </Link>
            <a
              href={`https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 border border-gray-700 hover:border-primary-500/50 rounded-xl text-lg font-semibold transition-all hover:bg-gray-900"
            >
              <ExternalLink className="w-5 h-5" />
              Verify on Solana Explorer
            </a>
          </motion.div>

          {/* Problem stats */}
          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
            {[
              { num: '12,000+', text: t('landing.stat_fraud') },
              { num: '15M', text: t('landing.stat_loss') },
              { num: '8-14', text: t('landing.stat_time') },
            ].map((s, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="text-2xl md:text-3xl font-bold text-red-400 mb-0.5">{s.num}</div>
                <div className="text-[11px] text-gray-500 leading-tight">{s.text}</div>
              </div>
            ))}
          </motion.div>

          {/* Proof Card — below hero */}
          <motion.div variants={fadeUp} className="max-w-4xl mx-auto mt-12">
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm">{t('landing.deployed')}</h3>
                  <p className="text-xs text-gray-500">Solana Devnet</p>
                </div>
              </div>

              <div className="bg-gray-950 rounded-lg p-3 mb-4 font-mono text-xs text-primary-300 text-center border border-gray-800">
                {PROGRAM_ID}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Smart Contract', value: '12 instructions' },
                  { label: 'AI Engine', value: 'AlemLLM' },
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
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600/20 hover:bg-green-600/30 border border-green-500/20 rounded-lg text-sm text-green-400 font-medium transition-colors"
              >
                <Eye className="w-4 h-4" />
                {t('landing.deployed_desc')}
              </a>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works — 3 steps */}
      <section className="py-20 px-4 bg-gray-900/60">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            {t('landing.how_title')}
          </motion.h2>
          <p className="text-center text-gray-500 mb-14 max-w-2xl mx-auto">
            {t('landing.subtitle')}
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-gray-700 to-transparent z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div className={`w-24 h-24 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${step.color} p-0.5`}>
                    <div className="w-full h-full bg-gray-950 rounded-2xl flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="text-xs font-bold text-primary-400 mb-2">Step {i + 1}</div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why TrustEstate — 3 cards */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            {t('landing.features_title')}
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                className={`p-6 rounded-2xl border ${feat.border} bg-gray-900/50 hover:bg-gray-900 transition-all`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <feat.icon className={`w-10 h-10 ${feat.color} mb-4`} />
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Verify It Yourself — Judge Section */}
      <section className="py-16 px-4 bg-gray-900/40">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('landing.try_title')}</h2>
            <p className="text-gray-400">{t('landing.try_desc')}</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: Wallet, label: t('common.connect_wallet'), desc: 'Phantom Devnet', to: '/dashboard' },
              { icon: Shield, label: t('nav.tokenize'), desc: 'NFT on-chain', to: '/tokenize' },
              { icon: Brain, label: 'AI', desc: t('landing.feat_ai'), to: '/tokenize' },
              { icon: Terminal, label: 'Explorer', desc: t('landing.deployed_desc'), href: `https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet` },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-5 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-primary-500/30 hover:bg-gray-900 transition-all text-center group"
                  >
                    <item.icon className="w-8 h-8 text-primary-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <div className="font-semibold text-sm mb-1">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </a>
                ) : (
                  <Link
                    to={item.to!}
                    className="block p-5 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-primary-500/30 hover:bg-gray-900 transition-all text-center group"
                  >
                    <item.icon className="w-8 h-8 text-primary-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <div className="font-semibold text-sm mb-1">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Solana — judge narrative */}
      <section className="py-16 px-4 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Why Solana — not just a database</h2>
            <p className="text-gray-500 text-sm">Without blockchain, fraud prevention is just a promise. With Solana, it's provable.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Shield, title: 'NFT = Unique Identity', desc: 'Each property is a unique on-chain token — no duplicates possible', color: 'text-blue-400' },
              { icon: Lock, title: 'Escrow = Funds Protected', desc: 'Money held in smart contract until AI approves — never sent early', color: 'text-green-400' },
              { icon: Eye, title: 'Public Audit Trail', desc: 'Every deal permanently recorded — anyone can verify via Explorer', color: 'text-purple-400' },
              { icon: Zap, title: 'AI Verdict On-Chain', desc: 'Fraud detection result is stored on-chain — not just a UI warning', color: 'text-yellow-400' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center"
              >
                <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-3`} />
                <div className="font-semibold text-sm mb-1">{item.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800 text-center text-sm text-gray-600">
        {t('landing.footer')}
      </footer>
    </div>
  );
}
