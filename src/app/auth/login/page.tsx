'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types/database';
import { Activity, ArrowRight, CheckCircle2, Lock, Mail, Shield, User, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { loginAs, loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Silakan masukkan alamat email');
      return;
    }

    setIsLoading(true);
    const success = await loginWithEmail(email, password);
    setIsLoading(false);

    if (success) {
      toast.success('Berhasil masuk ke akun Anda');
      router.push('/');
    } else {
      toast.error('Akun tidak ditemukan. Silakan gunakan tombol demo cepat di bawah ini.');
    }
  };

  const handleFastLogin = (role: UserRole) => {
    loginAs(role);
    toast.success(`Berhasil masuk sebagai ${role.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-slate-950 font-bold shadow-lg shadow-teal-500/30">
            <Activity className="h-7 w-7 stroke-[2.5]" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">
          Masuk ke Portal SIM-Klinik
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Sistem Informasi Manajemen Pelayanan Klinik Terpadu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/10 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl border border-white/15 sm:px-10 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300">
                Alamat Email
              </label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@kliniksehat.id"
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-teal-400 focus:bg-white/10"
                />
                <Mail className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300">
                Kata Sandi
              </label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-teal-400 focus:bg-white/10"
                />
                <Lock className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2.5 text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Memproses...' : 'Masuk ke Portal'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                Akses Cepat Pengujian (1-Click Demo Login)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Klik salah satu peran di bawah untuk menguji alur kerja lengkap tanpa perlu mengetik:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFastLogin('admin')}
                className="p-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-left transition-colors"
              >
                <p className="text-xs font-bold text-purple-300">1. Admin</p>
                <p className="text-[10px] text-slate-400">Master data & laporan</p>
              </button>

              <button
                type="button"
                onClick={() => handleFastLogin('petugas')}
                className="p-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-left transition-colors"
              >
                <p className="text-xs font-bold text-amber-300">2. Petugas FO</p>
                <p className="text-[10px] text-slate-400">Walk-in & check-in</p>
              </button>

              <button
                type="button"
                onClick={() => handleFastLogin('dokter')}
                className="p-2.5 rounded-xl bg-blue-950/60 hover:bg-blue-900 border border-blue-500/40 text-left transition-colors"
              >
                <p className="text-xs font-bold text-blue-300">3. Dokter</p>
                <p className="text-[10px] text-slate-400">Rekam medis & SOAP</p>
              </button>

              <button
                type="button"
                onClick={() => handleFastLogin('pasien')}
                className="p-2.5 rounded-xl bg-teal-950/60 hover:bg-teal-900 border border-teal-500/40 text-left transition-colors"
              >
                <p className="text-xs font-bold text-teal-300">4. Pasien</p>
                <p className="text-[10px] text-slate-400">Daftar poli & e-tiket</p>
              </button>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-400">
            <span>Belum memiliki akun pasien? </span>
            <Link href="/auth/register" className="font-bold text-teal-400 underline">
              Daftar Pasien Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

