import { supabase } from './supabase';
import { NotificationType } from '../types/notification';

export async function notifyAdmins(
  type: NotificationType,
  title: string,
  message: string,
  referralId?: string
) {
  try {
    const { data: admins } = await supabase
      .from('admins')
      .select('user_id');

    if (!admins || admins.length === 0) return;

    const notifications = admins.map((admin) => ({
      user_id: admin.user_id,
      type,
      title,
      message,
      referral_id: referralId || null,
    }));

    await supabase.from('notifications').insert(notifications);
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
    await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      referral_id: referralId || null,
    });
  } catch (err) {
    console.error('Error notifying user:', err);
  }
}
