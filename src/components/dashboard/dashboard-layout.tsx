'use client';

import React, { useState, useEffect } from 'react';
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
  PlusCircle,
  Settings,
  Shield,
  Stethoscope,
  Tv,
  UserCheck,
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

export function DashboardLayout({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout, loginAs, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Inferred role requirement from pathname if requiredRole not explicitly set
  const expectedRole: UserRole | UserRole[] = requiredRole || (
    pathname.startsWith('/dashboard/admin')
      ? 'admin'
      : pathname.startsWith('/dashboard/dokter')
      ? 'dokter'
      : pathname.startsWith('/dashboard/petugas')
      ? 'petugas'
      : pathname.startsWith('/dashboard/pasien')
      ? 'pasien'
      : ['admin', 'petugas', 'dokter', 'pasien']
  );

  const allowedRoles = Array.isArray(expectedRole)
    ? expectedRole
    : [expectedRole];

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

  if (isLoading || !user || !hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 animate-pulse mb-4">
          <Activity className="h-6 w-6 stroke-[2.5]" />
        </div>
        <p className="text-sm font-bold text-slate-800">Memverifikasi Otoritas Akses...</p>
        <p className="text-xs text-slate-400 mt-1">Mengamankan sesi Anda di SIM-Klinik</p>
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

  const getRoleBadgeStyle = (r: UserRole | null) => {
    switch (r) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'petugas':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'dokter':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900">SIM-Klinik</span>
            <span className="block text-[10px] text-blue-700 font-bold uppercase">{role || 'Tamu'}</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Activity className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-base text-slate-900 tracking-tight">Klinik Anaverse</span>
                <p className="text-[11px] text-slate-500">Panel Manajemen Terpadu</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User profile card */}
          <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-100 border-2 border-white shadow-xs shrink-0 flex items-center justify-center font-bold text-blue-800">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                ) : (
                  user?.full_name?.charAt(0) || 'U'
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.full_name || 'Pengguna Demo'}</p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeStyle(
                      role
                    )}`}
                  >
                    {role || 'Tamu'}
                  </span>
                  {user?.employee_code && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-slate-200/80 text-slate-700">
                      ID: {user.employee_code}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-2 space-y-1">
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick link to live TV queue */}
          <div className="px-3 pt-4">
            <Link
              href="/antrean"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100/70 border border-blue-200/60 transition-colors"
            >
              <Tv className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Buka Layar Antrean (TV Lobby)</span>
            </Link>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          {/* Quick Switch role for pairing & review */}
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-xs">
            <p className="font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
              <span>Ganti Akses Cepat:</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {(['admin', 'petugas', 'dokter', 'pasien'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => loginAs(r)}
                  className={`py-1 px-1.5 rounded-md text-[11px] font-semibold text-center uppercase tracking-tight transition-all cursor-pointer ${
                    role === r
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Halaman Utama</span>
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
