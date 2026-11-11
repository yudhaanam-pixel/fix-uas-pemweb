'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ClinicService } from '@/lib/clinic-service';
import { Doctor, Department } from '@/types/database';
import { formatRupiah } from '@/lib/utils';
import { FileUploader } from '@/components/ui/file-uploader';
import { Stethoscope, Plus, Edit2, Trash2, CheckCircle2, XCircle, X, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [sipNumber, setSipNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [roomNumber, setRoomNumber] = useState('Ruang 101');
  const [consultationFee, setConsultationFee] = useState<number>(50000);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    refreshData();
    window.addEventListener('clinic_data_updated', refreshData);
    return () => window.removeEventListener('clinic_data_updated', refreshData);
  }, []);

  const refreshData = () => {
    setDoctors(ClinicService.getDoctors());
    setDepartments(ClinicService.getDepartments());
  };

  const openAddModal = () => {
    setEditingDoctor(null);
    setName('');
    setTitle('');
    setDepartmentId(departments[0]?.id || '');
    setSipNumber('');
    setSpecialization('');
    setRoomNumber('Ruang 101');
    setConsultationFee(50000);
    setPhotoUrl('https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (doc: Doctor) => {
    setEditingDoctor(doc);
    setName(doc.name);
    setTitle(doc.title);
    setDepartmentId(doc.department_id);
    setSipNumber(doc.sip_number);
    setSpecialization(doc.specialization);
    setRoomNumber(doc.room_number);
    setConsultationFee(doc.consultation_fee);
    setPhotoUrl(doc.photo_url || '');
    setIsActive(doc.is_active);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title || !departmentId || !sipNumber) {
      toast.error('Harap lengkapi semua kolom wajib (*)');
      return;
    }

    if (editingDoctor) {
      ClinicService.updateDoctor(editingDoctor.id, {
        name,
        title,
        department_id: departmentId,
        sip_number: sipNumber,
        specialization,
        room_number: roomNumber,
        consultation_fee: consultationFee,
        photo_url: photoUrl,
        is_active: isActive,
      });
      toast.success('Data dokter berhasil diperbarui!');
    } else {
      ClinicService.addDoctor({
        name,
        title,
        department_id: departmentId,
        sip_number: sipNumber,
        specialization,
        room_number: roomNumber,
        consultation_fee: consultationFee,
        photo_url: photoUrl,
        is_active: isActive,
      });
      toast.success('Dokter baru berhasil ditambahkan!');
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string, docName: string) => {
    if (confirm(`Hapus data ${docName}?`)) {
      ClinicService.deleteDoctor(id);
      toast.info(`Data dokter ${docName} telah dihapus.`);
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Master Data Dokter & Tenaga Medis
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Kelola profil dokter spesialis, Surat Izin Praktik (SIP), nomor ruang, dan tarif jasa konsultasi.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Dokter Baru</span>
          </button>
        </div>

        {/* Doctor Grid / Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-5 py-3.5">Dokter</th>
                <th className="px-5 py-3.5">Poliklinik</th>
                <th className="px-5 py-3.5">Nomor SIP & Ruangan</th>
                <th className="px-5 py-3.5">Tarif Konsultasi</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={doc.photo_url || ''}
                        alt={doc.name}
                        className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{doc.title}</p>
                        <p className="text-teal-700 text-[11px]">{doc.specialization}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {doc.department?.name || 'Poliklinik'}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-mono text-slate-600 text-[11px]">{doc.sip_number}</p>
                    <p className="text-slate-500 font-semibold">{doc.room_number}</p>
                  </td>

                  <td className="px-5 py-4 font-bold text-slate-900">
                    {formatRupiah(doc.consultation_fee)}
                  </td>

                  <td className="px-5 py-4">
                    {doc.is_active ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> Aktif Praktik
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        <XCircle className="h-3 w-3" /> Cuti / Nonaktif
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(doc)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-teal-700 hover:bg-teal-50"
                        title="Edit Data Dokter"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id, doc.name)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                        title="Hapus Dokter"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Add / Edit */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 relative my-8">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-lg font-bold text-slate-900 mb-4">
                {editingDoctor ? 'Edit Profil Dokter' : 'Tambah Dokter Spesialis Baru'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Gelar & Nama Lengkap Dokter *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setName(e.target.value);
                    }}
                    placeholder="Contoh: dr. Budi Santoso, Sp.A"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:outline-teal-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Poliklinik *
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs focus:outline-teal-600"
                    >
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Spesialisasi Medis *
                    </label>
                    <input
                      type="text"
                      required
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="Contoh: Spesialis Anak"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:outline-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Nomor SIP (Surat Izin Praktik) *
                    </label>
                    <input
                      type="text"
                      required
                      value={sipNumber}
                      onChange={(e) => setSipNumber(e.target.value)}
                      placeholder="SIP/440/..."
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono focus:outline-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Nomor Ruangan Periksa *
                    </label>
                    <input
                      type="text"
                      required
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="Contoh: Ruang 102"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:outline-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Tarif Jasa Konsultasi Medis (Rp) *
                  </label>
                  <input
                    type="number"
                    step="5000"
                    required
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:outline-teal-600"
                  />
                </div>

                {/* Cloudflare R2 Doctor Photo Upload */}
                <div>
                  <FileUploader
                    label="Unggah Foto Dokter (Cloudflare R2)"
                    helperText="Pilih foto resmi dokter (JPG/PNG). Otomatis disimpan di Cloudflare R2."
                    onUploadSuccess={(url) => {
                      setPhotoUrl(url);
                      toast.success('Foto dokter berhasil diperbarui via Cloudflare R2!');
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="docActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="docActive" className="text-xs font-semibold text-slate-700">
                    Status Dokter Aktif Praktik
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
                    {editingDoctor ? 'Simpan Perubahan' : 'Tambah Dokter'}
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

