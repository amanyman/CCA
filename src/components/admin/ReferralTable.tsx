import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, FileText, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ReferralStatus } from '../../types/referral';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingSpinner } from '../common/LoadingSpinner';

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

export function ReferralTable() {
  const [referrals, setReferrals] = useState<ReferralWithProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all');

  useEffect(() => {
    const fetchReferrals = async () => {
      const { data, error } = await supabase
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

      if (error) {
        console.error('Error fetching referrals:', error);
      } else if (data) {
        // Transform data to handle Supabase's relation format
        const transformed = data.map((item: any) => ({
          ...item,
          provider: Array.isArray(item.provider) ? item.provider[0] : item.provider,
        }));
        setReferrals(transformed);
      }

      setIsLoading(false);
    };

    fetchReferrals();
  }, []);

  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch =
      referral.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.customer_phone.includes(searchTerm) ||
      referral.provider?.agency_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || referral.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Customer</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Agency</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Phone</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Submitted</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">
                      {referrals.length === 0 ? 'No referrals yet' : 'No matching referrals found'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReferrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-slate-50 transition-colors">
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
      </div>
    </div>
  );
}
