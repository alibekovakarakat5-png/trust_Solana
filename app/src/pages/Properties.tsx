import { useTranslation } from 'react-i18next';
import { Home, MapPin, Maximize, Shield, ShoppingCart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useWallet } from '@solana/wallet-adapter-react';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

export default function Properties() {
  const { t } = useTranslation();
  const { properties } = useStore();
  const { publicKey } = useWallet();
  const navigate = useNavigate();

  if (properties.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Home className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t('properties.no_properties')}</h2>
        <Link to="/tokenize" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors">
          <Shield className="w-5 h-5" />
          {t('nav.tokenize')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('properties.title')}</h1>
          <p className="text-sm text-gray-500">{t('properties.subtitle')}</p>
        </div>
        <Link to="/tokenize" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          + {t('nav.tokenize')}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((prop, i) => (
          <motion.div
            key={prop.propertyId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
          >
            <div className="h-32 bg-gradient-to-br from-primary-900/40 to-gray-900 flex items-center justify-center">
              <Home className="w-12 h-12 text-primary-400/50" />
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-mono">{prop.propertyId.slice(0, 16)}...</span>
                <StatusBadge status={prop.status} />
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <p className="text-sm">{prop.address}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{prop.areaSqm} {t('properties.sqm')}</span>
                <span>{prop.rooms} {t('properties.rooms')}</span>
                <span>{t('properties.floor')} {prop.floor}/{prop.totalFloors}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <span className="text-lg font-bold">{(prop.priceLamports / 1e9).toFixed(2)} SOL</span>
                {prop.aiScore > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{t('properties.ai_score')}</span>
                    <RiskBadge score={100 - prop.aiScore} size="sm" />
                  </div>
                )}
              </div>
              {prop.isListed && publicKey && prop.owner !== publicKey.toBase58() && (
                <button
                  onClick={() => navigate('/deals', { state: { propertyId: prop.propertyId, price: prop.priceLamports / 1e9 } })}
                  className="w-full mt-3 bg-green-600 hover:bg-green-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {t('properties.buy')}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
