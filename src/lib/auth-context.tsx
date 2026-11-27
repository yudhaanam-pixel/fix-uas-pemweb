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

export type DetectedRoleResult =
  | { role: 'dokter'; cleanCode: string }
  | { role: 'admin'; cleanCode: string }
  | { role: 'petugas'; cleanCode: string }
  | { role: 'pasien'; cleanCode: string }
  | { role: null; cleanCode: string; error: string };

/**
 * Helper untuk sinkronisasi cookie autentikasi demi keamanan middleware
 */
export function setAuthCookies(profile: Profile) {
  if (typeof document !== 'undefined') {
    document.cookie = `sim_klinik_role=${profile.role}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `sim_klinik_user_id=${profile.id}; path=/; max-age=86400; SameSite=Lax`;
  }
}

export function clearAuthCookies() {
  if (typeof document !== 'undefined') {
    document.cookie = 'sim_klinik_role=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'sim_klinik_user_id=; path=/; max-age=0; SameSite=Lax';
  }
}

/**
 * Deteksi Role Otomatis Berdasarkan Awalan (Prefix) Kode Pegawai:
 * - Diawali '10' -> Admin (contoh: 10001)
 * - Diawali '25' -> Dokter (contoh: 25001)
 * - Diawali '30' -> Petugas (contoh: 30001)
 * - Dikosongkan  -> Pasien
 * - Diisi tapi bukan 10/25/30 -> null (invalid)
 */
export function detectRoleFromEmployeeCode(code?: string | null): DetectedRoleResult {
  const cleanCode = code ? code.trim() : '';

  // Jika kolom kode dikosongkan -> Pasien
  if (!cleanCode) {
    return { role: 'pasien', cleanCode };
  }

  // Awalan 10 -> Admin
  if (cleanCode.startsWith('10')) {
    return { role: 'admin', cleanCode };
  }

  // Awalan 25 -> Dokter
  if (cleanCode.startsWith('25')) {
    return { role: 'dokter', cleanCode };
  }

  // Awalan 30 -> Petugas FO
  if (cleanCode.startsWith('30')) {
    return { role: 'petugas', cleanCode };
  }

  // Format awalan tidak dikenali -> GAGAL (null)
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
        setAuthCookies(found);
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
      setAuthCookies(targetUser);
      router.push(getRoleDashboardUrl(targetRole));
    }
  };

  const loginWithEmail = async (
    email: string,
    password?: string,
    employeeCode?: string
  ): Promise<LoginResult> => {
    try {
      const cleanEmail = email.trim();
      if (!cleanEmail) {
        return { success: false, error: 'Silakan masukkan alamat email.' };
      }

      // ═══════════════════════════════════════════════════════════════
      // 1. DETEKSI ROLE DARI KODE PEGAWAI — INI YANG MENENTUKAN ROLE
      //    Kode ini TIDAK BOLEH di-override oleh data profil lama.
      // ═══════════════════════════════════════════════════════════════
      const detection = detectRoleFromEmployeeCode(employeeCode);

      // Jika kode diisi tapi awalan tidak valid -> TOLAK LOGIN
      if (detection.role === null) {
        return {
          success: false,
          error: detection.error,
        };
      }

      // Role FINAL yang akan digunakan untuk sesi ini
      const finalRole: UserRole = detection.role;
      const cleanCode = detection.cleanCode;

      // ═══════════════════════════════════════════════════════════════
      // 2. SUPABASE AUTH (jika terkonfigurasi)
      // ═══════════════════════════════════════════════════════════════
      if (isSupabaseConfigured) {
        try {
          const supabase = createClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password || 'password123',
          });

          if (!error && data.user) {
            // Buat/update profil dengan role DARI KODE, bukan dari metadata lama
            const profiles = ClinicService.getProfiles();
            const existingIdx = profiles.findIndex(
              (p) => p.email?.toLowerCase() === cleanEmail.toLowerCase()
            );

            const sessionUser: Profile = existingIdx !== -1
              ? {
                  ...profiles[existingIdx],
                  role: finalRole, // PAKSA role dari deteksi kode
                  employee_code: cleanCode || null,
                  kode_pegawai: cleanCode || null,
                }
              : {
                  id: data.user.id,
                  email: data.user.email || cleanEmail,
                  full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
                  role: finalRole, // PAKSA role dari deteksi kode
                  employee_code: cleanCode || null,
                  kode_pegawai: cleanCode || null,
                  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
                };

            // Simpan/update ke localStorage
            if (existingIdx !== -1) {
              profiles[existingIdx] = sessionUser;
            } else {
              profiles.push(sessionUser);
            }
            localStorage.setItem('sim_klinik_profiles', JSON.stringify(profiles));

            setUser(sessionUser);
            localStorage.setItem(AUTH_STORAGE_KEY, sessionUser.id);
            setAuthCookies(sessionUser);
            return { success: true, role: finalRole };
          }
        } catch {
          // Lanjutkan ke alur autentikasi lokal di bawah
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // 3. CARI PROFIL LOKAL BERDASARKAN EMAIL
      //    Role di profil lama TIDAK menentukan — yang menentukan
      //    adalah `finalRole` dari deteksi kode pegawai.
      // ═══════════════════════════════════════════════════════════════
      const profiles = ClinicService.getProfiles();
      let existingProfile = profiles.find(
        (p) => p.email?.toLowerCase() === cleanEmail.toLowerCase()
      );
      if (!existingProfile) {
        existingProfile = DEMO_PROFILES.find(
          (p) => p.email?.toLowerCase() === cleanEmail.toLowerCase()
        );
      }

      if (existingProfile) {
        // Buat sesi dengan role DARI KODE, bukan role lama di profil
        const sessionUser: Profile = {
          ...existingProfile,
          role: finalRole,
          employee_code: cleanCode || existingProfile.employee_code || null,
          kode_pegawai: cleanCode || existingProfile.kode_pegawai || null,
        };

        setUser(sessionUser);
        localStorage.setItem(AUTH_STORAGE_KEY, sessionUser.id);
        setAuthCookies(sessionUser);

        // Update profil di localStorage agar sinkron
        const allProfiles = ClinicService.getProfiles();
        const idx = allProfiles.findIndex((p) => p.id === sessionUser.id);
        if (idx !== -1) {
          allProfiles[idx] = sessionUser;
          localStorage.setItem('sim_klinik_profiles', JSON.stringify(allProfiles));
        }

        return { success: true, role: finalRole };
      }

      // ═══════════════════════════════════════════════════════════════
      // 4. AUTENTIKASI DINAMIS (email baru, belum terdaftar)
      //    Buat profil baru dengan role dari deteksi kode pegawai.
      // ═══════════════════════════════════════════════════════════════
      const namePart = cleanEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const dynamicFullName =
        finalRole === 'dokter'
          ? `dr. ${namePart}`
          : finalRole === 'admin'
          ? `${namePart} (Administrator)`
          : finalRole === 'petugas'
          ? `${namePart} (Petugas FO)`
          : namePart;

      const dynamicAvatar =
        finalRole === 'dokter'
          ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&q=80'
          : finalRole === 'admin'
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80'
          : finalRole === 'petugas'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80';

      const dynamicUser: Profile = {
        id: `user-${finalRole}-${Date.now()}`,
        email: cleanEmail,
        full_name: dynamicFullName,
        role: finalRole,
        employee_code: cleanCode || null,
        kode_pegawai: cleanCode || null,
        avatar_url: dynamicAvatar,
        created_at: new Date().toISOString(),
      };

      // Simpan ke profil lokal
      profiles.push(dynamicUser);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('sim_klinik_profiles', JSON.stringify(profiles));
        } catch {
          // ignore
        }
      }

      setUser(dynamicUser);
      localStorage.setItem(AUTH_STORAGE_KEY, dynamicUser.id);
      setAuthCookies(dynamicUser);
      return { success: true, role: finalRole };
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
      setAuthCookies(newProfile);
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
