'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { ClinicService } from '@/lib/clinic-service';
import { Appointment, Doctor, MedicalRecord } from '@/types/database';
import { formatDateIndo, formatTimeIndo, getStatusBadge } from '@/lib/utils';
import { FileUploader } from '@/components/ui/file-uploader';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Image as ImageIcon,
  Megaphone,
  Pill,
  Save,
  Stethoscope,
  Thermometer,
  User,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // SOAP Form State
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(78);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(18);
  const [temperature, setTemperature] = useState<number>(36.6);
  const [weight, setWeight] = useState<number>(65);
  const [height, setHeight] = useState<number>(170);

  const [anamnesis, setAnamnesis] = useState<string>('');
  const [physicalExam, setPhysicalExam] = useState<string>('');
  const [icd10, setIcd10] = useState<string>('J06.9');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [therapyPlan, setTherapyPlan] = useState<string>('');
  const [prescription, setPrescription] = useState<string>('');
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
  const [todayStr, setTodayStr] = useState<string>('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTodayStr(today);

    const refreshData = () => {
      const doctors = ClinicService.getDoctors();
      // Match doctor with user if linked, or default to dr. Budi
      const matchedDoc = doctors.find((d) => d.name.includes(user?.full_name?.split(',')[0] || 'dr. Budi')) || doctors[0];
      setCurrentDoctor(matchedDoc);

      const all = ClinicService.getAppointments().filter(
        (a) => a.appointment_date === today && a.doctor_id === matchedDoc.id
      );
      setAppointments(all);

      // Auto select the first checked_in or in-examination patient
      if (!selectedAppointment && all.length > 0) {
        const active = all.find((a) => a.status === 'diperiksa' || a.status === 'check_in') || all[0];
        setSelectedAppointment(active);
        setAnamnesis(active.complaint || '');
      }
    };

    refreshData();
    window.addEventListener('clinic_data_updated', refreshData);
    return () => window.removeEventListener('clinic_data_updated', refreshData);
  }, [user]);

  // Handle select patient
  const handleSelectPatient = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setAnamnesis(apt.complaint || '');

    // If already has medical record
    const existing = apt.medical_record;
    if (existing) {
      setSystolic(existing.systolic || 120);
      setDiastolic(existing.diastolic || 80);
      setHeartRate(existing.heart_rate || 78);
      setRespiratoryRate(existing.respiratory_rate || 18);
      setTemperature(existing.temperature || 36.6);
      setWeight(existing.weight || 65);
      setHeight(existing.height || 170);
      setAnamnesis(existing.anamnesis || '');
      setPhysicalExam(existing.physical_examination || '');
      setIcd10(existing.diagnosis_icd10 || '');
      setDiagnosis(existing.diagnosis_description || '');
      setTherapyPlan(existing.therapy_plan || '');
      setPrescription(existing.prescription_text || '');
      setDoctorNotes(existing.doctor_notes || '');
      setAttachmentUrls(existing.attachment_urls || []);
    } else {
      setDiagnosis('');
      setPhysicalExam('Keadaan umum compos mentis, batas normal.');
      setTherapyPlan('Istirahat cukup dan kontrol berkala.');
      setPrescription('');
      setAttachmentUrls([]);
    }
  };

  // Call patient (mark as 'diperiksa')
  const handleCallPatient = (apt: Appointment) => {
    ClinicService.updateAppointmentStatus(apt.id, 'diperiksa');
    setSelectedAppointment({ ...apt, status: 'diperiksa' });
    toast.success(`Memanggil antrean ${apt.queue_code} ke ${currentDoctor?.room_number}!`);

    // Voice announcement if supported
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(
        `Nomor antrean ${apt.queue_code.replace('-', ' ')}, atas nama ${apt.patient_name}, silakan masuk ke ${currentDoctor?.room_number}`
      );
      speech.lang = 'id-ID';
      speech.rate = 0.9;
      window.speechSynthesis.speak(speech);
    }
  };

  // Submit Medical Record & Complete Appointment
  const handleSaveMedicalRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !currentDoctor) return;

    if (!anamnesis || !diagnosis) {
      toast.error('Kolom Anamnesis dan Diagnosa wajib diisi.');
      return;
    }

    const saved = ClinicService.saveMedicalRecord({
      appointment_id: selectedAppointment.id,
      patient_id: selectedAppointment.patient_id || 'user-pasien',
      doctor_id: currentDoctor.id,
      systolic,
      diastolic,
      heart_rate: heartRate,
      respiratory_rate: respiratoryRate,
      temperature,
      weight,
      height,
      anamnesis,
      physical_examination: physicalExam,
      diagnosis_icd10: icd10,
      diagnosis_description: diagnosis,
      therapy_plan: therapyPlan,
      prescription_text: prescription,
      attachment_urls: attachmentUrls,
      doctor_notes: doctorNotes,
    });

    toast.success(
      `Pemeriksaan pasien ${selectedAppointment.patient_name} selesai & rekam medis tersimpan!`
    );
  };

  // BMI Calculation
  const bmi = height > 0 ? (weight / Math.pow(height / 100, 2)).toFixed(1) : '-';

  return (
    <DashboardLayout requiredRole="dokter">
      <div className="space-y-6">
        {/* Doctor Banner */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentDoctor?.photo_url || ''}
              alt={currentDoctor?.name || 'Dokter'}
              className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shrink-0"
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                Ruang Praktik Dokter
              </span>
              <h1 className="text-xl font-black text-slate-900 mt-1">
                {currentDoctor?.title || 'dr. Budi Santoso'}
              </h1>
              <p className="text-xs text-slate-500 font-mono">
                {currentDoctor?.specialization} • {currentDoctor?.room_number} {todayStr ? `• ${formatDateIndo(todayStr)}` : ''}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400">Total Pasien Hari Ini</p>
            <p className="text-2xl font-black text-teal-700">{appointments.length} Pasien</p>
          </div>
        </div>

        {/* Main Work Area: Queue List & SOAP Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Patient Queue for this Doctor */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Daftar Antrean Pasien ({appointments.length})
              </h2>
            </div>

            {appointments.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-400 text-xs">
                Belum ada pasien yang mendaftar hari ini.
              </div>
            ) : (
              <div className="space-y-2">
                {appointments.map((apt) => {
                  const badge = getStatusBadge(apt.status);
                  const isSelected = selectedAppointment?.id === apt.id;

                  return (
                    <div
                      key={apt.id}
                      onClick={() => handleSelectPatient(apt)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50/70 border-teal-500 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          {apt.queue_code}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.badgeClass}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`} />
                          <span>{badge.label}</span>
                        </span>
                      </div>

                      <p className="font-bold text-sm text-slate-900">{apt.patient_name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        Keluhan: &ldquo;{apt.complaint || 'Pemeriksaan umum'}&rdquo;
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {apt.is_walk_in ? 'Walk-in' : 'Online'}
                        </span>

                        {apt.status === 'check_in' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCallPatient(apt);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-xs"
                          >
                            <Megaphone className="h-3 w-3" />
                            <span>Panggil</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: SOAP & Medical Record Form */}
          <div className="lg:col-span-8">
            {selectedAppointment ? (
              <form
                onSubmit={handleSaveMedicalRecord}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
              >
                {/* Patient Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                      ANTREAN: {selectedAppointment.queue_code}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      {selectedAppointment.patient_name}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">
                      NIK: {selectedAppointment.patient_nik || '-'} • HP: {selectedAppointment.patient_phone || '-'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedAppointment.status !== 'diperiksa' && selectedAppointment.status !== 'selesai' && (
                      <button
                        type="button"
                        onClick={() => handleCallPatient(selectedAppointment)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                      >
                        <Megaphone className="h-3.5 w-3.5" />
                        <span>Panggil Pasien ke Ruangan</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 1. Vital Signs Inputs */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-teal-600" /> Tanda-Tanda Vital (Pemeriksaan Awal)
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Sistolik (mmHg)
                      </label>
                      <input
                        type="number"
                        value={systolic}
                        onChange={(e) => setSystolic(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Diastolik (mmHg)
                      </label>
                      <input
                        type="number"
                        value={diastolic}
                        onChange={(e) => setDiastolic(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Detak Jantung (bpm)
                      </label>
                      <input
                        type="number"
                        value={heartRate}
                        onChange={(e) => setHeartRate(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Suhu Tubuh (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Laju Nafas (x/menit)
                      </label>
                      <input
                        type="number"
                        value={respiratoryRate}
                        onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Berat Badan (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Tinggi Badan (cm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-teal-600"
                      />
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">IMT / BMI</span>
                      <span className="font-bold text-teal-700 text-sm">{bmi} kg/m²</span>
                    </div>
                  </div>
                </div>

                {/* 2. SOAP Fields */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-teal-600" /> Catatan Medis Terstruktur (SOAP)
                  </h3>

                  {/* S - Subjective */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      S (Subjective) - Anamnesis & Keluhan Pasien *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={anamnesis}
                      onChange={(e) => setAnamnesis(e.target.value)}
                      placeholder="Keluhan utama, riwayat perjalanan penyakit, durasi, dll."
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:outline-teal-600"
                    />
                  </div>

                  {/* O - Objective */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      O (Objective) - Pemeriksaan Fisik & Penunjang
                    </label>
                    <textarea
                      rows={2}
                      value={physicalExam}
                      onChange={(e) => setPhysicalExam(e.target.value)}
                      placeholder="Temuan inspeksi, palpasi, perkusi, auskultasi..."
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:outline-teal-600"
                    />
                  </div>

                  {/* A - Assessment */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kode ICD-10
                      </label>
                      <input
                        type="text"
                        value={icd10}
                        onChange={(e) => setIcd10(e.target.value)}
                        placeholder="Contoh: J06.9, K29.7, I10"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono uppercase focus:outline-teal-600"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        A (Assessment) - Diagnosa Dokter *
                      </label>
                      <input
                        type="text"
                        required
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Diagnosa klinis pasien..."
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:outline-teal-600"
                      />
                    </div>
                  </div>

                  {/* P - Plan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      P (Plan) - Rencana Terapi & Edukasi Pasien
                    </label>
                    <textarea
                      rows={2}
                      value={therapyPlan}
                      onChange={(e) => setTherapyPlan(e.target.value)}
                      placeholder="Tindakan medis, konseling pola hidup, saran kontrol..."
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:outline-teal-600"
                    />
                  </div>

                  {/* Resep Obat */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                      <Pill className="h-4 w-4 text-emerald-600" /> Resep Obat & Aturan Pakai (E-Prescription)
                    </label>
                    <textarea
                      rows={3}
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      placeholder="Nama obat, dosis, frekuensi (contoh: Paracetamol 500mg 3x1 setelah makan)..."
                      className="w-full rounded-xl border border-emerald-200 bg-emerald-50/20 px-3.5 py-2 text-xs font-mono focus:outline-emerald-600"
                    />
                  </div>
                </div>

                {/* 3. Cloudflare R2 Upload for Medical Documents */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <FileUploader
                    label="Unggah Hasil Lab / Rontgen / Foto Medis (Cloudflare R2)"
                    helperText="Lampiran disimpan otomatis di Cloudflare R2 dan terikat pada rekam medis ini."
                    onUploadSuccess={(url) => {
                      setAttachmentUrls((prev) => [...prev, url]);
                      toast.success('Lampiran berhasil ditambahkan ke rekam medis!');
                    }}
                  />

                  {attachmentUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {attachmentUrls.map((url, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                        >
                          <ImageIcon className="h-4 w-4 text-teal-600" />
                          <span className="font-semibold text-slate-700">Lampiran #{i + 1}</span>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-700 font-bold underline"
                          >
                            Lihat
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Actions */}
                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    Menekan tombol ini akan menandai kunjungan sebagai <strong>SELESAI</strong>.
                  </p>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 text-xs shadow-md transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Selesaikan Pemeriksaan & Simpan Rekam Medis</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
                Pilih salah satu antrean pasien di sebelah kiri untuk memulai pemeriksaan.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

