import { ExternalLink, Zap } from 'lucide-react';
import { useTxStore } from '../store/useTxStore';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_COLORS: Record<string, string> = {
  initialize_platform: 'bg-green-500/20 text-green-400',
  tokenize_property: 'bg-blue-500/20 text-blue-400',
  create_deal: 'bg-purple-500/20 text-purple-400',
  ai_verification: 'bg-orange-500/20 text-orange-400',
};

export default function TransactionHistory() {
  const { t } = useTranslation();
  const { transactions } = useTxStore();

  if (transactions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6"
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        {t('dashboard.solana_txs')}
      </h2>
      <div className="space-y-2">
        <AnimatePresence>
          {transactions.slice(0, 10).map((tx) => (
            <motion.div
              key={tx.signature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${TYPE_COLORS[tx.type] || 'bg-gray-700 text-gray-300'}`}>
                  {tx.type.replace(/_/g, ' ')}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-300 truncate">{tx.description}</p>
                  <p className="text-xs text-gray-600 font-mono truncate">{tx.signature}</p>
                </div>
              </div>
              <a
                href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 ml-2 p-2 rounded-lg hover:bg-gray-800 text-primary-400 hover:text-primary-300 transition-colors"
                title="View on Solana Explorer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
