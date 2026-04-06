import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { Shield, Home, FileText, AlertTriangle, CheckCircle, X, ExternalLink } from 'lucide-react';

interface ProfileCardProps {
  address: string;
  onClose: () => void;
  isSelf?: boolean;
}

export default function ProfileCard({ address, onClose, isSelf }: ProfileCardProps) {
  const { t } = useTranslation();
  const { properties, deals } = useStore();

  const myProperties = properties.filter(p => p.owner === address);
  const myDealsAsBuyer = deals.filter(d => d.buyer === address);
  const myDealsAsSeller = deals.filter(d => d.seller === address);
  const allDeals = [...myDealsAsBuyer, ...myDealsAsSeller];
  const blockedDeals = allDeals.filter(d => d.status === 'blocked');
  const completedDeals = allDeals.filter(d => d.status === 'completed');
  const verifiedProps = myProperties.filter(p => p.isVerified);
  const fraudProps = myProperties.filter(p => p.fraudFlags > 0);

  const avgAiScore = myProperties.length > 0
    ? Math.round(myProperties.reduce((sum, p) => sum + p.aiScore, 0) / myProperties.length)
    : 0;

  const trustLevel = avgAiScore >= 80 ? 'high' : avgAiScore >= 50 ? 'medium' : 'low';
  const trustColor = trustLevel === 'high' ? 'text-green-400' : trustLevel === 'medium' ? 'text-yellow-400' : 'text-red-400';
  const trustBg = trustLevel === 'high' ? 'bg-green-500/10 border-green-500/20' : trustLevel === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20';
  const trustLabel = trustLevel === 'high' ? t('risk.safe') : trustLevel === 'medium' ? t('risk.medium') : t('risk.high');

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelf ? 'bg-primary-500/20' : 'bg-gray-800'}`}>
            <Shield className={`w-6 h-6 ${isSelf ? 'text-primary-400' : 'text-gray-400'}`} />
          </div>
          <div>
            <div className="text-sm font-bold">{isSelf ? t('profile.my_profile') : t('profile.seller_profile')}</div>
            <div className="text-xs text-gray-500 font-mono">{address.slice(0, 6)}...{address.slice(-4)}</div>
          </div>
        </div>

        {/* Trust Score */}
        <div className={`rounded-xl p-4 mb-4 border ${trustBg}`}>
          <div className="text-xs text-gray-400 mb-1">Trust Score</div>
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold ${trustColor}`}>{avgAiScore}/100</span>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${trustBg} ${trustColor}`}>{trustLabel}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-3.5 h-3.5 text-primary-400" />
              <span className="text-xs text-gray-400">{t('profile.properties')}</span>
            </div>
            <div className="text-lg font-bold">{myProperties.length}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-gray-400">{t('profile.verified')}</span>
            </div>
            <div className="text-lg font-bold text-green-400">{verifiedProps.length}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-gray-400">{t('profile.deals')}</span>
            </div>
            <div className="text-lg font-bold">{allDeals.length}</div>
            <div className="text-[10px] text-gray-500">{completedDeals.length} {t('profile.successful')}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-gray-400">{t('profile.fraud_flags')}</span>
            </div>
            <div className={`text-lg font-bold ${blockedDeals.length > 0 || fraudProps.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {blockedDeals.length + fraudProps.length}
            </div>
          </div>
        </div>

        {/* Warning for suspicious sellers */}
        {(blockedDeals.length > 0 || fraudProps.length > 0) && !isSelf && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {t('profile.warning')}
            </div>
            <p className="text-xs text-red-400/70 mt-1">{t('profile.warning_desc')}</p>
          </div>
        )}

        {/* Explorer link */}
        <a
          href={`https://explorer.solana.com/address/${address}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Solana Explorer
        </a>
      </div>
    </div>
  );
}
