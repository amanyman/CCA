import { User, Session } from '@supabase/supabase-js';

export type UserType = 'provider' | 'admin' | null;

export interface AuthState {
  user: User | null;
  session: Session | null;
  userType: UserType;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; user: User | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
