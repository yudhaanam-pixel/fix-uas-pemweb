'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ClinicService } from '@/lib/clinic-service';
import { Appointment, Doctor, Department, AppointmentStatus } from '@/types/database';
import { formatDateIndo, formatTimeIndo, getStatusBadge } from '@/lib/utils';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Megaphone,
  Printer,
  Search,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function FrontOfficeDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [todayStr, setTodayStr] = useState<string>('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTodayStr(today);

    const refreshData = () => {
      const all = ClinicService.getAppointments().filter(
        (a) => a.appointment_date === today
      );
      setAppointments(all);
      setDepartments(ClinicService.getDepartments());
      setDoctors(ClinicService.getDoctors());
    };

    refreshData();
    window.addEventListener('clinic_data_updated', refreshData);
    return () => window.removeEventListener('clinic_data_updated', refreshData);
  }, []);

  // Handle Check-in
  const handleCheckIn = (id: string, name: string) => {
    const updated = ClinicService.updateAppointmentStatus(id, 'check_in');
    if (updated) {
      toast.success(`Pasien ${name} berhasil Check-in! Status berubah menjadi Siap Diperiksa.`);
    }
  };

  // Handle Status Update
  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    ClinicService.updateAppointmentStatus(id, status);
    toast.info(`Status antrean diperbarui ke ${status.toUpperCase()}`);
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.queue_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.patient_nik && a.patient_nik.includes(searchQuery));

    const matchesDept =
      selectedDept === 'all' || a.doctor?.department_id === selectedDept;

    const matchesStatus =
      selectedStatus === 'all' || a.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Today statistics
  const totalToday = appointments.length;
  const waitingArrival = appointments.filter((a) => a.status === 'menunggu').length;
  const checkedIn = appointments.filter((a) => a.status === 'check_in').length;
  const inExamination = appointments.filter((a) => a.status === 'diperiksa').length;
  const completed = appointments.filter((a) => a.status === 'selesai').length;

  return (
    <DashboardLayout requiredRole="petugas">
      <div className="space-y-6">
        {/* Header with Walk-In Quick CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Meja Front Office & Validasi Antrean
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Kelola kedatangan pasien (check-in), verifikasi antrean, dan pendaftaran pasien walk-in {todayStr ? `(${formatDateIndo(todayStr)})` : ''}.
            </p>
          </div>

          <Link
            href="/dashboard/petugas/walk-in"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 text-xs shadow-sm shadow-blue-600/20 transition-all shrink-0 cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="h-4 w-4" />
            <span>Pendaftaran Pasien Walk-in Baru</span>
          </Link>
        </div>

        {/* Counter Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <p className="text-[11px] uppercase font-semibold tracking-wider text-slate-500">
              Total Pasien Hari Ini
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalToday}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <p className="text-[11px] uppercase font-semibold tracking-wider text-amber-700">
              Belum Datang (Menunggu)
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{waitingArrival}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <p className="text-[11px] uppercase font-semibold tracking-wider text-sky-700">
              Tiba (Check-in)
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{checkedIn}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <p className="text-[11px] uppercase font-semibold tracking-wider text-blue-700">
              Diperiksa Dokter
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{inExamination}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <p className="text-[11px] uppercase font-semibold tracking-wider text-emerald-700">
              Selesai Kunjungan
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{completed}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode antrean, nama, atau NIK..."
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="all">Semua Poliklinik</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="all">Semua Status Kunjungan</option>
                <option value="menunggu">Menunggu Kedatangan</option>
                <option value="check_in">Tiba (Check-in)</option>
                <option value="diperiksa">Sedang Diperiksa</option>
                <option value="selesai">Selesai</option>
                <option value="batal">Dibatalkan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-5 py-3.5 whitespace-nowrap">Antrean</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Nama Pasien &amp; NIK</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Poli / Dokter</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Waktu Check-in</th>
                  <th className="px-5 py-3.5 text-right whitespace-nowrap">Aksi Meja FO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Tidak ada data antrean yang cocok dengan filter saat ini.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => {
                    const badge = getStatusBadge(apt.status);
                    return (
                      <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-mono text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 inline-block px-2.5 py-1 rounded-lg">
                            {apt.queue_code}
                          </div>
                          {apt.is_walk_in && (
                            <span className="block text-[10px] font-bold text-amber-700 mt-1">
                              Walk-in Langsung
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900 whitespace-nowrap">{apt.patient_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                            NIK: {apt.patient_nik || '-'} • HP: {apt.patient_phone || '-'}
                          </p>
                          {apt.complaint && (
                            <p className="text-[11px] text-slate-500 italic mt-0.5 max-w-xs truncate">
                              &ldquo;{apt.complaint}&rdquo;
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-semibold text-slate-900">{apt.doctor?.title}</p>
                          <p className="text-[11px] text-blue-600 font-medium">
                            {apt.doctor?.specialization} ({apt.doctor?.room_number})
                          </p>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.badgeClass}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`} />
                            <span>{badge.label}</span>
                          </span>
                        </td>

                        <td className="px-5 py-4 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                          {apt.check_in_time ? formatTimeIndo(apt.check_in_time) : '-'}
                        </td>

                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {apt.status === 'menunggu' && (
                              <button
                                onClick={() => handleCheckIn(apt.id, apt.patient_name)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer whitespace-nowrap"
                                title="Konfirmasi Kedatangan Pasien"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Check-in</span>
                              </button>
                            )}

                            {apt.status !== 'batal' && apt.status !== 'selesai' && (
                              <button
                                onClick={() => handleStatusChange(apt.id, 'batal')}
                                className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Batalkan Antrean"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

