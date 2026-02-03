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
  EyeOff
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

  useEffect(() => {
    const fetchReferral = async () => {
      if (!id) return;

      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .select(`
          *,
          provider:providers(agency_name, email, phone)
        `)
        .eq('id', id)
        .single();

      if (referralError) {
        console.error('Error fetching referral:', referralError);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (!referral) {
    return (
      <AdminLayout title="Referral Details">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">Referral not found</p>
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

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <div>
                  <div className="font-medium text-slate-800">Referral Submitted</div>
                  <div className="text-sm text-slate-500">{formatDateTime(referral.created_at)}</div>
                </div>
              </div>
              {referral.status !== 'pending' && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                  <div>
                    <div className="font-medium text-slate-800">Status Updated</div>
                    <div className="text-sm text-slate-500">{formatDateTime(referral.updated_at)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
