import React from 'react';
import Link from 'next/link';
import { Activity, Phone, MapPin, Clock, Mail, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Accreditation */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md">
                <Activity className="h-6 w-6 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Klinik Sehat Utama
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pusat pelayanan kesehatan keluarga modern terintegrasi dengan standar akreditasi Paripurna Kemenkes RI.
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-teal-950/60 border border-teal-800/80 px-3 py-2 text-xs text-teal-300">
              <ShieldCheck className="h-4 w-4 text-teal-400 shrink-0" />
              <span>Terakreditasi <strong>PARIPURNA</strong> Kemenkes RI</span>
            </div>
          </div>

          {/* Contact & Emergency */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Layanan Darurat & Kontak
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">IGD 24 Jam & Hotline:</p>
                  <p className="text-emerald-400 font-mono">(021) 555-0199 / 0812-3456-7890</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400">Email Resmi:</p>
                  <p className="text-white">kontak@kliniksehatutama.id</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400">Alamat:</p>
                  <p className="text-slate-200">Jl. Graha Medika Prima No. 88, Jakarta Selatan 12870</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Jam Operasional */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Jam Operasional
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span>Senin - Jumat:</span>
                <span className="font-semibold text-white">08:00 - 21:00 WIB</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span>Sabtu:</span>
                <span className="font-semibold text-white">08:00 - 18:00 WIB</span>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-800">
                <span>Minggu & Hari Libur:</span>
                <span className="font-semibold text-amber-400">Khusus IGD & Rawat Darurat</span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              *Registrasi online ditutup 1 jam sebelum sesi praktik dokter berakhir.
            </p>
          </div>

          {/* Quick Access */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Akses Cepat
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/antrean" className="text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-2">
                  <span>📺 Layar Antrean Publik (TV Lobby)</span>
                </Link>
              </li>
              <li>
                <Link href="/#layanan" className="hover:text-white transition-colors">
                  Daftar Layanan & Poliklinik
                </Link>
              </li>
              <li>
                <Link href="/#jadwal" className="hover:text-white transition-colors">
                  Jadwal Praktik Dokter
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  Portal Masuk Pasien & Staf
                </Link>
              </li>
              <li>
                <Link href="/dashboard/pasien" className="hover:text-white transition-colors">
                  Pendaftaran Pasien Online
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SIM-Klinik Sehat Utama. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Dirancang dengan</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>untuk Pelayanan Kesehatan Berkualitas</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

