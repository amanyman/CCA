import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthContextType, UserType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true);

  const determineUserType = useCallback(async (userId: string): Promise<UserType> => {
    try {
      // Check if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!adminError && adminData) {
        return 'admin';
      }

      // Check if user is a provider
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!providerError && providerData) {
        return 'provider';
      }

      return null;
    } catch (err) {
      console.error('Error determining user type:', err);
      return null;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const type = await determineUserType(currentSession.user.id);
        setUserType(type);
      } else {
        setUserType(null);
      }
    } catch (err) {
      console.error('Error refreshing session:', err);
      setSession(null);
      setUser(null);
      setUserType(null);
    }
  }, [determineUserType]);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      // Add timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.warn('Auth initialization timed out');
        setIsLoading(false);
      }, 5000);

      try {
        await refreshSession();
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        clearTimeout(timeout);
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (!newSession) {
        setUserType(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Re-validate user type on sign-in and token refresh
        // This ensures revoked roles are detected promptly
        const type = await determineUserType(newSession.user.id);
        setUserType(type);
        if (!type) {
          // User exists in auth but has no valid role — sign them out
          await supabase.auth.signOut();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSession]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      setUser(data.user);
      setSession(data.session);
      const type = await determineUserType(data.user.id);
      setUserType(type);
    }
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { error: error as Error | null, user: data.user };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserType(null);
  };

  const value: AuthContextType = {
    user,
    session,
    userType,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
