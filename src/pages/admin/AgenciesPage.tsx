import { AdminLayout } from '../../components/admin/AdminLayout';
import { AgencyList } from '../../components/admin/AgencyList';

export function AgenciesPage() {
  return (
    <AdminLayout title="Agencies">
      <AgencyList />
    </AdminLayout>
  );
}
