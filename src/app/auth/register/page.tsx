'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Activity, ArrowRight, UserPlus, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { registerPatient } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nik, setNik] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !nik || !phone) {
      toast.error('Harap lengkapi semua data wajib (*)');
      return;
    }

    if (nik.length !== 16) {
      toast.error('NIK harus berjumlah 16 digit angka');
      return;
    }

    setIsLoading(true);
    const success = await registerPatient({
      fullName,
      email,
      phone,
      nik,
      gender,
      birthDate,
      address,
    });
    setIsLoading(false);

    if (success) {
      toast.success('Pendaftaran akun pasien berhasil! Selamat datang.');
      router.push('/dashboard/pasien');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-slate-950 font-bold shadow-lg shadow-teal-500/30">
            <Activity className="h-7 w-7 stroke-[2.5]" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">
          Registrasi Akun Pasien Baru
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Lengkapi data rekam medis pasien untuk kemudahan berobat dan booking poli
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white/10 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl border border-white/15 sm:px-10">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
                Nama Lengkap (Sesuai KTP) *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Rian Hidayat Kusuma"
                className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-teal-400 focus:bg-white/10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
                  Nomor Induk Kependudukan (NIK - 16 Digit) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="320101..."
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-teal-400 focus:bg-white/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
                  Nomor HP / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-teal-400 focus:bg-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
                  Alamat Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pasien@email.com"
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-teal-400 focus:bg-white/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
                  Jenis Kelamin *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                  className="w-full rounded-xl bg-slate-900 border border-white/20 px-3 py-2.5 text-xs text-white focus:outline-teal-400"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
                Tanggal Lahir *
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2.5 text-xs text-white focus:outline-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
                Alamat Domisili
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Merpati No..."
                className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-teal-400"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>{isLoading ? 'Mendaftarkan...' : 'Selesaikan Registrasi Pasien'}</span>
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-white/10 text-center text-xs text-slate-400">
            <span>Sudah memiliki akun? </span>
            <Link href="/auth/login" className="font-bold text-teal-400 underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

