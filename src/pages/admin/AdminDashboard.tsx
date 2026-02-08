import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, FileText, Clock, ArrowRight } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ReferralStatus } from '../../types/referral';
import { ReferralTrendChart } from '../../components/admin/charts/ReferralTrendChart';
import { StatusDistributionChart } from '../../components/admin/charts/StatusDistributionChart';
import { TopAgenciesChart } from '../../components/admin/charts/TopAgenciesChart';
import { PayoutSummaryCard } from '../../components/admin/charts/PayoutSummaryCard';
import { groupReferralsByPeriod, groupByStatus, getTopAgencies } from '../../utils/analytics';

interface DashboardStats {
  totalAgencies: number;
  totalReferrals: number;
  pendingReferrals: number;
  acceptedReferrals: number;
  inProgressReferrals: number;
  closedReferrals: number;
}

interface RecentReferral {
  id: string;
  customer_name: string;
  status: ReferralStatus;
  created_at: string;
  provider: { agency_name: string } | null;
}

type TimeRange = 'week' | 'month' | 'all';

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAgencies: 0,
    totalReferrals: 0,
    pendingReferrals: 0,
    acceptedReferrals: 0,
    inProgressReferrals: 0,
    closedReferrals: 0,
  });
  const [allReferrals, setAllReferrals] = useState<RecentReferral[]>([]);
  const [recentReferrals, setRecentReferrals] = useState<RecentReferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  // Payout data
  const [totalCosts, setTotalCosts] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);

        // Fetch agencies count
        const { count: agencyCount, error: agencyError } = await supabase
          .from('providers')
          .select('*', { count: 'exact', head: true });

        if (agencyError) {
          setError('Failed to load agency data.');
          setIsLoading(false);
          return;
        }

        // Fetch referrals
        const { data: referrals, error: referralsError } = await supabase
          .from('referrals')
          .select(`
            id,
            customer_name,
            status,
            created_at,
            provider:providers(agency_name)
          `)
          .order('created_at', { ascending: false });

        if (referralsError) {
          setError('Failed to load referral data.');
          setIsLoading(false);
          return;
        }

        if (referrals) {
          const transformed = referrals.map((item: any) => ({
            ...item,
            provider: Array.isArray(item.provider) ? item.provider[0] : item.provider,
          }));
          setStats({
            totalAgencies: agencyCount || 0,
            totalReferrals: referrals.length,
            pendingReferrals: referrals.filter((r: any) => r.status === 'pending').length,
            acceptedReferrals: referrals.filter((r: any) => r.status === 'accepted').length,
            inProgressReferrals: referrals.filter((r: any) => r.status === 'in_progress').length,
            closedReferrals: referrals.filter((r: any) => r.status === 'closed').length,
          });
          setAllReferrals(transformed);
          setRecentReferrals(transformed.slice(0, 10));
        }

        // Fetch referral costs for payout summary
        const { data: costsData } = await supabase
          .from('referral_costs')
          .select('amount, payout_status');

        if (costsData) {
          const total = costsData.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
          const paid = costsData
            .filter((c: any) => c.payout_status === 'paid')
            .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
          const pending = costsData
            .filter((c: any) => c.payout_status === 'pending')
            .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
          setTotalCosts(total);
          setTotalPaid(paid);
          setTotalPending(pending);
        }
      } catch {
        setError('An unexpected error occurred. Please try refreshing.');
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Filter referrals by time range for charts
  const filteredReferrals = useMemo(() => {
    if (timeRange === 'all') return allReferrals;

    const now = new Date();
    const cutoff = new Date();
    if (timeRange === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else {
      cutoff.setMonth(now.getMonth() - 1);
    }

    return allReferrals.filter((r) => new Date(r.created_at) >= cutoff);
  }, [allReferrals, timeRange]);

  const trendData = useMemo(
    () => groupReferralsByPeriod(filteredReferrals, timeRange === 'week' ? 'week' : 'month'),
    [filteredReferrals, timeRange]
  );

  const statusData = useMemo(() => groupByStatus(filteredReferrals), [filteredReferrals]);
  const topAgencies = useMemo(() => getTopAgencies(filteredReferrals), [filteredReferrals]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown date';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" message="Loading dashboard..." />
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      label: 'Total Agencies',
      value: stats.totalAgencies,
      icon: Building2,
      color: 'bg-purple-100 text-purple-800',
      link: '/admin/agencies',
    },
    {
      label: 'Total Referrals',
      value: stats.totalReferrals,
      icon: FileText,
      color: 'bg-blue-100 text-blue-800',
      link: '/admin/referrals',
    },
    {
      label: 'Pending Review',
      value: stats.pendingReferrals,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800',
      link: '/admin/referrals?status=pending',
    },
    {
      label: 'In Progress',
      value: stats.inProgressReferrals,
      icon: ArrowRight,
      color: 'bg-green-100 text-green-800',
      link: '/admin/referrals?status=in_progress',
    },
  ];

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-red-700 hover:text-red-800 underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Time Range Toggle */}
      <div className="flex items-center gap-2 mb-6">
        {timeRangeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTimeRange(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === opt.value
                ? 'bg-blue-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ReferralTrendChart
          data={trendData}
          timeRange={timeRangeOptions.find((o) => o.value === timeRange)?.label}
        />
        <StatusDistributionChart data={statusData} />
        <TopAgenciesChart data={topAgencies} />
        <PayoutSummaryCard
          totalCosts={totalCosts}
          totalPaid={totalPaid}
          totalPending={totalPending}
        />
      </div>

      {/* Recent Referrals */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Recent Referrals</h3>
          <Link
            to="/admin/referrals"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Customer</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Agency</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Submitted</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentReferrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No referrals yet</p>
                  </td>
                </tr>
              ) : (
                recentReferrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {referral.customer_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {referral.provider?.agency_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={referral.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(referral.created_at)}</td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/referrals/${referral.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
