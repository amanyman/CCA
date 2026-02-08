import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, AlertCircle, Download, Phone, Mail, MapPin, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { Provider } from '../../types/provider';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Pagination } from '../common/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToCSV } from '../../utils/export';

const PAGE_SIZE = 12;

interface AgencyWithStats extends Provider {
  totalReferrals: number;
  pendingCount: number;
  acceptedCount: number;
  inProgressCount: number;
  closedCount: number;
  rejectedCount: number;
}

export function AgencyList() {
  const [agencies, setAgencies] = useState<AgencyWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setError(null);

        const { data: providerData, error: fetchError } = await supabase
          .from('providers')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          setError('Failed to load agencies. Please try refreshing the page.');
          setIsLoading(false);
          return;
        }

        const providers = providerData || [];

        // Fetch referral counts grouped by provider and status
        const { data: referralData } = await supabase
          .from('referrals')
          .select('provider_id, status');

        const statsMap: Record<string, { total: number; pending: number; accepted: number; in_progress: number; closed: number; rejected: number }> = {};
        if (referralData) {
          for (const ref of referralData) {
            if (!statsMap[ref.provider_id]) {
              statsMap[ref.provider_id] = { total: 0, pending: 0, accepted: 0, in_progress: 0, closed: 0, rejected: 0 };
            }
            statsMap[ref.provider_id].total++;
            if (ref.status === 'pending') statsMap[ref.provider_id].pending++;
            else if (ref.status === 'accepted') statsMap[ref.provider_id].accepted++;
            else if (ref.status === 'in_progress') statsMap[ref.provider_id].in_progress++;
            else if (ref.status === 'closed') statsMap[ref.provider_id].closed++;
            else if (ref.status === 'rejected') statsMap[ref.provider_id].rejected++;
          }
        }

        const agenciesWithStats: AgencyWithStats[] = providers.map((p) => {
          const s = statsMap[p.id] || { total: 0, pending: 0, accepted: 0, in_progress: 0, closed: 0, rejected: 0 };
          return {
            ...p,
            totalReferrals: s.total,
            pendingCount: s.pending,
            acceptedCount: s.accepted,
            inProgressCount: s.in_progress,
            closedCount: s.closed,
            rejectedCount: s.rejected,
          };
        });

        setAgencies(agenciesWithStats);
      } catch {
        setError('An unexpected error occurred.');
      }

      setIsLoading(false);
    };

    fetchAgencies();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const filteredAgencies = agencies.filter((agency) => {
    const search = debouncedSearch.toLowerCase();
    const matchesSearch = !search || (
      agency.agency_name?.toLowerCase().includes(search) ||
      agency.email?.toLowerCase().includes(search) ||
      agency.main_contact_name?.toLowerCase().includes(search) ||
      agency.address?.toLowerCase().includes(search)
    );

    return matchesSearch;
  });

  const paginatedAgencies = filteredAgencies.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
        <LoadingSpinner message="Loading agencies..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search agencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          />
        </div>
        <button
          onClick={() => {
            const exportData = filteredAgencies.map(a => ({
              agency_name: a.agency_name,
              email: a.email,
              phone: a.phone,
              address: a.address,
              main_contact_name: a.main_contact_name,
              main_contact_email: a.main_contact_email,
              main_contact_phone: a.main_contact_phone,
              total_referrals: a.totalReferrals,
              pending: a.pendingCount,
              accepted: a.acceptedCount,
              in_progress: a.inProgressCount,
              closed: a.closedCount,
              rejected: a.rejectedCount,
              joined: a.created_at,
            }));
            exportToCSV(exportData, 'agencies');
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium text-sm whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary */}
      <p className="text-sm text-slate-500">
        {filteredAgencies.length} {filteredAgencies.length === 1 ? 'agency' : 'agencies'} found
      </p>

      {/* Cards Grid */}
      {paginatedAgencies.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">
            {agencies.length === 0 ? 'No agencies registered yet' : 'No matching agencies found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedAgencies.map((agency) => {
            return (
              <Link
                key={agency.id}
                to={`/admin/agencies/${agency.id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all group overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                      {agency.agency_name}
                    </h3>
                    <p className="text-xs text-slate-400">Joined {formatDate(agency.created_at)}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 mb-4 text-sm overflow-hidden">
                  <div className="flex items-center gap-2 text-slate-600 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{agency.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 min-w-0">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{agency.phone}</span>
                  </div>
                  {agency.address && (
                    <div className="flex items-center gap-2 text-slate-600 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{agency.address}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Referrals</span>
                    <span className="text-sm font-bold text-slate-800">{agency.totalReferrals}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <div className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3" />
                      {agency.pendingCount}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md">
                      <CheckCircle className="w-3 h-3" />
                      {agency.acceptedCount}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                      <FileText className="w-3 h-3" />
                      {agency.inProgressCount}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded-md">
                      <XCircle className="w-3 h-3" />
                      {agency.rejectedCount}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                      {agency.closedCount} closed
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filteredAgencies.length > PAGE_SIZE && (
        <div className="bg-white rounded-xl border border-slate-200 px-4">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredAgencies.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
