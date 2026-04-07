import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Wallet, Shield, Brain, FileText, CheckCircle, AlertTriangle,
  ArrowRight, Download, Globe, Eye, Zap, Lock, ExternalLink, HelpCircle
} from 'lucide-react';

const PROGRAM_ID = '8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY';

export default function Guide() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Download,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
      title: t('guide.step1_title'),
      desc: t('guide.step1_desc'),
      substeps: [
        t('guide.step1_sub1'),
        t('guide.step1_sub2'),
        t('guide.step1_sub3'),
        t('guide.step1_sub4'),
      ],
    },
    {
      icon: Wallet,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
      title: t('guide.step2_title'),
      desc: t('guide.step2_desc'),
      substeps: [
        t('guide.step2_sub1'),
        t('guide.step2_sub2'),
        t('guide.step2_sub3'),
      ],
    },
    {
      icon: Shield,
      color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20',
      title: t('guide.step3_title'),
      desc: t('guide.step3_desc'),
      substeps: [
        t('guide.step3_sub1'),
        t('guide.step3_sub2'),
        t('guide.step3_sub3'),
        t('guide.step3_sub4'),
      ],
    },
    {
      icon: Brain,
      color: 'bg-green-500/20 text-green-400 border-green-500/20',
      title: t('guide.step4_title'),
      desc: t('guide.step4_desc'),
      substeps: [
        t('guide.step4_sub1'),
        t('guide.step4_sub2'),
        t('guide.step4_sub3'),
      ],
    },
    {
      icon: FileText,
      color: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
      title: t('guide.step5_title'),
      desc: t('guide.step5_desc'),
      substeps: [
        t('guide.step5_sub1'),
        t('guide.step5_sub2'),
        t('guide.step5_sub3'),
        t('guide.step5_sub4'),
      ],
    },
    {
      icon: Eye,
      color: 'bg-pink-500/20 text-pink-400 border-pink-500/20',
      title: t('guide.step6_title'),
      desc: t('guide.step6_desc'),
      substeps: [
        t('guide.step6_sub1'),
        t('guide.step6_sub2'),
        t('guide.step6_sub3'),
      ],
    },
  ];

  const faq = [
    { q: t('guide.faq1_q'), a: t('guide.faq1_a') },
    { q: t('guide.faq2_q'), a: t('guide.faq2_a') },
    { q: t('guide.faq3_q'), a: t('guide.faq3_a') },
    { q: t('guide.faq4_q'), a: t('guide.faq4_a') },
  ];

  const judgeChecklist = [
    { emoji: '👛', text: 'Connect Phantom wallet → switch to Devnet' },
    { emoji: '🔗', text: 'Click Explorer link → verify contract is deployed' },
    { emoji: '✅', text: 'Happy path: open Almaty apt → Buy → watch deal reach Completed' },
    { emoji: '🚨', text: 'Fraud path: open Shymkent apt → AI Score 22 → deal is Blocked' },
    { emoji: '📊', text: 'Dashboard → see 2 blocked frauds in AI Fraud Analytics' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold">{t('guide.title')}</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">{t('guide.subtitle')}</p>
      </motion.div>

      {/* Judge Checklist — top priority */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-primary-900/20 border border-primary-500/30 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-bold text-primary-300">Judge Quick-Verify — 5 min</h2>
          <span className="ml-auto text-xs text-gray-500 font-mono bg-gray-900 px-2 py-1 rounded">Devnet</span>
        </div>
        <div className="space-y-2 mb-4">
          {judgeChecklist.map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="text-lg leading-none">{item.emoji}</span>
              <span className="text-gray-200">{item.text}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <a
            href={`https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600/20 hover:bg-primary-600/30 border border-primary-500/30 rounded-lg text-sm text-primary-300 font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Verify on Solana Explorer
          </a>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-400 font-mono">
            {PROGRAM_ID.slice(0, 8)}...{PROGRAM_ID.slice(-8)}
          </span>
        </div>
      </motion.div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${step.color}`}>
                <step.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary-400">Step {i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{step.desc}</p>
                <div className="space-y-1.5">
                  {step.substeps.map((sub, j) => (
                    <div key={j} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="w-3.5 h-3.5 text-gray-600 mt-0.5 shrink-0" />
                      <span className="text-gray-300">{sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Scoring */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-8"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          {t('guide.scoring_title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">70-100</div>
            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-sm font-medium text-green-400">{t('guide.score_safe')}</div>
            <p className="text-xs text-gray-500 mt-1">{t('guide.score_safe_desc')}</p>
          </div>
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">40-69</div>
            <AlertTriangle className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-sm font-medium text-yellow-400">{t('guide.score_review')}</div>
            <p className="text-xs text-gray-500 mt-1">{t('guide.score_review_desc')}</p>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">0-39</div>
            <Shield className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <div className="text-sm font-medium text-red-400">{t('guide.score_blocked')}</div>
            <p className="text-xs text-gray-500 mt-1">{t('guide.score_blocked_desc')}</p>
          </div>
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <h2 className="text-lg font-semibold mb-4">FAQ</h2>
        <div className="space-y-3">
          {faq.map((item, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="font-medium text-sm mb-1">{item.q}</h3>
              <p className="text-sm text-gray-400">{item.a}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Contract info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-center text-sm text-gray-600"
      >
        <p>Program ID: <code className="text-primary-300 font-mono text-xs">{PROGRAM_ID}</code></p>
        <a
          href={`https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 mt-1"
        >
          Solana Explorer <ExternalLink className="w-3 h-3" />
        </a>
      </motion.div>
    </div>
  );
}
