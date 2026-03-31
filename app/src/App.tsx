import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tokenize from './pages/Tokenize';
import Deals from './pages/Deals';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/tokenize" element={<Tokenize />} />
        <Route path="/deals" element={<Deals />} />
      </Routes>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' } }} />
    </div>
  );
}
