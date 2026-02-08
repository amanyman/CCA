import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Calendar, Users, AlertCircle, MessageSquare, Loader2, Send } from 'lucide-react';
import { ProviderLayout } from '../../components/provider/ProviderLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ReferralWithNotes, ReferralNote } from '../../types/referral';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { notifyAdmins } from '../../lib/notifications';

export function ReferralDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [referral, setReferral] = useState<ReferralWithNotes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');

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

      setProviderId(providerData.id);

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

      // Get visible notes (admin visible notes + all provider messages on this referral)
      const { data: notesData } = await supabase
        .from('referral_notes')
        .select(`
          *,
          admin:admins(name),
          provider:providers(agency_name)
        `)
        .eq('referral_id', id)
        .or('is_visible_to_provider.eq.true,author_type.eq.provider')
        .order('created_at', { ascending: true });

      setReferral({
        ...referralData,
        notes: notesData || [],
      });
      setIsLoading(false);
    };

    fetchReferral();
  }, [user, id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || !providerId || !id) return;

    setIsSending(true);
    setSendError('');

    try {
      const { data: noteData, error: insertError } = await supabase
        .from('referral_notes')
        .insert({
          referral_id: id,
          provider_id: providerId,
          author_type: 'provider',
          note: message.trim(),
          is_visible_to_provider: true,
        })
        .select(`
          *,
          admin:admins(name),
          provider:providers(agency_name)
        `)
        .single();

      if (insertError) throw insertError;

      setReferral((prev) =>
        prev
          ? { ...prev, notes: [...(prev.notes || []), noteData as ReferralNote] }
          : prev
      );
      setMessage('');

      // Notify all admins about the new message
      notifyAdmins(
        'new_message',
        'New Partner Message',
        `New message on referral for ${referral?.customer_name || 'a customer'}`,
        id
      );
    } catch (err) {
      console.error('Error sending message:', err);
      setSendError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
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

          {/* Messages */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages
            </h3>

            {/* Message Thread */}
            <div className="space-y-4 mb-6">
              {(!referral.notes || referral.notes.length === 0) ? (
                <p className="text-slate-500 text-center py-4">No messages yet. Send a message to get started.</p>
              ) : (
                referral.notes.map((note) => {
                  const isProvider = note.author_type === 'provider';
                  return (
                    <div
                      key={note.id}
                      className={`flex ${isProvider ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          isProvider
                            ? 'bg-slate-100 border border-slate-200'
                            : 'bg-blue-50 border border-blue-100'
                        }`}
                      >
                        <p className="text-slate-700 mb-2">{note.note}</p>
                        <p className="text-xs text-slate-500">
                          {isProvider ? 'You' : note.admin?.name || 'CCA Team'} • {formatDateTime(note.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSendMessage} className="border-t border-slate-100 pt-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 5000))}
                rows={3}
                maxLength={5000}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Type your message..."
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-slate-400">{message.length}/5000</div>
                {sendError && <p className="text-sm text-red-600">{sendError}</p>}
                <button
                  type="submit"
                  disabled={isSending || !message.trim()}
                  className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-950 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
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
            <p className="text-sm text-slate-600">
              Use the Messages section to communicate directly with our team about this referral.
            </p>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
