import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tokenize from './pages/Tokenize';
import Deals from './pages/Deals';
import PropertyDetail from './pages/PropertyDetail';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import { DEMO_PROPERTIES, DEMO_DEALS, DEMO_STATS } from './lib/demoData';

export default function App() {
  const { properties, setProperties, setDeals, setStats } = useStore();
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  useEffect(() => {
    if (properties.length === 0) {
      setProperties(DEMO_PROPERTIES);
      setDeals(DEMO_DEALS);
      setStats(DEMO_STATS);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {!isLanding && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/tokenize" element={<Tokenize />} />
        <Route path="/deals" element={<Deals />} />
      </Routes>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' } }} />
    </div>
  );
}
