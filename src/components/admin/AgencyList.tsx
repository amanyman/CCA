import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Provider } from '../../types/provider';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function AgencyList() {
  const [agencies, setAgencies] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAgencies = async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agencies:', error);
      } else {
        setAgencies(data || []);
      }

      setIsLoading(false);
    };

    fetchAgencies();
  }, []);

  const filteredAgencies = agencies.filter((agency) =>
    agency.agency_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.main_contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <LoadingSpinner message="Loading agencies..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search agencies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
        />
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
              {filteredAgencies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">
                      {agencies.length === 0 ? 'No agencies registered yet' : 'No matching agencies found'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAgencies.map((agency) => (
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
      </div>
    </div>
  );
}
