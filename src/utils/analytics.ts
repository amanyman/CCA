import { ReferralStatus } from '../types/referral';

interface ReferralLike {
  status: ReferralStatus;
  created_at: string;
  provider?: { agency_name: string } | null;
}

export interface PeriodCount {
  date: string;
  count: number;
}

export interface StatusGroup {
  name: string;
  value: number;
  color: string;
}

export interface AgencyCount {
  name: string;
  count: number;
}

const STATUS_COLORS: Record<ReferralStatus, string> = {
  pending: '#EAB308',
  accepted: '#22C55E',
  rejected: '#EF4444',
  in_progress: '#3B82F6',
  closed: '#64748B',
};

const STATUS_LABELS: Record<ReferralStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  in_progress: 'In Progress',
  closed: 'Closed',
};

export function groupReferralsByPeriod(
  referrals: ReferralLike[],
  period: 'week' | 'month'
): PeriodCount[] {
  const buckets = new Map<string, number>();

  for (const r of referrals) {
    const d = new Date(r.created_at);
    let key: string;
    if (period === 'month') {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    } else {
      // ISO week: use Monday of that week
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      key = monday.toISOString().split('T')[0];
    }
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export function groupByStatus(referrals: ReferralLike[]): StatusGroup[] {
  const counts: Record<string, number> = {};
  for (const r of referrals) {
    counts[r.status] = (counts[r.status] || 0) + 1;
  }

  return Object.entries(counts).map(([status, value]) => ({
    name: STATUS_LABELS[status as ReferralStatus] || status,
    value,
    color: STATUS_COLORS[status as ReferralStatus] || '#94A3B8',
  }));
}

export function getTopAgencies(referrals: ReferralLike[], topN = 5): AgencyCount[] {
  const counts = new Map<string, number>();
  for (const r of referrals) {
    const name = r.provider?.agency_name || 'Unknown';
    counts.set(name, (counts.get(name) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([name, count]) => ({ name, count }));
}
