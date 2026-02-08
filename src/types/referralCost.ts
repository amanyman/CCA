export type PayoutStatus = 'pending' | 'paid';

export interface ReferralCost {
  id: string;
  referral_id: string;
  amount: number;
  payout_status: PayoutStatus;
  paid_date: string | null;
  paid_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  referral?: {
    customer_name: string;
    provider: {
      agency_name: string;
    } | null;
  };
}
