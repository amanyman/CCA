import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Phone, Mail, MapPin, User, FileText, TrendingUp, DollarSign, Clock, Pencil, X, Loader2, Check } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Provider } from '../../types/provider';
import { Referral } from '../../types/referral';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SparklineChart } from '../../components/admin/charts/SparklineChart';

export function AgencyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [agency, setAgency] = useState<Provider | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cost data
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    agency_name: '',
    email: '',
    phone: '',
    address: '',
    main_contact_name: '',
    main_contact_email: '',
    main_contact_phone: '',
    secondary_contact_name: '',
    secondary_contact_email: '',
    secondary_contact_phone: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setError(null);

        // Fetch agency
        const { data: agencyData, error: agencyError } = await supabase
          .from('providers')
          .select('*')
          .eq('id', id)
          .single();

        if (agencyError) {
          setError('Failed to load agency details.');
          setIsLoading(false);
          return;
        }

        setAgency(agencyData);

        // Fetch referrals for this agency
        const { data: referralData, error: referralError } = await supabase
          .from('referrals')
          .select('*')
          .eq('provider_id', id)
          .order('created_at', { ascending: false });

        if (referralError) {
          setError('Failed to load referral data for this agency.');
        } else {
          setReferrals(referralData || []);
        }

        // Fetch referral costs for this agency's referrals
        if (referralData && referralData.length > 0) {
          const referralIds = referralData.map((r: Referral) => r.id);
          const { data: costsData } = await supabase
            .from('referral_costs')
            .select('amount, payout_status')
            .in('referral_id', referralIds);

          if (costsData) {
            const paid = costsData
              .filter((c: any) => c.payout_status === 'paid')
              .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
            const pending = costsData
              .filter((c: any) => c.payout_status === 'pending')
              .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
            setTotalEarned(paid);
            setTotalPending(pending);
          }
        }
      } catch {
        setError('An unexpected error occurred.');
      }

      setIsLoading(false);
    };

    fetchData();
  }, [id]);

  const startEditing = () => {
    if (!agency) return;
    setEditForm({
      agency_name: agency.agency_name || '',
      email: agency.email || '',
      phone: agency.phone || '',
      address: agency.address || '',
      main_contact_name: agency.main_contact_name || '',
      main_contact_email: agency.main_contact_email || '',
      main_contact_phone: agency.main_contact_phone || '',
      secondary_contact_name: agency.secondary_contact_name || '',
      secondary_contact_email: agency.secondary_contact_email || '',
      secondary_contact_phone: agency.secondary_contact_phone || '',
    });
    setSaveError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!id || !agency) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const { error: updateError } = await supabase
        .from('providers')
        .update({
          agency_name: editForm.agency_name.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim(),
          address: editForm.address.trim(),
          main_contact_name: editForm.main_contact_name.trim(),
          main_contact_email: editForm.main_contact_email.trim(),
          main_contact_phone: editForm.main_contact_phone.trim(),
          secondary_contact_name: editForm.secondary_contact_name.trim() || null,
          secondary_contact_email: editForm.secondary_contact_email.trim() || null,
          secondary_contact_phone: editForm.secondary_contact_phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setAgency({
        ...agency,
        agency_name: editForm.agency_name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        main_contact_name: editForm.main_contact_name.trim(),
        main_contact_email: editForm.main_contact_email.trim(),
        main_contact_phone: editForm.main_contact_phone.trim(),
        secondary_contact_name: editForm.secondary_contact_name.trim() || null,
        secondary_contact_email: editForm.secondary_contact_email.trim() || null,
        secondary_contact_phone: editForm.secondary_contact_phone.trim() || null,
      });
      setIsEditing(false);
    } catch {
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Sparkline: referrals over last 12 weeks
  const sparklineData = useMemo(() => {
    const now = new Date();
    const weeks: { value: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      const count = referrals.filter((r) => {
        const d = new Date(r.created_at);
        return d >= weekStart && d < weekEnd;
      }).length;
      weeks.push({ value: count });
    }
    return weeks;
  }, [referrals]);

  if (isLoading) {
    return (
      <AdminLayout title="Agency Details">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" message="Loading agency..." />
        </div>
      </AdminLayout>
    );
  }

  if (!agency) {
    return (
      <AdminLayout title="Agency Details">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">Agency not found</p>
        </div>
        <Link
          to="/admin/agencies"
          className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agencies
        </Link>
      </AdminLayout>
    );
  }

  const stats = {
    total: referrals.length,
    pending: referrals.filter((r) => r.status === 'pending').length,
    accepted: referrals.filter((r) => r.status === 'accepted').length,
    inProgress: referrals.filter((r) => r.status === 'in_progress').length,
    closed: referrals.filter((r) => r.status === 'closed').length,
  };

  const conversionRate = stats.total > 0
    ? Math.round(((stats.closed + stats.inProgress) / stats.total) * 100)
    : 0;

  const avgReferralValue = stats.total > 0
    ? (totalEarned + totalPending) / stats.total
    : 0;

  return (
    <AdminLayout title="Agency Details">
      <Link
        to="/admin/agencies"
        className="inline-flex items-center gap-2 mb-6 text-slate-600 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Agencies
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agency Info & Contacts */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.agency_name}
                      onChange={(e) => setEditForm({ ...editForm, agency_name: e.target.value })}
                      className="text-xl font-bold text-slate-800 border border-slate-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-slate-800">{agency.agency_name}</h2>
                  )}
                  <p className="text-slate-500">Member since {formatDate(agency.created_at)}</p>
                </div>
              </div>
              {!isEditing ? (
                <button
                  onClick={startEditing}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEditing}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-950 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              )}
            </div>

            {saveError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{saveError}</p>
            )}

            {isEditing ? (
              <div className="space-y-6">
                {/* Agency Details */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-slate-500 mb-1">Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Primary Contact */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Primary Contact</h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={editForm.main_contact_name}
                        onChange={(e) => setEditForm({ ...editForm, main_contact_name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.main_contact_email}
                        onChange={(e) => setEditForm({ ...editForm, main_contact_email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">Phone</label>
                      <input
                        type="text"
                        value={editForm.main_contact_phone}
                        onChange={(e) => setEditForm({ ...editForm, main_contact_phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary Contact */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Secondary Contact</h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={editForm.secondary_contact_name}
                        onChange={(e) => setEditForm({ ...editForm, secondary_contact_name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.secondary_contact_email}
                        onChange={(e) => setEditForm({ ...editForm, secondary_contact_email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">Phone</label>
                      <input
                        type="text"
                        value={editForm.secondary_contact_phone}
                        onChange={(e) => setEditForm({ ...editForm, secondary_contact_phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Email</div>
                      <div className="font-medium text-slate-800">{agency.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Phone</div>
                      <div className="font-medium text-slate-800">{agency.phone}</div>
                    </div>
                  </div>

                  {agency.address && (
                    <div className="flex items-center gap-3 sm:col-span-2">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">Address</div>
                        <div className="font-medium text-slate-800">{agency.address}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contacts */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Contacts</h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-slate-500 mb-2">Primary Contact</div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{agency.main_contact_name}</div>
                          <div className="text-sm text-slate-600">{agency.main_contact_email}</div>
                          <div className="text-sm text-slate-600">{agency.main_contact_phone}</div>
                        </div>
                      </div>
                    </div>

                    {agency.secondary_contact_name && (
                      <div>
                        <div className="text-sm text-slate-500 mb-2">Secondary Contact</div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">{agency.secondary_contact_name}</div>
                            <div className="text-sm text-slate-600">{agency.secondary_contact_email}</div>
                            <div className="text-sm text-slate-600">{agency.secondary_contact_phone}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-red-700 hover:text-red-800 underline ml-4"
              >
                Retry
              </button>
            </div>
          )}

          {/* Recent Referrals */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Recent Referrals</h3>
              {referrals.length > 5 && (
                <Link
                  to={`/admin/referrals?agency=${id}`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {referrals.length} referrals
                </Link>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {referrals.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600">No referrals from this agency</p>
                </div>
              ) : (
                referrals.slice(0, 5).map((referral) => (
                  <Link
                    key={referral.id}
                    to={`/admin/referrals/${referral.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-800">{referral.customer_name}</div>
                      <div className="text-sm text-slate-500">{formatDate(referral.created_at)}</div>
                    </div>
                    <StatusBadge status={referral.status} />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Performance Metrics */}
        <div className="space-y-6">
          {/* Performance Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-slate-600">Conversion Rate</span>
                  <span className="text-lg font-bold text-slate-800">{conversionRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${conversionRate}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Total Referrals</span>
                <span className="font-semibold text-slate-800">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Pending</span>
                <span className="font-semibold text-yellow-600">{stats.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Accepted</span>
                <span className="font-semibold text-green-600">{stats.accepted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">In Progress</span>
                <span className="font-semibold text-blue-600">{stats.inProgress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Closed</span>
                <span className="font-semibold text-slate-600">{stats.closed}</span>
              </div>
            </div>
          </div>

          {/* Payout Metrics */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payouts
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Total Earned</span>
                <span className="font-semibold text-green-700">{formatCurrency(totalEarned)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Pending Payouts</span>
                <span className="font-semibold text-yellow-700">{formatCurrency(totalPending)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Avg Referral Value</span>
                <span className="font-semibold text-slate-800">{formatCurrency(avgReferralValue)}</span>
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Last 12 Weeks
            </h3>
            <p className="text-xs text-slate-500 mb-3">Referrals per week</p>
            <SparklineChart data={sparklineData} color="#3B82F6" height={50} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
