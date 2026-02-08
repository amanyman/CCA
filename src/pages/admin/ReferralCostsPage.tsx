import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ReferralCost, PayoutStatus } from '../../types/referralCost';

export function AdminReferralCostsPage() {
  const [costs, setCosts] = useState<ReferralCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCosts = async () => {
      const { data, error: fetchError } = await supabase
        .from('referral_costs')
        .select(`
          *,
          referral:referrals(customer_name, provider:providers(agency_name))
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError('Failed to load referral costs.');
      } else {
        setCosts((data || []) as ReferralCost[]);
      }
      setIsLoading(false);
    };

    fetchCosts();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filtered = filter === 'all' ? costs : costs.filter((c) => c.payout_status === filter);

  const totalAmount = costs.reduce((sum, c) => sum + c.amount, 0);
  const totalPending = costs.filter((c) => c.payout_status === 'pending').reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = costs.filter((c) => c.payout_status === 'paid').reduce((sum, c) => sum + c.amount, 0);

  if (isLoading) {
    return (
      <AdminLayout title="Referral Costs">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" message="Loading referral costs..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Referral Costs">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-slate-500">Total Costs</div>
          </div>
          <div className="text-2xl font-bold text-slate-800">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-sm text-slate-500">Pending Payouts</div>
          </div>
          <div className="text-2xl font-bold text-yellow-700">{formatCurrency(totalPending)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-sm text-slate-500">Total Paid</div>
          </div>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(totalPaid)}</div>
        </div>
      </div>

      {/* Filter Tabs + Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
          {(['all', 'pending', 'paid'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors capitalize ${
                filter === f ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f} {f !== 'all' && `(${costs.filter((c) => f === 'all' || c.payout_status === f).length})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <DollarSign className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No referral costs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Referral</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Agency</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Paid To</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Paid Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((cost) => (
                  <tr key={cost.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/referrals/${cost.referral_id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {cost.referral?.customer_name || 'Unknown'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {cost.referral?.provider?.agency_name || '—'}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800">
                      {formatCurrency(cost.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          cost.payout_status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {cost.payout_status === 'paid' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {cost.payout_status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {cost.paid_to || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {cost.paid_date ? formatDate(cost.paid_date) : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(cost.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
