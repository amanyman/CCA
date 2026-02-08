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
  EyeOff,
  Clock,
  CheckCircle,
  XCircle,
  FolderClosed,
  FileText,
  Send,
  Loader2,
  StickyNote,
  DollarSign
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { ReferralWithNotes, ReferralNote, ReferralStatus } from '../../types/referral';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ReferralActions } from '../../components/admin/ReferralActions';
import { NoteForm } from '../../components/admin/NoteForm';
import { useAuth } from '../../contexts/AuthContext';
import { notifyUser } from '../../lib/notifications';
import { ReferralCost, PayoutStatus } from '../../types/referralCost';

export function AdminReferralDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [referral, setReferral] = useState<(ReferralWithNotes & { provider?: { agency_name: string; email: string; phone: string; user_id: string } }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState('');

  // Referral cost state
  const [referralCost, setReferralCost] = useState<ReferralCost | null>(null);
  const [costAmount, setCostAmount] = useState('');
  const [costPaidTo, setCostPaidTo] = useState('');
  const [costPaidDate, setCostPaidDate] = useState('');
  const [isSavingCost, setIsSavingCost] = useState(false);
  const [costError, setCostError] = useState('');

  useEffect(() => {
    const fetchReferral = async () => {
      if (!id) return;

      try {
        setError(null);
        const { data: referralData, error: referralError } = await supabase
          .from('referrals')
          .select(`
            *,
            provider:providers(agency_name, email, phone, user_id)
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
          admin:admins(name),
          provider:providers(agency_name)
        `)
        .eq('referral_id', id)
        .order('created_at', { ascending: false });

        setReferral({
          ...referralData,
          notes: notesData || [],
        });

        // Fetch referral cost
        const { data: costData } = await supabase
          .from('referral_costs')
          .select('*')
          .eq('referral_id', id)
          .maybeSingle();

        if (costData) {
          setReferralCost(costData as ReferralCost);
          setCostAmount(costData.amount?.toString() || '');
          setCostPaidTo(costData.paid_to || '');
          setCostPaidDate(costData.paid_date || '');
        }
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user || !id) return;

    setIsSendingMessage(true);
    setMessageError('');

    try {
      const { data: adminData } = await supabase
        .from('admins')
        .select('id, name')
        .eq('user_id', user.id)
        .single();

      if (!adminData) throw new Error('Admin not found');

      const { data: noteData, error: insertError } = await supabase
        .from('referral_notes')
        .insert({
          referral_id: id,
          admin_id: adminData.id,
          author_type: 'admin',
          note: messageText.trim(),
          is_visible_to_provider: true,
        })
        .select(`
          *,
          admin:admins(name),
          provider:providers(agency_name)
        `)
        .single();

      if (insertError) throw insertError;

      if (referral) {
        setReferral({
          ...referral,
          notes: [noteData as ReferralNote, ...(referral.notes || [])],
        });
      }

      // Notify the provider
      if (referral?.provider?.user_id) {
        notifyUser(
          referral.provider.user_id,
          'new_message',
          'New Message from CCA',
          `You have a new message regarding referral for ${referral.customer_name}`,
          id
        );
      }

      setMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
      setMessageError('Failed to send message. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSaveCost = async () => {
    if (!id || !costAmount) return;
    const amount = parseFloat(costAmount);
    if (isNaN(amount) || amount <= 0) {
      setCostError('Please enter a valid amount');
      return;
    }

    setIsSavingCost(true);
    setCostError('');

    try {
      if (referralCost) {
        const { data, error: updateError } = await supabase
          .from('referral_costs')
          .update({
            amount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', referralCost.id)
          .select()
          .single();

        if (updateError) throw updateError;
        setReferralCost(data as ReferralCost);
      } else {
        const { data, error: insertError } = await supabase
          .from('referral_costs')
          .insert({
            referral_id: id,
            amount,
            payout_status: 'pending',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setReferralCost(data as ReferralCost);
      }
    } catch {
      setCostError('Failed to save referral cost.');
    } finally {
      setIsSavingCost(false);
    }
  };

  const handleUpdatePayoutStatus = async (status: PayoutStatus) => {
    if (!referralCost) return;
    setIsSavingCost(true);
    setCostError('');

    try {
      const updateData: Record<string, unknown> = {
        payout_status: status,
        updated_at: new Date().toISOString(),
      };
      if (status === 'paid') {
        updateData.paid_date = costPaidDate || new Date().toISOString().split('T')[0];
        updateData.paid_to = costPaidTo || null;
      } else {
        updateData.paid_date = null;
        updateData.paid_to = null;
      }

      const { data, error: updateError } = await supabase
        .from('referral_costs')
        .update(updateData)
        .eq('id', referralCost.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setReferralCost(data as ReferralCost);
      setCostPaidTo(data.paid_to || '');
      setCostPaidDate(data.paid_date || '');
    } catch {
      setCostError('Failed to update payout status.');
    } finally {
      setIsSavingCost(false);
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
                providerId={referral.provider_id}
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

          {/* Internal Notes Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <StickyNote className="w-5 h-5" />
              Internal Notes
            </h3>
            <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
              <EyeOff className="w-3.5 h-3.5" />
              These notes are only visible to admins
            </p>

            {/* Add Note Form */}
            <div className="mb-6 pb-6 border-b border-slate-100">
              <NoteForm referralId={referral.id} onNoteAdded={handleNoteAdded} />
            </div>

            {/* Internal Notes List */}
            <div className="space-y-4">
              {(() => {
                const internalNotes = referral.notes?.filter(
                  (n) => n.author_type === 'admin' && !n.is_visible_to_provider
                ) || [];
                return internalNotes.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No internal notes yet</p>
                ) : (
                  internalNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg p-4 bg-slate-50 border border-slate-100"
                    >
                      <p className="text-slate-700 mb-2">{note.note}</p>
                      <p className="text-sm text-slate-500">
                        {note.admin?.name || 'Admin'} • {formatDateTime(note.created_at)}
                      </p>
                    </div>
                  ))
                );
              })()}
            </div>
          </div>

          {/* Messages Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages with Partner
            </h3>

            {/* Message Thread */}
            <div className="space-y-4 mb-6">
              {(() => {
                const messages = (referral.notes || [])
                  .filter((n) => n.is_visible_to_provider || n.author_type === 'provider')
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                return messages.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No messages yet. Send a message to the partner below.</p>
                ) : (
                  messages.map((note) => {
                    const isAdmin = note.author_type === 'admin';
                    return (
                      <div
                        key={note.id}
                        className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            isAdmin
                              ? 'bg-blue-50 border border-blue-100'
                              : 'bg-amber-50 border border-amber-200'
                          }`}
                        >
                          <p className="text-slate-700 mb-2">{note.note}</p>
                          <p className="text-xs text-slate-500">
                            {isAdmin
                              ? note.admin?.name || 'Admin'
                              : note.provider?.agency_name || 'Partner'}{' '}
                            • {formatDateTime(note.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                );
              })()}
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSendMessage} className="border-t border-slate-100 pt-4">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value.slice(0, 5000))}
                rows={3}
                maxLength={5000}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Type a message to the partner..."
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-slate-400">{messageText.length}/5000</div>
                {messageError && <p className="text-sm text-red-600">{messageError}</p>}
                <button
                  type="submit"
                  disabled={isSendingMessage || !messageText.trim()}
                  className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-950 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingMessage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </form>
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

          {/* Referral Cost */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Referral Cost
            </h3>

            {costError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">{costError}</p>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Expected Payout Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costAmount}
                    onChange={(e) => setCostAmount(e.target.value)}
                    className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveCost}
                disabled={isSavingCost || !costAmount}
                className="w-full text-sm bg-blue-900 text-white px-3 py-2 rounded-lg hover:bg-blue-950 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSavingCost ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <DollarSign className="w-3.5 h-3.5" />
                )}
                {referralCost ? 'Update Amount' : 'Set Amount'}
              </button>

              {referralCost && (
                <>
                  <div className="border-t border-slate-100 pt-3 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Payout Status</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          referralCost.payout_status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {referralCost.payout_status === 'paid' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {referralCost.payout_status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>

                    {referralCost.payout_status === 'pending' ? (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Paid To</label>
                          <input
                            type="text"
                            value={costPaidTo}
                            onChange={(e) => setCostPaidTo(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Recipient name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Payment Date</label>
                          <input
                            type="date"
                            value={costPaidDate}
                            onChange={(e) => setCostPaidDate(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <button
                          onClick={() => handleUpdatePayoutStatus('paid')}
                          disabled={isSavingCost}
                          className="w-full text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark as Paid
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        {referralCost.paid_to && (
                          <div>
                            <span className="text-slate-500">Paid to:</span>{' '}
                            <span className="text-slate-800 font-medium">{referralCost.paid_to}</span>
                          </div>
                        )}
                        {referralCost.paid_date && (
                          <div>
                            <span className="text-slate-500">Date:</span>{' '}
                            <span className="text-slate-800 font-medium">{formatDate(referralCost.paid_date)}</span>
                          </div>
                        )}
                        <button
                          onClick={() => handleUpdatePayoutStatus('pending')}
                          disabled={isSavingCost}
                          className="w-full text-sm bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg hover:bg-yellow-200 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Revert to Pending
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
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
                  const isPartner = note.author_type === 'provider';
                  entries.push({
                    type: 'note',
                    date: note.created_at,
                    label: isPartner
                      ? `Message from ${note.provider?.agency_name || 'Partner'}`
                      : `Note by ${note.admin?.name || 'Admin'}`,
                    detail: note.note.length > 80 ? note.note.slice(0, 80) + '...' : note.note,
                    icon: isPartner
                      ? <Building2 className="w-4 h-4 text-amber-500" />
                      : <MessageSquare className="w-4 h-4 text-slate-500" />,
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
