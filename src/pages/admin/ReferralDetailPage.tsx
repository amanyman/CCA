import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Users,
  AlertCircle,
  Building2,
  MessageSquare,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  XCircle,
  FolderClosed,
  FileText
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { ReferralWithNotes, ReferralNote, ReferralStatus } from '../../types/referral';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ReferralActions } from '../../components/admin/ReferralActions';
import { NoteForm } from '../../components/admin/NoteForm';

export function AdminReferralDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [referral, setReferral] = useState<ReferralWithNotes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferral = async () => {
      if (!id) return;

      try {
        setError(null);
        const { data: referralData, error: referralError } = await supabase
          .from('referrals')
          .select(`
            *,
            provider:providers(agency_name, email, phone)
          `)
          .eq('id', id)
          .single();

        if (referralError) {
          setError('Failed to load referral details.');
          setIsLoading(false);
          return;
        }

      // Fetch all notes (admin can see all)
      const { data: notesData } = await supabase
        .from('referral_notes')
        .select(`
          *,
          admin:admins(name)
        `)
        .eq('referral_id', id)
        .order('created_at', { ascending: false });

        setReferral({
          ...referralData,
          notes: notesData || [],
        });
      } catch {
        setError('An unexpected error occurred.');
      }

      setIsLoading(false);
    };

    fetchReferral();
  }, [id]);

  const handleStatusChange = (newStatus: ReferralStatus) => {
    if (referral) {
      setReferral({ ...referral, status: newStatus });
    }
  };

  const handleNoteAdded = (note: ReferralNote) => {
    if (referral) {
      setReferral({
        ...referral,
        notes: [note, ...(referral.notes || [])],
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Unknown date';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
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

  const getAtFaultLabel = (status: string | null) => {
    switch (status) {
      case 'at_fault':
        return 'At Fault';
      case 'not_at_fault':
        return 'Not At Fault';
      case 'unknown':
        return 'Unknown';
      default:
        return 'Not Specified';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Referral Details">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" message="Loading referral..." />
        </div>
      </AdminLayout>
    );
  }

  if (error || !referral) {
    return (
      <AdminLayout title="Referral Details">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-600">{error || 'Referral not found'}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-red-700 hover:text-red-800 underline ml-auto"
          >
            Retry
          </button>
        </div>
        <Link
          to="/admin/referrals"
          className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Referrals
        </Link>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Referral Details">
      <Link
        to="/admin/referrals"
        className="inline-flex items-center gap-2 mb-6 text-slate-600 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Referrals
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{referral.customer_name}</h2>
                <p className="text-slate-500">Submitted {formatDate(referral.created_at)}</p>
              </div>
              <StatusBadge status={referral.status} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Phone</div>
                  <div className="font-medium text-slate-800">{referral.customer_phone}</div>
                </div>
              </div>

              {referral.customer_email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Email</div>
                    <div className="font-medium text-slate-800">{referral.customer_email}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Quick Actions</h3>
              <ReferralActions
                referralId={referral.id}
                currentStatus={referral.status}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>

          {/* Accident Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Accident Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Date of Accident</div>
                  <div className="font-medium text-slate-800">
                    {referral.accident_date ? formatDate(referral.accident_date) : 'Not specified'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">People Involved</div>
                  <div className="font-medium text-slate-800">
                    {referral.people_involved || 'Not specified'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">At-Fault Status</div>
                  <div className="font-medium text-slate-800">
                    {getAtFaultLabel(referral.at_fault_status)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Notes
            </h3>

            {/* Add Note Form */}
            <div className="mb-6 pb-6 border-b border-slate-100">
              <NoteForm referralId={referral.id} onNoteAdded={handleNoteAdded} />
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              {referral.notes?.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No notes yet</p>
              ) : (
                referral.notes?.map((note) => (
                  <div
                    key={note.id}
                    className={`rounded-lg p-4 ${
                      note.is_visible_to_provider
                        ? 'bg-blue-50 border border-blue-100'
                        : 'bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {note.is_visible_to_provider ? (
                          <Eye className="w-4 h-4 text-blue-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-xs text-slate-500">
                          {note.is_visible_to_provider ? 'Visible to provider' : 'Internal only'}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-700 mb-2">{note.note}</p>
                    <p className="text-sm text-slate-500">
                      {note.admin?.name || 'Admin'} • {formatDateTime(note.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Referring Agency */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Referring Agency
            </h3>
            {referral.provider && (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-500">Agency Name</div>
                  <div className="font-medium text-slate-800">{referral.provider.agency_name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Email</div>
                  <div className="text-slate-700">{referral.provider.email}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Phone</div>
                  <div className="text-slate-700">{referral.provider.phone}</div>
                </div>
                <Link
                  to={`/admin/agencies/${referral.provider_id}`}
                  className="inline-block text-blue-600 hover:text-blue-700 font-medium text-sm mt-2"
                >
                  View Agency Details →
                </Link>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Activity
            </h3>
            <div className="space-y-0">
              {(() => {
                const statusIcon = (status: string) => {
                  switch (status) {
                    case 'accepted': return <CheckCircle className="w-4 h-4 text-green-600" />;
                    case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
                    case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
                    case 'closed': return <FolderClosed className="w-4 h-4 text-slate-600" />;
                    default: return <FileText className="w-4 h-4 text-yellow-600" />;
                  }
                };

                const statusLabel = (status: string) => {
                  switch (status) {
                    case 'accepted': return 'Accepted';
                    case 'rejected': return 'Rejected';
                    case 'in_progress': return 'In Progress';
                    case 'closed': return 'Closed';
                    default: return 'Pending';
                  }
                };

                type TimelineEntry = {
                  type: 'created' | 'status' | 'note';
                  date: string;
                  label: string;
                  detail?: string;
                  icon: React.ReactNode;
                };

                const entries: TimelineEntry[] = [];

                // Referral created
                entries.push({
                  type: 'created',
                  date: referral.created_at,
                  label: 'Referral Submitted',
                  detail: `by ${referral.provider?.agency_name || 'Unknown Agency'}`,
                  icon: <FileText className="w-4 h-4 text-blue-600" />,
                });

                // Status change (if not pending)
                if (referral.status !== 'pending' && referral.updated_at !== referral.created_at) {
                  entries.push({
                    type: 'status',
                    date: referral.updated_at,
                    label: `Status: ${statusLabel(referral.status)}`,
                    icon: statusIcon(referral.status),
                  });
                }

                // Notes
                referral.notes?.forEach(note => {
                  entries.push({
                    type: 'note',
                    date: note.created_at,
                    label: `Note by ${note.admin?.name || 'Admin'}`,
                    detail: note.note.length > 80 ? note.note.slice(0, 80) + '...' : note.note,
                    icon: <MessageSquare className="w-4 h-4 text-slate-500" />,
                  });
                });

                // Sort newest first
                entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                return entries.map((entry, i) => (
                  <div key={i} className="flex gap-3 pb-4 last:pb-0 relative">
                    {i < entries.length - 1 && (
                      <div className="absolute left-[7px] top-6 bottom-0 w-px bg-slate-200" />
                    )}
                    <div className="flex-shrink-0 mt-0.5">{entry.icon}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800">{entry.label}</div>
                      {entry.detail && (
                        <div className="text-xs text-slate-500 truncate">{entry.detail}</div>
                      )}
                      <div className="text-xs text-slate-400 mt-0.5">{formatDateTime(entry.date)}</div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
