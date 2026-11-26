'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types/database';
import {
  Activity,
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Stethoscope,
  Tv,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  petugas: 'Petugas FO',
  dokter: 'Dokter',
  pasien: 'Pasien',
};

export function DashboardLayout({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Inferred role requirement from pathname if requiredRole not explicitly set
  const allowedRoles = useMemo<UserRole[]>(() => {
    const expectedRole: UserRole | UserRole[] =
      requiredRole ||
      (pathname.startsWith('/dashboard/admin')
        ? 'admin'
        : pathname.startsWith('/dashboard/dokter')
        ? 'dokter'
        : pathname.startsWith('/dashboard/petugas')
        ? 'petugas'
        : pathname.startsWith('/dashboard/pasien')
        ? 'pasien'
        : ['admin', 'petugas', 'dokter', 'pasien']);

    return Array.isArray(expectedRole) ? expectedRole : [expectedRole];
  }, [requiredRole, pathname]);

  const hasAccess = Boolean(role && allowedRoles.includes(role));

  // Security Redirect: Tendang pengguna tidak sah kembali ke login
  useEffect(() => {
    if (!isLoading) {
      if (!user || !role) {
        toast.error('Silakan masuk terlebih dahulu untuk mengakses dashboard.');
        router.replace('/auth/login?auth_error=unauthenticated');
      } else if (!hasAccess) {
        toast.error(
          `Akses ditolak! Anda masuk sebagai ${role.toUpperCase()} dan tidak memiliki izin mengakses halaman ${allowedRoles.join('/').toUpperCase()}.`
        );
        router.replace(`/auth/login?auth_error=forbidden_${allowedRoles[0]}`);
      }
    }
  }, [user, role, isLoading, hasAccess, router, allowedRoles]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isLoading || !user || !hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 animate-pulse mb-4">
          <Activity className="h-6 w-6 stroke-[2.5]" />
        </div>
        <p className="text-sm font-bold text-slate-900">Memverifikasi Otoritas Akses...</p>
        <p className="text-xs text-slate-500 mt-1">
          Mengamankan sesi Anda di Rumah Sakit &amp; Klinik Anaverse
        </p>
      </div>
    );
  }

  // Navigation Links based on role
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'admin':
        return [
          { label: 'Ringkasan & Statistik', href: '/dashboard/admin', icon: LayoutDashboard },
          { label: 'Master Poliklinik', href: '/dashboard/admin/departments', icon: Activity },
          { label: 'Master Dokter', href: '/dashboard/admin/doctors', icon: Stethoscope },
          { label: 'Jadwal & Kuota', href: '/dashboard/admin/schedules', icon: Calendar },
          { label: 'Pengguna & Hak Akses', href: '/dashboard/admin/users', icon: Users },
          { label: 'Laporan & Rekapitulasi', href: '/dashboard/admin/reports', icon: FileText },
        ];
      case 'petugas':
        return [
          { label: 'Antrean & Check-in', href: '/dashboard/petugas', icon: ClipboardList },
          { label: 'Pendaftaran Walk-in', href: '/dashboard/petugas/walk-in', icon: UserPlus },
        ];
      case 'dokter':
        return [
          { label: 'Pemeriksaan Pasien', href: '/dashboard/dokter', icon: Stethoscope },
          { label: 'Riwayat Rekam Medis', href: '/dashboard/dokter/history', icon: FileText },
        ];
      case 'pasien':
      default:
        return [
          { label: 'Pendaftaran & Tiket', href: '/dashboard/pasien', icon: Calendar },
          { label: 'Riwayat Kunjungan', href: '/dashboard/pasien/riwayat', icon: Clock },
          { label: 'Data Diri Pasien', href: '/dashboard/pasien/profil', icon: Users },
        ];
    }
  };

  const navItems = getNavItems();
  const activeNavItem = navItems.find((item) => item.href === pathname) || navItems[0];

  const getRoleBadgeStyle = (r: UserRole | null) => {
    switch (r) {
      case 'admin':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'petugas':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'dokter':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <header className="lg:hidden flex items-center justify-between border-b border-slate-200 bg-white px-4 h-16 sticky top-0 z-40 shadow-xs">
        <Link href="/" className="flex items-center gap-2.5 whitespace-nowrap">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20 shrink-0">
            <Activity className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600 leading-none">
              RUMAH SAKIT / KLINIK
            </span>
            <span className="font-extrabold text-sm text-slate-900 leading-tight">
              ANAVERSE
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${getRoleBadgeStyle(
              role
            )}`}
          >
            {role ? ROLE_LABELS[role] : 'Tamu'}
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? 'Tutup menu' : 'Buka menu'}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col overflow-y-auto">
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-slate-200/80 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center gap-2.5 whitespace-nowrap group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20 group-hover:bg-blue-700 transition-colors shrink-0">
                <Activity className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600 leading-none">
                  RUMAH SAKIT / KLINIK
                </span>
                <span className="font-extrabold text-base text-slate-900 tracking-tight leading-tight">
                  ANAVERSE
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Tutup sidebar"
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-3.5 mx-3 mt-4 mb-2 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-100 border-2 border-white shadow-xs shrink-0 flex items-center justify-center font-bold text-blue-700">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                ) : (
                  user?.full_name?.charAt(0) || 'U'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {user?.full_name || 'Pengguna Demo'}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-nowrap overflow-hidden">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${getRoleBadgeStyle(
                      role
                    )}`}
                  >
                    {role || 'Tamu'}
                  </span>
                  {user?.employee_code && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-white border border-slate-200 text-slate-600 whitespace-nowrap">
                      ID: {user.employee_code}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Menu Dashboard" className="px-3 py-2 space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Menu Utama
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Link to Live TV Queue */}
          <div className="px-3 pt-3">
            <Link
              href="/antrean"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 transition-colors whitespace-nowrap"
            >
              <Tv className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="truncate">Buka Layar Antrean (TV Lobby)</span>
            </Link>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-white shrink-0">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-700 transition-colors whitespace-nowrap"
            >
              <Home className="h-3.5 w-3.5 shrink-0" />
              <span>Halaman Utama</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Bar */}
        <header className="hidden lg:flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 backdrop-blur-md px-8 sticky top-0 z-30 shadow-[0_1px_2px_0_rgba(15,23,42,0.03)]">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border whitespace-nowrap shrink-0 ${getRoleBadgeStyle(
                role
              )}`}
            >
              {role ? ROLE_LABELS[role] : 'Tamu'}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-800 truncate whitespace-nowrap">
              {activeNavItem?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-700 transition-colors whitespace-nowrap"
            >
              <Home className="h-3.5 w-3.5 shrink-0" />
              <span>Beranda Publik</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
