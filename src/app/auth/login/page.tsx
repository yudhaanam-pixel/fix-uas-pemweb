'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, getRoleDashboardUrl, detectRoleFromEmployeeCode } from '@/lib/auth-context';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  Shield,
  Stethoscope,
  User,
  UserCheck,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roleDetection = detectRoleFromEmployeeCode(employeeCode);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authError = params.get('auth_error');
      if (authError === 'unauthenticated') {
        toast.error('Sesi tidak ditemukan atau telah berakhir. Silakan masuk terlebih dahulu.');
      } else if (authError === 'forbidden_admin') {
        toast.error('Akses ditolak! Halaman tersebut khusus untuk Administrator.');
      } else if (authError === 'forbidden_dokter') {
        toast.error('Akses ditolak! Halaman tersebut khusus untuk Dokter.');
      } else if (authError === 'forbidden_petugas') {
        toast.error('Akses ditolak! Halaman tersebut khusus untuk Petugas FO.');
      } else if (authError === 'forbidden_pasien') {
        toast.error('Akses ditolak! Halaman tersebut khusus untuk Pasien.');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Silakan masukkan alamat email.');
      return;
    }

    // Validasi prefix kode pegawai di sisi klien sebelum request
    if (employeeCode.trim() && roleDetection.role === null) {
      toast.error(
        'Kode akses tidak valid! Gunakan awalan 10 (Admin), 25 (Dokter), 30 (Petugas), atau kosongkan untuk Pasien.'
      );
      return;
    }

    setIsLoading(true);
    const result = await loginWithEmail(email, password, employeeCode);
    setIsLoading(false);

    if (result.success && result.role) {
      toast.success(`Berhasil masuk sebagai ${result.role.toUpperCase()}`);
      router.push(getRoleDashboardUrl(result.role));
    } else {
      toast.error(
        result.error ||
          'Gagal memproses login. Silakan periksa kembali data yang dimasukkan.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100/50 text-slate-800 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Activity className="h-7 w-7 stroke-[2.5]" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
          Masuk ke Portal SIM-Klinik
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Sistem Informasi Pelayanan Klinik & Rumah Sakit Anaverse
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-blue-900/5 rounded-3xl border border-blue-100 sm:px-10 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@kliniksehat.id"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
                <Mail className="h-4 w-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
                <Lock className="h-4 w-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {/* Input Kode Pegawai / ID Akses */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Kode Pegawai / ID Akses
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Khusus Staf (Opsional Pasien)</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  placeholder="Contoh: 25xxx (Dokter), 10xxx (Admin), 30xxx (Petugas)"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-mono"
                />
                <KeyRound className="h-4 w-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>

              {/* Dynamic Real-Time Role Detection Badge */}
              {employeeCode.trim() === '' ? (
                <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  <User className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Akses: <strong>Pasien</strong> (Login tanpa kode ID)</span>
                </div>
              ) : roleDetection.role === 'dokter' ? (
                <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs">
                  <Stethoscope className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Awalan <strong>25</strong>: Masuk ke <strong>Dashboard Dokter</strong></span>
                </div>
              ) : roleDetection.role === 'admin' ? (
                <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs">
                  <Shield className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  <span>Awalan <strong>10</strong>: Masuk ke <strong>Dashboard Administrator</strong></span>
                </div>
              ) : roleDetection.role === 'petugas' ? (
                <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <UserCheck className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span>Awalan <strong>30</strong>: Masuk ke <strong>Dashboard Petugas FO</strong></span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                  <span>Awalan tidak valid! Gunakan awalan <strong>25</strong>, <strong>10</strong>, <strong>30</strong>, atau kosongkan untuk Pasien.</span>
                </div>
              )}

              <p className="mt-1.5 text-[11px] text-slate-400 leading-tight">
                *Awalan kode: <span className="font-semibold text-blue-700">25</span> (Dokter),{' '}
                <span className="font-semibold text-purple-700">10</span> (Admin),{' '}
                <span className="font-semibold text-amber-700">30</span> (Petugas). Kosongkan jika Pasien.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Belum memiliki akun pasien? </span>
            <Link href="/auth/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
              Daftar Pasien Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
