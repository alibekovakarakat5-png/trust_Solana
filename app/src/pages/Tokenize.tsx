import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { Upload, Shield, AlertTriangle, CheckCircle, Loader2, ExternalLink, UserCheck, FileCheck, KeyRound } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';
import { useTxStore } from '../store/useTxStore';
import { useTrustEstate } from '../hooks/useTrustEstate';
import RiskBadge from '../components/RiskBadge';
import toast from 'react-hot-toast';

export default function Tokenize() {
  const { t } = useTranslation();
  const { publicKey } = useWallet();
  const { addProperty } = useStore();
  const { tokenizeProperty, loading: solanaLoading } = useTrustEstate();

  const addTx = useTxStore((s) => s.addTx);

  const [form, setForm] = useState({
    address: '',
    areaSqm: '',
    rooms: '',
    floor: '',
    totalFloors: '',
    cadastralId: '',
    price: '',
    propertyType: 'Apartment',
  });

  const [ownershipForm, setOwnershipForm] = useState({ iin: '', cadastralId: '' });
  const [ownershipVerified, setOwnershipVerified] = useState(false);
  const [ownershipChecking, setOwnershipChecking] = useState(false);

  const [result, setResult] = useState<any>(null);
  const [step, setStep] = useState<'ownership' | 'form' | 'verifying' | 'result'>('ownership');
  const [solanaResult, setSolanaResult] = useState<{ tx: string; mint: string } | null>(null);

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  async function handleOwnershipCheck(e: React.FormEvent) {
    e.preventDefault();
    setOwnershipChecking(true);

    // Имитация проверки через ЕГКН (в продакшене — реальный API)
    await new Promise(resolve => setTimeout(resolve, 2000));

    setOwnershipVerified(true);
    setOwnershipChecking(false);

    // Переносим кадастровый номер в основную форму
    setForm(prev => ({ ...prev, cadastralId: ownershipForm.cadastralId }));

    toast.success(t('tokenize.ownership_confirmed') || 'Ownership verified via EGKN');

    // Переход к форме через секунду
    setTimeout(() => setStep('form'), 1000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey) return;

    setStep('verifying');
    setSolanaResult(null);

    const propertyId = `prop_${Date.now()}`;

    // 1. Try on-chain tokenization first
    try {
      const onChainResult = await tokenizeProperty({
        propertyId,
        address: form.address,
        areaSqm: Number(form.areaSqm),
        rooms: Number(form.rooms),
        floor: Number(form.floor),
        totalFloors: Number(form.totalFloors),
        cadastralId: form.cadastralId,
        priceLamports: Number(form.price) * 1e9,
        propertyType: form.propertyType as any,
      });

      setSolanaResult({ tx: onChainResult.tx, mint: onChainResult.mint });

      toast.success(
        <div>
          <p className="font-semibold">NFT minted on Solana!</p>
          <a
            href={`https://explorer.solana.com/tx/${onChainResult.tx}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-400 underline"
          >
            View transaction
          </a>
        </div>,
        { duration: 8000 }
      );
    } catch (err: any) {
      console.warn('On-chain tokenization failed (continuing with off-chain):', err.message);
    }

    // 2. Run AI verification via backend
    try {
      const propertyData = {
        propertyId,
        address: form.address,
        areaSqm: Number(form.areaSqm),
        rooms: Number(form.rooms),
        floor: Number(form.floor),
        totalFloors: Number(form.totalFloors),
        cadastralId: form.cadastralId,
        priceLamports: Number(form.price) * 1e9,
        propertyType: form.propertyType,
        documentHash: Array(32).fill(0).map(() => Math.floor(Math.random() * 256)).join(''),
        owner: publicKey.toBase58(),
      };

      await api.createProperty(propertyData);

      const aiResult = await api.verifyProperty({
        ...propertyData,
        sellerHistory: { totalPropertiesListed: 1, recentListings30Days: 1, previousFraudFlags: 0 },
      });

      // Oracle recorded AI verdict on-chain
      if (aiResult.onChainTx) {
        addTx({
          signature: aiResult.onChainTx,
          type: 'ai_verification',
          description: `AI verdict on-chain: score ${aiResult.verificationScore}/100`,
          timestamp: Date.now(),
        });
        toast.success(
          <div>
            <p className="font-semibold">AI verdict recorded on-chain!</p>
            <a href={`https://explorer.solana.com/tx/${aiResult.onChainTx}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 underline">View oracle transaction</a>
          </div>,
          { duration: 8000 }
        );
      }

      setResult({ ...aiResult, propertyId });

      addProperty({
        ...propertyData,
        isVerified: aiResult.isVerified,
        aiScore: aiResult.verificationScore,
        fraudFlags: aiResult.fraudFlags,
        isListed: aiResult.isVerified && aiResult.fraudFlags === 0,
        status: aiResult.isVerified ? 'verified' : 'pending_verification',
      });

      setStep('result');
    } catch (err: any) {
      console.error(err);
      toast.error(t('tokenize.verification_failed') || 'AI verification failed. Please try again.');
      setStep('form');
    }
  }

  if (!publicKey) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t('common.connect_wallet')}</h2>
        <p className="text-gray-400">{t('tokenize.subtitle')}</p>
      </div>
    );
  }

  const typeOptions = [
    { value: 'Apartment', label: t('tokenize.type_apartment') },
    { value: 'House', label: t('tokenize.type_house') },
    { value: 'Commercial', label: t('tokenize.type_commercial') },
    { value: 'Land', label: t('tokenize.type_land') },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('tokenize.title')}</h1>
        <p className="text-sm text-gray-500">{t('tokenize.subtitle')}</p>
      </div>

      {step === 'ownership' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2 text-primary-400">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">1</div>
              <span className="text-sm font-medium">{t('tokenize.step_ownership')}</span>
            </div>
            <div className="h-px flex-1 bg-gray-700" />
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 text-sm font-bold">2</div>
              <span className="text-sm">{t('tokenize.step_details')}</span>
            </div>
            <div className="h-px flex-1 bg-gray-700" />
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 text-sm font-bold">3</div>
              <span className="text-sm">{t('tokenize.step_verify')}</span>
            </div>
          </div>

          <form onSubmit={handleOwnershipCheck} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{t('tokenize.ownership_title')}</h2>
                <p className="text-sm text-gray-500">{t('tokenize.ownership_desc')}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('tokenize.iin_label')}</label>
              <input
                type="text"
                value={ownershipForm.iin}
                onChange={e => setOwnershipForm(prev => ({ ...prev, iin: e.target.value }))}
                placeholder="950101350123"
                maxLength={12}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary-500 outline-none font-mono tracking-wider"
                required
              />
              <p className="text-xs text-gray-600 mt-1">{t('tokenize.iin_hint')}</p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('tokenize.form_cadastral')}</label>
              <input
                type="text"
                value={ownershipForm.cadastralId}
                onChange={e => setOwnershipForm(prev => ({ ...prev, cadastralId: e.target.value }))}
                placeholder="20:01:123456:789"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary-500 outline-none font-mono"
                required
              />
            </div>

            <div className="border border-dashed border-gray-700 rounded-lg p-6 text-center">
              <KeyRound className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{t('tokenize.sign_wallet')}</p>
              <p className="text-xs text-gray-600 mt-1">{t('tokenize.sign_wallet_desc')}</p>
            </div>

            {ownershipVerified && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 bg-green-950/30 border border-green-800 rounded-lg"
              >
                <FileCheck className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-green-400 font-semibold">{t('tokenize.ownership_confirmed')}</p>
                  <p className="text-xs text-green-400/60">{t('tokenize.egkn_match')}</p>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={ownershipChecking || ownershipVerified}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {ownershipChecking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('tokenize.checking_egkn')}
                </>
              ) : ownershipVerified ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {t('tokenize.ownership_confirmed')}
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  {t('tokenize.verify_ownership')}
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {step === 'form' && (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">{t('tokenize.form_address')}</label>
              <input type="text" value={form.address} onChange={e => update('address', e.target.value)} placeholder="Almaty, Abay st. 50, apt 12" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('tokenize.form_area')}</label>
              <input type="number" value={form.areaSqm} onChange={e => update('areaSqm', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('tokenize.form_rooms')}</label>
              <input type="number" value={form.rooms} onChange={e => update('rooms', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('tokenize.form_floor')}</label>
              <input type="number" value={form.floor} onChange={e => update('floor', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('tokenize.form_total_floors')}</label>
              <input type="number" value={form.totalFloors} onChange={e => update('totalFloors', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('tokenize.form_cadastral')}</label>
              <input type="text" value={form.cadastralId} onChange={e => update('cadastralId', e.target.value)} placeholder="20:01:123456:789" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('tokenize.form_price')}</label>
              <input type="number" step="0.01" value={form.price} onChange={e => update('price', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('tokenize.form_type')}</label>
              <select value={form.propertyType} onChange={e => update('propertyType', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary-500 outline-none">
                {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="border border-dashed border-gray-700 rounded-lg p-8 text-center">
            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Upload property documents</p>
            <p className="text-xs text-gray-600 mt-1">Documents will be hashed and stored on-chain</p>
          </div>

          <button type="submit" disabled={solanaLoading} className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Shield className="w-5 h-5" />
            {t('tokenize.submit')}
          </button>
        </motion.form>
      )}

      {step === 'verifying' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Loader2 className="w-12 h-12 text-primary-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold mb-2">{t('tokenize.verifying')}</h2>
          <p className="text-gray-400 text-sm">{t('tokenize.verifying_desc')}</p>
          {solanaLoading && (
            <p className="text-xs text-green-400 mt-3 flex items-center justify-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Minting NFT on Solana...
            </p>
          )}
        </motion.div>
      )}

      {step === 'result' && result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Solana Transaction Card */}
          {solanaResult && (
            <div className="border border-green-500/30 bg-green-950/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-semibold text-green-400">NFT Minted on Solana</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Transaction:</span>
                  <a
                    href={`https://explorer.solana.com/tx/${solanaResult.tx}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  >
                    {solanaResult.tx.slice(0, 20)}... <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Mint:</span>
                  <a
                    href={`https://explorer.solana.com/address/${solanaResult.mint}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  >
                    {solanaResult.mint.slice(0, 20)}... <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className={`border rounded-xl p-6 ${result.fraudFlags > 0 ? 'bg-red-950/30 border-red-800' : 'bg-green-950/30 border-green-800'}`}>
            <div className="flex items-center gap-3 mb-4">
              {result.fraudFlags > 0
                ? <AlertTriangle className="w-8 h-8 text-red-400" />
                : <CheckCircle className="w-8 h-8 text-green-400" />
              }
              <div>
                <h2 className="text-lg font-semibold">
                  {result.fraudFlags > 0 ? t('tokenize.result_not_verified') : t('tokenize.result_verified')}
                </h2>
                <RiskBadge score={100 - result.verificationScore} />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-gray-400">{t('tokenize.score')}</span>
                <span className="font-medium">{result.verificationScore}/100</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-gray-400">{t('tokenize.market_estimate')}</span>
                <span className="font-medium">{(result.marketPriceEstimate / 1e9).toFixed(2)} SOL</span>
              </div>
              <div className="pt-2">
                <span className="text-gray-400 block mb-1">AI Analysis</span>
                <p className="text-gray-300">{result.fraudDetails}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setStep('ownership'); setResult(null); setSolanaResult(null); setOwnershipVerified(false); setOwnershipForm({ iin: '', cadastralId: '' }); setForm({ address: '', areaSqm: '', rooms: '', floor: '', totalFloors: '', cadastralId: '', price: '', propertyType: 'Apartment' }); }}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {t('tokenize.add_another')}
          </button>
        </motion.div>
      )}
    </div>
  );
}
