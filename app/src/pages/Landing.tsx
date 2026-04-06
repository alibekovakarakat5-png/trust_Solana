import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Brain, Zap, Lock, PieChart, ArrowRight, ExternalLink, CheckCircle } from 'lucide-react';

const PROGRAM_ID = '8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

export default function Landing() {
  const { t } = useTranslation();

  const steps = [
    { icon: Shield, title: t('landing.step1_title'), desc: t('landing.step1_desc'), color: 'from-blue-500 to-cyan-500' },
    { icon: Brain, title: t('landing.step2_title'), desc: t('landing.step2_desc'), color: 'from-purple-500 to-pink-500' },
    { icon: Lock, title: t('landing.step3_title'), desc: t('landing.step3_desc'), color: 'from-green-500 to-emerald-500' },
    { icon: PieChart, title: t('landing.step4_title'), desc: t('landing.step4_desc'), color: 'from-orange-500 to-yellow-500' },
  ];

  const features = [
    { icon: Brain, title: t('landing.feat_ai'), desc: t('landing.feat_ai_desc'), color: 'text-purple-400' },
    { icon: Zap, title: t('landing.feat_sol'), desc: t('landing.feat_sol_desc'), color: 'text-cyan-400' },
    { icon: Lock, title: t('landing.feat_escrow'), desc: t('landing.feat_escrow_desc'), color: 'text-green-400' },
    { icon: PieChart, title: t('landing.feat_frac'), desc: t('landing.feat_frac_desc'), color: 'text-orange-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/40 via-gray-950 to-gray-950" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />

        <motion.div
          className="relative max-w-5xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-300 text-sm mb-8">
            <Shield className="w-4 h-4" />
            {t('landing.badge')}
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent leading-tight">
            {t('landing.title') || 'Real Estate Fraud Protection'}
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            {t('landing.subtitle') || 'AI + Solana blockchain to verify every real estate transaction in Kazakhstan. Tokenization, escrow, transparency.'}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 rounded-xl text-lg font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary-500/25"
            >
              {t('landing.cta_start')}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/tokenize"
              className="inline-flex items-center gap-2 px-8 py-4 border border-gray-700 hover:border-gray-500 rounded-xl text-lg font-semibold transition-all hover:bg-gray-900"
            >
              {t('landing.cta_demo')}
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-3xl mx-auto">
            {[
              { num: '12,000+', text: t('landing.stat_fraud') },
              { num: '15M', text: t('landing.stat_loss') },
              { num: '8-14', text: t('landing.stat_time') },
            ].map((s, i) => (
              <div key={i} className="text-center p-4">
                <div className="text-3xl md:text-4xl font-bold text-primary-400 mb-1">{s.num}</div>
                <div className="text-sm text-gray-500">{s.text}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-gray-900/80">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            {t('landing.how_title')}
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                {i < 3 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-gray-700 to-transparent z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${step.color} p-0.5`}>
                    <div className="w-full h-full bg-gray-950 rounded-2xl flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="text-xs font-bold text-gray-600 mb-2">0{i + 1}</div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            {t('landing.features_title')}
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-2xl border border-gray-800 bg-gray-900/50 hover:border-gray-700 transition-all hover:bg-gray-900"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <feat.icon className={`w-10 h-10 ${feat.color} mb-4`} />
                <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployed Contract */}
      <section className="py-16 px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center p-8 rounded-2xl border border-green-500/20 bg-green-500/5"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">{t('landing.deployed')}</h3>
          <p className="text-gray-400 mb-4">{t('landing.deployed_desc')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <code className="px-4 py-2 bg-gray-900 rounded-lg text-sm text-primary-300 font-mono">
              {PROGRAM_ID}
            </code>
            <a
              href={`https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm font-semibold transition-colors"
            >
              Solana Explorer <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800 text-center text-sm text-gray-600">
        {t('landing.footer')}
      </footer>
    </div>
  );
}
