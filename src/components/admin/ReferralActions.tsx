import { useState } from 'react';
import { CheckCircle, XCircle, Clock, FolderClosed, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ReferralStatus } from '../../types/referral';

interface ReferralActionsProps {
  referralId: string;
  currentStatus: ReferralStatus;
  onStatusChange: (newStatus: ReferralStatus) => void;
}

const statusActions: { status: ReferralStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'accepted', label: 'Accept', icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' },
  { status: 'rejected', label: 'Reject', icon: XCircle, color: 'bg-red-600 hover:bg-red-700' },
  { status: 'in_progress', label: 'In Progress', icon: Clock, color: 'bg-blue-600 hover:bg-blue-700' },
  { status: 'closed', label: 'Close', icon: FolderClosed, color: 'bg-slate-600 hover:bg-slate-700' },
];

export function ReferralActions({ referralId, currentStatus, onStatusChange }: ReferralActionsProps) {
  const [isUpdating, setIsUpdating] = useState<ReferralStatus | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: ReferralStatus) => {
    if (newStatus === currentStatus) return;

    setIsUpdating(newStatus);
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
    } catch {
      setActionError('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  // Filter out current status and determine available actions
  const getAvailableActions = () => {
    if (currentStatus === 'pending') {
      return statusActions.filter((a) => ['accepted', 'rejected'].includes(a.status));
    }
    if (currentStatus === 'accepted') {
      return statusActions.filter((a) => ['in_progress', 'rejected'].includes(a.status));
    }
    if (currentStatus === 'in_progress') {
      return statusActions.filter((a) => a.status === 'closed');
    }
    return [];
  };

  const availableActions = getAvailableActions();

  if (availableActions.length === 0) {
    return (
      <div className="text-sm text-slate-500 italic">
        No actions available for this status
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
      <div className="flex flex-wrap gap-2">
      {availableActions.map((action) => {
        const Icon = action.icon;
        const isLoading = isUpdating === action.status;

        return (
          <button
            key={action.status}
            onClick={() => handleStatusChange(action.status)}
            disabled={isUpdating !== null}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Icon className="w-4 h-4" />
            )}
            {action.label}
          </button>
        );
      })}
      </div>
    </div>
  );
}
