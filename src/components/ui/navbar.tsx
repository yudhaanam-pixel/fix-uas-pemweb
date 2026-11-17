'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, getRoleDashboardUrl } from '@/lib/auth-context';
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
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { UserRole } from '@/types/database';

interface NavbarProps {
  onOpenBooking?: () => void;
}

export function Navbar({ onOpenBooking }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loginAs, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', href: '/#beranda' },
    { label: 'Tentang Kami', href: '/#tentang' },
    { label: 'Layanan', href: '/#layanan' },
    { label: 'Dokter', href: '/#dokter' },
    { label: 'Jadwal Praktik', href: '/#jadwal' },
    { label: 'Kontak', href: '/#kontak' },
  ];

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return 'Administrator';
      case 'petugas':
        return 'Petugas FO';
      case 'dokter':
        return 'Dokter';
      case 'pasien':
        return 'Pasien';
    }
  };

  const handleBookingClick = () => {
    if (onOpenBooking) {
      onOpenBooking();
    } else {
      router.push('/#booking');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-100 bg-white/95 backdrop-blur-md shadow-xs transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Activity className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest block leading-none">
                RUMAH SAKIT / KLINIK
              </span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
              ANAVERSE
            </span>
          </div>
        </Link>

        {/* Center Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === '/' && link.href === '/#beranda';
            return (
              <Link
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            );
          })}
          {/* Layar Antrean TV Shortcut */}
          <Link
            href="/antrean"
            className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all"
          >
            <Tv className="h-3.5 w-3.5" />
            <span>Layar Antrean</span>
          </Link>
        </nav>

        {/* Right Authentication & Action Controls */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Quick Role Switcher Pill (Helper for Testing & Evaluation) */}
          <div className="relative">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Ganti Peran Cepat (Testing)"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Role: <strong className="text-blue-700 uppercase">{role || 'Tamu'}</strong></span>
            </button>

            {roleSwitcherOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 text-xs"
                onMouseLeave={() => setRoleSwitcherOpen(false)}
              >
                <div className="px-2 py-1.5 font-bold text-slate-500 border-b border-slate-100 text-[11px]">
                  Beralih Peran Cepat:
                </div>
                {(['pasien', 'petugas', 'dokter', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      loginAs(r);
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      role === r
                        ? 'bg-blue-50 text-blue-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{getRoleLabel(r)}</span>
                    {role === r && <span className="text-blue-600 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conditional Rendering Based on Auth State */}
          {user ? (
            /* SUDAH LOGIN */
            <div className="flex items-center gap-2">
              <Link
                href={getRoleDashboardUrl(user.role)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard ({user.role.toUpperCase()})</span>
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Keluar (Logout)"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* BELUM LOGIN */
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Masuk</span>
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Daftar</span>
              </Link>
              <button
                onClick={handleBookingClick}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Calendar className="h-4 w-4" />
                <span>Daftar Kunjungan</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu hamburger button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 shadow-xl space-y-4">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-700"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/antrean"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-700 bg-blue-50 rounded-lg"
            >
              <Tv className="h-4 w-4" />
              <span>Layar Monitor Antrean (TV Lobby)</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Akses Peran Pengguna:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['pasien', 'petugas', 'dokter', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    loginAs(r);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold text-center border transition-colors ${
                    role === r
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {getRoleLabel(r)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href={getRoleDashboardUrl(user.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Buka Dashboard ({user.role.toUpperCase()})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar dari Akun
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleBookingClick();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm"
                >
                  <Calendar className="h-4 w-4" />
                  Daftar Kunjungan Sekarang
                </button>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <LogIn className="h-4 w-4" />
                    Masuk
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-sm font-bold text-blue-700"
                  >
                    <UserPlus className="h-4 w-4" />
                    Daftar
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
