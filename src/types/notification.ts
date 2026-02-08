export type NotificationType =
  | 'new_referral'
  | 'new_agency'
  | 'new_message'
  | 'status_change'
  | 'new_support_request';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  referral_id: string | null;
  is_read: boolean;
  created_at: string;
}
