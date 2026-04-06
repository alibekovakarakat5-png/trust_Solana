import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, MapPin, Maximize, Shield, ShoppingCart, Layers, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useWallet } from '@solana/wallet-adapter-react';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Properties() {
  const { t } = useTranslation();
  const { properties, updateProperty } = useStore();
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const [fractionalizing, setFractionalizing] = useState<string | null>(null);
  const [totalShares, setTotalShares] = useState('');
  const [pricePerShare, setPricePerShare] = useState('');

  function handleFractionalize(propertyId: string, e: React.FormEvent) {
    e.preventDefault();
    const shares = Number(totalShares);
    const price = Number(pricePerShare);
    if (shares <= 0 || price <= 0) return;
    updateProperty(propertyId, {
      isFractionalized: true,
      totalShares: shares,
      pricePerShare: price,
      availableShares: shares,
    });
    toast.success(t('properties.fractionalized'));
    setFractionalizing(null);
    setTotalShares('');
    setPricePerShare('');
  }

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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
          >
            <div className="h-40 bg-gradient-to-br from-primary-900/40 to-gray-900 overflow-hidden">
              {prop.imageUrl ? (
                <img src={prop.imageUrl} alt={prop.address} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="w-12 h-12 text-primary-400/50" />
                </div>
              )}
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
              {/* Fractionalized badge & share info */}
              {prop.isFractionalized && (
                <div className="mt-2 bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-3 h-3 text-purple-400" />
                    <span className="text-xs font-medium text-purple-400">{t('properties.fractionalized')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{prop.availableShares}/{prop.totalShares} {t('properties.shares_available')}</span>
                    <span>{prop.pricePerShare} SOL/{t('properties.total_shares').toLowerCase()}</span>
                  </div>
                </div>
              )}

              {/* Buy button for non-owned listed properties */}
              {prop.isListed && publicKey && prop.owner !== publicKey.toBase58() && !prop.isFractionalized && (
                <button
                  onClick={() => navigate('/deals', { state: { propertyId: prop.propertyId, price: prop.priceLamports / 1e9 } })}
                  className="w-full mt-3 bg-green-600 hover:bg-green-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {t('properties.buy')}
                </button>
              )}

              {/* Buy Shares button for non-owned fractionalized properties */}
              {prop.isFractionalized && publicKey && prop.owner !== publicKey.toBase58() && (
                <button
                  onClick={() => toast('Coming soon in Phase 2', { icon: '🔜' })}
                  className="w-full mt-2 bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t('properties.buy_shares')}
                </button>
              )}

              {/* Fractionalize button for owned verified properties */}
              {publicKey && prop.owner === publicKey.toBase58() && prop.isVerified && !prop.isFractionalized && (
                <>
                  {fractionalizing === prop.propertyId ? (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      onSubmit={(e) => handleFractionalize(prop.propertyId, e)}
                      className="mt-3 bg-gray-800 border border-gray-700 rounded-lg p-3 space-y-2"
                    >
                      <h4 className="text-xs font-semibold text-purple-400">{t('properties.fractionalize_title')}</h4>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('properties.total_shares')}</label>
                        <input type="number" min="2" step="1" value={totalShares} onChange={e => setTotalShares(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white outline-none" required />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('properties.price_per_share')}</label>
                        <input type="number" min="0.001" step="0.001" value={pricePerShare} onChange={e => setPricePerShare(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white outline-none" required />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-xs">{t('properties.fractionalize')}</button>
                        <button type="button" onClick={() => { setFractionalizing(null); setTotalShares(''); setPricePerShare(''); }} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs">{t('deals.cancel_deal')}</button>
                      </div>
                    </motion.form>
                  ) : (
                    <button
                      onClick={() => setFractionalizing(prop.propertyId)}
                      className="w-full mt-3 bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Layers className="w-4 h-4" />
                      {t('properties.fractionalize')}
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
