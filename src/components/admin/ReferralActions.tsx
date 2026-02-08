import { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, FolderClosed, Loader2, ChevronDown, AlertCircle, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ReferralStatus } from '../../types/referral';
import { notifyUser } from '../../lib/notifications';
import { logActivity } from '../../lib/activityLog';

interface ReferralActionsProps {
  referralId: string;
  currentStatus: ReferralStatus;
  onStatusChange: (newStatus: ReferralStatus) => void;
  providerId?: string;
}

const allStatuses: { status: ReferralStatus; label: string; icon: React.ElementType; dotColor: string }[] = [
  { status: 'pending', label: 'Pending', icon: AlertCircle, dotColor: 'bg-yellow-500' },
  { status: 'accepted', label: 'Accepted', icon: CheckCircle, dotColor: 'bg-green-500' },
  { status: 'in_progress', label: 'In Progress', icon: Clock, dotColor: 'bg-blue-500' },
  { status: 'rejected', label: 'Rejected', icon: XCircle, dotColor: 'bg-red-500' },
  { status: 'closed', label: 'Closed', icon: FolderClosed, dotColor: 'bg-slate-500' },
];

export function ReferralActions({ referralId, currentStatus, onStatusChange, providerId }: ReferralActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentStatusInfo = allStatuses.find((s) => s.status === currentStatus) || allStatuses[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = async (newStatus: ReferralStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    setIsOpen(false);
    setActionError(null);
    setActionSuccess(null);

    try {
      const { error } = await supabase
        .from('referrals')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', referralId);

      if (error) throw error;

      onStatusChange(newStatus);
      setActionSuccess(`Status updated to ${newStatus.replace('_', ' ')}`);
      setTimeout(() => setActionSuccess(null), 3000);

      logActivity({
        actorType: 'admin',
        action: 'status_change',
        entityType: 'referral',
        entityId: referralId,
        metadata: { detail: `Status changed to ${newStatus.replace('_', ' ')}`, newStatus },
      });

      // Notify the provider about the status change
      if (providerId) {
        const { data: providerData } = await supabase
          .from('providers')
          .select('user_id')
          .eq('id', providerId)
          .single();

        if (providerData?.user_id) {
          notifyUser(
            providerData.user_id,
            'status_change',
            'Referral Status Updated',
            `Your referral status has been updated to ${newStatus.replace('_', ' ')}`,
            referralId
          );
        }
      }
    } catch {
      setActionError('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Once status has been changed from pending, it's locked
  const isLocked = currentStatus !== 'pending';

  if (isLocked) {
    return (
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600">
          <span className={`w-2.5 h-2.5 rounded-full ${currentStatusInfo.dotColor}`} />
          {currentStatusInfo.label}
          <Lock className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actionError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{actionError}</p>
      )}
      {actionSuccess && (
        <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{actionSuccess}</p>
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isUpdating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors font-medium text-sm text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          ) : (
            <span className={`w-2.5 h-2.5 rounded-full ${currentStatusInfo.dotColor}`} />
          )}
          {currentStatusInfo.label}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
            {allStatuses.filter((s) => s.status !== 'pending').map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.status}
                  onClick={() => handleStatusChange(item.status)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
