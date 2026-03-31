import { Shield, Home, FileText, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
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
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { stats, properties, deals } = useStore();

  const verifiedCount = properties.filter(p => p.isVerified).length;
  const activeDeals = deals.filter(d => !['completed', 'cancelled'].includes(d.status)).length;
  const blockedDeals = deals.filter(d => d.status === 'blocked').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">TrustEstate Dashboard</h1>
        <p className="text-gray-400">AI-powered real estate fraud detection on Solana</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Home} label="Total Properties" value={stats.totalProperties} color="bg-primary-600/20 text-primary-400" />
        <StatCard icon={FileText} label="Total Deals" value={stats.totalDeals} color="bg-blue-600/20 text-blue-400" />
        <StatCard icon={AlertTriangle} label="Fraud Blocked" value={stats.totalFraudBlocked} color="bg-red-600/20 text-red-400" />
        <StatCard icon={CheckCircle} label="Verified Properties" value={verifiedCount} color="bg-green-600/20 text-green-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-400" />
            How It Works
          </h2>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Tokenize property — upload docs, AI verifies authenticity' },
              { step: '2', text: 'AI checks for fraud — duplicates, price anomalies, fake docs' },
              { step: '3', text: 'Buyer creates deal — funds go into escrow smart contract' },
              { step: '4', text: 'AI analyzes deal — risk score determines: approve / review / block' },
              { step: '5', text: 'Atomic swap — NFT to buyer, SOL to seller, all on-chain' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {step}
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
            Recent Activity
          </h2>
          {deals.length === 0 ? (
            <p className="text-gray-500 text-sm">No deals yet. Create your first property!</p>
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
                    {deal.aiRiskScore > 0 ? `Risk: ${deal.aiRiskScore}` : deal.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
