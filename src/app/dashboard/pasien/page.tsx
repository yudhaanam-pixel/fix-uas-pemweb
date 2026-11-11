'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { ClinicService } from '@/lib/clinic-service';
import { Appointment, Doctor, Department, Schedule } from '@/types/database';
import { formatDateIndo, formatRupiah, getStatusBadge } from '@/lib/utils';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  QrCode,
  Sparkles,
  Stethoscope,
  Ticket,
  User,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Booking form state
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [today, setToday] = useState('');
  const [complaint, setComplaint] = useState('');

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setToday(todayStr);
    setSelectedDate(todayStr);

    const refreshData = () => {
      const all = ClinicService.getAppointments();
      // Filter for current patient if logged in
      const patientAppts = user
        ? all.filter((a) => a.patient_id === user.id || a.patient_nik === user.nik)
        : all.slice(0, 3);
      setAppointments(patientAppts);
      setDepartments(ClinicService.getDepartments().filter((d) => d.is_active));
      setDoctors(ClinicService.getDoctors().filter((d) => d.is_active));
    };

    refreshData();
    window.addEventListener('clinic_data_updated', refreshData);
    return () => window.removeEventListener('clinic_data_updated', refreshData);
  }, [user]);

  // Find active appointment for today or upcoming
  const activeAppointment = appointments.find(
    (a) => a.status === 'menunggu' || a.status === 'check_in' || a.status === 'diperiksa'
  );

  const availableDoctors = selectedDeptId
    ? doctors.filter((d) => d.department_id === selectedDeptId)
    : doctors;

  const quotaInfo = selectedDoctorId && selectedDate
    ? ClinicService.checkDoctorQuota(selectedDoctorId, selectedDate)
    : null;

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedDate) {
      toast.error('Harap pilih poliklinik, dokter, dan tanggal kunjungan.');
      return;
    }

    const res = ClinicService.bookAppointment({
      patient_id: user?.id,
      patient_name: user?.full_name || 'Pasien',
      patient_nik: user?.nik || '',
      patient_phone: user?.phone || '',
      doctor_id: selectedDoctorId,
      appointment_date: selectedDate,
      complaint: complaint || 'Pemeriksaan rutin',
    });

    if (res.success && res.appointment) {
      toast.success(`Berhasil! Nomor antrean Anda: ${res.appointment.queue_code}`);
      setComplaint('');
    } else {
      toast.error(res.error || 'Gagal mendaftar');
    }
  };

  const handleCancelAppointment = (id: string) => {
    if (confirm('Apakah Anda yakin ingin membatalkan antrean ini?')) {
      ClinicService.updateAppointmentStatus(id, 'batal');
      toast.info('Antrean telah dibatalkan');
    }
  };

  return (
    <DashboardLayout requiredRole="pasien">
      <div className="space-y-8">
        {/* Top Welcome Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-teal-500/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/30 px-3 py-1 text-xs font-semibold text-teal-200 border border-teal-400/30">
              <Sparkles className="h-3.5 w-3.5" /> Portal Pasien Terintegrasi
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Halo, {user?.full_name || 'Bapak/Ibu Pasien'}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              Pantau tiket antrean aktif Anda hari ini atau lakukan pendaftaran kunjungan dokter untuk jadwal mendatang dengan verifikasi kuota otomatis.
            </p>
          </div>
        </div>

        {/* ACTIVE E-TICKET CARD */}
        {activeAppointment ? (
          <div className="rounded-3xl bg-white border-2 border-teal-300 shadow-xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-teal-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1.5">
              <Ticket className="h-3.5 w-3.5" />
              <span>E-Tiket Antrean Aktif</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Queue Big Code */}
              <div className="lg:col-span-5 text-center lg:text-left border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-6">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Nomor Antrean Anda
                </p>
                <p className="text-6xl font-black font-mono text-teal-800 tracking-tight my-2">
                  {activeAppointment.queue_code}
                </p>

                {(() => {
                  const badge = getStatusBadge(activeAppointment.status);
                  return (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold mt-1">
                      <span className={`h-2 w-2 rounded-full ${badge.dotClass}`} />
                      <span>{badge.label}</span>
                    </div>
                  );
                })()}

                <div className="mt-4 flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-500">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  <span>{formatDateIndo(activeAppointment.appointment_date)}</span>
                </div>
              </div>

              {/* Doctor and Clinic details */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Dokter Spesialis</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {activeAppointment.doctor?.title || 'Dokter'}
                    </p>
                    <p className="text-teal-700 font-medium">
                      {activeAppointment.doctor?.specialization}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Ruang & Meja</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {activeAppointment.doctor?.room_number || 'Ruang 101'}
                    </p>
                    <p className="text-slate-500">Gedung Poliklinik Lantai 1</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs text-teal-900">
                  <p className="font-bold flex items-center gap-1.5 text-teal-800">
                    <Clock className="h-4 w-4" /> Petunjuk Kedatangan:
                  </p>
                  <p className="mt-1 text-slate-700">
                    Setibanya di klinik, harap menuju <strong>Meja Resepsionis / Front Office</strong> untuk konfirmasi kedatangan (Check-in). Setelah itu, silakan menunggu di ruang tunggu sesuai nomor antrean.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleCancelAppointment(activeAppointment.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Batalkan Antrean</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-slate-100 border border-slate-200 text-center space-y-2">
            <Ticket className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-sm text-slate-700">Tidak Ada Antrean Aktif Hari Ini</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Anda belum memiliki janji temu yang aktif. Gunakan formulir di bawah ini untuk membuat janji temu baru.
            </p>
          </div>
        )}

        {/* BOOKING SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Booking Form Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                <span>Pendaftaran Kunjungan Poliklinik Baru</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pilih poliklinik tujuan dan jadwal dokter. Sistem akan memeriksa sisa kuota secara otomatis.
              </p>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              {/* Poliklinik */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Pilih Poliklinik *
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => {
                    setSelectedDeptId(e.target.value);
                    const docs = doctors.filter((d) => d.department_id === e.target.value);
                    setSelectedDoctorId(docs[0]?.id || '');
                  }}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-teal-600"
                >
                  <option value="">-- Pilih Poliklinik --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dokter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Pilih Dokter Spesialis *
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  required
                  disabled={!selectedDeptId}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-teal-600 disabled:bg-slate-100"
                >
                  <option value="">-- Pilih Dokter --</option>
                  {availableDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title} - {doc.specialization} ({formatRupiah(doc.consultation_fee)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tanggal Kunjungan *
                </label>
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-teal-600"
                />
              </div>

              {/* Kuota Check Display */}
              {quotaInfo && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
                    quotaInfo.isFull
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                  }`}
                >
                  <span>Ketersediaan Kuota Dokter:</span>
                  <span className="font-bold">
                    {quotaInfo.isFull
                      ? `Penuh (${quotaInfo.booked}/${quotaInfo.quota})`
                      : `Tersedia ${quotaInfo.remaining} dari ${quotaInfo.quota} Pasien`}
                  </span>
                </div>
              )}

              {/* Keluhan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Keluhan Pasien (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  placeholder="Ceritakan keluhan singkat yang dirasakan..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-teal-600"
                />
              </div>

              <button
                type="submit"
                disabled={quotaInfo?.isFull || !selectedDoctorId}
                className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold py-3 text-xs shadow-md transition-all"
              >
                {quotaInfo?.isFull ? 'Kuota Penuh - Pilih Jadwal Lain' : 'Daftar Kunjungan & Ambil Tiket'}
              </button>
            </form>
          </div>

          {/* Quick Doctor Details Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Informasi Pasien Terdaftar
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Nama Lengkap:</span>
                  <span className="font-bold text-slate-800">{user?.full_name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">NIK KTP:</span>
                  <span className="font-mono text-slate-800">{user?.nik || '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Nomor Telepon:</span>
                  <span className="font-mono text-slate-800">{user?.phone || '-'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Golongan Darah:</span>
                  <span className="font-bold text-teal-700">{user?.blood_type || 'O+'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Riwayat Alergi:</span>
                  <span className="text-rose-600 font-semibold">{user?.allergies || 'Tidak ada'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-teal-50 border border-teal-200 p-6 text-xs text-teal-900 space-y-2">
              <p className="font-bold flex items-center gap-2 text-teal-800">
                <Activity className="h-4 w-4" /> Alur Pelayanan Klinik:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 text-xs">
                <li>Lakukan pendaftaran online melalui form ini.</li>
                <li>Dapatkan nomor antrean unik poliklinik.</li>
                <li>Lakukan Check-in di Front Office saat tiba.</li>
                <li>Tunggu panggilan dokter di ruang tunggu.</li>
                <li>Pemeriksaan & rekam medis digital selesai.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

