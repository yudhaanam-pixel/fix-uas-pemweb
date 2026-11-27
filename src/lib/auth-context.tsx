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

interface RegistrationResult {
  success: boolean;
  requiresEmailConfirmation?: boolean;
  error?: string;
}

export type DetectedRoleResult =
  | { role: 'dokter'; cleanCode: string }
  | { role: 'admin'; cleanCode: string }
  | { role: 'petugas'; cleanCode: string }
  | { role: 'pasien'; cleanCode: string }
  | { role: null; cleanCode: string; error: string };

const DEMO_SESSION_COOKIE = 'sim_klinik_demo';

export function setAuthCookies(profile: Profile, isDemo = false) {
  if (typeof document !== 'undefined') {
    document.cookie = `sim_klinik_role=${profile.role}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `sim_klinik_user_id=${profile.id}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `${DEMO_SESSION_COOKIE}=${isDemo ? 'true' : ''}; path=/; max-age=${isDemo ? 86400 : 0}; SameSite=Lax`;
  }
}

export function clearAuthCookies() {
  if (typeof document !== 'undefined') {
    document.cookie = 'sim_klinik_role=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'sim_klinik_user_id=; path=/; max-age=0; SameSite=Lax';
    document.cookie = `${DEMO_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function detectRoleFromEmployeeCode(code?: string | null): DetectedRoleResult {
  const cleanCode = code ? code.trim() : '';

  if (!cleanCode) {
    return { role: 'pasien', cleanCode };
  }
  if (cleanCode.startsWith('10')) {
    return { role: 'admin', cleanCode };
  }
  if (cleanCode.startsWith('25')) {
    return { role: 'dokter', cleanCode };
  }
  if (cleanCode.startsWith('30')) {
    return { role: 'petugas', cleanCode };
  }

  return {
    role: null,
    cleanCode,
    error:
      'Kode akses tidak valid. Awalan kode harus berupa "10" (Admin), "25" (Dokter), "30" (Petugas), atau kosongkan untuk Pasien.',
  };
}

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  loginAs: (role: UserRole) => void;
  loginWithEmail: (email: string, password?: string, employeeCode?: string) => Promise<LoginResult>;
  registerPatient: (data: {
    fullName: string;
    email: string;
    phone: string;
    nik: string;
    gender: 'L' | 'P';
    birthDate: string;
    address: string;
    password?: string;
  }) => Promise<RegistrationResult>;
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

function isUserRole(role: unknown): role is UserRole {
  return role === 'admin' || role === 'petugas' || role === 'dokter' || role === 'pasien';
}

export function isDemoSession() {
  return typeof document !== 'undefined' &&
    document.cookie.split('; ').includes(`${DEMO_SESSION_COOKIE}=true`);
}

async function getSupabaseProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat profil Supabase: ${error.message}`);
  }
  if (!data || !isUserRole(data.role)) {
    return null;
  }

  return {
    ...data,
    role: data.role,
    employee_code: data.employee_code ?? null,
    kode_pegawai: data.employee_code ?? null,
  } as Profile;
}

function loginErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();
  if (
    normalizedMessage.includes('invalid login credentials') ||
    normalizedMessage.includes('user not found')
  ) {
    return 'Email belum terdaftar atau kata sandi salah. Periksa kembali kredensial Anda.';
  }
  if (normalizedMessage.includes('email not confirmed')) {
    return 'Email Anda belum diverifikasi. Silakan verifikasi email terlebih dahulu.';
  }
  return `Gagal masuk: ${message}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        if (isDemoSession()) {
          const demoRole = document.cookie
            .split('; ')
            .find((cookie) => cookie.startsWith('sim_klinik_role='))
            ?.split('=')[1];
          const savedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
          const profiles = ClinicService.getProfiles();
          const demoUser = profiles.find(
            (profile) => profile.id === savedUserId && profile.role === demoRole
          ) || DEMO_PROFILES.find((profile) => profile.role === demoRole);

          if (demoUser) {
            setUser(demoUser);
            return;
          }
          clearAuthCookies();
        }

        localStorage.removeItem(AUTH_STORAGE_KEY);
        if (!isSupabaseConfigured) {
          setUser(null);
          return;
        }

        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          clearAuthCookies();
          setUser(null);
          return;
        }

        const profile = await getSupabaseProfile(data.user.id);
        if (!profile) {
          await supabase.auth.signOut();
          clearAuthCookies();
          setUser(null);
          return;
        }

        setUser(profile);
        setAuthCookies(profile);
      } catch (error) {
        console.error('Gagal memulihkan sesi autentikasi', error);
        clearAuthCookies();
        setUser(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const loginAs = (targetRole: UserRole) => {
    const profiles = ClinicService.getProfiles();
    const targetUser =
      DEMO_PROFILES.find((profile) => profile.role === targetRole) ||
      profiles.find((profile) => profile.role === targetRole);

    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem(AUTH_STORAGE_KEY, targetUser.id);
      setAuthCookies(targetUser, true);
      router.push(getRoleDashboardUrl(targetRole));
    }
  };

  const loginWithEmail = async (
    email: string,
    password?: string,
    employeeCode?: string
  ): Promise<LoginResult> => {
    const cleanEmail = email.trim();
    const cleanPassword = password || '';
    if (!cleanEmail) {
      return { success: false, error: 'Silakan masukkan alamat email.' };
    }
    if (!cleanPassword) {
      return { success: false, error: 'Silakan masukkan kata sandi.' };
    }
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase belum dikonfigurasi. Login normal tidak dapat digunakan.',
      };
    }

    const detection = detectRoleFromEmployeeCode(employeeCode);
    if (detection.role === null) {
      return { success: false, error: detection.error };
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error || !data.user) {
      return {
        success: false,
        error: loginErrorMessage(error?.message || 'Email atau kata sandi salah.'),
      };
    }

    try {
      const profile = await getSupabaseProfile(data.user.id);
      const profileCode = (profile?.employee_code || profile?.kode_pegawai || '').trim();
      const credentialsMatch =
        profile?.role === detection.role &&
        (profile.role === 'pasien'
          ? !detection.cleanCode
          : profileCode === detection.cleanCode && profileCode.length > 0);

      if (!profile || !credentialsMatch) {
        await supabase.auth.signOut();
        clearAuthCookies();
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return {
          success: false,
          error:
            detection.role === 'pasien'
              ? 'Role akun tidak sesuai. Pastikan akun Anda terdaftar sebagai pasien.'
              : 'Role atau kode pegawai tidak cocok dengan profil Supabase. Periksa kembali data Anda.',
        };
      }

      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(profile);
      setAuthCookies(profile);
      return { success: true, role: profile.role };
    } catch (profileError) {
      await supabase.auth.signOut();
      clearAuthCookies();
      localStorage.removeItem(AUTH_STORAGE_KEY);
      const message =
        profileError instanceof Error ? profileError.message : 'Gagal memverifikasi profil Supabase.';
      return { success: false, error: message };
    }
  };

  const registerPatient: AuthContextType['registerPatient'] = async (data) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase belum dikonfigurasi. Pendaftaran tidak dapat diproses.',
      };
    }
    if (!data.password) {
      return { success: false, error: 'Kata sandi wajib diisi.' };
    }

    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email.trim(),
      password: data.password,
      options: {
        data: {
          full_name: data.fullName.trim(),
          role: 'pasien',
          employee_code: null,
          phone: data.phone,
          nik: data.nik,
          gender: data.gender,
          birth_date: data.birthDate,
          address: data.address,
        },
      },
    });

    if (error) {
      return { success: false, error: `Pendaftaran gagal: ${error.message}` };
    }
    if (!authData.user) {
      return { success: false, error: 'Supabase tidak mengembalikan data akun baru.' };
    }
    if (authData.user.identities?.length === 0) {
      return { success: false, error: 'Email tersebut sudah terdaftar. Silakan masuk.' };
    }

    clearAuthCookies();
    localStorage.removeItem(AUTH_STORAGE_KEY);

    if (!authData.session) {
      setUser(null);
      return { success: true, requiresEmailConfirmation: true };
    }

    try {
      const profile = await getSupabaseProfile(authData.user.id);
      if (!profile || profile.role !== 'pasien') {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Akun berhasil dibuat, tetapi profil pasien tidak ditemukan di database.',
        };
      }

      setUser(profile);
      setAuthCookies(profile);
      return { success: true };
    } catch (profileError) {
      await supabase.auth.signOut();
      const message =
        profileError instanceof Error ? profileError.message : 'Gagal memuat profil pasien.';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Gagal mengakhiri sesi Supabase', error);
      }
    }
    clearAuthCookies();
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
