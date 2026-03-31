const statusConfig: Record<string, { color: string; label: string }> = {
  created: { color: 'bg-blue-500/20 text-blue-400', label: 'Created' },
  funded: { color: 'bg-blue-500/20 text-blue-400', label: 'Funded' },
  awaiting_ai: { color: 'bg-yellow-500/20 text-yellow-400', label: 'AI Review' },
  ai_approved: { color: 'bg-green-500/20 text-green-400', label: 'AI Approved' },
  under_review: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Under Review' },
  blocked: { color: 'bg-red-500/20 text-red-400', label: 'Blocked' },
  completed: { color: 'bg-green-500/20 text-green-400', label: 'Completed' },
  cancelled: { color: 'bg-gray-500/20 text-gray-400', label: 'Cancelled' },
  pending_verification: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Pending AI' },
  verified: { color: 'bg-green-500/20 text-green-400', label: 'Verified' },
  listed: { color: 'bg-primary-500/20 text-primary-400', label: 'Listed' },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { color: 'bg-gray-500/20 text-gray-400', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
