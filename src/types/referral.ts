export type ReferralStatus = 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'closed';
export type AtFaultStatus = 'at_fault' | 'not_at_fault' | 'unknown' | null;

export interface Referral {
  id: string;
  provider_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  accident_date: string | null;
  people_involved: number | null;
  at_fault_status: AtFaultStatus;
  status: ReferralStatus;
  created_at: string;
  updated_at: string;
}

export interface ReferralFormData {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  accident_date: string;
  people_involved: string;
  at_fault_status: AtFaultStatus;
}

export interface ReferralNote {
  id: string;
  referral_id: string;
  admin_id: string;
  provider_id: string | null;
  author_type: 'admin' | 'provider';
  note: string;
  is_visible_to_provider: boolean;
  created_at: string;
  admin?: {
    name: string;
  };
  provider?: {
    agency_name: string;
  };
}

export interface ReferralWithNotes extends Referral {
  notes?: ReferralNote[];
  provider?: {
    agency_name: string;
    email: string;
    phone: string;
  };
}
