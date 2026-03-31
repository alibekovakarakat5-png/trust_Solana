import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Shield, Home, PlusCircle, FileText, BarChart3 } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/properties', label: 'Properties', icon: Home },
  { to: '/tokenize', label: 'Tokenize', icon: PlusCircle },
  { to: '/deals', label: 'Deals', icon: FileText },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary-400" />
          <span className="text-xl font-bold">TrustEstate</span>
        </Link>

        <div className="flex items-center gap-1">
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

        <WalletMultiButton className="!bg-primary-600 !rounded-lg !h-10 !text-sm" />
      </div>
    </nav>
  );
}
