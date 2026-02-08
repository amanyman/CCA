import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Referral, ReferralStatus } from '../../types/referral';
import { ReferralCard } from './ReferralCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Pagination } from '../common/Pagination';
import { useDebounce } from '../../hooks/useDebounce';

const PAGE_SIZE = 15;

const statusOptions: { value: ReferralStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
];

export function ReferralList() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!user) return;

      try {
        setError(null);

        // First get provider ID
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (providerError || !providerData) {
          setError('Could not find your provider profile. Please contact support.');
          setIsLoading(false);
          return;
        }

        // Then get referrals
        const { data, error: fetchError } = await supabase
          .from('referrals')
          .select('*')
          .eq('provider_id', providerData.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          setError('Failed to load referrals. Please try refreshing the page.');
        } else {
          setReferrals(data || []);
        }
      } catch {
        setError('An unexpected error occurred.');
      }

      setIsLoading(false);
    };

    fetchReferrals();
  }, [user]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const filteredReferrals = referrals.filter((referral) => {
    const search = debouncedSearch.toLowerCase();
    const matchesSearch = !search ||
      referral.customer_name?.toLowerCase().includes(search) ||
      referral.customer_phone?.includes(debouncedSearch) ||
      (referral.customer_email?.toLowerCase().includes(search) ?? false);

    const matchesStatus = statusFilter === 'all' || referral.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedReferrals = filteredReferrals.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
        </div>
        <Link
          to="/provider/referrals/new"
          className="bg-blue-900 text-white px-4 py-2.5 rounded-lg hover:bg-blue-950 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Referral
        </Link>
      </div>

      {/* Referral List */}
      {filteredReferrals.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {referrals.length === 0 ? 'No referrals yet' : 'No matching referrals'}
          </h3>
          <p className="text-slate-600 mb-6">
            {referrals.length === 0
              ? 'Submit your first referral to get started.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {referrals.length === 0 && (
            <Link
              to="/provider/referrals/new"
              className="inline-flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-950 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create First Referral
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedReferrals.map((referral) => (
              <ReferralCard key={referral.id} referral={referral} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredReferrals.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
