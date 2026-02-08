import { ReferralStatus } from '../../types/referral';

interface StatusBadgeProps {
  status: ReferralStatus;
  providerView?: boolean;
}

const statusConfig: Record<ReferralStatus, { label: string; providerLabel?: string; className: string }> = {
  pending: {
    label: 'Pending',
    providerLabel: 'Processing',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  closed: {
    label: 'Closed',
    className: 'bg-slate-100 text-slate-800 border-slate-200',
  },
};

export function StatusBadge({ status, providerView }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = providerView && config.providerLabel ? config.providerLabel : config.label;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {displayLabel}
    </span>
  );
}
