'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ClinicService } from '@/lib/clinic-service';
import { Appointment, Department, Doctor } from '@/types/database';
import { formatDateIndo, formatRupiah, getStatusBadge } from '@/lib/utils';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  Users,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReportsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const d1 = new Date();
    d1.setDate(d1.getDate() - 7);
    const d2 = new Date();
    d2.setDate(d2.getDate() + 7);
    setStartDate(d1.toISOString().split('T')[0]);
    setEndDate(d2.toISOString().split('T')[0]);

    setAppointments(ClinicService.getAppointments());
    setDepartments(ClinicService.getDepartments());
    setDoctors(ClinicService.getDoctors());
  }, []);

  const filteredAppointments = appointments.filter((a) => {
    const matchDate =
      (!startDate || a.appointment_date >= startDate) &&
      (!endDate || a.appointment_date <= endDate);
    const matchDept =
      selectedDept === 'all' || a.doctor?.department_id === selectedDept;
    const matchStatus =
      selectedStatus === 'all' || a.status === selectedStatus;
    return matchDate && matchDept && matchStatus;
  });

  // Calculate summaries
  const total = filteredAppointments.length;
  const completed = filteredAppointments.filter((a) => a.status === 'selesai').length;
  const cancelled = filteredAppointments.filter((a) => a.status === 'batal').length;
  const walkIns = filteredAppointments.filter((a) => a.is_walk_in).length;

  const handleExportCSV = () => {
    if (filteredAppointments.length === 0) {
      toast.error('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = ['Kode Antrean', 'Tanggal', 'Nama Pasien', 'NIK', 'Poliklinik', 'Dokter', 'Status', 'Tipe'];
    const rows = filteredAppointments.map((a) => [
      a.queue_code,
      a.appointment_date,
      `"${a.patient_name.replace(/"/g, '""')}"`,
      `'${a.patient_nik || ''}`,
      `"${a.doctor?.department?.name || ''}"`,
      `"${a.doctor?.title || ''}"`,
      a.status,
      a.is_walk_in ? 'Walk-in' : 'Online',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Kunjungan_Klinik_${startDate}_sd_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Laporan berhasil diunduh dalam format CSV!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Rekapitulasi & Laporan Operasional Klinik
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Filter dan ekspor rekap data pendaftaran, performa dokter, dan status kunjungan pasien.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-600/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="h-4 w-4" />
              <span>Ekspor ke CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Printer className="h-4 w-4 text-slate-500" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Poliklinik
              </label>
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Status Kunjungan
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="all">Semua Status</option>
                <option value="menunggu">Menunggu</option>
                <option value="check_in">Tiba (Check-in)</option>
                <option value="diperiksa">Sedang Diperiksa</option>
                <option value="selesai">Selesai</option>
                <option value="batal">Batal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <p className="text-[11px] uppercase font-semibold tracking-wider text-slate-500">
              Total Kunjungan
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{total}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <p className="text-[11px] uppercase font-semibold tracking-wider text-emerald-700">
              Terselesaikan
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{completed}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <p className="text-[11px] uppercase font-semibold tracking-wider text-blue-700">
              Pasien Walk-in
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{walkIns}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <p className="text-[11px] uppercase font-semibold tracking-wider text-rose-700">
              Dibatalkan
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{cancelled}</p>
          </div>
        </div>

        {/* Report Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="px-5 py-3.5 whitespace-nowrap">Tanggal</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Antrean</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Nama Pasien</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Poliklinik &amp; Dokter</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Jenis Pendaftaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      Tidak ada data yang sesuai dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => {
                    const badge = getStatusBadge(apt.status);
                    return (
                      <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                          {apt.appointment_date}
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                          {apt.queue_code}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="font-semibold text-slate-900">{apt.patient_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">NIK: {apt.patient_nik || '-'}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="font-semibold text-slate-800">{apt.doctor?.title}</p>
                          <p className="text-[11px] text-blue-600 font-medium">{apt.doctor?.department?.name}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.badgeClass}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`} />
                            <span>{badge.label}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                              apt.is_walk_in
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {apt.is_walk_in ? 'Walk-in (FO)' : 'Online Web'}
                          </span>
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

