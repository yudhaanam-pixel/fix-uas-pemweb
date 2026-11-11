'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ClinicService } from '@/lib/clinic-service';
import { Department } from '@/types/database';
import { Activity, Plus, Edit2, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    refreshData();
    window.addEventListener('clinic_data_updated', refreshData);
    return () => window.removeEventListener('clinic_data_updated', refreshData);
  }, []);

  const refreshData = () => {
    setDepartments(ClinicService.getDepartments());
  };

  const openAddModal = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setDescription('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description || '');
    setIsActive(dept.is_active);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      toast.error('Nama dan Kode Poliklinik wajib diisi.');
      return;
    }

    if (editingDept) {
      ClinicService.updateDepartment(editingDept.id, {
        name,
        code: code.toUpperCase(),
        description,
        is_active: isActive,
      });
      toast.success('Poliklinik berhasil diperbarui!');
    } else {
      ClinicService.addDepartment({
        name,
        code: code.toUpperCase(),
        description,
        is_active: isActive,
      });
      toast.success('Poliklinik baru berhasil ditambahkan!');
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string, deptName: string) => {
    if (confirm(`Hapus poliklinik ${deptName}? Data dokter terkait akan terpengaruh.`)) {
      ClinicService.deleteDepartment(id);
      toast.info(`Poliklinik ${deptName} telah dihapus.`);
    }
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Master Data Poliklinik & Layanan
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Atur daftar poliklinik, kode antrean (misal: UMU, GIG, ANK), dan status operasional.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Poliklinik Baru</span>
          </button>
        </div>

        {/* Poliklinik Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-5 py-3.5">Kode</th>
                <th className="px-5 py-3.5">Nama Poliklinik</th>
                <th className="px-5 py-3.5">Deskripsi Layanan</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-black text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                      {dept.code}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900 text-sm">
                    {dept.name}
                  </td>
                  <td className="px-5 py-4 text-slate-600 max-w-md">
                    {dept.description || '-'}
                  </td>
                  <td className="px-5 py-4">
                    {dept.is_active ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        <XCircle className="h-3 w-3" /> Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(dept)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-teal-700 hover:bg-teal-50"
                        title="Edit Poliklinik"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id, dept.name)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                        title="Hapus Poliklinik"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-lg font-bold text-slate-900 mb-4">
                {editingDept ? 'Edit Data Poliklinik' : 'Tambah Poliklinik Baru'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nama Poliklinik *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Poli Umum, Poli Mata..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Kode Singkatan (Awalan Antrean) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: UMU, GIG, ANK"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-mono uppercase focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Deskripsi Layanan
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan cakupan tindakan / diagnosis poli ini..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:outline-teal-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="isActive" className="text-xs font-semibold text-slate-700">
                    Status Layanan Aktif (Buka Pendaftaran)
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
                    {editingDept ? 'Simpan Perubahan' : 'Tambah Poliklinik'}
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

