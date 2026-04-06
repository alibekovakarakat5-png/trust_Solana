import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@solana/wallet-adapter-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import {
  Home, MapPin, Maximize, Shield, ArrowLeft, ExternalLink,
  ShoppingCart, AlertTriangle, CheckCircle, Brain, User, FileText,
  Building, Hash, DollarSign, Layers
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import ProfileCard from '../components/ProfileCard';

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { properties, deals } = useStore();
  const [viewProfile, setViewProfile] = useState(false);

  const prop = properties.find(p => p.propertyId === id);
  if (!prop) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Home className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-4">{t('properties.no_properties')}</h2>
        <Link to="/properties" className="text-primary-400 hover:text-primary-300">&larr; {t('properties.title')}</Link>
      </div>
    );
  }

  const propertyDeals = deals.filter(d => d.propertyId === prop.propertyId);
  const isSuspicious = prop.fraudFlags > 0 || prop.aiScore < 50;
  const isOwner = publicKey?.toBase58() === prop.owner;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back button */}
      <button onClick={() => navigate('/properties')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {t('properties.title')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Image + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl overflow-hidden h-64 bg-gradient-to-br from-primary-900/40 to-gray-900"
          >
            {prop.imageUrl ? (
              <img src={prop.imageUrl} alt={prop.address} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="w-16 h-16 text-primary-400/50" />
              </div>
            )}
          </motion.div>

          {/* Property Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{prop.address}</h1>
              <StatusBadge status={prop.status} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Maximize className="w-3 h-3" />
                  {t('properties.sqm')}
                </div>
                <div className="text-lg font-bold">{prop.areaSqm} m²</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Building className="w-3 h-3" />
                  {t('properties.rooms')}
                </div>
                <div className="text-lg font-bold">{prop.rooms}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Layers className="w-3 h-3" />
                  {t('properties.floor')}
                </div>
                <div className="text-lg font-bold">{prop.floor}/{prop.totalFloors}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <DollarSign className="w-3 h-3" />
                  {t('deals.price')}
                </div>
                <div className="text-lg font-bold text-primary-400">{(prop.priceLamports / 1e9).toFixed(2)} SOL</div>
              </div>
            </div>

            {/* Cadastral + Type */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400">{t('tokenize.form_cadastral')}:</span>
                <span className="font-mono text-xs">{prop.cadastralId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400">{t('tokenize.form_type')}:</span>
                <span>{prop.propertyType}</span>
              </div>
            </div>

            {/* Property ID */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileText className="w-4 h-4" />
              <span className="font-mono text-xs">{prop.propertyId}</span>
            </div>
          </motion.div>

          {/* Deal History for this property */}
          {propertyDeals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                {t('deals.title')}
              </h2>
              <div className="space-y-2">
                {propertyDeals.map(deal => (
                  <div key={deal.dealId} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{deal.dealId}</p>
                      <p className="text-xs text-gray-500">{t(`status.${deal.status}`)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{(deal.price / 1e9).toFixed(2)} SOL</span>
                      {deal.aiRiskScore > 0 && <RiskBadge score={deal.aiRiskScore} size="sm" />}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* AI Verification */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-5 border ${isSuspicious ? 'bg-red-950/20 border-red-500/20' : 'bg-green-950/20 border-green-500/20'}`}
          >
            <div className="flex items-center gap-3 mb-4">
              {isSuspicious ? (
                <AlertTriangle className="w-8 h-8 text-red-400" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-400" />
              )}
              <div>
                <h3 className="font-bold">{t('properties.ai_score')}</h3>
                <p className="text-xs text-gray-500">AlemLLM</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className={`text-3xl font-bold ${isSuspicious ? 'text-red-400' : 'text-green-400'}`}>
                {prop.aiScore}/100
              </span>
              <RiskBadge score={100 - prop.aiScore} size="sm" />
            </div>

            {prop.fraudFlags > 0 && (
              <div className="bg-red-500/10 rounded-lg p-3 mt-3">
                <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  {prop.fraudFlags} {t('properties.fraud_flags')}
                </div>
                <p className="text-xs text-red-400/70">{t('profile.warning_desc')}</p>
              </div>
            )}
          </motion.div>

          {/* Seller Profile */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              {t('profile.seller_profile')}
            </h3>
            <p className="font-mono text-xs text-gray-400 mb-3 truncate">{prop.owner}</p>
            <button
              onClick={() => setViewProfile(true)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              {t('profile.seller_profile')}
            </button>
          </motion.div>

          {/* Action Buttons */}
          {publicKey && !isOwner && prop.isListed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={() => navigate('/deals', { state: { propertyId: prop.propertyId, price: prop.priceLamports / 1e9 } })}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  isSuspicious
                    ? 'bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {isSuspicious ? t('profile.warning') + ' — ' + t('properties.buy') : t('properties.buy')}
              </button>
            </motion.div>
          )}

          {/* Explorer Link */}
          <a
            href={`https://explorer.solana.com/address/${prop.owner}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl text-sm text-gray-400 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Solana Explorer
          </a>
        </div>
      </div>

      {/* Profile Modal */}
      {viewProfile && (
        <ProfileCard
          address={prop.owner}
          onClose={() => setViewProfile(false)}
          isSelf={isOwner}
        />
      )}
    </div>
  );
}
