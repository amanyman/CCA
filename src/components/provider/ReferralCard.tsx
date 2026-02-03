import { Link } from 'react-router-dom';
import { Phone, Mail, Calendar, Users, ChevronRight } from 'lucide-react';
import { Referral } from '../../types/referral';
import { StatusBadge } from '../common/StatusBadge';

interface ReferralCardProps {
  referral: Referral;
}

export function ReferralCard({ referral }: ReferralCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link
      to={`/provider/referrals/${referral.id}`}
      className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 group-hover:text-blue-900 transition-colors">
            {referral.customer_name}
          </h3>
          <p className="text-sm text-slate-500">Submitted {formatDate(referral.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={referral.status} />
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-900 transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Phone className="w-4 h-4 text-slate-400" />
          <span>{referral.customer_phone}</span>
        </div>
        {referral.customer_email && (
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="truncate">{referral.customer_email}</span>
          </div>
        )}
        {referral.accident_date && (
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Accident: {formatDate(referral.accident_date)}</span>
          </div>
        )}
        {referral.people_involved && (
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{referral.people_involved} people involved</span>
          </div>
        )}
      </div>
    </Link>
  );
}
