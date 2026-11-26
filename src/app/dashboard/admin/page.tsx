'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ClinicService } from '@/lib/clinic-service';
import { ClinicStats, Appointment } from '@/types/database';
import { formatDateIndo, formatRupiah, getStatusBadge } from '@/lib/utils';
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<ClinicStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [todayStr, setTodayStr] = useState<string>('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTodayStr(today);

    const refreshData = () => {
      setStats(ClinicService.getClinicStats());
      const all = ClinicService.getAppointments().slice(-6).reverse();
      setRecentAppointments(all);
    };

    refreshData();
    window.addEventListener('clinic_data_updated', refreshData);
    return () => window.removeEventListener('clinic_data_updated', refreshData);
  }, []);

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data demo ke pengaturan awal?')) {
      ClinicService.resetToDefaults();
      toast.success('Data sistem telah direset ke pengaturan awal demo!');
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-2 border border-blue-200">
              <ShieldCheck className="h-3.5 w-3.5" /> Administrator Sistem
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ringkasan Operasional Klinik
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pantau metrik kunjungan pasien hari ini {todayStr ? `(${formatDateIndo(todayStr)})` : ''}, kapasitas dokter, dan status layanan klinik.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              title="Reset ke data awal"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        </div>

        {/* Analytics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Pasien Hari Ini
              </span>
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats?.totalPatientsToday || 0}</p>
            <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Registrasi online &amp; walk-in
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Selesai Diperiksa
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats?.completedCount || 0}</p>
            <p className="text-xs text-slate-500">
              {stats?.inExaminationCount || 0} pasien sedang di ruang dokter
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Menunggu di Lobby
              </span>
              <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">
              {(stats?.checkedInCount || 0) + (stats?.waitingCount || 0)}
            </p>
            <p className="text-xs text-slate-500">
              {stats?.checkedInCount || 0} siap panggil • {stats?.waitingCount || 0} belum tiba
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Poliklinik &amp; Dokter
              </span>
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Stethoscope className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats?.activeDoctorsCount || 0}</p>
            <p className="text-xs text-slate-500">
              Tersebar di {stats?.totalDepartmentsCount || 6} poliklinik aktif
            </p>
          </div>
        </div>

        {/* Quick Master Data Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/admin/departments"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md transition-all flex items-center justify-between gap-3 group shadow-xs"
          >
            <div>
              <p className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                Kelola Poliklinik
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Tambah / edit nama &amp; kode poli</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            href="/dashboard/admin/doctors"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md transition-all flex items-center justify-between gap-3 group shadow-xs"
          >
            <div>
              <p className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                Kelola Dokter &amp; Tarif
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Spesialisasi, SIP, &amp; ruang praktik</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            href="/dashboard/admin/schedules"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md transition-all flex items-center justify-between gap-3 group shadow-xs"
          >
            <div>
              <p className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                Jadwal &amp; Kuota Praktik
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Atur batas kuota harian dokter</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Recent Appointments Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" /> Kunjungan Pasien Terbaru
            </h2>
            <Link
              href="/dashboard/admin/reports"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
            >
              Lihat Laporan Lengkap →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Antrean</th>
                  <th className="px-4 py-3 whitespace-nowrap">Nama Pasien</th>
                  <th className="px-4 py-3 whitespace-nowrap">Dokter / Poli</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 whitespace-nowrap">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAppointments.map((apt) => {
                  const badge = getStatusBadge(apt.status);
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {apt.queue_code}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                        {apt.patient_name}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {apt.doctor?.title} ({apt.doctor?.room_number})
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.badgeClass}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`} />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {apt.appointment_date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

