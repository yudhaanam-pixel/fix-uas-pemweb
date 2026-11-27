'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { isDemoSession, useAuth } from '@/lib/auth-context';
import { ClinicService } from '@/lib/clinic-service';
import { MedicalRecord, UserRole } from '@/types/database';
import { formatDateIndo } from '@/lib/utils';
import { Search, Pill } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function MedicalRecordHistoryPage({ role }: { role: Extract<UserRole, 'admin' | 'dokter'> }) {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadRecords = async () => {
      if (!user) return;
      setIsLoading(true);
      setLoadError('');

      try {
        const allRecords = await ClinicService.getMedicalRecordsWithRelations(
          isSupabaseConfigured && !isDemoSession()
        );
        const visibleRecords = role === 'admin'
          ? allRecords
          : allRecords.filter((record) => {
              const doctor = record.doctor;
              if (!doctor) return false;
              if (doctor.user_id === user.id) return true;
              const userName = (user.full_name || '').split(',')[0].trim().toLowerCase();
              const doctorName = doctor.name.trim().toLowerCase();
              return doctorName.includes(userName) || userName.includes(doctorName);
            });

        if (!cancelled) {
          setRecords(visibleRecords);
          setSelectedRecord(visibleRecords[0] ?? null);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Gagal memuat riwayat pemeriksaan.';
        if (!cancelled) {
          setLoadError(message);
          setRecords([]);
          setSelectedRecord(null);
          toast.error(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadRecords();
    return () => {
      cancelled = true;
    };
  }, [user, role]);

  const filteredRecords = records.filter((r) => {
    const patientName = r.patient?.full_name || r.appointment?.patient_name || '';
    const patientNik = r.patient?.nik || r.appointment?.patient_nik || '';
    return (
      r.diagnosis_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.diagnosis_icd10 && r.diagnosis_icd10.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.anamnesis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patientNik.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <DashboardLayout requiredRole={role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {role === 'admin' ? 'Riwayat Pemeriksaan' : 'Arsip Rekam Medis Pasien'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'admin'
              ? 'Daftar lengkap riwayat pemeriksaan dan rekam medis pasien.'
              : 'Daftar seluruh rekam medis yang telah diperiksa dan diselesaikan oleh Anda.'}
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pasien, NIK, diagnosa, ICD-10, atau anamnesis..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs focus:outline-teal-600"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* List */}
          <div className="lg:col-span-5 space-y-3">
            {isLoading ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                Memuat riwayat pemeriksaan...
              </div>
            ) : loadError ? (
              <div role="alert" className="bg-rose-50 rounded-3xl border border-rose-200 p-8 text-center text-rose-700 text-xs">
                {loadError}
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                Tidak ada rekam medis yang ditemukan.
              </div>
            ) : (
              filteredRecords.map((rec) => {
                const isSelected = selectedRecord?.id === rec.id;
                const patientName = rec.patient?.full_name || rec.appointment?.patient_name || 'Nama pasien tidak tersedia';
                const patientNik = rec.patient?.nik || rec.appointment?.patient_nik;
                return (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecord(rec)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        ICD: {rec.diagnosis_icd10 || 'J06.9'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {rec.created_at ? formatDateIndo(rec.created_at) : '-'}
                      </span>
                    </div>

                    <p className="font-bold text-sm text-slate-900">{patientName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      NIK: {patientNik || '-'}
                    </p>
                    <h3 className="font-bold text-sm text-slate-900">{rec.diagnosis_description}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                      {rec.anamnesis}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-7">
            {selectedRecord ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    Detail Rekam Medis (SOAP)
                  </span>
                  <h2 className="text-lg font-bold text-blue-900 mt-3">
                    {selectedRecord.patient?.full_name || selectedRecord.appointment?.patient_name || 'Nama pasien tidak tersedia'}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    NIK: {selectedRecord.patient?.nik || selectedRecord.appointment?.patient_nik || '-'}
                  </p>
                  <h2 className="text-xl font-black text-slate-900 mt-2">
                    {selectedRecord.diagnosis_description}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Kode ICD-10: {selectedRecord.diagnosis_icd10 || '-'} • Tanggal: {selectedRecord.created_at ? formatDateIndo(selectedRecord.created_at) : selectedRecord.appointment?.appointment_date ? formatDateIndo(selectedRecord.appointment.appointment_date) : '-'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Tekanan Darah</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {selectedRecord.systolic ?? '-'}/{selectedRecord.diastolic ?? '-'} mmHg
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Nadi</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {selectedRecord.heart_rate ?? '-'} bpm
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Pernapasan</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {selectedRecord.respiratory_rate ?? '-'} kali/menit
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Suhu</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {selectedRecord.temperature ?? '-'} °C
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Berat Badan</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {selectedRecord.weight ?? '-'} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Tinggi Badan</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {selectedRecord.height ?? '-'} cm
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                      Anamnesis (Subjective)
                    </p>
                    <p className="text-slate-700 leading-relaxed">{selectedRecord.anamnesis}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                      Pemeriksaan Fisik (Objective)
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      {selectedRecord.physical_examination || 'Dalam batas normal'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                      Rencana & Edukasi (Plan)
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      {selectedRecord.therapy_plan || 'Edukasi pola hidup sehat.'}
                    </p>
                  </div>
                </div>

                {selectedRecord.prescription_text ? (
                  <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                      <Pill className="h-4 w-4 text-emerald-600" /> Resep Obat:
                    </p>
                    <pre className="font-mono text-xs text-emerald-950 whitespace-pre-wrap leading-relaxed">
                      {selectedRecord.prescription_text}
                    </pre>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500">
                    Belum ada resep obat.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                Pilih salah satu rekam medis di sebelah kiri.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MedicalRecordHistoryPage;

