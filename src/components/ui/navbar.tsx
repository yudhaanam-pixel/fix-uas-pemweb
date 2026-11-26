'use client';

import React, { useEffect, useState } from 'react';
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

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Beranda', href: '/#beranda' },
  { label: 'Tentang Kami', href: '/#tentang' },
  { label: 'Dokter', href: '/#dokter' },
  { label: 'Kontak', href: '/#kontak' },
];

export function Navbar({ onOpenBooking }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPatient = Boolean(user && user.role === 'pasien');

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleBookingClick = () => {
    setMobileMenuOpen(false);
    if (onOpenBooking) {
      onOpenBooking();
    } else {
      router.push('/#booking');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex h-16 lg:h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo & Identity */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 group whitespace-nowrap"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20 group-hover:bg-blue-700 transition-colors shrink-0">
            <Activity className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600 leading-none">
              RUMAH SAKIT / KLINIK
            </span>
            <span className="text-base lg:text-[17px] font-extrabold tracking-tight text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
              ANAVERSE
            </span>
          </div>
        </Link>

        {/* Center: Concise Main Navigation */}
        <nav
          aria-label="Navigasi utama"
          className="hidden lg:flex items-center justify-center gap-1 xl:gap-2"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex items-center rounded-lg px-3.5 xl:px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Action Controls with Clear Visual Hierarchy */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              {isPatient && (
                <>
                  <Link
                    href="/antrean"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs xl:text-[13px] font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-700 transition-colors whitespace-nowrap"
                  >
                    <Tv className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>Layar Antrean</span>
                  </Link>
                  <span aria-hidden="true" className="h-5 w-px bg-slate-200 mx-0.5" />
                </>
              )}
              <Link
                href={getRoleDashboardUrl(user.role)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span>Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                title="Keluar"
                aria-label="Keluar dari akun"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                <LogIn className="h-4 w-4 shrink-0 text-slate-400" />
                <span>Masuk</span>
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-700 transition-colors whitespace-nowrap"
              >
                <span>Daftar</span>
              </Link>
              <button
                type="button"
                onClick={handleBookingClick}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Daftar Kunjungan</span>
              </button>
            </div>
          )}
        </div>

        {/* Tablet quick CTA + Mobile Hamburger */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          {!user && (
            <button
              type="button"
              onClick={handleBookingClick}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Daftar Kunjungan</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-5 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav aria-label="Navigasi mobile" className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {isPatient && (
              <Link
                href="/antrean"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors mt-2"
              >
                <Tv className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Layar Antrean</span>
              </Link>
            )}
          </nav>

          {/* Mobile Actions */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href={getRoleDashboardUrl(user.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar dari Akun</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleBookingClick}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Daftar Kunjungan</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <LogIn className="h-4 w-4 text-slate-400" />
                    <span>Masuk</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4 text-blue-600" />
                    <span>Daftar</span>
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
