'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, UserRole } from '@/types/database';
import { ClinicService } from '@/lib/clinic-service';
import { DEMO_PROFILES } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface LoginResult {
  success: boolean;
  role?: UserRole;
  error?: string;
}

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  loginAs: (role: UserRole) => void;
  loginWithEmail: (email: string, password?: string) => Promise<LoginResult>;
  registerPatient: (data: {
    fullName: string;
    email: string;
    phone: string;
    nik: string;
    gender: 'L' | 'P';
    birthDate: string;
    address: string;
    password?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateCurrentUserProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sim_klinik_current_user_id';

export function getRoleDashboardUrl(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'petugas':
      return '/dashboard/petugas';
    case 'dokter':
      return '/dashboard/dokter';
    case 'pasien':
    default:
      return '/dashboard/pasien';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check saved user session
    const savedUserId = typeof window !== 'undefined' ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
    const profiles = ClinicService.getProfiles();

    if (savedUserId) {
      const found = profiles.find((p) => p.id === savedUserId);
      if (found) {
        setUser(found);
        setIsLoading(false);
        return;
      }
    }

    // By default: guest / not logged in
    setUser(null);
    setIsLoading(false);
  }, []);

  const loginAs = (targetRole: UserRole) => {
    const profiles = ClinicService.getProfiles();
    const targetUser =
      profiles.find((p) => p.role === targetRole) ||
      DEMO_PROFILES.find((p) => p.role === targetRole);

    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem(AUTH_STORAGE_KEY, targetUser.id);
      router.push(getRoleDashboardUrl(targetRole));
    }
  };

  const loginWithEmail = async (email: string, password?: string): Promise<LoginResult> => {
    try {
      // 1. If Supabase configured, attempt Supabase Auth
      if (isSupabaseConfigured) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || 'password123',
        });

        if (!error && data.user) {
          const profiles = ClinicService.getProfiles();
          let targetUser = profiles.find((p) => p.email?.toLowerCase() === email.toLowerCase());

          if (!targetUser) {
            targetUser = {
              id: data.user.id,
              email: data.user.email || email,
              full_name: data.user.user_metadata?.full_name || email.split('@')[0],
              role: (data.user.user_metadata?.role as UserRole) || 'pasien',
              avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
            };
            profiles.push(targetUser);
            localStorage.setItem('sim_klinik_profiles', JSON.stringify(profiles));
          }

          setUser(targetUser);
          localStorage.setItem(AUTH_STORAGE_KEY, targetUser.id);
          return { success: true, role: targetUser.role };
        }
      }

      // 2. Local mock credentials validation
      const profiles = ClinicService.getProfiles();
      const targetUser = profiles.find((p) => p.email?.toLowerCase() === email.toLowerCase());

      if (targetUser) {
        setUser(targetUser);
        localStorage.setItem(AUTH_STORAGE_KEY, targetUser.id);
        return { success: true, role: targetUser.role };
      }

      return {
        success: false,
        error: 'Akun dengan email tersebut tidak ditemukan. Silakan periksa kembali atau gunakan Akun Demo.',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses login';
      return { success: false, error: msg };
    }
  };

  const registerPatient = async (data: {
    fullName: string;
    email: string;
    phone: string;
    nik: string;
    gender: 'L' | 'P';
    birthDate: string;
    address: string;
    password?: string;
  }): Promise<boolean> => {
    try {
      let userId = `user-${Date.now()}`;

      // 1. If Supabase is connected, create Supabase user
      if (isSupabaseConfigured) {
        const supabase = createClient();
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password || 'password123',
          options: {
            data: {
              full_name: data.fullName,
              role: 'pasien',
              nik: data.nik,
              phone: data.phone,
            },
          },
        });

        if (error) {
          console.warn('Supabase signup notice:', error.message);
        } else if (authData.user) {
          userId = authData.user.id;
        }
      }

      // 2. Persist in local profile store
      const newProfile: Profile = {
        id: userId,
        email: data.email,
        full_name: data.fullName,
        role: 'pasien',
        phone: data.phone,
        nik: data.nik,
        gender: data.gender,
        birth_date: data.birthDate,
        address: data.address,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
      };

      const profiles = ClinicService.getProfiles();
      // Replace if exists, or append
      const existingIdx = profiles.findIndex((p) => p.email === data.email);
      if (existingIdx !== -1) {
        profiles[existingIdx] = newProfile;
      } else {
        profiles.push(newProfile);
      }
      localStorage.setItem('sim_klinik_profiles', JSON.stringify(profiles));

      setUser(newProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, newProfile.id);
      return true;
    } catch (err) {
      console.error('Registration error', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } catch {
      // ignore
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    router.push('/');
  };

  const updateCurrentUserProfile = (updates: Partial<Profile>) => {
    if (!user) return;
    const updated = ClinicService.updateProfile(user.id, updates);
    if (updated) {
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isLoading,
        loginAs,
        loginWithEmail,
        registerPatient,
        logout,
        updateCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
