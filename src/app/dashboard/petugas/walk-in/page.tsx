'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ClinicService } from '@/lib/clinic-service';
import { Doctor, Department, Appointment } from '@/types/database';
import { formatDateIndo, formatRupiah } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle2,
  Printer,
  Ticket,
  UserPlus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export default function FrontOfficeWalkInPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Form states
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientNik, setPatientNik] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [complaint, setComplaint] = useState('');

  const [generatedTicket, setGeneratedTicket] = useState<Appointment | null>(null);
  const [todayStr, setTodayStr] = useState<string>('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTodayStr(today);
    setDepartments(ClinicService.getDepartments().filter((d) => d.is_active));
    setDoctors(ClinicService.getDoctors().filter((d) => d.is_active));
  }, []);

  const availableDoctors = selectedDeptId
    ? doctors.filter((d) => d.department_id === selectedDeptId)
    : doctors;

  const quotaCheck = selectedDoctorId
    ? ClinicService.checkDoctorQuota(selectedDoctorId, todayStr)
    : null;

  const handleRegisterWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !patientName) {
      toast.error('Harap lengkapi poli, dokter, dan nama pasien.');
      return;
    }

    const res = ClinicService.bookAppointment({
      patient_name: patientName,
      patient_nik: patientNik,
      patient_phone: patientPhone,
      doctor_id: selectedDoctorId,
      appointment_date: todayStr,
      complaint: complaint || 'Pemeriksaan walk-in langsung',
      is_walk_in: true, // Auto check-in
    });

    if (res.success && res.appointment) {
      setGeneratedTicket(res.appointment);
      toast.success(`Pasien berhasil didaftarkan! Nomor: ${res.appointment.queue_code}`);
    } else {
      toast.error(res.error || 'Pendaftaran gagal.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout requiredRole="petugas">
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/petugas"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Pendaftaran Pasien Walk-in (Loket FO)
            </h1>
            <p className="text-xs text-slate-500">
              Pendaftaran langsung di meja resepsionis {todayStr ? `untuk tanggal ${formatDateIndo(todayStr)}` : ''}.
            </p>
          </div>
        </div>

        {generatedTicket ? (
          /* Printed Ticket Screen */
          <div className="bg-white rounded-3xl border-2 border-teal-400 p-8 shadow-xl text-center space-y-6">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Pendaftaran Berhasil (Langsung Check-In)
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                Struk Nomor Antrean Pasien
              </h2>
            </div>

            {/* Ticket Box */}
            <div className="max-w-sm mx-auto p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 text-center space-y-3">
              <p className="text-xs uppercase font-extrabold text-slate-400">
                Klinik Sehat Utama
              </p>
              <div className="py-2 border-y border-slate-200">
                <p className="text-5xl font-black font-mono text-teal-800">
                  {generatedTicket.queue_code}
                </p>
                <p className="text-xs font-bold text-slate-700 mt-1">
                  {generatedTicket.doctor?.department?.name || 'Poliklinik'}
                </p>
              </div>

              <div className="text-left text-xs text-slate-600 space-y-1 pt-1">
                <p>
                  <strong>Pasien:</strong> {generatedTicket.patient_name}
                </p>
                <p>
                  <strong>Dokter:</strong> {generatedTicket.doctor?.title}
                </p>
                <p>
                  <strong>Ruang:</strong> {generatedTicket.doctor?.room_number}
                </p>
                <p>
                  <strong>Waktu Daftar:</strong> {generatedTicket.created_at ? new Date(generatedTicket.created_at).toLocaleTimeString('id-ID') : '-'} WIB
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 text-xs shadow-md"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Struk Antrean</span>
              </button>

              <button
                onClick={() => {
                  setGeneratedTicket(null);
                  setPatientName('');
                  setPatientNik('');
                  setPatientPhone('');
                  setComplaint('');
                }}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Daftar Pasien Berikutnya
              </button>
            </div>
          </div>
        ) : (
          /* Walk-in Input Form */
          <form
            onSubmit={handleRegisterWalkIn}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5"
          >
            {/* Poli Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Pilih Poliklinik Tujuan *
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
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Selection */}
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
                    {doc.title} ({doc.room_number}) - Kuota {doc.consultation_fee ? formatRupiah(doc.consultation_fee) : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Quota Alert */}
            {quotaCheck && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between font-medium ${
                  quotaCheck.isFull
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <span>Kuota Hari Ini ({formatDateIndo(todayStr)}):</span>
                <span className="font-bold">
                  {quotaCheck.isFull
                    ? `Penuh (${quotaCheck.booked}/${quotaCheck.quota})`
                    : `Sisa ${quotaCheck.remaining} dari ${quotaCheck.quota} Pasien`}
                </span>
              </div>
            )}

            {/* Patient Data */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Identitas Pasien Walk-in
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Pasien *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Nama lengkap pasien..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    NIK Pasien
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={patientNik}
                    onChange={(e) => setPatientNik(e.target.value)}
                    placeholder="3201..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    No. Handphone / WA
                  </label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="0812..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:outline-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Keluhan / Alasan Kunjungan
                </label>
                <textarea
                  rows={2}
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  placeholder="Gejala yang dialami..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:outline-teal-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={quotaCheck?.isFull || !selectedDoctorId}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>
                  {quotaCheck?.isFull ? 'Kuota Dokter Penuh' : 'Daftarkan Walk-in & Cetak Tiket'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

