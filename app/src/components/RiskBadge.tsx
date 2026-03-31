import { useTranslation } from 'react-i18next';

interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function RiskBadge({ score, size = 'md' }: Props) {
  const { t } = useTranslation();

  const color = score > 75 ? 'bg-red-500/20 text-red-400 border-red-500/30'
    : score > 40 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    : 'bg-green-500/20 text-green-400 border-green-500/30';

  const label = score > 75 ? t('risk.high') : score > 40 ? t('risk.medium') : t('risk.safe');

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5'
    : size === 'lg' ? 'text-base px-4 py-2'
    : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${color} ${sizeClass}`}>
      <span className={`w-2 h-2 rounded-full ${score > 75 ? 'bg-red-400' : score > 40 ? 'bg-yellow-400' : 'bg-green-400'}`} />
      {score}/100 {label}
    </span>
  );
}
