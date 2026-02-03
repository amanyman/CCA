import { AdminLayout } from '../../components/admin/AdminLayout';
import { ReferralTable } from '../../components/admin/ReferralTable';

export function ReferralsPage() {
  return (
    <AdminLayout title="Referrals">
      <ReferralTable />
    </AdminLayout>
  );
}
