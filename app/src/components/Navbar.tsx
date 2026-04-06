import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Shield, Home, PlusCircle, FileText, BarChart3, Globe, Menu, X, Wallet, LogOut } from 'lucide-react';
import { useState } from 'react';

const langs = [
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KZ' },
  { code: 'en', label: 'EN' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [showLangs, setShowLangs] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  const links = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: BarChart3 },
    { to: '/properties', label: t('nav.properties'), icon: Home },
    { to: '/tokenize', label: t('nav.tokenize'), icon: PlusCircle },
    { to: '/deals', label: t('nav.deals'), icon: FileText },
  ];

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary-400" />
          <span className="text-xl font-bold">TrustEstate</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                pathname === to
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangs(!showLangs)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
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

          {connected && publicKey ? (
            <div className="relative">
              <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-primary-600/20 border border-primary-500/30 rounded-lg text-sm text-primary-300 hover:bg-primary-600/30 transition-colors"
              >
                <Wallet className="w-4 h-4" />
                {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
              </button>
              {showWalletMenu && (
                <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-xl z-50 min-w-[160px]">
                  <button
                    onClick={() => { disconnect(); setShowWalletMenu(false); }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('common.disconnect_wallet')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setVisible(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm text-white font-medium transition-colors"
            >
              <Wallet className="w-4 h-4" />
              {t('common.connect_wallet')}
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm px-4 py-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === to
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
