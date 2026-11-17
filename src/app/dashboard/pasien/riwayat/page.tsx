'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { ClinicService } from '@/lib/clinic-service';
import { Appointment, MedicalRecord } from '@/types/database';
import { formatDateIndo, getStatusBadge } from '@/lib/utils';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileText,
  Heart,
  Image as ImageIcon,
  Pill,
  Search,
  Stethoscope,
  Thermometer,
} from 'lucide-react';

export default function PatientHistoryPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    const refreshData = () => {
      const allAppts = ClinicService.getAppointments();
      const patientAppts = user
        ? allAppts.filter((a) => a.patient_id === user.id || a.patient_nik === user.nik)
        : allAppts;
      setAppointments(patientAppts);

      const allRecords = ClinicService.getMedicalRecords();
      const patientRecords = user
        ? allRecords.filter((r) => r.patient_id === user.id)
        : allRecords;
      setMedicalRecords(patientRecords);

      if (patientRecords.length > 0) {
        setSelectedRecord((prev) => prev ?? patientRecords[0]);
      }
    };

    refreshData();
    window.addEventListener('clinic_data_updated', refreshData);
    return () => window.removeEventListener('clinic_data_updated', refreshData);
  }, [user]);

  return (
    <DashboardLayout requiredRole="pasien">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Riwayat Kunjungan & Rekam Medis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lihat arsip pemeriksaan dokter, diagnosa, resep obat, dan dokumen lampiran medis Anda.
          </p>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Belum Ada Riwayat Kunjungan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Riwayat pemeriksaan akan otomatis tercatat di sini setelah kunjungan dokter selesai.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: List of Visits */}
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Daftar Kunjungan ({appointments.length})
              </h2>

              {appointments.map((apt) => {
                const badge = getStatusBadge(apt.status);
                const hasRecord = medicalRecords.some((r) => r.appointment_id === apt.id);
                const isSelected = selectedRecord?.appointment_id === apt.id;

                return (
                  <div
                    key={apt.id}
                    onClick={() => {
                      const rec = medicalRecords.find((r) => r.appointment_id === apt.id);
                      if (rec) setSelectedRecord(rec);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {apt.queue_code}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.badgeClass}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`} />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <p className="font-bold text-sm text-slate-900">{apt.doctor?.title || 'Dokter Spesialis'}</p>
                    <p className="text-xs text-blue-700">{apt.doctor?.specialization}</p>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDateIndo(apt.appointment_date)}
                      </span>
                      {hasRecord && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <FileCheck className="h-3.5 w-3.5" />
                          Rekam Medis Siap
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Detailed Medical Record Card */}
            <div className="lg:col-span-7">
              {selectedRecord ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                  {/* Record Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        Hasil Rekam Medis Elektronik (RME)
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-1">
                        {selectedRecord.diagnosis_description}
                      </h2>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Kode ICD-10: {selectedRecord.diagnosis_icd10 || 'J06.9'}
                      </p>
                    </div>
                  </div>

                  {/* Vital Signs Grid */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-teal-600" /> Tanda-Tanda Vital (Vital Signs)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Tekanan Darah</p>
                        <p className="text-base font-bold text-slate-900 mt-0.5">
                          {selectedRecord.systolic || 120}/{selectedRecord.diastolic || 80}{' '}
                          <span className="text-[10px] text-slate-500 font-normal">mmHg</span>
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Detak Jantung</p>
                        <p className="text-base font-bold text-slate-900 mt-0.5">
                          {selectedRecord.heart_rate || 80}{' '}
                          <span className="text-[10px] text-slate-500 font-normal">bpm</span>
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Suhu Tubuh</p>
                        <p className="text-base font-bold text-slate-900 mt-0.5">
                          {selectedRecord.temperature || 36.8}{' '}
                          <span className="text-[10px] text-slate-500 font-normal">°C</span>
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Berat & Tinggi</p>
                        <p className="text-base font-bold text-slate-900 mt-0.5">
                          {selectedRecord.weight || 65}kg / {selectedRecord.height || 170}cm
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SOAP Details */}
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                        Anamnesis & Keluhan (Subjective)
                      </p>
                      <p className="text-slate-700 leading-relaxed">{selectedRecord.anamnesis}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                        Pemeriksaan Fisik (Objective)
                      </p>
                      <p className="text-slate-700 leading-relaxed">
                        {selectedRecord.physical_examination || 'Dalam batas normal'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                        Rencana Terapi & Tindakan (Plan)
                      </p>
                      <p className="text-slate-700 leading-relaxed">
                        {selectedRecord.therapy_plan || 'Tirah baring dan kontrol berkala.'}
                      </p>
                    </div>
                  </div>

                  {/* Electronic Prescription */}
                  {selectedRecord.prescription_text && (
                    <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-5 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                        <Pill className="h-4 w-4 text-emerald-600" /> Resep Obat & Anjuran Minum:
                      </p>
                      <pre className="font-mono text-xs text-emerald-950 whitespace-pre-wrap leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-100">
                        {selectedRecord.prescription_text}
                      </pre>
                    </div>
                  )}

                  {/* Cloudflare R2 Attachments */}
                  {selectedRecord.attachment_urls && selectedRecord.attachment_urls.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <ImageIcon className="h-4 w-4 text-teal-600" /> Lampiran Berkas (Cloudflare R2):
                        </p>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          Tersimpan Aman
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedRecord.attachment_urls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:border-teal-400 transition-all"
                          >
                            <img
                              src={url}
                              alt={`Lampiran ${i + 1}`}
                              className="h-32 w-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="p-2 bg-white text-[11px] font-bold text-slate-700 truncate flex items-center justify-between">
                              <span>Lampiran Dokumen #{i + 1}</span>
                              <Download className="h-3.5 w-3.5 text-teal-600" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                  <p className="text-sm font-bold text-slate-700">Pilih salah satu kunjungan di sebelah kiri</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Detail rekam medis lengkap akan ditampilkan di sini.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

