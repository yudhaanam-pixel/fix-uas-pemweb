'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, getRoleDashboardUrl } from '@/lib/auth-context';
import {
  Activity,
  Calendar,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Tv,
  UserPlus,
  X,
} from 'lucide-react';

interface NavbarProps {
  onOpenBooking?: () => void;
}

export function Navbar({ onOpenBooking }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', href: '/#beranda' },
    { label: 'Tentang Kami', href: '/#tentang' },
    { label: 'Layanan', href: '/#layanan' },
    { label: 'Dokter', href: '/#dokter' },
    { label: 'Jadwal Praktik', href: '/#jadwal' },
    { label: 'Kontak', href: '/#kontak' },
  ];

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
            className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all whitespace-nowrap"
          >
            <Tv className="h-3.5 w-3.5" />
            <span>Layar Antrean</span>
          </Link>
        </nav>

        {/* Right Authentication & Action Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            /* SUDAH LOGIN */
            <div className="flex items-center gap-3">
              <Link
                href={getRoleDashboardUrl(user.role)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all whitespace-nowrap"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Keluar"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            /* BELUM LOGIN */
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Masuk</span>
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Daftar</span>
              </Link>
              <button
                onClick={handleBookingClick}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
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
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-700 bg-blue-50 rounded-lg whitespace-nowrap"
            >
              <Tv className="h-4 w-4" />
              <span>Layar Antrean</span>
            </Link>
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
                  Dashboard
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
