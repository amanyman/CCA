import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Calendar, Users, AlertCircle, MessageSquare } from 'lucide-react';
import { ProviderLayout } from '../../components/provider/ProviderLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ReferralWithNotes } from '../../types/referral';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function ReferralDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [referral, setReferral] = useState<ReferralWithNotes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferral = async () => {
      if (!user || !id) return;

      // First get provider ID
      const { data: providerData } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!providerData) {
        setError('Provider not found');
        setIsLoading(false);
        return;
      }

      // Get referral with notes visible to provider
      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .select('*')
        .eq('id', id)
        .eq('provider_id', providerData.id)
        .single();

      if (referralError || !referralData) {
        setError('Referral not found');
        setIsLoading(false);
        return;
      }

      // Get visible notes
      const { data: notesData } = await supabase
        .from('referral_notes')
        .select(`
          *,
          admin:admins(name)
        `)
        .eq('referral_id', id)
        .eq('is_visible_to_provider', true)
        .order('created_at', { ascending: false });

      setReferral({
        ...referralData,
        notes: notesData || [],
      });
      setIsLoading(false);
    };

    fetchReferral();
  }, [user, id]);

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
      <ProviderLayout title="Referral Details">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" message="Loading referral..." />
        </div>
      </ProviderLayout>
    );
  }

  if (error || !referral) {
    return (
      <ProviderLayout title="Referral Details">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-red-600">{error || 'Referral not found'}</p>
          </div>
        </div>
        <Link
          to="/provider/referrals"
          className="inline-flex items-center gap-2 mt-4 text-blue-900 hover:text-blue-950 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Referrals
        </Link>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout title="Referral Details">
      <Link
        to="/provider/referrals"
        className="inline-flex items-center gap-2 mb-6 text-slate-600 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Referrals
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{referral.customer_name}</h2>
                <p className="text-slate-500">Submitted {formatDate(referral.created_at)}</p>
              </div>
              <StatusBadge status={referral.status} providerView />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
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

          {/* Notes from Admin */}
          {referral.notes && referral.notes.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Updates from California Care Alliance
              </h3>
              <div className="space-y-4">
                {referral.notes.map((note) => (
                  <div key={note.id} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p className="text-slate-700 mb-2">{note.note}</p>
                    <p className="text-sm text-slate-500">
                      {note.admin?.name || 'Admin'} • {formatDateTime(note.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-blue-900 rounded-full mt-2" />
                <div>
                  <div className="font-medium text-slate-800">Referral Submitted</div>
                  <div className="text-sm text-slate-500">{formatDateTime(referral.created_at)}</div>
                </div>
              </div>
              {referral.status !== 'pending' && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-900 rounded-full mt-2" />
                  <div>
                    <div className="font-medium text-slate-800">Status Updated</div>
                    <div className="text-sm text-slate-500">{formatDateTime(referral.updated_at)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Help Box */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-2">Need Help?</h3>
            <p className="text-sm text-slate-600 mb-4">
              If you have questions about this referral, please contact our team.
            </p>
            <a
              href="mailto:support@californiacarealliance.com"
              className="text-blue-900 hover:text-blue-950 font-medium text-sm"
            >
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
