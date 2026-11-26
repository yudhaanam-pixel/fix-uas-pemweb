'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { ClinicService } from '@/lib/clinic-service';
import { MedicalRecord, Doctor } from '@/types/database';
import { formatDateIndo, formatTimeIndo } from '@/lib/utils';
import { FileText, Search, Activity, Pill, Image as ImageIcon, Download } from 'lucide-react';

export default function DoctorHistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    const doctors = ClinicService.getDoctors();
    const matchedDoc = doctors.find((d) => d.name.includes(user?.full_name?.split(',')[0] || 'dr. Budi')) || doctors[0];

    const allRecords = ClinicService.getMedicalRecords().filter(
      (r) => r.doctor_id === matchedDoc.id
    );
    setRecords(allRecords);

    if (allRecords.length > 0) {
      setSelectedRecord((prev) => prev ?? allRecords[0]);
    }
  }, [user]);

  const filteredRecords = records.filter((r) => {
    return (
      r.diagnosis_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.diagnosis_icd10 && r.diagnosis_icd10.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.anamnesis.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <DashboardLayout requiredRole="dokter">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Arsip Rekam Medis Pasien
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar seluruh rekam medis yang telah diperiksa dan diselesaikan oleh Anda.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari diagnosa, ICD-10, atau anamnesis..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* List */}
          <div className="lg:col-span-5 space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center text-slate-400 text-xs">
                Tidak ada rekam medis yang ditemukan.
              </div>
            ) : (
              filteredRecords.map((rec) => {
                const isSelected = selectedRecord?.id === rec.id;
                return (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecord(rec)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                        : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md whitespace-nowrap">
                        ICD: {rec.diagnosis_icd10 || 'J06.9'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                        {rec.created_at ? formatDateIndo(rec.created_at) : '-'}
                      </span>
                    </div>

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
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Detail Rekam Medis (SOAP)
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                    {selectedRecord.diagnosis_description}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Kode ICD-10: {selectedRecord.diagnosis_icd10 || '-'} • Tanggal: {selectedRecord.created_at ? formatDateIndo(selectedRecord.created_at) : '-'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Tekanan Darah</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {selectedRecord.systolic}/{selectedRecord.diastolic} mmHg
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Nadi</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {selectedRecord.heart_rate} bpm
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Suhu</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {selectedRecord.temperature} °C
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">IMT / Berat</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {selectedRecord.weight} kg
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                      Anamnesis (Subjective)
                    </p>
                    <p className="text-slate-700 leading-relaxed">{selectedRecord.anamnesis}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                      Pemeriksaan Fisik (Objective)
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      {selectedRecord.physical_examination || 'Dalam batas normal'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                      Rencana &amp; Edukasi (Plan)
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      {selectedRecord.therapy_plan || 'Edukasi pola hidup sehat.'}
                    </p>
                  </div>
                </div>

                {selectedRecord.prescription_text && (
                  <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                      <Pill className="h-4 w-4 text-blue-600" /> Resep Obat:
                    </p>
                    <pre className="font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-white/80 p-3 rounded-xl border border-blue-100">
                      {selectedRecord.prescription_text}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center text-slate-400 text-xs">
                Pilih salah satu rekam medis di sebelah kiri.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

