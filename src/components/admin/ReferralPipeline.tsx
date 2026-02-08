import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ReferralStatus } from '../../types/referral';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PipelineReferral {
  id: string;
  customer_name: string;
  status: ReferralStatus;
  created_at: string;
  provider: { agency_name: string } | null;
}

const COLUMNS: { status: ReferralStatus; label: string; color: string; bgColor: string }[] = [
  { status: 'pending', label: 'Pending', color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
  { status: 'accepted', label: 'Accepted', color: 'bg-green-500', bgColor: 'bg-green-50' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
  { status: 'closed', label: 'Closed', color: 'bg-slate-500', bgColor: 'bg-slate-50' },
];

export function ReferralPipeline() {
  const [referrals, setReferrals] = useState<PipelineReferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('referrals')
          .select(`
            id,
            customer_name,
            status,
            created_at,
            provider:providers(agency_name)
          `)
          .in('status', ['pending', 'accepted', 'in_progress', 'closed'])
          .order('created_at', { ascending: false });

        if (fetchError) {
          setError('Failed to load referrals.');
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner message="Loading pipeline..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const items = referrals.filter((r) => r.status === col.status);
        return (
          <div key={col.status} className="flex flex-col">
            {/* Column header */}
            <div className={`flex items-center gap-2 px-4 py-3 rounded-t-xl ${col.bgColor}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
              <span className="font-medium text-slate-800 text-sm">{col.label}</span>
              <span className="ml-auto bg-white text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 bg-slate-50 rounded-b-xl border border-slate-200 border-t-0 p-2 space-y-2 max-h-[500px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="text-center py-6">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No referrals</p>
                </div>
              ) : (
                items.map((referral) => (
                  <Link
                    key={referral.id}
                    to={`/admin/referrals/${referral.id}`}
                    className="block bg-white rounded-lg border border-slate-200 p-3 hover:shadow-md hover:border-blue-200 transition-all"
                  >
                    <div className="font-medium text-slate-800 text-sm truncate">
                      {referral.customer_name}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 truncate">
                      {referral.provider?.agency_name || 'Unknown Agency'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {formatDate(referral.created_at)}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
