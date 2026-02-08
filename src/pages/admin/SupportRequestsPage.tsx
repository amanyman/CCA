import { useState, useEffect } from 'react';
import { Search, AlertCircle, Phone, Mail, MapPin, Calendar, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

type RequestStatus = 'new' | 'contacted' | 'in_progress' | 'closed';

interface SupportRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  preferred_contact_method: string;
  help_type: string;
  what_happened: string;
  incident_date: string | null;
  any_passengers: string | null;
  referred_by: string | null;
  consent_given: boolean;
  status: RequestStatus;
  created_at: string;
}

const statusOptions: { value: RequestStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
];

const statusColors: Record<RequestStatus, string> = {
  new: 'bg-yellow-100 text-yellow-700',
  contacted: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-700',
};

export function SupportRequestsPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError('Failed to load support requests.');
      } else {
        setRequests(data || []);
      }
    } catch {
      setError('An unexpected error occurred.');
    }
    setIsLoading(false);
  };

  const handleStatusUpdate = async (requestId: string, newStatus: RequestStatus) => {
    setUpdatingId(requestId);
    try {
      const { error: updateError } = await supabase
        .from('support_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (updateError) {
        setError('Failed to update status.');
      } else {
        setRequests(requests.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
      }
    } catch {
      setError('An unexpected error occurred.');
    }
    setUpdatingId(null);
  };

  const filteredRequests = requests.filter(req => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      req.name?.toLowerCase().includes(search) ||
      req.email?.toLowerCase().includes(search) ||
      req.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
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
      <AdminLayout title="Support Requests">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" message="Loading support requests..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Support Requests">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'all')}
          className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">
              {requests.length === 0 ? 'No support requests yet' : 'No matching requests found'}
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-800 truncate">{req.name}</div>
                    <div className="text-sm text-slate-500">{formatDate(req.created_at)}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>
                {expandedId === req.id ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 ml-4 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 ml-4 flex-shrink-0" />
                )}
              </button>

              {expandedId === req.id && (
                <div className="px-6 pb-6 border-t border-slate-100 pt-4">
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{req.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{req.phone}</span>
                    </div>
                    {req.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">{req.address}</span>
                      </div>
                    )}
                    {req.incident_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">Incident: {req.incident_date}</span>
                      </div>
                    )}
                  </div>

                  {req.help_type && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-slate-500 uppercase mb-1">Help Needed</div>
                      <div className="text-sm text-slate-700">{req.help_type}</div>
                    </div>
                  )}

                  {req.what_happened && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-slate-500 uppercase mb-1">What Happened</div>
                      <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{req.what_happened}</div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                    <span className="text-sm text-slate-600 mr-2">Update status:</span>
                    {(['new', 'contacted', 'in_progress', 'closed'] as RequestStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(req.id, status)}
                        disabled={req.status === status || updatingId === req.id}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                          req.status === status ? statusColors[status] : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
