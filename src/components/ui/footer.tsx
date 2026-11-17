'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Phone, MapPin, Clock, Mail, ShieldCheck, Heart, ArrowRight, Ambulance } from 'lucide-react';

interface FooterProps {
  onOpenBooking?: () => void;
}

export function Footer({ onOpenBooking }: FooterProps) {
  const router = useRouter();

  const handleBooking = () => {
    if (onOpenBooking) {
      onOpenBooking();
    } else {
      router.push('/#booking');
    }
  };

  return (
    <footer id="kontak" className="bg-slate-900 text-slate-300">
      {/* EMERGENCY & CALL TO ACTION BANNER (Matching reference design) */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 border-b border-blue-700/50 py-10 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Butuh Bantuan Medis?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl">
              Tim gawat darurat dan poliklinik spesialis kami siap melayani Anda dan keluarga 24 jam sehari, 7 hari seminggu.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-blue-100 border border-white/15">
                <Clock className="h-3.5 w-3.5 text-blue-300" />
                IGD 24 Jam
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-blue-100 border border-white/15">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />
                Tenaga Medis Profesional
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-blue-100 border border-white/15">
                <Activity className="h-3.5 w-3.5 text-blue-300" />
                Fasilitas Lengkap
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* Phone Call Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl flex items-center gap-4 text-slate-900 w-full sm:w-auto border border-blue-100">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Phone className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hubungi Kami</p>
                <p className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight">(021) 1234 5678</p>
                <p className="text-[11px] text-slate-400">Emergency & Ambulance</p>
              </div>
            </div>

            {/* Quick Booking Button */}
            <button
              onClick={handleBooking}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-4 text-sm shadow-xl shadow-blue-900/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Daftar Kunjungan Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Accreditation */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Activity className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                  RUMAH SAKIT / KLINIK
                </span>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  ANAVERSE
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pusat pelayanan kesehatan keluarga modern dengan fasilitas medis terintegrasi, dokter spesialis berpengalaman, dan sistem antrean digital.
            </p>
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 border border-slate-700/80 px-3.5 py-2 text-xs text-blue-300">
              <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Terakreditasi <strong>PARIPURNA</strong> Kemenkes RI</span>
            </div>
          </div>

          {/* Contact & Emergency */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Lokasi & Kontak
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Alamat Klinik:</p>
                  <p className="text-slate-400">Jl. Graha Medika Prima No. 88, Kebayoran Baru, Jakarta Selatan 12870</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Hotline WhatsApp:</p>
                  <p className="text-blue-300 font-mono">0812-3456-7890 / 0812-9876-5432</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Email Resmi:</p>
                  <p className="text-slate-300">layanan@klinikanaverse.id</p>
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
              <li className="flex justify-between py-1.5 border-b border-slate-800">
                <span>Instalasi Gawat Darurat:</span>
                <span className="font-bold text-emerald-400">24 Jam / 7 Hari</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-slate-800">
                <span>Poli Rawat Jalan (Senin-Jumat):</span>
                <span className="font-semibold text-white">08:00 - 21:00 WIB</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-slate-800">
                <span>Poli Spesialis (Sabtu):</span>
                <span className="font-semibold text-white">08:00 - 16:00 WIB</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-slate-800">
                <span>Apotek & Laboratorium:</span>
                <span className="font-semibold text-white">24 Jam</span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              *Pendaftaran online dibuka setiap hari 24 jam untuk kunjungan hari H maupun H+1.
            </p>
          </div>

          {/* Quick Access */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Akses Cepat
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/antrean" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 font-medium">
                  <span>📺 Layar Antrean Publik (TV Lobby)</span>
                </Link>
              </li>
              <li>
                <Link href="/#layanan" className="hover:text-white transition-colors">
                  Daftar Layanan & Poliklinik
                </Link>
              </li>
              <li>
                <Link href="/#dokter" className="hover:text-white transition-colors">
                  Profil Dokter Spesialis
                </Link>
              </li>
              <li>
                <Link href="/#jadwal" className="hover:text-white transition-colors">
                  Jadwal Praktik Dokter & Sisa Kuota
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  Portal Masuk Pasien & Staf
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-white transition-colors">
                  Registrasi Akun Pasien Baru
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Rumah Sakit & Klinik Anaverse. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Standar Pelayanan Medis Terakreditasi Paripurna Kemenkes RI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
