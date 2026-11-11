'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ClinicService } from '@/lib/clinic-service';
import { Schedule, Doctor } from '@/types/database';
import { getDayName } from '@/lib/utils';
import { Calendar, Plus, Edit2, Clock, CheckCircle2, XCircle, X, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Form states
  const [doctorId, setDoctorId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('14:00');
  const [quotaPerDay, setQuotaPerDay] = useState<number>(30);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    refreshData();
    window.addEventListener('clinic_data_updated', refreshData);
    return () => window.removeEventListener('clinic_data_updated', refreshData);
  }, []);

  const refreshData = () => {
    setSchedules(ClinicService.getSchedules());
    setDoctors(ClinicService.getDoctors());
  };

  const openAddModal = () => {
    setEditingSchedule(null);
    setDoctorId(doctors[0]?.id || '');
    setDayOfWeek(1);
    setStartTime('08:00');
    setEndTime('14:00');
    setQuotaPerDay(30);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (sch: Schedule) => {
    setEditingSchedule(sch);
    setDoctorId(sch.doctor_id);
    setDayOfWeek(sch.day_of_week);
    setStartTime(sch.start_time.slice(0, 5));
    setEndTime(sch.end_time.slice(0, 5));
    setQuotaPerDay(sch.quota_per_day);
    setIsActive(sch.is_active);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) {
      toast.error('Pilih dokter terlebih dahulu.');
      return;
    }

    if (editingSchedule) {
      ClinicService.updateSchedule(editingSchedule.id, {
        doctor_id: doctorId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        quota_per_day: quotaPerDay,
        is_active: isActive,
      });
      toast.success('Jadwal dan kuota berhasil diperbarui!');
    } else {
      ClinicService.addSchedule({
        doctor_id: doctorId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        quota_per_day: quotaPerDay,
        is_active: isActive,
      });
      toast.success('Jadwal dokter baru berhasil ditambahkan!');
    }

    setModalOpen(false);
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Master Jadwal Praktik & Kuota Harian
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Atur hari kerja dokter, jam mulai/selesai praktik, serta batas maksimal kuota antrean pasien per hari.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Jadwal Dokter</span>
          </button>
        </div>

        {/* Schedules Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-5 py-3.5">Hari Praktik</th>
                <th className="px-5 py-3.5">Nama Dokter & Poli</th>
                <th className="px-5 py-3.5">Jam Operasional</th>
                <th className="px-5 py-3.5">Kuota Pasien / Hari</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((sch) => (
                <tr key={sch.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {getDayName(sch.day_of_week)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900 text-sm">{sch.doctor?.title}</p>
                    <p className="text-teal-700 text-[11px]">
                      {sch.doctor?.department?.name} ({sch.doctor?.room_number})
                    </p>
                  </td>

                  <td className="px-5 py-4 font-mono font-semibold text-slate-700">
                    {sch.start_time.slice(0, 5)} - {sch.end_time.slice(0, 5)} WIB
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs">
                      {sch.quota_per_day} Kuota
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {sch.is_active ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> Buka
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        <XCircle className="h-3 w-3" /> Tutup
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => openEditModal(sch)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-teal-700 hover:bg-teal-50"
                      title="Edit Jadwal & Kuota"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Add / Edit */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-lg font-bold text-slate-900 mb-4">
                {editingSchedule ? 'Edit Jadwal & Kuota' : 'Tambah Jadwal Dokter'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Pilih Dokter *
                  </label>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs focus:outline-teal-600"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.title} ({doc.department?.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Hari Praktik *
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs focus:outline-teal-600"
                  >
                    <option value={1}>Senin</option>
                    <option value={2}>Selasa</option>
                    <option value={3}>Rabu</option>
                    <option value={4}>Kamis</option>
                    <option value={5}>Jumat</option>
                    <option value={6}>Sabtu</option>
                    <option value={7}>Minggu</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Jam Mulai *
                    </label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:outline-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Jam Selesai *
                    </label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:outline-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Batas Maksimal Kuota Pasien per Hari *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={quotaPerDay}
                    onChange={(e) => setQuotaPerDay(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:outline-teal-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    *Pendaftaran otomatis ditolak sistem bila kuota pada hari tersebut telah tercapai.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="schActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="schActive" className="text-xs font-semibold text-slate-700">
                    Jadwal Aktif untuk Pendaftaran Online
                  </label>
                </div>

                <div className="pt-3 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 text-xs shadow-md"
                  >
                    {editingSchedule ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

