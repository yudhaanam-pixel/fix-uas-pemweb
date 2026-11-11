'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Activity,
  Calendar,
  Clock,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Shield,
  Stethoscope,
  Tv,
  User,
  Users,
  X,
} from 'lucide-react';
import { UserRole } from '@/types/database';

export function Navbar() {
  const pathname = usePathname();
  const { user, role, loginAs, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Layanan & Poli', href: '/#layanan' },
    { label: 'Jadwal Dokter', href: '/#jadwal' },
    { label: 'Monitor Antrean', href: '/antrean', icon: Tv, highlight: true },
    { label: 'Lokasi & Kontak', href: '/#kontak' },
  ];

  const getDashboardHref = () => {
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'petugas') return '/dashboard/petugas';
    if (role === 'dokter') return '/dashboard/dokter';
    return '/dashboard/pasien';
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return 'Administrator';
      case 'petugas':
        return 'Front Office / Petugas';
      case 'dokter':
        return 'Dokter Spesialis';
      case 'pasien':
        return 'Pasien';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-teal-100/70 bg-white/85 backdrop-blur-md shadow-xs transition-all">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Activity className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                Klinik Sehat Utama
              </span>
              <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 ring-1 ring-inset ring-teal-600/20">
                SIM
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">Sistem Informasi Manajemen Kesehatan</p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isHighlight = link.highlight;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                  isHighlight
                    ? 'text-teal-700 hover:bg-teal-50 border border-teal-200/70'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
                }`}
              >
                {Icon && <Icon className="h-4 w-4 text-teal-600 animate-pulse" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Role Switcher */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Quick Role Switcher Pill for Pairing/Evaluation */}
          <div className="relative">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all shadow-xs"
              title="Ganti Peran Pengguna untuk Pengujian"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Peran: <strong className="text-teal-800 uppercase font-bold">{role || 'Tamu'}</strong></span>
            </button>

            {roleSwitcherOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 text-xs"
                onMouseLeave={() => setRoleSwitcherOpen(false)}
              >
                <div className="px-2 py-1.5 font-bold text-slate-500 border-b border-slate-100">
                  Ganti Akses Peran Cepat:
                </div>
                {(['pasien', 'petugas', 'dokter', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      loginAs(r);
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg font-medium flex items-center justify-between transition-colors ${
                      role === r
                        ? 'bg-teal-50 text-teal-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{getRoleLabel(r)}</span>
                    {role === r && <span className="text-teal-600">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={getDashboardHref()}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-teal-600 transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Masuk</span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 shadow-xl space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-teal-700"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Peran Pengguna:</p>
            <div className="grid grid-cols-2 gap-2">
              {(['pasien', 'petugas', 'dokter', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    loginAs(r);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium text-center border ${
                    role === r
                      ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {getRoleLabel(r)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href={getDashboardHref()}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
            >
              <LayoutDashboard className="h-4 w-4" />
              Buka Dashboard ({role?.toUpperCase()})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

