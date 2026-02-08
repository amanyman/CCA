import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, CheckCircle, Clock, Loader2, AlertCircle, CheckSquare, X } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ReferralCost } from '../../types/referralCost';
import { logActivity } from '../../lib/activityLog';

export function AdminReferralCostsPage() {
  const [costs, setCosts] = useState<ReferralCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [error, setError] = useState<string | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPaidTo, setBulkPaidTo] = useState('');
  const [bulkPaidDate, setBulkPaidDate] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
  const pendingFiltered = filtered.filter((c) => c.payout_status === 'pending');

  const totalAmount = costs.reduce((sum, c) => sum + c.amount, 0);
  const totalPending = costs.filter((c) => c.payout_status === 'pending').reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = costs.filter((c) => c.payout_status === 'paid').reduce((sum, c) => sum + c.amount, 0);

  const allPendingOnPageSelected = pendingFiltered.length > 0 && pendingFiltered.every((c) => selectedIds.has(c.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allPendingOnPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pendingFiltered.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pendingFiltered.forEach((c) => next.add(c.id));
        return next;
      });
    }
  };

  const handleBulkMarkPaid = async () => {
    if (selectedIds.size === 0) return;

    setIsBulkUpdating(true);
    setBulkMessage(null);

    try {
      const updateData: Record<string, unknown> = {
        payout_status: 'paid',
        paid_date: bulkPaidDate || new Date().toISOString().split('T')[0],
        paid_to: bulkPaidTo || null,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('referral_costs')
        .update(updateData)
        .in('id', Array.from(selectedIds));

      if (updateError) throw updateError;

      setCosts((prev) =>
        prev.map((c) =>
          selectedIds.has(c.id)
            ? {
                ...c,
                payout_status: 'paid' as const,
                paid_date: (updateData.paid_date as string) || null,
                paid_to: (updateData.paid_to as string) || null,
              }
            : c
        )
      );

      logActivity({
        actorType: 'admin',
        action: 'bulk_payout_marked',
        entityType: 'referral_cost',
        metadata: {
          detail: `Marked ${selectedIds.size} referral cost(s) as paid`,
          count: selectedIds.size,
          paidTo: bulkPaidTo || null,
        },
      });

      setBulkMessage({ type: 'success', text: `${selectedIds.size} referral cost(s) marked as paid` });
      setSelectedIds(new Set());
      setBulkPaidTo('');
      setBulkPaidDate('');
      setTimeout(() => setBulkMessage(null), 4000);
    } catch {
      setBulkMessage({ type: 'error', text: 'Failed to update payout status. Please try again.' });
    } finally {
      setIsBulkUpdating(false);
    }
  };

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

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{selectedIds.size} selected</span>
              <button onClick={() => setSelectedIds(new Set())} className="text-blue-600 hover:text-blue-800 ml-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:ml-auto">
              <input
                type="text"
                placeholder="Paid to..."
                value={bulkPaidTo}
                onChange={(e) => setBulkPaidTo(e.target.value)}
                className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <input
                type="date"
                value={bulkPaidDate}
                onChange={(e) => setBulkPaidDate(e.target.value)}
                className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handleBulkMarkPaid}
                disabled={isBulkUpdating}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50"
              >
                {isBulkUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Mark as Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk feedback */}
      {bulkMessage && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            bulkMessage.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {bulkMessage.text}
        </div>
      )}

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
              {f} {f !== 'all' && `(${costs.filter((c) => c.payout_status === f).length})`}
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
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allPendingOnPageSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      title="Select all pending"
                    />
                  </th>
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
                {filtered.map((cost) => {
                  const isPending = cost.payout_status === 'pending';
                  return (
                    <tr
                      key={cost.id}
                      className={`hover:bg-slate-50 ${selectedIds.has(cost.id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(cost.id)}
                          onChange={() => toggleSelect(cost.id)}
                          disabled={!isPending}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-30"
                        />
                      </td>
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
                      <td className="px-6 py-4 text-sm text-slate-600">{cost.paid_to || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {cost.paid_date ? formatDate(cost.paid_date) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(cost.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
