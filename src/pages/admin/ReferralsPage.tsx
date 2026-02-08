import { useSearchParams } from 'react-router-dom';
import { List, Columns } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ReferralTable } from '../../components/admin/ReferralTable';
import { ReferralPipeline } from '../../components/admin/ReferralPipeline';

type ViewMode = 'table' | 'pipeline';

export function ReferralsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = (searchParams.get('view') as ViewMode) || 'table';

  const setViewMode = (mode: ViewMode) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', mode);
    setSearchParams(params);
  };

  return (
    <AdminLayout title="Referrals">
      {/* View Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setViewMode('table')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'table'
              ? 'bg-blue-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <List className="w-4 h-4" />
          Table
        </button>
        <button
          onClick={() => setViewMode('pipeline')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'pipeline'
              ? 'bg-blue-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Columns className="w-4 h-4" />
          Pipeline
        </button>
      </div>

      {viewMode === 'table' ? <ReferralTable /> : <ReferralPipeline />}
    </AdminLayout>
  );
}
