export type AdminRole = 'admin' | 'super_admin';

export interface Admin {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: AdminRole;
  created_at: string;
}
