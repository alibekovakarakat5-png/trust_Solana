import { useTranslation } from 'react-i18next';

const statusConfig: Record<string, { color: string; labelKey: string }> = {
  created: { color: 'bg-blue-500/20 text-blue-400', labelKey: 'status.created' },
  funded: { color: 'bg-blue-500/20 text-blue-400', labelKey: 'status.funded' },
  awaiting_ai: { color: 'bg-yellow-500/20 text-yellow-400', labelKey: 'status.awaiting_ai' },
  ai_approved: { color: 'bg-green-500/20 text-green-400', labelKey: 'status.ai_approved' },
  under_review: { color: 'bg-yellow-500/20 text-yellow-400', labelKey: 'status.under_review' },
  blocked: { color: 'bg-red-500/20 text-red-400', labelKey: 'status.blocked' },
  completed: { color: 'bg-green-500/20 text-green-400', labelKey: 'status.completed' },
  cancelled: { color: 'bg-gray-500/20 text-gray-400', labelKey: 'status.cancelled' },
  pending_verification: { color: 'bg-yellow-500/20 text-yellow-400', labelKey: 'status.pending' },
  verified: { color: 'bg-green-500/20 text-green-400', labelKey: 'status.verified' },
  listed: { color: 'bg-primary-500/20 text-primary-400', labelKey: 'status.listed' },
};

export default function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const config = statusConfig[status] || { color: 'bg-gray-500/20 text-gray-400', labelKey: '' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.labelKey ? t(config.labelKey) : status}
    </span>
  );
}
