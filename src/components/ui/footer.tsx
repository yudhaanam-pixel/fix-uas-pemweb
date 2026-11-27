'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Phone, MapPin, Clock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

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

      {/* ═══════════════ CTA BANNER ═══════════════ */}
      <div className="relative overflow-hidden border-b border-blue-700/50 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-4 py-5 text-white sm:px-6 sm:py-6 lg:px-8">
        {/* decorative blurs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 lg:flex-row lg:gap-8">

          {/* LEFT — headline + badges */}
          <div className="min-w-0 flex-1 space-y-2 text-center lg:text-left">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Butuh Bantuan Medis?
            </h2>
            <p className="max-w-lg text-sm leading-relaxed text-blue-100">
              Tim gawat darurat dan poliklinik spesialis kami siap melayani Anda dan keluarga 24 jam sehari, 7 hari seminggu.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5 lg:justify-start">
              {[
                { icon: Clock, label: 'IGD 24 Jam' },
                { icon: ShieldCheck, label: 'Tenaga Medis Profesional' },
                { icon: Activity, label: 'Fasilitas Lengkap' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-100 backdrop-blur-sm"
                >
                  <Icon className="h-3 w-3 text-blue-300" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — phone card + CTA */}
          <div className="flex w-full shrink-0 flex-col items-center gap-3 sm:w-auto sm:flex-row">
            {/* phone card */}
            <div className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-2.5 shadow-lg sm:w-auto">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Phone className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hubungi Kami</p>
                <p className="text-base font-black leading-tight tracking-tight text-blue-700 sm:text-lg">(021) 1234 5678</p>
                <p className="text-[10px] text-slate-400">Emergency &amp; Ambulance</p>
              </div>
            </div>

            {/* CTA button */}
            <button
              onClick={handleBooking}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.03] hover:bg-blue-500 active:scale-95 sm:w-auto"
            >
              Daftar Kunjungan Sekarang
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════ MAIN FOOTER — 4 columns ═══════════════ */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">

          {/* ── Col 1 · ANAVERSE ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Activity className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="mb-0.5 block text-[10px] font-bold uppercase leading-none tracking-wider text-blue-400">
                  RUMAH SAKIT / KLINIK
                </span>
                <span className="text-lg font-extrabold leading-none tracking-tight text-white">
                  ANAVERSE
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-400">
              Pusat pelayanan kesehatan keluarga modern dengan fasilitas medis terintegrasi, dokter spesialis berpengalaman, dan sistem antrean digital.
            </p>

            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs text-blue-300">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              <span>Terakreditasi <strong>PARIPURNA</strong> Kemenkes RI</span>
            </div>
          </div>

          {/* ── Col 2 · LOKASI & KONTAK ── */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              Lokasi &amp; Kontak
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <div>
                  <p className="font-semibold text-white">Alamat Klinik:</p>
                  <p className="leading-relaxed text-slate-400">
                    Jl. Graha Medika Prima No. 88, Kebayoran Baru, Jakarta Selatan 12870
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <div>
                  <p className="font-semibold text-white">Hotline WhatsApp:</p>
                  <p className="font-mono text-[13px] text-blue-300">
                    0812-3456-7890 / 0812-9876-5432
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <div>
                  <p className="font-semibold text-white">Email Resmi:</p>
                  <p className="text-slate-300">layanan@klinikanaverse.id</p>
                </div>
              </li>
            </ul>
          </div>

          {/* ── Col 3 · JAM OPERASIONAL ── */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              Jam Operasional
            </h3>
            <ul className="text-sm text-slate-300">
              {[
                { label: 'Instalasi Gawat Darurat', time: '24 Jam / 7 Hari', highlight: true },
                { label: 'Poli Rawat Jalan (Sen–Jum)', time: '08:00 – 21:00 WIB', highlight: false },
                { label: 'Poli Spesialis (Sabtu)', time: '08:00 – 16:00 WIB', highlight: false },
                { label: 'Apotek & Laboratorium', time: '24 Jam', highlight: false },
              ].map(({ label, time, highlight }) => (
                <li
                  key={label}
                  className="flex items-start justify-between gap-3 border-b border-slate-800 py-2 last:border-b-0"
                >
                  <span className="text-slate-400">{label}</span>
                  <span
                    className={`shrink-0 whitespace-nowrap font-semibold ${
                      highlight ? 'font-bold text-emerald-400' : 'text-white'
                    }`}
                  >
                    {time}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              *Pendaftaran online dibuka setiap hari 24 jam untuk kunjungan hari H maupun H+1.
            </p>
          </div>

          {/* ── Col 4 · AKSES CEPAT ── */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
              Akses Cepat
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: '/antrean', label: '📺 Layar Antrean Publik (TV Lobby)' },
                { href: '/#layanan', label: 'Daftar Layanan & Poliklinik' },
                { href: '/#dokter', label: 'Profil Dokter Spesialis' },
                { href: '/#jadwal', label: 'Jadwal Praktik Dokter & Sisa Kuota' },
                { href: '/auth/login', label: 'Portal Masuk Pasien & Staf' },
                { href: '/auth/register', label: 'Registrasi Akun Pasien Baru' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ═══════════════ COPYRIGHT BAR ═══════════════ */}
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 Rumah Sakit &amp; Klinik Anaverse. Seluruh hak cipta dilindungi undang-undang.</p>
          <p className="text-slate-400">Standar Pelayanan Medis Terakreditasi Paripurna Kemenkes RI</p>
        </div>
      </div>
    </footer>
  );
}
