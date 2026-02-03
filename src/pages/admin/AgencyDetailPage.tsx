import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Phone, Mail, MapPin, User, FileText } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Provider } from '../../types/provider';
import { Referral } from '../../types/referral';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function AgencyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [agency, setAgency] = useState<Provider | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      // Fetch agency
      const { data: agencyData, error: agencyError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', id)
        .single();

      if (agencyError) {
        console.error('Error fetching agency:', agencyError);
        setIsLoading(false);
        return;
      }

      setAgency(agencyData);

      // Fetch referrals for this agency
      const { data: referralData } = await supabase
        .from('referrals')
        .select('*')
        .eq('provider_id', id)
        .order('created_at', { ascending: false });

      setReferrals(referralData || []);
      setIsLoading(false);
    };

    fetchData();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
  };

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
          {/* Agency Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{agency.agency_name}</h2>
                <p className="text-slate-500">Member since {formatDate(agency.created_at)}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
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
          </div>

          {/* Contacts */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
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

          {/* Recent Referrals */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Recent Referrals</h3>
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Referral Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Referrals</span>
                <span className="font-semibold text-slate-800">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Pending</span>
                <span className="font-semibold text-yellow-600">{stats.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Accepted</span>
                <span className="font-semibold text-green-600">{stats.accepted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">In Progress</span>
                <span className="font-semibold text-blue-600">{stats.inProgress}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
