import { supabase } from './supabase';
import { NotificationType } from '../types/notification';

export async function notifyAdmins(
  type: NotificationType,
  title: string,
  message: string,
  referralId?: string
) {
  try {
    await supabase.rpc('notify_all_admins', {
      p_type: type,
      p_title: title,
      p_message: message,
      p_referral_id: referralId || null,
    });
  } catch (err) {
    console.error('Error notifying admins:', err);
  }
}

export async function notifyUser(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  referralId?: string
) {
  try {
    await supabase.rpc('notify_user', {
      p_user_id: userId,
      p_type: type,
      p_title: title,
      p_message: message,
      p_referral_id: referralId || null,
    });
  } catch (err) {
    console.error('Error notifying user:', err);
  }
}
