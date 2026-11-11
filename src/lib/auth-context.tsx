'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, UserRole } from '@/types/database';
import { ClinicService } from '@/lib/clinic-service';
import { DEMO_PROFILES } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  loginAs: (role: UserRole) => void;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  registerPatient: (data: {
    fullName: string;
    email: string;
    phone: string;
    nik: string;
    gender: 'L' | 'P';
    birthDate: string;
    address: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateCurrentUserProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sim_klinik_current_user_id';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load persisted user or default to patient for quick preview
    const savedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
    const profiles = ClinicService.getProfiles();

    if (savedUserId) {
      const found = profiles.find((p) => p.id === savedUserId);
      if (found) {
        setUser(found);
        setIsLoading(false);
        return;
      }
    }

    // Default: set to patient if nothing saved, so landing user can interact
    const defaultPatient = profiles.find((p) => p.role === 'pasien') || DEMO_PROFILES[3];
    setUser(defaultPatient);
    localStorage.setItem(AUTH_STORAGE_KEY, defaultPatient.id);
    setIsLoading(false);
  }, []);

  const loginAs = (targetRole: UserRole) => {
    const profiles = ClinicService.getProfiles();
    const targetUser = profiles.find((p) => p.role === targetRole) || DEMO_PROFILES.find((p) => p.role === targetRole);
    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem(AUTH_STORAGE_KEY, targetUser.id);
      
      // Redirect to respective dashboard
      if (targetRole === 'admin') router.push('/dashboard/admin');
      else if (targetRole === 'petugas') router.push('/dashboard/petugas');
      else if (targetRole === 'dokter') router.push('/dashboard/dokter');
      else router.push('/dashboard/pasien');
    }
  };

  const loginWithEmail = async (email: string): Promise<boolean> => {
    const profiles = ClinicService.getProfiles();
    const targetUser = profiles.find((p) => p.email?.toLowerCase() === email.toLowerCase());
    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem(AUTH_STORAGE_KEY, targetUser.id);
      return true;
    }
    return false;
  };

  const registerPatient = async (data: {
    fullName: string;
    email: string;
    phone: string;
    nik: string;
    gender: 'L' | 'P';
    birthDate: string;
    address: string;
  }): Promise<boolean> => {
    const newProfile: Profile = {
      id: `user-${Date.now()}`,
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
    profiles.push(newProfile);
    localStorage.setItem('sim_klinik_profiles', JSON.stringify(profiles));

    setUser(newProfile);
    localStorage.setItem(AUTH_STORAGE_KEY, newProfile.id);
    return true;
  };

  const logout = () => {
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

