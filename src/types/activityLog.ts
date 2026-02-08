export type ActivityAction =
  | 'status_change'
  | 'message_sent'
  | 'note_added'
  | 'cost_saved'
  | 'payout_status_changed'
  | 'referral_created'
  | 'bulk_payout_marked';

export type EntityType = 'referral' | 'provider' | 'referral_cost';

export type ActorType = 'admin' | 'provider' | 'system';

export interface ActivityLog {
  id: string;
  user_id: string | null;
  actor_name: string | null;
  actor_type: ActorType;
  action: ActivityAction;
  entity_type: EntityType;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
