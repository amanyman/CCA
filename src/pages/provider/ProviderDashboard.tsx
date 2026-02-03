import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, ArrowRight, Plus } from 'lucide-react';
import { ProviderLayout } from '../../components/provider/ProviderLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Referral } from '../../types/referral';
import { Provider } from '../../types/provider';
import { ReferralCard } from '../../components/provider/ReferralCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface DashboardStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  inProgress: number;
  closed: number;
}

export function ProviderDashboard() {
  const { user } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [recentReferrals, setRecentReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    inProgress: 0,
    closed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Get provider data
      const { data: providerData } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (providerData) {
        setProvider(providerData);

        // Get referrals
        const { data: referrals } = await supabase
          .from('referrals')
          .select('*')
          .eq('provider_id', providerData.id)
          .order('created_at', { ascending: false });

        if (referrals) {
          setRecentReferrals(referrals.slice(0, 5));
          setStats({
            total: referrals.length,
            pending: referrals.filter((r) => r.status === 'pending').length,
            accepted: referrals.filter((r) => r.status === 'accepted').length,
            rejected: referrals.filter((r) => r.status === 'rejected').length,
            inProgress: referrals.filter((r) => r.status === 'in_progress').length,
            closed: referrals.filter((r) => r.status === 'closed').length,
          });
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <ProviderLayout title="Dashboard">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" message="Loading dashboard..." />
        </div>
      </ProviderLayout>
    );
  }

  if (!provider) {
    return (
      <ProviderLayout title="Dashboard">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Account Setup Incomplete</h2>
          <p className="text-yellow-700 mb-4">
            Your provider profile wasn't found. This may happen if:
          </p>
          <ul className="text-yellow-700 text-sm mb-4 list-disc list-inside">
            <li>You need to confirm your email address first</li>
            <li>There was an issue during signup</li>
          </ul>
          <p className="text-yellow-700 text-sm">
            Please check your email for a confirmation link, or{' '}
            <Link to="/provider/signup" className="text-blue-900 font-semibold hover:underline">
              try signing up again
            </Link>.
          </p>
        </div>
      </ProviderLayout>
    );
  }

  const statCards = [
    {
      label: 'Total Referrals',
      value: stats.total,
      icon: FileText,
      color: 'bg-blue-100 text-blue-900',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      label: 'Accepted',
      value: stats.accepted,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: ArrowRight,
      color: 'bg-blue-100 text-blue-800',
    },
  ];

  return (
    <ProviderLayout title="Dashboard">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-xl p-6 mb-8 text-white">
        <h2 className="text-xl font-semibold mb-2">
          Welcome back, {provider?.main_contact_name || 'Partner'}!
        </h2>
        <p className="text-blue-100 mb-4">
          Manage your referrals and track their progress from your dashboard.
        </p>
        <Link
          to="/provider/referrals/new"
          className="inline-flex items-center gap-2 bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Submit New Referral
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Referrals */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Recent Referrals</h3>
          <Link
            to="/provider/referrals"
            className="text-sm text-blue-900 hover:text-blue-950 font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-4">
          {recentReferrals.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 mb-4">No referrals yet</p>
              <Link
                to="/provider/referrals/new"
                className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-950 font-medium"
              >
                <Plus className="w-5 h-5" />
                Submit your first referral
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReferrals.map((referral) => (
                <ReferralCard key={referral.id} referral={referral} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProviderLayout>
  );
}
