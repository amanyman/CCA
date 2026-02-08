import { supabase } from './supabase';
import { ActivityAction, EntityType, ActorType } from '../types/activityLog';

interface LogActivityParams {
  actorName?: string;
  actorType: ActorType;
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-forget activity log insert.
 * Never throws — catches errors internally so it never breaks the main flow.
 */
export function logActivity(params: LogActivityParams) {
  (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('activity_logs').insert({
        user_id: user?.id ?? null,
        actor_name: params.actorName ?? null,
        actor_type: params.actorType,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId ?? null,
        metadata: params.metadata ?? {},
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  })();
}
