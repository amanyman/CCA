import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, ChevronRight, AlertCircle, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Provider } from '../../types/provider';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Pagination } from '../common/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToCSV } from '../../utils/export';

const PAGE_SIZE = 20;

export function AgencyList() {
  const [agencies, setAgencies] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setError(null);
        const { data, error: fetchError } = await supabase
          .from('providers')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          setError('Failed to load agencies. Please try refreshing the page.');
        } else {
          setAgencies(data || []);
        }
      } catch {
        setError('An unexpected error occurred.');
      }

      setIsLoading(false);
    };

    fetchAgencies();
  }, []);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const filteredAgencies = agencies.filter((agency) => {
    const search = debouncedSearch.toLowerCase();
    return !search || (
      agency.agency_name?.toLowerCase().includes(search) ||
      agency.email?.toLowerCase().includes(search) ||
      agency.main_contact_name?.toLowerCase().includes(search)
    );
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

      {/* Search & Export */}
      <div className="flex flex-col sm:flex-row gap-3 items-start">
      <div className="relative flex-1 max-w-md">
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
            joined: a.created_at,
          }));
          exportToCSV(exportData, 'agencies');
        }}
        className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium text-sm whitespace-nowrap"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </button>
      </div>

      {/* Agency Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Agency</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Contact</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Phone</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Joined</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAgencies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">
                      {agencies.length === 0 ? 'No agencies registered yet' : 'No matching agencies found'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedAgencies.map((agency) => (
                  <tr key={agency.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{agency.agency_name}</div>
                      <div className="text-sm text-slate-500">{agency.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700">{agency.main_contact_name}</div>
                      <div className="text-sm text-slate-500">{agency.main_contact_email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{agency.phone}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(agency.created_at)}</td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/agencies/${agency.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-4">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredAgencies.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
