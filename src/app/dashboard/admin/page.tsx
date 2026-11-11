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
            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-800 mb-1 border border-purple-200">
              <ShieldCheck className="h-3.5 w-3.5" /> Administrator Sistem
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ringkasan Operasional Klinik
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau metrik kunjungan pasien hari ini {todayStr ? `(${formatDateIndo(todayStr)})` : ''}, kapasitas dokter, dan status layanan klinik.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
              title="Reset ke data awal"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        </div>

        {/* Analytics KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Pasien Hari Ini
              </span>
              <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats?.totalPatientsToday || 0}</p>
            <p className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Registrasi online & walk-in
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Selesai Diperiksa
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-emerald-700">{stats?.completedCount || 0}</p>
            <p className="text-[11px] text-slate-500">
              {stats?.inExaminationCount || 0} pasien sedang di ruang dokter
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Menunggu di Lobby
              </span>
              <div className="h-9 w-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-cyan-700">
              {(stats?.checkedInCount || 0) + (stats?.waitingCount || 0)}
            </p>
            <p className="text-[11px] text-slate-500">
              {stats?.checkedInCount || 0} siap panggil • {stats?.waitingCount || 0} belum tiba
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Poliklinik & Dokter
              </span>
              <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Stethoscope className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-purple-900">{stats?.activeDoctorsCount || 0}</p>
            <p className="text-[11px] text-slate-500">
              Tersebar di {stats?.totalDepartmentsCount || 6} poliklinik aktif
            </p>
          </div>
        </div>

        {/* Quick Master Data Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/admin/departments"
            className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-white border border-teal-200 hover:border-teal-400 hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div>
              <p className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                Kelola Poliklinik
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Tambah / edit nama & kode poli</p>
            </div>
            <ArrowRight className="h-5 w-5 text-teal-600 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/dashboard/admin/doctors"
            className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div>
              <p className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                Kelola Dokter & Tarif
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Spesialisasi, SIP, & ruang praktik</p>
            </div>
            <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/dashboard/admin/schedules"
            className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div>
              <p className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                Jadwal & Kuota Praktik
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Atur batas kuota harian dokter</p>
            </div>
            <ArrowRight className="h-5 w-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Recent Appointments Activity */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-600" /> Kunjungan Pasien Terbaru
            </h2>
            <Link
              href="/dashboard/admin/reports"
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Lihat Laporan Lengkap →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="px-4 py-3">Antrean</th>
                  <th className="px-4 py-3">Nama Pasien</th>
                  <th className="px-4 py-3">Dokter / Poli</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAppointments.map((apt) => {
                  const badge = getStatusBadge(apt.status);
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {apt.queue_code}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {apt.patient_name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {apt.doctor?.title} ({apt.doctor?.room_number})
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.badgeClass}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`} />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
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

