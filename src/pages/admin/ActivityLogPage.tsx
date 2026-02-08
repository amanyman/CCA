import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  MessageSquare,
  StickyNote,
  DollarSign,
  ArrowRightLeft,
  FileText,
  CheckCircle,
  Filter,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { ActivityLog, ActivityAction, EntityType } from '../../types/activityLog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Pagination } from '../../components/common/Pagination';

const PAGE_SIZE = 25;

const ACTION_CONFIG: Record<ActivityAction, { icon: React.ElementType; color: string; label: string }> = {
  status_change: { icon: ArrowRightLeft, color: 'text-blue-600 bg-blue-100', label: 'Status Change' },
  message_sent: { icon: MessageSquare, color: 'text-purple-600 bg-purple-100', label: 'Message Sent' },
  note_added: { icon: StickyNote, color: 'text-amber-600 bg-amber-100', label: 'Note Added' },
  cost_saved: { icon: DollarSign, color: 'text-green-600 bg-green-100', label: 'Cost Saved' },
  payout_status_changed: { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100', label: 'Payout Updated' },
  referral_created: { icon: FileText, color: 'text-slate-600 bg-slate-100', label: 'Referral Created' },
  bulk_payout_marked: { icon: DollarSign, color: 'text-teal-600 bg-teal-100', label: 'Bulk Payout' },
};

const actionFilterOptions: { value: ActivityAction | 'all'; label: string }[] = [
  { value: 'all', label: 'All Actions' },
  { value: 'status_change', label: 'Status Changes' },
  { value: 'message_sent', label: 'Messages' },
  { value: 'note_added', label: 'Notes' },
  { value: 'cost_saved', label: 'Costs' },
  { value: 'payout_status_changed', label: 'Payouts' },
  { value: 'referral_created', label: 'Referrals Created' },
  { value: 'bulk_payout_marked', label: 'Bulk Payouts' },
];

const entityFilterOptions: { value: EntityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Entities' },
  { value: 'referral', label: 'Referrals' },
  { value: 'provider', label: 'Providers' },
  { value: 'referral_cost', label: 'Referral Costs' },
];

export function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<ActivityAction | 'all'>('all');
  const [entityFilter, setEntityFilter] = useState<EntityType | 'all'>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);

      let query = supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }
      if (entityFilter !== 'all') {
        query = query.eq('entity_type', entityFilter);
      }

      const from = (currentPage - 1) * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data, count } = await query;

      setLogs((data || []) as ActivityLog[]);
      setTotalCount(count || 0);
      setIsLoading(false);
    };

    fetchLogs();
  }, [currentPage, actionFilter, entityFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter, entityFilter]);

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown';
    }
  };

  const getEntityLink = (log: ActivityLog) => {
    if (!log.entity_id) return null;
    if (log.entity_type === 'referral') return `/admin/referrals/${log.entity_id}`;
    if (log.entity_type === 'provider') return `/admin/agencies/${log.entity_id}`;
    return null;
  };

  return (
    <AdminLayout title="Activity Log">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as ActivityAction | 'all')}
            className="pl-9 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white text-sm"
          >
            {actionFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value as EntityType | 'all')}
            className="pl-9 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white text-sm"
          >
            {entityFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" message="Loading activity..." />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No activity logged yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="divide-y divide-slate-100">
            {logs.map((log) => {
              const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.status_change;
              const Icon = config.icon;
              const link = getEntityLink(log);
              const meta = log.metadata as Record<string, string>;

              return (
                <div key={log.id} className="flex items-start gap-4 px-6 py-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-800">{config.label}</span>
                      {log.actor_name && (
                        <span className="text-xs text-slate-500">by {log.actor_name}</span>
                      )}
                    </div>
                    {meta?.detail && (
                      <p className="text-sm text-slate-600 mt-0.5">{meta.detail}</p>
                    )}
                    {link && (
                      <Link
                        to={link}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block"
                      >
                        View {log.entity_type === 'referral' ? 'Referral' : 'Agency'} →
                      </Link>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                    {formatDateTime(log.created_at)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 px-4">
            <Pagination
              currentPage={currentPage}
              totalItems={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
