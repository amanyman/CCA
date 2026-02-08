import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, FileText, ChevronRight, AlertCircle, Download, CheckSquare, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ReferralStatus } from '../../types/referral';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Pagination } from '../common/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToCSV } from '../../utils/export';

const PAGE_SIZE = 20;

interface ReferralWithProvider {
  id: string;
  customer_name: string;
  customer_phone: string;
  status: ReferralStatus;
  created_at: string;
  provider: {
    agency_name: string;
  } | null;
}

const statusOptions: { value: ReferralStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
];

const bulkStatusOptions: { value: ReferralStatus; label: string }[] = [
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
];

export function ReferralTable() {
  const [referrals, setReferrals] = useState<ReferralWithProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<ReferralStatus>('accepted');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setError(null);
        const { data, error: fetchError } = await supabase
          .from('referrals')
          .select(`
            id,
            customer_name,
            customer_phone,
            status,
            created_at,
            provider:providers(agency_name)
          `)
          .order('created_at', { ascending: false });

        if (fetchError) {
          setError('Failed to load referrals. Please try refreshing the page.');
        } else if (data) {
          const transformed = data.map((item: any) => ({
            ...item,
            provider: Array.isArray(item.provider) ? item.provider[0] : item.provider,
          }));
          setReferrals(transformed);
        }
      } catch {
        setError('An unexpected error occurred.');
      }

      setIsLoading(false);
    };

    fetchReferrals();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const filteredReferrals = referrals.filter((referral) => {
    const search = debouncedSearch.toLowerCase();
    const matchesSearch = !search ||
      referral.customer_name?.toLowerCase().includes(search) ||
      referral.customer_phone?.includes(debouncedSearch) ||
      referral.provider?.agency_name?.toLowerCase().includes(search);

    const matchesStatus = statusFilter === 'all' || referral.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedReferrals = filteredReferrals.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const allPageSelected = paginatedReferrals.length > 0 && paginatedReferrals.every(r => selectedIds.has(r.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        paginatedReferrals.forEach(r => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        paginatedReferrals.forEach(r => next.add(r.id));
        return next;
      });
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0) return;

    setIsBulkUpdating(true);
    setBulkMessage(null);

    try {
      const { error: updateError } = await supabase
        .from('referrals')
        .update({ status: bulkStatus, updated_at: new Date().toISOString() })
        .in('id', Array.from(selectedIds));

      if (updateError) throw updateError;

      setReferrals(prev =>
        prev.map(r => selectedIds.has(r.id) ? { ...r, status: bulkStatus } : r)
      );
      setBulkMessage({ type: 'success', text: `${selectedIds.size} referral(s) updated to ${bulkStatus.replace('_', ' ')}` });
      setSelectedIds(new Set());
      setTimeout(() => setBulkMessage(null), 4000);
    } catch {
      setBulkMessage({ type: 'error', text: 'Failed to update referrals. Please try again.' });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Unknown date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner message="Loading referrals..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-red-700 hover:text-red-800 underline ml-auto"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer or agency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReferralStatus | 'all')}
            className="pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            const exportData = filteredReferrals.map(r => ({
              customer_name: r.customer_name,
              customer_phone: r.customer_phone,
              agency: r.provider?.agency_name || 'Unknown',
              status: r.status,
              submitted: r.created_at,
            }));
            exportToCSV(exportData, 'referrals');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium text-sm whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {selectedIds.size} selected
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-blue-600 hover:text-blue-800 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-blue-700">Set status to:</label>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as ReferralStatus)}
              className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {bulkStatusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleBulkUpdate}
              disabled={isBulkUpdating}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {isBulkUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
              Update
            </button>
          </div>
        </div>
      )}

      {/* Bulk update feedback */}
      {bulkMessage && (
        <div className={`p-3 rounded-lg text-sm ${
          bulkMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {bulkMessage.text}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Customer</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Agency</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Phone</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Submitted</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReferrals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">
                      {referrals.length === 0 ? 'No referrals yet' : 'No matching referrals found'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedReferrals.map((referral) => (
                  <tr key={referral.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.has(referral.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(referral.id)}
                        onChange={() => toggleSelect(referral.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{referral.customer_name}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {referral.provider?.agency_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{referral.customer_phone}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={referral.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(referral.created_at)}</td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/referrals/${referral.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Manage
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="border-t border-slate-100 px-4">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredReferrals.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
